const axios = require("axios");
const { setPrice } = require("./priceService");

async function fetchCryptoPrices() {
  try {
    const res = await axios.get(
      "https://api.coingecko.com/api/v3/simple/price",
      {
        params: {
          ids: "bitcoin,ethereum",
          vs_currencies: "usd"
        }
      }
    );

    const prices = {
      BTCUSDT: res.data.bitcoin.usd,
      ETHUSDT: res.data.ethereum.usd
    };

    // Integration with existing priceService
    Object.keys(prices).forEach(symbol => {
      setPrice(symbol, prices[symbol]);
    });

    return prices;

  } catch (err) {
    console.error("Price fetch error:", err.message);
    return {};
  }
}

module.exports = fetchCryptoPrices;
