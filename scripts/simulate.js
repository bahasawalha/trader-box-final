const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting Full Platform Simulation...");

  // 1. Clear Database
  await prisma.auditLog.deleteMany();
  await prisma.ledgerEntry.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.sponsor.deleteMany();
  await prisma.pair.deleteMany();
  await prisma.user.deleteMany();

  const hashedPass = await bcrypt.hash("password123", 10);

  // 2. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: "admin@traderbox.com",
      password: hashedPass,
      role: "ADMIN",
      referralCode: "ADMIN_REF",
      name: "Master Admin"
    }
  });
  await prisma.wallet.create({ data: { userId: admin.id } });

  // 3. Create Providers
  const providers = [];
  const providerNames = ["Alpha Strategy", "Bullish Crypto", "FX Master"];
  for (const name of providerNames) {
    const p = await prisma.user.create({
      data: {
        email: `${name.toLowerCase().replace(" ", "")}@traderbox.com`,
        password: hashedPass,
        role: "PROVIDER",
        name: name,
        referralCode: crypto.randomUUID()
      }
    });
    const wallet = await prisma.wallet.create({ data: { userId: p.id } });
    // Initial balance via ledger
    await prisma.ledgerEntry.create({
      data: { walletId: wallet.id, type: "DEPOSIT", amount: 1000, balanceAfter: 1000 }
    });
    providers.push(p);
  }

  // 4. Create Analysts
  const analysts = [];
  const analystNames = ["Gold Analyst", "Weekly Insight"];
  for (const name of analystNames) {
    const a = await prisma.user.create({
      data: {
        email: `${name.toLowerCase().replace(" ", "")}@traderbox.com`,
        password: hashedPass,
        role: "ANALYST",
        name: name,
        referralCode: crypto.randomUUID()
      }
    });
    await prisma.wallet.create({ data: { userId: a.id } });
    analysts.push(a);
  }

  // 5. Create Regular Users
  const users = [];
  for (let i = 1; i <= 3; i++) {
    const u = await prisma.user.create({
      data: {
        email: `user${i}@gmail.com`,
        password: hashedPass,
        role: "USER",
        name: `Trader ${i}`,
        referralCode: `USER_REF_${i}`,
        referredById: i === 2 ? users[0]?.id : null // User 2 referred by User 1
      }
    });
    const wallet = await prisma.wallet.create({ data: { userId: u.id } });
    // Give User 1 some money to subscribe
    await prisma.ledgerEntry.create({
      data: { walletId: wallet.id, type: "DEPOSIT", amount: 500, balanceAfter: 500 }
    });
    users.push(u);
  }

  // 6. Create Pairs & Recommendations
  const btc = await prisma.pair.create({ data: { symbol: "BTCUSDT", name: "Bitcoin" } });
  const eth = await prisma.pair.create({ data: { symbol: "ETHUSDT", name: "Ethereum" } });

  await prisma.recommendation.create({
    data: {
      pairId: btc.id,
      providerId: providers[0].id,
      type: "BUY",
      entryPrice: 65000,
      takeProfit: 68000,
      stopLoss: 63000,
      status: "ACTIVE"
    }
  });

  await prisma.recommendation.create({
    data: {
      pairId: eth.id,
      providerId: providers[1].id,
      type: "SELL",
      entryPrice: 3500,
      takeProfit: 3200,
      stopLoss: 3700,
      status: "PENDING"
    }
  });

  // 7. Create Analyses
  await prisma.analysis.create({
    data: {
      analystId: analysts[0].id,
      title: "BTC Market Outlook 2026",
      content: "Bitcoin is showing strong support at 60k. We expect a bullish wave soon due to institutional demand."
    }
  });

  // 8. Create Sponsors
  await prisma.sponsor.create({
    data: { name: "Binance", logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Binance_Logo.png", url: "https://binance.com" }
  });

  // 9. Create a pending withdrawal for testing
  await prisma.withdrawal.create({
    data: {
      userId: users[0].id,
      amount: 150,
      method: "USDT_TRC20",
      address: "TXXXXX_WITHDRAW_ADDRESS",
      status: "PENDING"
    }
  });

  console.log("✅ Simulation Data Created Successfully!");
  console.log("-----------------------------------------");
  console.log("Admin: admin@traderbox.com / password123");
  console.log("User 1 (with 500$): user1@gmail.com / password123");
  console.log("Provider: alphastrategy@traderbox.com / password123");
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
