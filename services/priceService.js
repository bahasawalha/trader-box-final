const prices = {}; // cache

function setPrice(symbol, price) {
  prices[symbol] = price;
}

function getPrice(symbol) {
  return prices[symbol];
}

module.exports = { setPrice, getPrice };
