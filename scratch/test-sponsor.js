const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  try {
    const s = await prisma.sponsor.create({
      data: {
        name: "Test Sponsor",
        logo: "https://example.com/logo.png",
        url: "https://example.com",
        isActive: true,
        providerId: null
      }
    });
    console.log("Success:", s);
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
