const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("📥 Header Authorization reçu :", authHeader); // 🔍 1

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("⚠️ Aucun token ou mauvais format. Accès anonyme."); // 🔍 2
      return next(); // Pas d'erreur, mais pas d'auth non plus
    }

    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.auth = { userId: decodedToken.userId };

    console.log("🔐 Middleware Auth OK - userId :", decodedToken.userId); // 🔍 3

    next();
  } catch (error) {
    console.error("❌ Erreur d'authentification :", error); // 🔍 4
    res.status(401).json({ message: "Requête non authentifiée" });
  }
};
