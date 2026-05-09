const axios = require("axios");
const { setPrice } = require("./priceService");

async function fetchCryptoPrices() {
  try {
    // Using Binance API instead of CoinGecko for higher rate limits
    const res = await axios.get('https://api.binance.com/api/v3/ticker/price?symbols=["BTCUSDT","ETHUSDT"]');

    const prices = {};
    if (Array.isArray(res.data)) {
      res.data.forEach(ticker => {
        prices[ticker.symbol] = parseFloat(ticker.price);
      });
    }

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
