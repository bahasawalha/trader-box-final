const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = new PrismaClient();

async function main() {
  const users = [
    { email: "admin@traderbox.com", password: "admin123", role: "ADMIN", name: "Master Admin" },
    { email: "provider@traderbox.com", password: "provider123", role: "PROVIDER", name: "Alpha Provider" },
    { email: "analyst@traderbox.com", password: "analyst123", role: "ANALYST", name: "Chief Analyst" },
    { email: "user@traderbox.com", password: "user123", role: "USER", name: "Elite Trader" }
  ];

  console.log("🚀 Creating test users...");

  for (const u of users) {
    const hashedPassword = await bcrypt.hash(u.password, 10);
    try {
      const newUser = await prisma.user.upsert({
        where: { email: u.email },
        update: { password: hashedPassword, role: u.role, name: u.name },
        create: {
          email: u.email,
          password: hashedPassword,
          role: u.role,
          name: u.name,
          referralCode: crypto.randomUUID()
        }
      });
      
      // Ensure wallet exists
      await prisma.wallet.upsert({
        where: { userId: newUser.id },
        update: {},
        create: { userId: newUser.id }
      });

      console.log(`✅ Created/Updated: ${u.email} (${u.role})`);
    } catch (e) {
      console.error(`❌ Failed for ${u.email}:`, e.message);
    }
  }

  console.log("✨ All test users are ready!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
