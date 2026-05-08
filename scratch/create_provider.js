
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const crypto = require("crypto");

async function main() {
  const email = "provider@traderbox.com";
  const hashedPassword = await bcrypt.hash("123456", 10);
  
  console.log(`Creating provider: ${email}...`);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Pro Provider",
        role: "PROVIDER",
        referralCode: "PRO_" + crypto.randomBytes(4).toString('hex'),
        wallet: {
          create: {}
        }
      }
    });
    console.log("Provider created successfully with ID:", user.id);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log("Provider already exists.");
    } else {
      console.error("Error creating provider:", error);
    }
  }
}

main().finally(() => prisma.$disconnect());
