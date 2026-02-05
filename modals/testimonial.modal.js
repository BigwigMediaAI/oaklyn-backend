const mongoose = require("mongoose");

const testimonialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
    },

    image: {
      type: String, // Cloudinary / S3 URL
      default: null,
    },

    designation: {
      type: String, // Client / Investor / Buyer etc
      default: "Verified Client",
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Testimonial", testimonialSchema);
