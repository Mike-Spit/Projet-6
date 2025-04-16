require("dotenv").config(); // Charge les variables d’environnement
const mongoose = require("mongoose");
const session = require("express-session");

// Connexion à MongoDB avec l’URL du fichier .env
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connexion réussie à MongoDB !"))
  .catch((err) => console.error("❌ Erreur de connexion à MongoDB :", err));

const authRoutes = require("./routes/authRoutes"); // Import des routes d'authentification
const Book = require("./models/Book"); // Import du modèle Book
const bookRoutes = require("./routes/bookRoutes"); // Importation des routes des livres

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json()); // Permet de lire le JSON dans les requêtes
app.use(cors());
const sess = {
  secret: process.env.JWT_SECRET,
  cookie: {},
};
app.use(session(sess)); // Middleware pour gérer les sessions

// Définition des routes

app.use("/api/auth", authRoutes); // Routes pour l'authentification
app.use("/api/books", bookRoutes); // Routes pour les livres
app.use("/images", express.static(path.join(__dirname, "images"))); // Gestion des images

app.get("/", (req, res) => {
  res.send("Bienvenue sur l'API Mon Vieux Grimoire 📚 !");
});

app.post("/test", (req, res) => {
  console.log(req.body);
  res.status(201).json({ message: "Données reçues avec succès !" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
});
