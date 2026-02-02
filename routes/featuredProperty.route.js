const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = require("../config/storage");
const upload = multer({ storage });

const {
  createFeaturedProperty,
  getFeaturedProperties,
  getFeaturedPropertyBySlug,
  updateFeaturedProperty,
  deleteFeaturedProperty,
} = require("../controllers/featuredProperty.controller");

/* ROUTES */
router.post("/", upload.single("image"), createFeaturedProperty);
router.get("/", getFeaturedProperties);
router.get("/:slug", getFeaturedPropertyBySlug);
router.put("/:id", upload.single("image"), updateFeaturedProperty);
router.delete("/:id", deleteFeaturedProperty);

module.exports = router;
