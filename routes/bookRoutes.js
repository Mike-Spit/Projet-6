const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const auth = require("../middleware/auth"); // Middleware d'authentification
const multer = require("../middleware/multer-config"); // Middleware de gestion des fichiers
const resizeImage = require("../middleware/resizeImage"); // Middleware de redimensionnement des images
const fs = require("fs");
const path = require("path");
const user = require("../models/user");

// Route POST pour ajouter un livre avec image (protégée par auth)
router.post("/", auth, multer, resizeImage, async (req, res) => {
  try {
    // Affiche ce qu'on reçoit pour debug
    console.log("💬 Champ 'book' brut :", req.body.book);
    console.log("📷 Fichier image reçu :", req.file);

    // Conversion sécurisée des champs JSON stringifiés
    let parsedBody;
    try {
      parsedBody = JSON.parse(req.body.book);
    } catch (err) {
      return res.status(400).json({
        message:
          "Données JSON invalides ou manquantes. Format attendu : champ 'book' contenant un JSON stringifié.",
      });
    }

    const { title, author, year, genre, ratings } = parsedBody;

    // Vérifie les champs obligatoires
    if (!title || !author || !req.file || !year || !genre) {
      return res
        .status(400)
        .json({ message: "Tous les champs sont obligatoires." });
    }

    // Génère l'URL complète de l'image uploadée
    const imageUrl = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;

    // Préparation des notes avec userId
    let processedRatings = [];

    if (typeof ratings === "number") {
      processedRatings = [{ userId: req.auth.userId, grade: ratings }];
    } else if (Array.isArray(ratings)) {
      processedRatings = ratings.map((rating) => ({
        ...rating,
        userId: rating.userId || req.auth.userId,
      }));
    }

    // Calcul de la moyenne
    let averageRating = 0;
    if (processedRatings.length > 0) {
      const total = processedRatings.reduce(
        (sum, rating) => sum + rating.grade,
        0
      );
      averageRating = total / processedRatings.length;
    }

    // Création du livre
    const newBook = new Book({
      title,
      author,
      imageUrl,
      year,
      genre,
      ratings: processedRatings,
      averageRating,
      userId: req.auth.userId, // Ajout de l'ID utilisateur
    });

    await newBook.save();
    res
      .status(201)
      .json({ message: "Livre ajouté avec succès !", book: newBook });
  } catch (error) {
    console.error("Erreur interne :", error);
    res.status(500).json({ message: "Erreur lors de l'ajout du livre", error });
  }
});

// Route POST pour ajouter une note à un livre
router.post("/:id/rating", auth, async (req, res) => {
  try {
    const bookId = req.params.id;
    const { userId, rating } = req.body;

    // Conversion explicite du rating en nombre
    const numericRating = Number(rating);

    // Vérification que la note est bien un nombre compris entre 0 et 5
    if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
      return res
        .status(400)
        .json({ message: "La note doit être un nombre entre 0 et 5." });
    }

    // Récupération du livre par son ID
    const book = await Book.findById(bookId);

    // Vérification si le livre existe
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé !" });
    }

    // Vérification si l'utilisateur a déjà noté ce livre
    const existingRating = book.ratings.find((r) => r.userId === userId);
    if (existingRating) {
      return res
        .status(400)
        .json({ message: "L'utilisateur a déjà noté ce livre." });
    }

    // Ajout de la nouvelle note dans le tableau ratings
    book.ratings.push({ userId, grade: numericRating });

    // Calcul de la nouvelle moyenne des notes
    book.averageRating =
      book.ratings.reduce((sum, r) => sum + r.grade, 0) / book.ratings.length;

    // Sauvegarde du livre modifié dans la base de données
    await book.save();

    // Retourne une réponse positive avec le livre modifié
    res.status(200).json({ message: "Note ajoutée avec succès !", book });
  } catch (error) {
    console.error("Erreur interne lors de l'ajout de la note :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout de la note.", error });
  }
});

// Route GET - récupérer tous les livres
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des livres", error });
  }
});

// Route GET pour les livres les mieux notés (avant la route :id)
router.get("/bestrating", async (req, res) => {
  try {
    const bestRatedBooks = await Book.find()
      .sort({ averageRating: -1 })
      .limit(3);
    res.status(200).json(bestRatedBooks);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des meilleurs livres :",
      error
    );
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

const jwt = require("jsonwebtoken");

// Route GET - récupérer un livre par ID (authentification facultative)

router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    const bookObject = book.toObject();

    // ✅ On expose systématiquement le userId (nécessaire pour le front)
    bookObject.userId = book.userId ?? undefined;

    console.log("📤 Résultat envoyé au front :", bookObject);
    res.status(200).json(bookObject);
  } catch (error) {
    console.error("🚨 Erreur lors de la récupération du livre :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du livre", error });
  }
});

router.put("/:id", auth, multer, resizeImage, async (req, res) => {
  try {
    const bookId = req.params.id;
    const existingBook = await Book.findById(bookId);

    if (!existingBook) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    // Suppression ancienne image si nouvelle
    let imageUrl = existingBook.imageUrl;
    if (req.file) {
      const oldFilename = existingBook.imageUrl?.split("/images/")[1];
      if (oldFilename) {
        const oldPath = path.join(__dirname, "..", "images", oldFilename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      imageUrl = `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`;
    }

    // Parse champ 'book'
    let parsedBody;

    if (req.body.book) {
      // Si on reçoit un champ 'book', on tente de le parser
      try {
        parsedBody =
          typeof req.body.book === "string"
            ? JSON.parse(req.body.book)
            : req.body.book;
      } catch (err) {
        return res.status(400).json({
          message:
            "Format invalide. Le champ 'book' doit être un objet ou un JSON valide.",
        });
      }
    } else {
      // Sinon on utilise directement req.body
      parsedBody = req.body;
    }

    // Traitement des notes
    let processedRatings = existingBook.ratings;
    if (Array.isArray(parsedBody.ratings)) {
      processedRatings = parsedBody.ratings.map((r) => ({
        userId: r.userId || req.auth.userId,
        grade: Number(r.grade),
      }));
    }

    const averageRating =
      processedRatings.reduce((sum, r) => sum + r.grade, 0) /
      processedRatings.length;

    // Mise à jour
    const updatedBook = await Book.findByIdAndUpdate(
      bookId,
      {
        title: parsedBody.title,
        author: parsedBody.author,
        year: parsedBody.year,
        genre: parsedBody.genre,
        ratings: processedRatings,
        averageRating,
        imageUrl,
      },
      { new: true, runValidators: true }
    );

    console.log("📤 Résultat envoyé au front :", updatedBook);
    res.status(200).json(updatedBook);
  } catch (error) {
    console.error("Erreur lors de la mise à jour :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du livre", error });
  }
});
// Route DELETE - suppression d'un livre (protégée)
router.delete("/:id", auth, async (req, res) => {
  try {
    const bookToDelete = await Book.findById(req.params.id);
    if (!bookToDelete) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    // Supprime l’image du serveur si elle existe
    const filename = bookToDelete.imageUrl.split("/images/")[1];
    const filePath = path.join(__dirname, "..", "images", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Book.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Livre supprimé avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur lors de la suppression", error });
  }
});

module.exports = router;
