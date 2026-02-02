const FeaturedProperty = require("../modals/featuredProperty.modal");

/**
 * ================= CREATE FEATURED PROPERTY
 */
exports.createFeaturedProperty = async (req, res) => {
  try {
    const { title, slug, location, price } = req.body;

    // 🔒 Validation
    if (!title || !slug || !location) {
      return res.status(400).json({
        error: "Title, slug, location and price are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Property image is required",
      });
    }

    // 🔒 Safe image extraction
    let image;
    if (req.file.secure_url) image = req.file.secure_url;
    else if (req.file.path) image = req.file.path;
    else {
      return res.status(400).json({
        error: "Image upload failed",
      });
    }

    // 🔒 Slug uniqueness check
    const slugExists = await FeaturedProperty.findOne({ slug });
    if (slugExists) {
      return res.status(409).json({
        error: "Slug already exists",
      });
    }

    const property = new FeaturedProperty({
      title,
      slug,
      location,
      price,
      image,
    });

    await property.save();

    return res.status(201).json({
      message: "Featured property created successfully",
      property,
    });
  } catch (error) {
    console.error("CREATE FEATURED PROPERTY ERROR:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

/**
 * ================= GET ALL FEATURED PROPERTIES
 */
exports.getFeaturedProperties = async (req, res) => {
  try {
    const properties = await FeaturedProperty.find({ isActive: true }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      count: properties.length,
      properties,
    });
  } catch (error) {
    console.error("GET FEATURED PROPERTIES ERROR:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

/**
 * ================= GET FEATURED PROPERTY BY SLUG
 */
exports.getFeaturedPropertyBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const property = await FeaturedProperty.findOne({
      slug,
      isActive: true,
    });

    if (!property) {
      return res.status(404).json({
        error: "Featured property not found",
      });
    }

    return res.status(200).json(property);
  } catch (error) {
    console.error("GET FEATURED PROPERTY ERROR:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

/**
 * ================= UPDATE FEATURED PROPERTY
 */
exports.updateFeaturedProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, location, price } = req.body;

    const updateData = { location, price };

    if (title) updateData.title = title;
    if (slug) updateData.slug = slug;

    // 🔒 Optional image update
    if (req.file) {
      if (req.file.secure_url) updateData.image = req.file.secure_url;
      else if (req.file.path) updateData.image = req.file.path;
      else {
        return res.status(400).json({ error: "Image upload failed" });
      }
    }

    const property = await FeaturedProperty.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!property) {
      return res.status(404).json({
        error: "Featured property not found",
      });
    }

    return res.status(200).json({
      message: "Featured property updated successfully",
      property,
    });
  } catch (error) {
    console.error("UPDATE FEATURED PROPERTY ERROR:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};

/**
 * ================= DELETE FEATURED PROPERTY (SOFT DELETE)
 */

exports.deleteFeaturedProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await FeaturedProperty.findByIdAndDelete(id);

    if (!property) {
      return res.status(404).json({
        error: "Featured property not found",
      });
    }

    return res.status(200).json({
      message: "Featured property deleted permanently",
    });
  } catch (error) {
    console.error("DELETE FEATURED PROPERTY ERROR:", error);
    return res.status(500).json({
      error: error.message || "Internal server error",
    });
  }
};
