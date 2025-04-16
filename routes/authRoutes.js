const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Inscription
router.post("/signup", authController.signup);

// Connexion
router.post("/login", authController.login);

module.exports = router;
