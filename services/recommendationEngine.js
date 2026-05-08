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
        const isBuyType = ["BUY", "BUY_LIMIT", "BUY_STOP"].includes(r.type);
        const isSellType = ["SELL", "SELL_LIMIT", "SELL_STOP"].includes(r.type);

        let shouldActivate = false;
        
        if (r.type === "BUY" || r.type === "BUY_LIMIT") {
          if (price <= r.entryPrice) shouldActivate = true;
        } else if (r.type === "BUY_STOP") {
          if (price >= r.entryPrice) shouldActivate = true;
        } else if (r.type === "SELL" || r.type === "SELL_LIMIT") {
          if (price >= r.entryPrice) shouldActivate = true;
        } else if (r.type === "SELL_STOP") {
          if (price <= r.entryPrice) shouldActivate = true;
        }

        if (shouldActivate) {
          await prisma.recommendation.update({
            where: { id: r.id },
            data: {
              status: "ACTIVE",
              activatedAt: new Date()
            }
          });
          console.log(`Recommendation ${r.id} (${r.pair.symbol}) activated at ${price} [Type: ${r.type}]`);
        }
      }

      // ======================
      // 2. TP / SL
      // ======================
      if (r.status === "ACTIVE") {
        const isBuyType = ["BUY", "BUY_LIMIT", "BUY_STOP"].includes(r.type);
        const isSellType = ["SELL", "SELL_LIMIT", "SELL_STOP"].includes(r.type);

        // Take Profit
        if (
          (isBuyType && price >= r.takeProfit) ||
          (isSellType && price <= r.takeProfit)
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
          (isBuyType && price <= r.stopLoss) ||
          (isSellType && price >= r.stopLoss)
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
