const { PrismaClient } = require("@prisma/client");
const { getPrice } = require("./priceService");

const prisma = new PrismaClient();

async function processRecommendations() {
  try {
    const recs = await prisma.recommendation.findMany({
      where: {
        status: {
          in: ["PENDING", "ACTIVE"]
        }
      },
      include: { pair: true }
    });

    for (const r of recs) {
      const price = getPrice(r.pair.symbol);
      if (!price) continue;

      // ======================
      // 1. Activation
      // ======================
      if (r.status === "PENDING") {
        if (
          (r.type === "BUY" && price <= r.entryPrice) ||
          (r.type === "SELL" && price >= r.entryPrice)
        ) {
          await prisma.recommendation.update({
            where: { id: r.id },
            data: {
              status: "ACTIVE",
              activatedAt: new Date()
            }
          });
          console.log(`Recommendation ${r.id} (${r.pair.symbol}) activated at ${price}`);
        }
      }

      // ======================
      // 2. TP / SL
      // ======================
      if (r.status === "ACTIVE") {
        // Take Profit
        if (
          (r.type === "BUY" && price >= r.takeProfit) ||
          (r.type === "SELL" && price <= r.takeProfit)
        ) {
          await prisma.recommendation.update({
            where: { id: r.id },
            data: {
              status: "CLOSED",
              result: "WIN",
              closedAt: new Date()
            }
          });
          console.log(`Recommendation ${r.id} (${r.pair.symbol}) closed with WIN at ${price}`);
        }

        // Stop Loss
        else if (
          (r.type === "BUY" && price <= r.stopLoss) ||
          (r.type === "SELL" && price >= r.stopLoss)
        ) {
          await prisma.recommendation.update({
            where: { id: r.id },
            data: {
              status: "CLOSED",
              result: "LOSS",
              closedAt: new Date()
            }
          });
          console.log(`Recommendation ${r.id} (${r.pair.symbol}) closed with LOSS at ${price}`);
        }
      }

      // ======================
      // 3. Expiration (48h)
      // ======================
      const now = Date.now();
      const created = new Date(r.createdAt).getTime();

      if (r.status === "PENDING" && now - created > 48 * 60 * 60 * 1000) {
        await prisma.recommendation.update({
          where: { id: r.id },
          data: {
            status: "EXPIRED"
          }
        });
        console.log(`Recommendation ${r.id} (${r.pair.symbol}) expired`);
      }
    }
  } catch (error) {
    console.error("Error processing recommendations:", error.message);
  }
}

module.exports = processRecommendations;
