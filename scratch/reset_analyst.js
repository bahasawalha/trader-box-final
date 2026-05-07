const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

async function resetPassword() {
  const hashedPassword = await bcrypt.hash("123456", 10);
  
  // First, check if user exists
  const existing = await prisma.user.findUnique({ where: { email: "analyst@traderbox.com" } });
  
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { password: hashedPassword, role: "ANALYST" }
    });
  } else {
    await prisma.user.create({
      data: {
        email: "analyst@traderbox.com",
        password: hashedPassword,
        name: "Expert Analyst",
        role: "ANALYST",
        referralCode: "ANALYST_REF_" + Math.random().toString(36).substring(7)
      }
    });
  }
  
  console.log("Password reset for analyst@traderbox.com successfully!");
}

resetPassword().finally(() => prisma.$disconnect());
