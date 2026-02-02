const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },

    purpose: {
      type: String,
      required: true,
    },

    requirements: {
      type: String,
      required: true,
    },

    budget: {
      type: String,
    },

    message: {
      type: String,
    },
    marked: { type: Boolean, default: false },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
