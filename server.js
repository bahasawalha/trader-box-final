const express = require("express");
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
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(idempotencyMiddleware);

// ==========================
// 🟢 HEALTH CHECK
// ==========================
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

// ==========================
// 🧠 Financial Orchestrator (Serializable + Atomic)
// ==========================
async function recordFinancialMutation(tx, walletId, type, amount, referenceId) {
  const wallet = await tx.wallet.findUnique({
    where: { id: walletId },
    include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } }
  });

  const currentBalance = wallet.entries[0]?.balanceAfter || 0;
  const newBalance = currentBalance + amount;

  if (newBalance < -0.000001) throw new Error(`Insufficient funds: Wallet ${walletId}`);

  return tx.ledgerEntry.create({
    data: { walletId, type, amount, balanceAfter: newBalance, referenceId }
  });
}

async function createAuditLog(adminId, action, targetId, details, req) {
  return prisma.auditLog.create({
    data: {
      adminId,
      action,
      targetId,
      details,
      ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress
    }
  });
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
// 🔐 SUBSCRIPTION
// ==========================
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
// 🔍 LEDGER AUDIT
// ==========================
app.get("/admin/audit/ledger-health", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  try {
    const wallets = await prisma.wallet.findMany({ include: { entries: true } });
    const report = wallets.map(w => {
      const ledgerSum = w.entries.reduce((acc, e) => acc + e.amount, 0);
      const lastEntryBalance = w.entries.length > 0 ? [...w.entries].sort((a,b) => b.createdAt - a.createdAt)[0].balanceAfter : 0;
      return { walletId: w.id, userEmail: w.userId, ledgerSum, lastEntryBalance, isHealthy: Math.abs(ledgerSum - lastEntryBalance) < 0.001 };
    });
    const globalSum = report.reduce((acc, r) => acc + r.ledgerSum, 0);
    res.json({ wallets: report, globalSystemLiquidity: globalSum, health: report.every(r => r.isHealthy) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// ==========================
// 🛡️ ADMIN & PROVIDER DASHBOARDS (Kept for completeness)
// ==========================
app.get("/admin/deposits", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const d = await prisma.deposit.findMany({ include: { user: { select: { email: true } } }, orderBy: { createdAt: "desc" } });
  res.json(d);
});

app.post("/admin/deposit/approve", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { depositId } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      const deposit = await tx.deposit.findUnique({ where: { id: depositId }, include: { user: { include: { wallet: true } } } });
      if (!deposit || deposit.status !== "PENDING") throw new Error("Invalid deposit request");
      await tx.deposit.update({ where: { id: depositId }, data: { status: "APPROVED", approvedAt: new Date() } });
      await recordFinancialMutation(tx, deposit.user.wallet.id, "DEPOSIT", deposit.amount, deposit.id);
      await createAuditLog(req.user.userId, "APPROVE_DEPOSIT", depositId, { amount: deposit.amount }, req);
    });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.post("/withdraw", authMiddleware, async (req, res) => {
  const { amount, method, address } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { wallet: true } });
    if (user.lastWithdrawalAt && (Date.now() - new Date(user.lastWithdrawalAt).getTime() < 24 * 60 * 60 * 1000)) return res.status(400).json({ error: "Withdrawal cooldown active." });
    const wallet = await prisma.wallet.findUnique({ where: { id: user.wallet.id }, include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } } });
    const balance = wallet.entries[0]?.balanceAfter || 0;
    if (amount < 100) return res.status(400).json({ error: "Min withdrawal $100" });
    if (balance < amount) return res.status(400).json({ error: "Insufficient balance" });
    await prisma.$transaction(async (tx) => {
      await tx.withdrawal.create({ data: { userId: user.id, amount, method, address } });
      await tx.user.update({ where: { id: user.id }, data: { lastWithdrawalAt: new Date() } });
    });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post("/admin/withdraw/approve", authMiddleware, requireRole("ADMIN"), async (req, res) => {
  const { withdrawalId } = req.body;
  try {
    await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId }, include: { user: { include: { wallet: true } } } });
      if (!withdrawal || withdrawal.status !== "PENDING") throw new Error("Invalid withdrawal request");
      await tx.withdrawal.update({ where: { id: withdrawalId }, data: { status: "APPROVED", approvedAt: new Date() } });
      await recordFinancialMutation(tx, withdrawal.user.wallet.id, "WITHDRAWAL", -withdrawal.amount, withdrawal.id);
      await createAuditLog(req.user.userId, "APPROVE_WITHDRAWAL", withdrawalId, { amount: withdrawal.amount }, req);
    });
    res.json({ success: true });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.get("/provider/stats", authMiddleware, requireRole("PROVIDER"), async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { wallet: true } });
  const wallet = await prisma.wallet.findUnique({ where: { id: user.wallet.id }, include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } } });
  const subCount = await prisma.subscription.count({ where: { providerId: req.user.userId, endDate: { gt: new Date() } } });
  res.json({ score: 42, subscribers: subCount, earnings: wallet.entries[0]?.balanceAfter || 0 });
});

// ... (Other discovery/public routes remain same)
app.get("/providers/top", async (req, res) => {
  const p = await prisma.user.findMany({ where: { role: "PROVIDER" }, take: 10 });
  res.json(p.map(x => ({ ...x, score: 42 })));
});

app.get("/wallet/balance", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { wallet: true } });
  const wallet = await prisma.wallet.findUnique({ where: { id: user.wallet.id }, include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } } });
  res.json({ balance: wallet.entries[0]?.balanceAfter || 0 });
});

app.get("/wallet/transactions", authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId }, include: { wallet: true } });
  const txs = await prisma.ledgerEntry.findMany({ where: { walletId: user.wallet.id }, orderBy: { createdAt: "desc" } });
  res.json(txs);
});

app.get("/sponsors", async (req, res) => { res.json(await prisma.sponsor.findMany({ where: { isActive: true } })); });
app.get("/analyses/latest", async (req, res) => { res.json(await prisma.analysis.findMany({ take: 5, include: { analyst: { select: { name: true } } }, orderBy: { createdAt: "desc" } })); });

// ==========================
// 🚀 START SERVER + ENGINE
// ==========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);

  setInterval(async () => {
    try { await fetchCryptoPrices(); } catch (e) { console.error("Price fetch error:", e.message); }
  }, 10000);

  setInterval(async () => {
    try { await processRecommendations(); } catch (e) { console.error("Engine error:", e.message); }
  }, 15000);
});
