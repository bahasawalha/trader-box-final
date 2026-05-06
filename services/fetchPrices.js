const axios = require("axios");
const { setPrice } = require("./priceService");

async function fetchCryptoPrices() {
  try {
    const res = await axios.get("https://api.binance.com/api/v3/ticker/price");

    res.data.forEach((p) => {
      setPrice(p.symbol, parseFloat(p.price));
    });
  } catch (error) {
    console.error("Error fetching crypto prices:", error.message);
  }
}

module.exports = fetchCryptoPrices;
