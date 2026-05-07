const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function findAnalyst() {
  const user = await prisma.user.findFirst({
    where: { role: "ANALYST" }
  });
  if (user) {
    console.log("Found Analyst:", user.email);
  } else {
    console.log("No Analyst found. Creating one...");
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("123456", 10);
    const newUser = await prisma.user.create({
      data: {
        email: "analyst@traderbox.com",
        password: hashedPassword,
        name: "Expert Analyst",
        role: "ANALYST"
      }
    });
    console.log("Created Analyst:", newUser.email, "Password: 123456");
  }
}

findAnalyst().finally(() => prisma.$disconnect());
