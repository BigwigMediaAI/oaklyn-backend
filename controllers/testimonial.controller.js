const Testimonial = require("../modals/testimonial.modal");

/* =========================
   CREATE TESTIMONIAL (ADMIN)
========================= */
exports.createTestimonial = async (req, res) => {
  try {
    const { name, message, designation, rating, isActive } = req.body;

    // 🔒 Basic validation
    if (!name || !message) {
      return res.status(400).json({
        message: "Name and message are required",
      });
    }

    // 🔒 Safe image extraction (same as blog)
    let image = null;

    if (req.file) {
      if (req.file.secure_url) {
        image = req.file.secure_url;
      } else if (req.file.path) {
        image = req.file.path;
      } else {
        return res.status(400).json({
          message: "Image upload failed (no path or URL)",
        });
      }
    }

    const testimonial = new Testimonial({
      name,
      message,
      designation,
      rating,
      isActive,
      image,
    });

    await testimonial.save();

    return res.status(201).json({
      message: "Testimonial created successfully",
      testimonial,
    });
  } catch (error) {
    console.error("CREATE TESTIMONIAL ERROR:", error);
    return res.status(500).json({
      message: error.message || "Failed to create testimonial",
    });
  }
};

/* =========================
   GET ALL TESTIMONIALS (ADMIN)
========================= */
exports.getAllTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    return res.status(200).json(testimonials);
  } catch (error) {
    console.error("GET TESTIMONIALS ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch testimonials",
    });
  }
};

/* =========================
   GET ACTIVE TESTIMONIALS (PUBLIC)
========================= */
exports.getPublicTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json(testimonials);
  } catch (error) {
    console.error("PUBLIC TESTIMONIAL ERROR:", error);
    return res.status(500).json({
      message: "Failed to fetch testimonials",
    });
  }
};

/* =========================
   UPDATE TESTIMONIAL
========================= */
exports.updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({
        message: "Testimonial not found",
      });
    }

    // 🔒 Safe image extraction (same as blog)
    if (req.file) {
      if (req.file.secure_url) {
        testimonial.image = req.file.secure_url;
      } else if (req.file.path) {
        testimonial.image = req.file.path;
      } else {
        return res.status(400).json({
          message: "Image upload failed (no path or URL)",
        });
      }
    }

    testimonial.name = req.body.name ?? testimonial.name;
    testimonial.message = req.body.message ?? testimonial.message;
    testimonial.designation = req.body.designation ?? testimonial.designation;
    testimonial.rating = req.body.rating ?? testimonial.rating;
    testimonial.isActive =
      req.body.isActive !== undefined
        ? req.body.isActive
        : testimonial.isActive;

    await testimonial.save();

    return res.status(200).json({
      message: "Testimonial updated successfully",
      testimonial,
    });
  } catch (error) {
    console.error("UPDATE TESTIMONIAL ERROR:", error);
    return res.status(500).json({
      message: error.message || "Failed to update testimonial",
    });
  }
};

/* =========================
   DELETE TESTIMONIAL
========================= */
exports.deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Testimonial.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Testimonial not found",
      });
    }

    return res.status(200).json({
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    console.error("DELETE TESTIMONIAL ERROR:", error);
    return res.status(500).json({
      message: "Failed to delete testimonial",
    });
  }
};
