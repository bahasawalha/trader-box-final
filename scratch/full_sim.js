const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function simulate() {
  try {
    console.log("🚀 Starting Simulation...");
    
    // 1. Create Test User
    const email = "sim_user_" + Date.now() + "@traderbox.com";
    const hashedPassword = await bcrypt.hash("password123", 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Simulated Trader",
        role: "USER",
        referralCode: "SIM-" + Math.random().toString(36).substring(7).toUpperCase(),
        wallet: { create: {} }
      },
      include: { wallet: true }
    });
    console.log(`✅ User Created: ${email}`);

    // 2. Request Deposit
    const deposit = await prisma.deposit.create({
      data: {
        userId: user.id,
        amount: 1500,
        method: "BINANCE_PAY",
        status: "PENDING",
        reference: "SIM_TX_" + Date.now()
      }
    });
    console.log(`✅ Deposit Requested: $${deposit.amount}`);

    // 3. Admin Approval Simulation
    // We'll mimic the internal logic of the /admin/deposit/approve endpoint
    await prisma.$transaction(async (tx) => {
      await tx.deposit.update({ where: { id: deposit.id }, data: { status: "APPROVED" } });
      
      // The financial orchestrator logic:
      const wallet = await tx.wallet.findUnique({ 
        where: { id: user.wallet.id },
        include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } }
      });
      const currentBalance = wallet.entries[0]?.balanceAfter || 0;
      
      await tx.ledgerEntry.create({
        data: {
          walletId: user.wallet.id,
          type: "DEPOSIT",
          amount: 1500,
          balanceAfter: currentBalance + 1500,
          referenceId: deposit.id
        }
      });
    });
    console.log("✅ Admin Approved Deposit.");

    // 4. Final Balance Check
    const finalWallet = await prisma.wallet.findUnique({
      where: { id: user.wallet.id },
      include: { entries: { orderBy: { createdAt: "desc" }, take: 1 } }
    });
    console.log(`💰 Final Wallet Balance: $${finalWallet.entries[0].balanceAfter}`);
    console.log("-----------------------------------");
    console.log("🏁 Simulation Completed Successfully!");

  } catch (e) {
    console.error("❌ Simulation Failed:", e);
  } finally {
    await prisma.$disconnect();
  }
}

simulate();
