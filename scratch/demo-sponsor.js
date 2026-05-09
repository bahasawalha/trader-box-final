const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const s = await prisma.sponsor.create({
      data: {
        name: "Antigravity Elite",
        logo: "http://localhost:5000/uploads/demo_logo.png",
        url: "https://www.google.com",
        isActive: true,
        providerId: null // Homepage
      }
    });
    console.log("Sponsor added for demo:", s);
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
