const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createUsers() {
  const password = await bcrypt.hash('123456', 10);

  async function createAccount(email, name, role, initialBalance, extraProps = {}) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { password, role },
      create: { 
        name, 
        email, 
        password, 
        role, 
        referralCode: role.substring(0,4) + Date.now().toString(36).toUpperCase(),
        ...extraProps
      }
    });

    let wallet = await prisma.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({ data: { userId: user.id } });
      await prisma.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          type: "SYSTEM_MINT",
          amount: initialBalance,
          balanceAfter: initialBalance
        }
      });
    }
    return user;
  }

  await createAccount('user@test.com', 'Test User', 'USER', 1000);
  await createAccount('provider@test.com', 'Test Provider', 'PROVIDER', 5000, { subscriptionPrice: 49.99 });
  await createAccount('analyst@test.com', 'Test Analyst', 'ANALYST', 2000);

  console.log("Accounts created successfully.");
}

createUsers().catch(console.error).finally(() => prisma.$disconnect());
