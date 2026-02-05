const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = require("../config/storage");
const upload = multer({ storage });

const {
  createTestimonial,
  getAllTestimonials,
  getPublicTestimonials,
  updateTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonial.controller");

// 🔒 Admin routes (protect with auth middleware)
router.post("/", upload.single("image"), createTestimonial);
router.get("/", getAllTestimonials);
router.put("/:id", upload.single("image"), updateTestimonial);
router.delete("/:id", deleteTestimonial);

// 🌍 Public route
router.get("/public/list", getPublicTestimonials);

module.exports = router;
