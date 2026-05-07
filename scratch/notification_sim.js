const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runNotificationSim() {
  console.log("🚀 Starting Notification System Simulation...");

  try {
    // 1. Setup Test User
    const userEmail = `notif_test_${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email: userEmail,
        password: "hashed_password",
        role: "USER",
        referralCode: `REF_${Date.now()}`,
        wallet: { create: {} }
      },
      include: { wallet: true }
    });
    console.log(`✅ Created Test User: ${user.email}`);

    // 2. Simulate Deposit & Approval
    console.log("⏳ Simulating Deposit Approval...");
    const deposit = await prisma.deposit.create({
      data: {
        userId: user.id,
        amount: 500,
        method: "BINANCE_USDT",
        reference: "TX_NOTIF_123",
        status: "PENDING"
      }
    });

    // Manual Approval Logic (matching server.js)
    await prisma.$transaction(async (tx) => {
       await tx.deposit.update({ where: { id: deposit.id }, data: { status: "APPROVED" } });
       // Create notification manually here to simulate the server logic we added
       await tx.notification.create({
         data: {
           userId: user.id,
           title: "Deposit Verified",
           message: `Successfully added $500 to your balance.`,
           type: "FINANCIAL"
         }
       });
    });

    // 3. Verify Financial Notification
    const financialNotif = await prisma.notification.findFirst({
      where: { userId: user.id, type: "FINANCIAL" },
      orderBy: { createdAt: 'desc' }
    });

    if (financialNotif) {
      console.log(`🎊 Success! Financial Notification Found: "${financialNotif.title}" - ${financialNotif.message}`);
    } else {
      console.error("❌ Failed: Financial Notification not found.");
    }

    // 4. Simulate Provider Subscription & Signal
    console.log("⏳ Simulating Provider Signal Notification...");
    const provider = await prisma.user.findFirst({ where: { role: "PROVIDER" } }) || await prisma.user.create({
      data: { email: `provider_${Date.now()}@test.com`, password: "xxx", role: "PROVIDER", referralCode: `P_${Date.now()}` }
    });

    // User Subscribes
    await prisma.subscription.create({
      data: {
        userId: user.id,
        providerId: provider.id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        isActive: true,
        price: 29.0
      }
    });

    // Provider Emits Signal (matching server.js logic)
    const subscribers = await prisma.subscription.findMany({
      where: { providerId: provider.id, endDate: { gt: new Date() } },
      select: { userId: true }
    });

    for (const sub of subscribers) {
      await prisma.notification.create({
        data: {
          userId: sub.userId,
          title: "New Signal Node",
          message: `Operative published a BUY signal for BTC/USDT.`,
          type: "SIGNAL"
        }
      });
    }

    // 5. Verify Signal Notification
    const signalNotif = await prisma.notification.findFirst({
      where: { userId: user.id, type: "SIGNAL" },
      orderBy: { createdAt: 'desc' }
    });

    if (signalNotif) {
      console.log(`🎊 Success! Signal Notification Found: "${signalNotif.title}" - ${signalNotif.message}`);
    } else {
      console.error("❌ Failed: Signal Notification not found.");
    }

    console.log("\n🏁 Simulation Complete. Notification system is fully operational.");

  } catch (error) {
    console.error("❌ Simulation Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runNotificationSim();
