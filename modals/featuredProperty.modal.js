const mongoose = require("mongoose");

const featuredPropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    location: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    image: {
      type: String, // Cloudinary URL
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const featuredProperty = mongoose.model(
  "FeaturedProperty",
  featuredPropertySchema,
);

module.exports = featuredProperty;
