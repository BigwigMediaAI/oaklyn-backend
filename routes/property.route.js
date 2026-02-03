const express = require("express");
const router = express.Router();
const propertyController = require("../controllers/property.controller");
const multer = require("multer");
const storage = require("../config/storage"); // Cloudinary storage

const upload = multer({ storage });

// Create a new property with multiple images
// routes/propertyRoutes.js
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 50 },
    { name: "brochure", maxCount: 1 },
  ]),
  propertyController.createProperty,
);

// Get all properties
router.get("/", propertyController.getProperties);

// Get single property by slug
router.get("/:slug", propertyController.getPropertyBySlug);

router.delete("/:slug", propertyController.deleteProperty);

// PATCH route - update property
router.patch(
  "/:slug",
  upload.fields([
    { name: "images", maxCount: 50 },
    { name: "brochure", maxCount: 1 },
  ]),
  propertyController.updateProperty,
);
module.exports = router;
