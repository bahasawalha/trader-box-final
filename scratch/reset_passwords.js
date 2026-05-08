
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

async function main() {
  const hashedPassword = await bcrypt.hash("123456", 10);
  const emails = [
    "admin@traderbox.com",
    "analyst@traderbox.com",
    "user@traderbox.com",
    "provider@traderbox.com"
  ];

  console.log("Resetting passwords to '123456'...");

  for (const email of emails) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });
      console.log(`Updated: ${email}`);
    } else {
      console.log(`Not found: ${email}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
