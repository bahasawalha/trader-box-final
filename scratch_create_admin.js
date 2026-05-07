const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@traderbox.com';
  const password = 'admin123';
  const hashed = await bcrypt.hash(password, 10);

  try {
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role: 'ADMIN',
        name: 'Super Admin',
        referralCode: crypto.randomUUID(),
      }
    });
    await prisma.wallet.create({ data: { userId: admin.id } });
    console.log('✅ Admin created:', email, 'Password:', password);
  } catch (e) {
    console.error('❌ Error creating admin (maybe already exists):', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
