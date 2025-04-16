const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

module.exports = async (req, res, next) => {
  if (!req.file) return next();

  const inputPath = path.join(__dirname, "..", "images", req.file.filename);
  const extension = path.extname(req.file.filename);

  // Si le fichier est déjà au format .webp, on ne fait rien
  if (extension === ".webp") {
    return next();
  }

  const outputFilename = req.file.filename.split(".")[0] + ".webp";
  const outputPath = path.join(__dirname, "..", "images", outputFilename);

  try {
    await sharp(inputPath)
      .resize({ width: 800 })
      .webp({ quality: 80 })
      .toFile(outputPath);

    fs.unlinkSync(inputPath); // Supprime l'ancienne image
    req.file.filename = outputFilename;
    next();
  } catch (error) {
    console.error("Erreur lors de l'optimisation de l'image :", error);
    res.status(500).json({ message: "Erreur lors du traitement de l'image" });
  }
};
