const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.user.findFirst({ where: { role: "PROVIDER" } });
  if (!p) {
    console.log("No provider found");
    return;
  }
  console.log("Provider ID:", p.id);
  try {
    const s = await prisma.sponsor.create({
      data: {
        name: "Provider Test Sponsor",
        logo: "https://example.com/logo.png",
        url: "https://example.com",
        isActive: true,
        providerId: p.id
      }
    });
    console.log("Success with provider:", s);
  } catch (e) {
    console.error("Error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
