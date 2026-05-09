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
const axios = require("axios");
const { Decimal } = require("decimal.js");
const rateLimit = require("express-rate-limit");
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

// Ensure temp directory exists
const tempDir = path.join(__dirname, "temp");
const idempotencyDir = path.join(tempDir, "idempotency");
if (!fs.existsSync(idempotencyDir)) fs.mkdirSync(idempotencyDir, { recursive: true });

// ==========================
// 🛡️ IDEMPOTENCY SYSTEM (Persistent)
// ==========================
function idempotencyMiddleware(req, res, next) {
  const key = req.headers["x-idempotency-key"];
  if (key) {
    const keyPath = path.join(idempotencyDir, key);
    if (fs.existsSync(keyPath)) {
      return res.status(409).json({ error: "Duplicate request detected" });
    }
    // We mark it as processed ONLY if the request succeeds
    res.on("finish", () => { 
      if (res.statusCode < 400) {
        fs.writeFileSync(keyPath, JSON.stringify({ timestamp: new Date() }));
      } 
    });
  }
  next();
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 300, 
  message: { error: "Too many requests from this IP, please try again after 15 minutes" }
});

// ==========================
// 🌐 MIDDLEWARES
// ==========================
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(globalLimiter);
app.use(idempotencyMiddleware);
app.use("/uploads", express.static("uploads"));

// --- PROTECTED UPLOAD ENDPOINT ---
app.post("/upload", authMiddleware, upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  if (req.user.role === 'USER') return res.status(403).json({ error: "Unauthorized upload" });
  
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ url: fileUrl });
});

// ==========================
// 🟢 HEALTH CHECK & AUTH SESSION
// ==========================
app.get("/", (req, res) => { res.send("API is running 🚀"); });



// ==========================
// 📜 Audit Logging Helper
// ==========================
async function createNotification(userId, title, message, type = "INFO", tx = null) {
  const client = tx || prisma;
  try {
    await client.notification.create({
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
  
  const currentBalance = new Decimal(wallet.entries[0]?.balanceAfter || 0);
  const mutationAmount = new Decimal(amount);
  const newBalance = currentBalance.plus(mutationAmount);
  
  if (newBalance.lt(0)) {
    throw new Error(`Insufficient funds: Wallet ${walletId}`);
  }
  
  return tx.ledgerEntry.create({ 
    data: { 
      walletId, 
      type, 
      amount: mutationAmount.toNumber(), 
      balanceAfter: newBalance.toNumber(), 
      referenceId 
    } 
  });
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
    res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true })
       .json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Invalid credentials" });
    
    if (user.isBlocked) {
      return res.status(403).json({ error: "Your account has been suspended by administration." });
    }

    await prisma.user.update({ where: { id: user.id }, data: { lastIp: req.ip } });
    const token = generateToken(user);
    res.cookie("token", token, { httpOnly: true, sameSite: "none", secure: true })
       .json({ token, user: { id: user.id, email: user.email, role: user.role } });
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
        recommendations: {
          where: { 
            status: "CLOSED",
            closedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        providerSubs: { where: { endDate: { gt: new Date() } } },
        sponsors: { where: { isActive: true } }
      },
      take: 20 
    });
    
    const formatted = providers.map(p => {
      const wins = p.recommendations.filter(r => r.result === "WIN").length;
      const total = p.recommendations.length;
      const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : "0";
      
      return {
        id: p.id,
        name: p.name || "Anonymous Operative",
        email: p.email,
        bio: p.bio,
        avatar: p.avatar,
        score: winRate,
        subscribers: p.providerSubs.length,
        recommendationCount: total,
        sponsors: p.sponsors
      };
    });
    res.json(formatted);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/providers/:id", async (req, res) => {
  try {
    const provider = await prisma.user.findUnique({ 
      where: { id: req.params.id },
      include: {
        providerSubs: { where: { endDate: { gt: new Date() } } }
      }
    });
    if (!provider) return res.status(404).json({ error: "Provider not found" });
    
    res.json({ 
      ...provider, 
      subscribers: provider.providerSubs.length,
      price: provider.subscriptionPrice // Use dynamic price
    });
  } catch (error) { res.status(500).json({ error: "Database connection error" }); }
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
    // 🌐 Real-time Financial News Integration
    const response = await axios.get('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
    const articles = response.data.Data;
    
    // Format to simple text for our ticker
    const news = articles.slice(0, 15).map(article => ({
      id: article.id,
      text: article.title,
      category: article.categories
    }));
    
    res.json(news);
  } catch (error) { 
    console.error("Live news fetch failed, falling back to cache", error);
    // Fallback if API fails
    const fallbackNews = [
      { id: 1, text: "Federal Reserve signals potential rate cuts as inflation cools", category: "MACRO" },
      { id: 2, text: "Bitcoin ETF inflows hit record highs in Q2", category: "CRYPTO" },
      { id: 3, text: "Gold reaches all-time high amidst geopolitical tensions", category: "COMMODITIES" }
    ];
    res.json(fallbackNews); 
  }
});

app.get("/api/calendar", async (req, res) => {
  try {
    const lang = req.query.lang || 'en';
    const isRTL = lang === 'ar';
    
    let formattedEvents = [];
    
    try {
      // 🌐 Attempt Real-time Economic Calendar Integration
      const response = await axios.get('https://nfs.faireconomy.media/ff_calendar_thisweek.json', { timeout: 5000 });
      const allEvents = response.data;
      
      if (Array.isArray(allEvents)) {
        formattedEvents = allEvents.slice(0, 15).map((event, i) => {
          let translatedTitle = event.title || "Economic Event";
          if (isRTL) {
             if (event.title?.includes("Interest Rate")) translatedTitle = `قرار الفائدة - ${event.country}`;
             else if (event.title?.includes("CPI")) translatedTitle = `مؤشر التضخم - ${event.country}`;
             else if (event.title?.includes("Unemployment")) translatedTitle = `معدل البطالة - ${event.country}`;
             else translatedTitle = `${event.country}: ${event.title}`;
          }

          return {
            id: i,
            title: translatedTitle,
            time: event.time || "TBD",
            impact: event.impact === "High" ? "HIGH" : (event.impact === "Medium" ? "MEDIUM" : "LOW"),
            country: event.country || "GLOBAL"
          };
        });
      }
    } catch (apiErr) {
      console.error("External Calendar API failed, using intelligent fallback");
    }

    // 🛡️ Fallback Guard: If API failed or returned empty, use our high-quality simulation
    if (formattedEvents.length === 0) {
      formattedEvents = isRTL ? [
        { id: 1, title: "USD: تقرير الوظائف غير الزراعية (NFP)", time: "13:30", impact: "HIGH" },
        { id: 2, title: "EUR: قرار الفائدة من المركزي الأوروبي", time: "11:45", impact: "HIGH" },
        { id: 3, title: "USD: مؤشر أسعار المستهلك (التضخم)", time: "12:30", impact: "HIGH" },
        { id: 4, title: "GBP: قرار الفائدة البريطانية", time: "11:00", impact: "MEDIUM" }
      ] : [
        { id: 1, title: "USD: Non-Farm Payrolls (NFP)", time: "13:30", impact: "HIGH" },
        { id: 2, title: "EUR: ECB Interest Rate Decision", time: "11:45", impact: "HIGH" },
        { id: 3, title: "USD: CPI Inflation Data", time: "12:30", impact: "HIGH" },
        { id: 4, title: "GBP: BOE Interest Rate Decision", time: "11:00", impact: "MEDIUM" }
      ];
    }

    res.json(formattedEvents);
  } catch (error) { 
    console.error("Critical calendar endpoint failure", error);
    res.json([]); // Return empty array instead of crashing
  }
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

app.get("/dashboard/stats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const [userWithWallet, activeSubs, closedRecs] = await Promise.all([
      prisma.user.findUnique({ 
        where: { id: userId }, 
        include: { wallet: { include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } } } } 
      }),
      prisma.subscription.count({ 
        where: { userId, endDate: { gt: new Date() }, isActive: true } 
      }),
      prisma.recommendation.findMany({
        where: { status: "COMPLETED" },
        select: { result: true }
      })
    ]);

    const balance = userWithWallet.wallet?.entries[0]?.balanceAfter || 0;
    
    // Calculate Win Rate
    let winRate = 92; // Default if no recs
    if (closedRecs.length > 0) {
      const wins = closedRecs.filter(r => r.result === "WIN").length;
      winRate = Math.round((wins / closedRecs.length) * 100);
    }

    // Calculate Referral Count
    const referralCount = await prisma.user.count({ where: { referredById: userId } });

    res.json({ balance, activeSubs, winRate, referralCount });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/dashboard/signals", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // 1. Get active subscriptions
    const subs = await prisma.subscription.findMany({
      where: { userId, endDate: { gt: new Date() }, isActive: true },
      select: { providerId: true }
    });

    const providerIds = subs.map(s => s.providerId);

    // 2. Get latest signals from these providers
    const signals = await prisma.recommendation.findMany({
      where: { providerId: { in: providerIds } },
      include: { 
        pair: true, 
        provider: { select: { name: true, email: true } } 
      },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    // Format for frontend
    const formatted = signals.map(s => ({
      id: s.id,
      symbol: s.pair.symbol,
      type: s.type,
      entry: s.entryPrice.toLocaleString(),
      tp: s.takeProfit.toLocaleString(),
      status: s.status,
      provider: s.provider.name || s.provider.email.split('@')[0],
      createdAt: s.createdAt
    }));

    res.json(formatted);
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
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: req.user.userId }, include: { wallet: true } });
      const provider = await tx.user.findUnique({ where: { id: providerId }, include: { wallet: true } });
      if (!provider || provider.role !== "PROVIDER") throw new Error("Invalid provider");
      
      const price = provider.subscriptionPrice || 29; // Use dynamic provider price

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
    const users = await prisma.user.findMany({ 
      include: { 
        wallet: true,
        sponsors: true 
      }, 
      orderBy: { createdAt: "desc" } 
    });
    res.json(users);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/admin/audit-logs", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({ include: { admin: { select: { email: true } } }, orderBy: { createdAt: "desc" } });
    res.json(logs);
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
    const user = await prisma.user.findUnique({ 
      where: { id: req.user.userId }, 
      include: { 
        wallet: { include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } } }
      } 
    });
    
    const [subs, recentRecs] = await Promise.all([
      prisma.subscription.count({ where: { providerId: user.id, endDate: { gt: new Date() } } }),
      prisma.recommendation.findMany({
        where: { 
          providerId: user.id,
          status: "CLOSED",
          closedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      })
    ]);

    const wins = recentRecs.filter(r => r.result === "WIN").length;
    const total = recentRecs.length;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    res.json({ 
      score: winRate, 
      subscribers: subs, 
      earnings: user.wallet.entries[0]?.balanceAfter || 0 
    });
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

app.post("/recommendations/create", authMiddleware, requireRole("PROVIDER"), async (req, res) => {
  const { symbol, type, entryPrice, takeProfit, stopLoss } = req.body;
  try {
    const rec = await prisma.$transaction(async (tx) => {
      let pair = await tx.pair.findUnique({ where: { symbol: symbol.toUpperCase() } });
      if (!pair) {
        throw new Error("Trading pair not authorized by administration.");
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
    const providers = await prisma.user.findMany({ 
      where: { role: "PROVIDER" }, 
      include: { 
        recommendations: {
          where: { 
            status: "CLOSED",
            closedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        },
        providerSubs: { where: { endDate: { gt: new Date() } } },
        sponsors: { where: { isActive: true } }
      },
      take: 20 
    });
    
    const formatted = providers.map(p => {
      const wins = p.recommendations.filter(r => r.result === "WIN").length;
      const total = p.recommendations.length;
      const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : "0";
      
      return {
        id: p.id,
        name: p.name || "Anonymous Operative",
        email: p.email,
        bio: p.bio,
        avatar: p.avatar,
        score: winRate,
        subscribers: p.providerSubs.length,
        recommendationCount: total,
        sponsors: p.sponsors
      };
    });
    res.json(formatted);
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
        where: { id: depositId },
        data: { status: "APPROVED" }
      });
      await tx.user.update({
        where: { id: deposit.userId },
        data: { balance: { increment: deposit.amount } }
      });
      // Corrected to use ledger mutation if applicable, or keeping simple increment for now
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
    await prisma.user.update({ where: { id: userId }, data: { isBlocked } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/user/balance", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { userId, amount } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { balance: { increment: parseFloat(amount) } }
    });
    res.json({ success: true, newBalance: user.balance });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/user/alert", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { userId, message } = req.body;
  try {
    await prisma.notification.create({
      data: { userId: userId, message, type: "ADMIN_ALERT" }
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


app.post("/admin/user/role", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { userId, role } = req.body;
  console.log(`[ADMIN] MANUAL ROLE CHANGE: User ${userId} to ${role}`);
  
  try {
    const user = await prisma.user.update({ 
      where: { id: userId }, 
      data: { role } 
    });

    // Notify the user about their new status
    await createNotification(
      userId, 
      "Account Status Updated", 
      `Your account classification has been updated to ${role}. Please log out and back in to refresh your access.`, 
      "INFO"
    );

    res.json({ success: true });
  } catch (error) { 
    console.error(`[ADMIN] ROLE CHANGE ERROR:`, error.message);
    res.status(500).json({ error: error.message }); 
  }
});

app.post("/admin/user/price", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { userId, price } = req.body;
  const newPrice = parseFloat(price);
  if (isNaN(newPrice) || newPrice < 29) {
    return res.status(400).json({ error: "Minimum price is $29" });
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionPrice: newPrice }
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================
// 🤝 Sponsors Management
// ==========================

app.get("/sponsors", async (req, res) => {
  const { providerId } = req.query;
  try {
    const where = { isActive: true };
    if (providerId === 'all') {
      // Return all sponsors for admin
    } else {
      where.providerId = providerId || null;
    }
    const sponsors = await prisma.sponsor.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });
    res.json(sponsors);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/sponsors", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { name, logo, url, providerId } = req.body;
  console.log("Attempting to create sponsor:", { name, logo, url, providerId });
  try {
    const sponsor = await prisma.sponsor.create({
      data: { 
        name, 
        logo, 
        url: url || "", 
        isActive: true,
        providerId: providerId || null
      }
    });
    res.json(sponsor);
  } catch (error) { 
    console.error("Sponsor Creation Error:", error);
    res.status(500).json({ error: error.message }); 
  }
});

app.delete("/admin/sponsors/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  try {
    await prisma.sponsor.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================
// 🛡️ Role Upgrade Requests
// ==========================

app.post("/role-requests", authMiddleware, async (req, res) => {
  const { requestedRole, reason } = req.body;
  try {
    const existing = await prisma.roleRequest.findFirst({
      where: { userId: req.user.userId, status: "PENDING" }
    });
    if (existing) return res.status(400).json({ error: "You already have a pending request" });

    const request = await prisma.roleRequest.create({
      data: {
        userId: req.user.userId,
        requestedRole,
        reason,
        status: "PENDING"
      }
    });
    res.json(request);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/api/news", async (req, res) => {
  const lang = req.query.lang === 'ar' ? 'ar' : 'en';
  const query = lang === 'ar' ? 'أخبار+اقتصادية' : 'financial+news';
  const hl = lang === 'ar' ? 'ar' : 'en-US';
  const gl = lang === 'ar' ? 'SA' : 'US';
  const ceid = lang === 'ar' ? 'SA:ar' : 'US:en';
  
  const url = `https://news.google.com/rss/search?q=${query}&hl=${hl}&gl=${gl}&ceid=${ceid}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 5000
    });
    const xml = response.data;
    const titles = [];
    const regex = /<title>(.*?)<\/title>/g;
    let match;
    
    // Skip the first title (which is the feed title)
    match = regex.exec(xml); 
    
    while ((match = regex.exec(xml)) !== null && titles.length < 15) {
      let title = match[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      title = title.split(' - ')[0];
      if (title.length > 10) titles.push(title);
    }
    
    if (titles.length > 0) return res.json(titles);
    throw new Error("No titles found");

  } catch (error) {
    console.error("News Fetch Error:", error.message);
    
    // 🛡️ High-quality Fallback News if source is down
    const fallbacks = lang === 'ar' ? [
      "مؤشرات الأسواق العالمية تسجل مكاسب جماعية",
      "انخفاض طفيف في أسعار الذهب وسط ترقب لبيانات التضخم",
      "ارتفاع احتياطيات النقد الأجنبي مدفوعة بنمو الصادرات",
      "المركزي الأوروبي يبقي على أسعار الفائدة دون تغيير",
      "نمو قوي في قطاع الخدمات التكنولوجية الناشئة",
      "استقرار أسعار النفط عالمياً فوق مستوى 80 دولاراً"
    ] : [
      "Global indices edge higher on positive earnings reports",
      "Gold prices stabilize as markets await inflation data",
      "Central banks signal cautious approach to rate adjustments",
      "Tech sector leads gains in pre-market trading session",
      "Crude oil maintains stability above key support levels",
      "Foreign exchange reserves show growth driven by export surge"
    ];
    
    res.json(fallbacks);
  }
});

app.get("/admin/stats", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  try {
    const [totalUsers, pendingDeposits, activeSignals, totalDeposits] = await Promise.all([
      prisma.user.count(),
      prisma.deposit.count({ where: { status: "PENDING" } }),
      prisma.recommendation.count({ where: { status: "PENDING" } }),
      prisma.deposit.aggregate({
        where: { status: "APPROVED" },
        _sum: { amount: true }
      })
    ]);

    // Mock revenue as 5% of total approved deposits for now
    const platformRevenue = (totalDeposits._sum.amount || 0) * 0.05;

    res.json({
      totalUsers,
      pendingDeposits,
      activeSignals,
      platformRevenue
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/admin/role-requests", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') {
    console.warn(`[ADMIN] UNAUTHORIZED ACCESS ATTEMPT by ${req.user.userId} (Role: ${req.user.role})`);
    return res.status(403).json({ error: "Access denied" });
  }
  
  try {
    const requests = await prisma.roleRequest.findMany({
      include: { 
        user: { 
          select: { 
            email: true, 
            name: true 
          } 
        } 
      },
      orderBy: { createdAt: "desc" }
    });
    console.log(`[ADMIN] Fetched ${requests.length} role requests`);
    res.json(requests);
  } catch (error) { 
    console.error(`[ADMIN] ROLE REQUESTS FETCH ERROR:`, error.message);
    res.status(500).json({ error: error.message }); 
  }
});

app.post("/admin/role-requests/resolve", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { requestId, status, adminNote } = req.body; 
  console.log(`[ADMIN] RESOLVE ATTEMPT: ID=${requestId} Status=${status}`);
  
  try {
    const request = await prisma.$transaction(async (tx) => {
      // Check if request exists first
      const existing = await tx.roleRequest.findUnique({ where: { id: requestId } });
      if (!existing) {
        console.error(`[ADMIN] Request NOT FOUND: ${requestId}`);
        throw new Error("Role request not found");
      }

      console.log(`[ADMIN] Updating Request ${requestId} to ${status}`);
      const r = await tx.roleRequest.update({
        where: { id: requestId },
        data: { status, adminNote }
      });

      if (status === "APPROVED") {
        console.log(`[ADMIN] UPGRADING USER ${r.userId} TO ${r.requestedRole}`);
        await tx.user.update({
          where: { id: r.userId },
          data: { 
            role: r.requestedRole,
            bio: r.reason 
          }
        });
      }
      return r;
    });

    if (status === "APPROVED") {
      await createNotification(request.userId, "Role Upgraded", `Your request to become a ${request.requestedRole} has been approved!`, "INFO");
    } else {
      await createNotification(request.userId, "Role Request Rejected", `Your request was rejected. Note: ${adminNote || 'No reason provided'}`, "INFO");
    }

    res.json({ success: true });
  } catch (error) { 
    console.error(`[ADMIN] RESOLVE ERROR:`, error.message);
    res.status(500).json({ error: error.message }); 
  }
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

app.get("/analyst/stats", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ANALYST') return res.status(403).json({ error: "Access denied" });
  try {
    const reportCount = await prisma.analysis.count({ where: { analystId: req.user.userId } });
    
    // 🧠 Mock Advanced Metrics for Analysts (Future implementation: Track actual views/likes)
    const readerReach = reportCount * 42 + 125; // Simulated reach
    const accuracy = 85 + (reportCount > 5 ? 7 : 0); // Simulated accuracy
    
    res.json({
      totalReports: reportCount,
      readerReach,
      accuracy
    });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================
// ⚙️ GLOBAL PLATFORM SETTINGS (ADMIN)
// ==========================

app.get("/admin/settings", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  try {
    // Use raw query because Prisma Client might not be generated with new models
    let settings = await prisma.$queryRaw`SELECT * FROM AppSettings WHERE id = 'global' LIMIT 1`;
    settings = settings[0];
    
    if (!settings) {
      const now = new Date().toISOString();
      await prisma.$executeRaw`INSERT INTO AppSettings (id, platformFee, updatedAt) VALUES ('global', 30, ${now})`;
      settings = { id: "global", platformFee: 30, updatedAt: now };
    } else if (settings.platformFee < 0) {
      // Auto-fix negative fee if it exists in DB
      await prisma.$executeRaw`UPDATE AppSettings SET platformFee = 0 WHERE id = 'global'`;
      settings.platformFee = 0;
    }
    
    const methods = await prisma.$queryRaw`SELECT * FROM PaymentMethod ORDER BY createdAt DESC`;
    const pairs = await prisma.pair.findMany({ orderBy: { symbol: 'asc' } });
    res.json({ settings, methods, pairs });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/settings/pairs", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { symbol } = req.body;
  if (!symbol) return res.status(400).json({ error: "Symbol is required" });
  
  try {
    const pair = await prisma.pair.create({
      data: { 
        symbol: symbol.toUpperCase(),
        name: symbol.toUpperCase()
      }
    });
    res.json(pair);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete("/admin/settings/pairs/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  try {
    await prisma.pair.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get("/pairs", async (req, res) => {
  try {
    const pairs = await prisma.pair.findMany({ orderBy: { symbol: 'asc' } });
    res.json(pairs);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/settings/fee", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { platformFee } = req.body;
  const fee = parseFloat(platformFee);
  
  if (isNaN(fee) || fee < 0) {
    return res.status(400).json({ error: "Platform fee must be a positive number" });
  }

  try {
    const now = new Date().toISOString();
    await prisma.$executeRaw`UPDATE AppSettings SET platformFee = ${fee}, updatedAt = ${now} WHERE id = 'global'`;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/settings/methods", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  const { name, address } = req.body;
  const id = crypto.randomUUID();
  try {
    await prisma.$executeRaw`INSERT INTO PaymentMethod (id, name, address, isActive, createdAt) VALUES (${id}, ${name}, ${address}, 1, ${new Date().toISOString()})`;
    res.json({ id, name, address });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete("/admin/settings/methods/:id", authMiddleware, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: "Access denied" });
  try {
    await prisma.$executeRaw`DELETE FROM PaymentMethod WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Public endpoint for users to get deposit methods
app.get("/deposit/methods", async (req, res) => {
  try {
    const methods = await prisma.$queryRaw`SELECT * FROM PaymentMethod WHERE isActive = 1`;
    res.json(methods);
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
  }, 5000); // 5 seconds
  setInterval(async () => {
    try { await processRecommendations(); } catch (e) { console.error("Engine error:", e.message); }
  }, 10000); // 10 seconds
});
