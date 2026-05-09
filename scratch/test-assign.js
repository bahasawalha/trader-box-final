const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const p = await prisma.user.findFirst({ where: { role: "PROVIDER" } });
  if (!p) {
    console.log("No provider found");
    return;
  }
  console.log("Assigning sponsor to:", p.email, "(ID:", p.id, ")");
  try {
    const s = await prisma.sponsor.create({
      data: {
        name: "Direct Provider Sponsor",
        logo: "https://via.placeholder.com/150",
        url: "https://example.com",
        isActive: true,
        providerId: p.id
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
