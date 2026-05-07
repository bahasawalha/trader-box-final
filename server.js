require("dotenv").config();
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const cors = require("cors");
const { generateToken } = require("./utils/auth");
const authMiddleware = require("./middleware/authMiddleware");
const requireRole = require("./middleware/roleMiddleware");
const fetchCryptoPrices = require("./services/fetchPrices");
const processRecommendations = require("./services/recommendationEngine");

const app = express();
const prisma = new PrismaClient();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// ==========================
// 🛡️ IDEMPOTENCY SYSTEM
// ==========================
const processedRequests = new Set();
function idempotencyMiddleware(req, res, next) {
  const key = req.headers["x-idempotency-key"];
  if (key) {
    if (processedRequests.has(key)) return res.status(409).json({ error: "Duplicate request detected" });
    res.on("finish", () => { if (res.statusCode < 400) processedRequests.add(key); });
  }
  next();
}

// ==========================
// 🌐 MIDDLEWARES
// ==========================
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(idempotencyMiddleware);
app.use("/uploads", express.static("uploads"));

// --- UPLOAD ENDPOINT ---
app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ==========================
// 🟢 HEALTH CHECK & AUTH SESSION
// ==========================
app.get("/", (req, res) => { res.send("API is running 🚀"); });



// ==========================
// 📜 Audit Logging Helper
// ==========================
async function createNotification(userId, title, message, type = "INFO") {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type }
    });
  } catch (e) { console.error("Notification failed", e); }
}


// ==========================
// 🧠 Financial Orchestrator
// ==========================
async function recordFinancialMutation(tx, walletId, type, amount, referenceId) {
  const wallet = await tx.wallet.findUnique({
    where: { id: walletId },
    include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } }
  });
  const currentBalance = wallet.entries[0]?.balanceAfter || 0;
  const newBalance = currentBalance + amount;
  if (newBalance < -0.000001) throw new Error(`Insufficient funds: Wallet ${walletId}`);
  return tx.ledgerEntry.create({ data: { walletId, type, amount, balanceAfter: newBalance, referenceId } });
}

async function createAuditLog(adminId, action, targetId, details, req) {
  try {
    return await prisma.auditLog.create({
      data: { adminId, action, targetId, details, ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress }
    });
  } catch (e) { console.error("Audit log error:", e.message); }
}

// ==========================
// 🔐 Auth Routes
// ==========================
app.post("/auth/register", async (req, res) => {
  const { email, password, referralCode } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.$transaction(async (tx) => {
      let referredBy = null;
      if (referralCode) {
        const refUser = await tx.user.findUnique({ where: { referralCode } });
        if (refUser) referredBy = refUser.id;
      }
      const newUser = await tx.user.create({
        data: { email, password: hashed, referralCode: crypto.randomUUID(), referredById: referredBy, lastIp: req.ip }
      });
      await tx.wallet.create({ data: { userId: newUser.id } });
      return newUser;
    });
    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" })
       .json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
    await prisma.user.update({ where: { id: user.id }, data: { lastIp: req.ip } });
    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" })
       .json({ user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/auth/logout", (req, res) => { res.clearCookie("token").json({ success: true }); });

app.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, email: true, role: true, referralCode: true } });
    res.json(user);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================
// 🛡️ Discovery & Public
// ==========================
app.get("/providers/top", async (req, res) => {
  try {
    const providers = await prisma.user.findMany({ 
      where: { role: "PROVIDER" }, 
      include: { 
        recommendations: { select: { id: true } },
        providerSubs: { select: { id: true } }
      },
      take: 10 
    });
    
    // Calculate score based on last 50 recs (Mock logic for now, using 94 as placeholder)
    res.json(providers.map(p => ({ 
      ...p, 
      score: 94, 
      subscribers: p.providerSubs.length,
      recommendationCount: p.recommendations.length
    })));
  } catch (error) { res.status(500).json({ error: "Database connection error" }); }
});

app.get("/providers/:id", async (req, res) => {
  try {
    const provider = await prisma.user.findUnique({ where: { id: req.params.id }, select: { id: true, name: true, avatar: true, role: true } });
    if (!provider) return res.status(404).json({ error: "Provider not found" });
    res.json({ ...provider, score: 42, subscribers: 120, price: 29 });
  } catch (error) { res.status(500).json({ error: "Database error" }); }
});

app.get("/providers/:id/recommendations", async (req, res) => {
  try {
    const recs = await prisma.recommendation.findMany({ 
      where: { providerId: req.params.id }, 
      include: { pair: true },
      orderBy: { createdAt: "desc" } 
    });
    res.json(recs);
  } catch (error) { res.status(500).json({ error: "Database error" }); }
});

app.get("/sponsors", async (req, res) => {
  try { res.json(await prisma.sponsor.findMany({ where: { isActive: true } })); }
  catch (error) { res.status(500).json({ error: "Database error" }); }
});

app.get("/analyses/latest", async (req, res) => {
  try { res.json(await prisma.analysis.findMany({ take: 5, include: { analyst: { select: { name: true } } }, orderBy: { createdAt: "desc" } })); }
  catch (error) { res.status(500).json({ error: "Database error" }); }
});

app.get("/news", async (req, res) => {
  try {
    // 🌍 Future API Integration Point:
    // const response = await axios.get('https://newsapi.org/v2/top-headlines?category=business&apiKey=...');
    // return res.json(response.data.articles);
    
    const news = [
      { id: 1, text: "Federal Reserve signals potential rate cuts as inflation cools", category: "MACRO" },
      { id: 2, text: "Bitcoin ETF inflows hit record highs in Q2", category: "CRYPTO" },
      { id: 3, text: "Gold reaches all-time high amidst geopolitical tensions", category: "COMMODITIES" },
      { id: 4, text: "OPEC+ extends production cuts to stabilize oil prices", category: "ENERGY" },
      { id: 5, text: "Major tech earnings beat expectations, boosting NASDAQ", category: "STOCKS" }
    ];
    res.json(news);
  } catch (error) { res.status(500).json({ error: "Failed to fetch news" }); }
});

app.get("/subscription/status", authMiddleware, async (req, res) => {
  try {
    const sub = await prisma.subscription.findFirst({ where: { userId: req.user.userId, providerId: req.query.providerId, endDate: { gt: new Date() } } });
    res.json({ active: !!sub });
  } catch (error) { res.status(500).json({ error: "Database error" }); }
});

// ==========================
// 💼 Wallet & Financials
// ==========================
app.get("/wallet/balance", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { wallet: true } });
    const wallet = await prisma.wallet.findUnique({ where: { id: user.wallet.id }, include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } } });
    res.json({ balance: wallet.entries[0]?.balanceAfter || 0 });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/wallet/transactions", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { wallet: true } });
    if (!user.wallet) return res.json([]);
    const txs = await prisma.ledgerEntry.findMany({ where: { walletId: user.wallet.id }, orderBy: { createdAt: "desc" } });
    res.json(txs);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/wallet/deposit", authMiddleware, async (req, res) => {
  const { amount, method, reference } = req.body;
  
  // 🛡️ Strict Positive Amount Guard
  const parsedAmount = parseFloat(amount);
  if (!parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: "Invalid amount. Deposit must be greater than zero." });
  }

  if (!reference) return res.status(400).json({ error: "Reference/Proof is required" });
  try {
    const deposit = await prisma.deposit.create({
      data: { userId: req.user.userId, amount: parsedAmount, method, reference, status: "PENDING" }
    });
    res.json(deposit);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/wallet/withdraw", authMiddleware, async (req, res) => {
  const { amount, method, address } = req.body;
  const parsedAmount = parseFloat(amount);

  // 🛡️ Strict Positive Amount Guard
  if (!parsedAmount || parsedAmount <= 0) {
    return res.status(400).json({ error: "Invalid amount. Withdrawal must be greater than zero." });
  }

  if (parsedAmount < 100) return res.status(400).json({ error: "Minimum withdrawal is $100" });
  if (!address) return res.status(400).json({ error: "Withdrawal address is required" });
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: req.user.userId }, include: { wallet: true } });
      const wallet = await tx.wallet.findUnique({ 
        where: { id: user.wallet.id }, 
        include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } } 
      });
      const balance = wallet.entries[0]?.balanceAfter || 0;
      
      if (balance < amount) throw new Error("Insufficient funds");
      if (amount < 100) throw new Error("Minimum withdrawal is $100");

      const withdrawal = await tx.withdrawal.create({
        data: { userId: req.user.userId, amount: parseFloat(amount), method, address, status: "PENDING" }
      });
      
      // We deduct the balance immediately to prevent double spending
      await recordFinancialMutation(tx, user.wallet.id, "WITHDRAWAL", -amount, withdrawal.id);
    });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.post("/subscribe", authMiddleware, async (req, res) => {
  const { providerId } = req.body;
  const price = 29;
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: req.user.userId }, include: { wallet: true } });
      const provider = await tx.user.findUnique({ where: { id: providerId }, include: { wallet: true } });
      const admin = await tx.user.findFirst({ where: { role: "ADMIN" }, include: { wallet: true } });
      const sub = await tx.subscription.create({ data: { userId: user.id, providerId, price, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } });
      await recordFinancialMutation(tx, user.wallet.id, "SUBSCRIPTION", -price, sub.id);
      await recordFinancialMutation(tx, provider.wallet.id, "PROVIDER_EARNING", price * 0.65, sub.id);
      let adminNet = price * 0.35;
      if (user.referredById) {
        const referrer = await tx.user.findUnique({ where: { id: user.referredById }, include: { wallet: true } });
        if (referrer) { await recordFinancialMutation(tx, referrer.wallet.id, "REFERRAL_REWARD", 5, sub.id); adminNet -= 5; }
      }
      await recordFinancialMutation(tx, admin.wallet.id, "ADMIN_PROFIT", adminNet, sub.id);
    }, { isolationLevel: 'Serializable' });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// ==========================
// 🛡️ ADMIN MANAGEMENT
// ==========================
app.get("/admin/stats", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const [users, wallets, deposits, recommendations] = await Promise.all([
      prisma.user.count(),
      prisma.wallet.findMany({ include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } } }),
      prisma.deposit.count({ where: { status: "PENDING" } }),
      prisma.recommendation.count({ where: { status: "ACTIVE" } })
    ]);
    const totalLiquidity = wallets.reduce((acc, w) => acc + (w.entries[0]?.balanceAfter || 0), 0);
    res.json({ users, totalBalance: totalLiquidity, pendingDeposits: deposits, activeSignals: recommendations });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/admin/deposits", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const d = await prisma.deposit.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: "desc" } });
    res.json(d);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/admin/withdrawals", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const w = await prisma.withdrawal.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: "desc" } });
    res.json(w);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/withdraw/approve", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { withdrawalId } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId }, include: { user: { include: { wallet: true } } } });
      if (!withdrawal || withdrawal.status !== "PENDING") throw new Error("Invalid withdrawal");
      await tx.withdrawal.update({ where: { id: withdrawalId }, data: { status: "APPROVED", approvedAt: new Date() } });
      await createNotification(withdrawal.userId, "Withdrawal Approved", `Your withdrawal of $${withdrawal.amount} has been processed.`, "FINANCIAL");
      await createAuditLog(req.user.userId, "APPROVE_WITHDRAWAL", withdrawal.id, `Approved $${withdrawal.amount} for ${withdrawal.user.email}`, req);
    });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.post("/admin/withdraw/reject", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { withdrawalId } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId }, include: { user: { include: { wallet: true } } } });
      if (!withdrawal || withdrawal.status !== "PENDING") throw new Error("Invalid withdrawal");
      await tx.withdrawal.update({ where: { id: withdrawalId }, data: { status: "REJECTED" } });
      await createNotification(withdrawal.userId, "Withdrawal Rejected", `Your withdrawal of $${withdrawal.amount} was rejected.`, "FINANCIAL");
      // Refund the balance since it was deducted at request
      await recordFinancialMutation(tx, withdrawal.user.wallet.id, "WITHDRAWAL_REFUND", withdrawal.amount, withdrawal.id);
      await createAuditLog(req.user.userId, "REJECT_WITHDRAWAL", withdrawal.id, `Rejected $${withdrawal.amount} for ${withdrawal.user.email}`, req);
    });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.get("/admin/users", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({ include: { wallet: true }, orderBy: { createdAt: "desc" } });
    res.json(users);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/admin/audit-logs", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({ include: { admin: { select: { email: true } } }, orderBy: { createdAt: "desc" } });
    res.json(logs);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/sponsors", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { name, logo, website } = req.body;
  try {
    const sponsor = await prisma.sponsor.create({ data: { name, logo, website, isActive: true } });
    res.json(sponsor);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/analysis", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { title, content } = req.body;
  try {
    const analysis = await prisma.analysis.create({
      data: {
        title,
        content,
        analystId: req.user.userId, // Admin acts as analyst here
        isActive: true
      }
    });
    res.json(analysis);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/deposit/approve", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { depositId } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.findUnique({ where: { id: depositId }, include: { user: { include: { wallet: true } } } });
      if (!deposit || deposit.status !== "PENDING") throw new Error("Invalid deposit");
      await tx.deposit.update({ where: { id: depositId }, data: { status: "APPROVED" } });
      await recordFinancialMutation(tx, deposit.user.wallet.id, "DEPOSIT", deposit.amount, deposit.id);
      await createNotification(deposit.userId, "Deposit Verified", `Successfully added $${deposit.amount} to your balance.`, "FINANCIAL");
      await createAuditLog(req.user.userId, "APPROVE_DEPOSIT", deposit.id, `Approved ${deposit.amount} for ${deposit.user.email}`, req);
    }, { isolationLevel: 'Serializable' });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// ==========================
// 📡 PROVIDER MANAGEMENT
// ==========================
app.get("/provider/stats", authMiddleware, requireRole("PROVIDER"), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { wallet: { include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } } } } });
    const subs = await prisma.subscription.count({ where: { providerId: user.id, endDate: { gt: new Date() } } });
    res.json({ score: 94, subscribers: subs, earnings: user.wallet.entries[0]?.balanceAfter || 0 });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/recommendations/create", authMiddleware, requireRole("PROVIDER"), async (req, res) => {
  const { symbol, type, entryPrice, takeProfit, stopLoss } = req.body;
  try {
    const rec = await prisma.$transaction(async (tx) => {
      let pair = await tx.pair.findUnique({ where: { symbol: symbol.toUpperCase() } });
      if (!pair) {
        pair = await tx.pair.create({ data: { symbol: symbol.toUpperCase(), name: symbol.toUpperCase(), type: "CRYPTO" } });
      }

      const newRec = await tx.recommendation.create({
        data: { 
          providerId: req.user.userId, 
          pairId: pair.id, 
          type, 
          entryPrice: parseFloat(entryPrice), 
          takeProfit: parseFloat(takeProfit), 
          stopLoss: parseFloat(stopLoss), 
          status: "PENDING"
        }
      });

      const subscribers = await tx.subscription.findMany({
        where: { providerId: req.user.userId, endDate: { gt: new Date() } },
        select: { userId: true }
      });

      for (const sub of subscribers) {
        await createNotification(sub.userId, "New Signal Node", `Operative published a ${type} signal for ${symbol.toUpperCase()}.`, "SIGNAL");
      }

      return newRec;
    });
    res.json(rec);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/provider/recommendations", authMiddleware, requireRole("PROVIDER"), async (req, res) => {
  try {
    const recs = await prisma.recommendation.findMany({
      where: { providerId: req.user.userId },
      include: { pair: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(recs);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/pairs", async (req, res) => {
  try { res.json(await prisma.pair.findMany()); }
  catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================
// 🔍 ADMIN Audit
// ==========================
app.get("/admin/audit/ledger-health", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const wallets = await prisma.wallet.findMany({ include: { entries: true } });
    const report = wallets.map(w => {
      const ledgerSum = w.entries.reduce((acc, e) => acc + e.amount, 0);
      const lastEntryBalance = w.entries.length > 0 ? [...w.entries].sort((a,b) => b.createdAt - a.createdAt)[0].balanceAfter : 0;
      return { walletId: w.id, userEmail: w.userId, ledgerSum, lastEntryBalance, isHealthy: Math.abs(ledgerSum - lastEntryBalance) < 0.001 };
    });
    res.json({ wallets: report, health: report.every(r => r.isHealthy) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// ==========================
// 🌍 PUBLIC DATA
// ==========================
app.get("/providers/top", async (req, res) => {
  try {
    const p = await prisma.user.findMany({
      where: { role: "PROVIDER" },
      take: 6,
      select: { id: true, name: true, email: true, avatar: true }
    });
    res.json(p);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/analyses", async (req, res) => {
  try {
    const a = await prisma.analysis.findMany({
      where: { isActive: true },
      include: { analyst: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" }
    });
    res.json(a);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/analyses/latest", async (req, res) => {
  try {
    const a = await prisma.analysis.findMany({
      where: { isActive: true },
      take: 4,
      orderBy: { createdAt: "desc" }
    });
    res.json(a);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/sponsorships", async (req, res) => {
  try {
    const { companyName, email, website, license, type } = req.body;
    const request = await prisma.sponsorshipRequest.create({
      data: { companyName, email, website, license, type }
    });
    res.json(request);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- ADMIN ENDPOINTS ---

app.get("/admin/sponsorships", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  try {
    const requests = await prisma.sponsorshipRequest.findMany({
      orderBy: { createdAt: "desc" }
    });
    res.json(requests);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/admin/deposits/pending", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  try {
    const deposits = await prisma.deposit.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { email: true, name: true } } }
    });
    res.json(deposits);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/admin/withdrawals/pending", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      where: { status: "PENDING" },
      include: { user: { select: { email: true, name: true } } }
    });
    res.json(withdrawals);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/deposit/approve", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { depositId } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.update({
        where: { id: parseInt(depositId) },
        data: { status: "APPROVED" }
      });
      await tx.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: deposit.amount } }
      });
      await tx.transaction.create({
        data: { userId: deposit.userId, amount: deposit.amount, type: "DEPOSIT", balanceAfter: (await tx.user.findUnique({ where: { id: deposit.userId } })).balance }
      });
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/admin/users", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, balance: true, createdAt: true }
    });
    res.json(users);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/user/block", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { userId, isBlocked } = req.body;
  try {
    await prisma.user.update({ where: { id: parseInt(userId) }, data: { isBlocked } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/user/balance", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { userId, amount } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { balance: { increment: parseFloat(amount) } }
    });
    // Record as administrative adjustment
    await prisma.transaction.create({
      data: { userId: user.id, amount: parseFloat(amount), type: "ADJUSTMENT", balanceAfter: user.balance }
    });
    res.json({ success: true, newBalance: user.balance });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/user/alert", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { userId, message } = req.body;
  try {
    await prisma.notification.create({
      data: { userId: parseInt(userId), message, type: "ADMIN_ALERT" }
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Update Login to check block status
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    if (user.isBlocked) {
      return res.status(403).json({ error: "Your account has been suspended by administration." });
    }
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/user/role", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { userId, role } = req.body;
  try {
    await prisma.user.update({ where: { id: parseInt(userId) }, data: { role } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/sponsors", async (req, res) => {
  try {
    const s = await prisma.sponsor.findMany({ where: { isActive: true } });
    res.json(s);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================
// 🔔 Notifications
// ==========================
app.get("/notifications", authMiddleware, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" },
      take: 20
    });
    res.json(notifications);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/notifications/:id/read", authMiddleware, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { id: req.params.id, userId: req.user.userId },
      data: { isRead: true }
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================
// ⚙️ Settings / Profile
// ==========================
app.post("/profile/update", authMiddleware, async (req, res) => {
  const { name, avatar } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, avatar }
    });
    res.json(user);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/profile/password", authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const bcrypt = require("bcryptjs");
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error("Current password incorrect");

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { password: hashedPassword }
    });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// ==========================
// 🧠 Analyst Intelligence
// ==========================
app.post("/analyst/reports", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ANALYST') return res.status(403).json({ error: "Access denied" });
  const { title, content, image } = req.body;
  try {
    const report = await prisma.analysis.create({
      data: { 
        title, 
        content, 
        image,
        analystId: req.user.userId 
      }
    });
    res.json(report);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/analyst/reports/my", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ANALYST') return res.status(403).json({ error: "Access denied" });
  try {
    const reports = await prisma.analysis.findMany({
      where: { analystId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reports);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Global 404 JSON handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// ==========================
// 🚀 START SERVER + ENGINE
// ==========================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  setInterval(async () => {
    try { await fetchCryptoPrices(); } catch (e) { console.error("Price fetch error:", e.message); }
  }, 30000);
  setInterval(async () => {
    try { await processRecommendations(); } catch (e) { console.error("Engine error:", e.message); }
  }, 60000);
});
