const { verifyToken } = require("../utils/auth");

function authMiddleware(req, res, next) {
  // Support both: cookie-based (same-origin) and Bearer token (cross-origin)
  let token = req.cookies.token;
  
  if (!token && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

module.exports = authMiddleware;
