const Property = require("../modals/property.modal");

// @desc    Create a new property with images
// @route   POST /api/properties
// @access  Public or Admin

exports.createProperty = async (req, res) => {
  try {
    const {
      title,
      type,
      description,
      purpose,
      location,
      price,
      bedrooms,
      bathrooms,
      areaSqft,
      highlights,
      featuresAmenities,
      nearby,
      googleMapUrl,
      videoLink,
      builder,
      metatitle,
      metadescription,
    } = req.body;

    // ✅ Handle uploaded images
    const images = req.files?.images
      ? req.files.images.map((file) => file.path)
      : [];

    // ✅ Handle brochure (PDF)
    const brochure = req.files?.brochure ? req.files.brochure[0].path : "";

    // ✅ Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const toNumberOrNull = (value) => {
      if (value === "" || value === undefined) return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };

    const property = new Property({
      title,
      slug,
      type,
      description: description || "",
      purpose,
      location,
      price: toNumberOrNull(price),
      bedrooms,
      bathrooms,
      areaSqft,
      highlights: highlights ? JSON.parse(highlights) : [],
      featuresAmenities: featuresAmenities ? JSON.parse(featuresAmenities) : [],
      nearby: nearby ? JSON.parse(nearby) : [],
      googleMapUrl: googleMapUrl || "",
      videoLink: videoLink || "",
      images,
      brochure,
      builder: builder || "",
      metatitle: metatitle || "",
      metadescription: metadescription || "",
    });

    await property.save();
    res.status(201).json(property);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Failed to create property", error });
  }
};

// @desc    Get all properties
// @route   GET /api/properties
// @access  Public
// controllers/propertyController.js
exports.getProperties = async (req, res) => {
  try {
    const { type, location, purpose, page = 1, limit = 9 } = req.query;

    const query = {};

    // Purpose filter
    if (purpose) {
      query.purpose = { $regex: new RegExp(purpose, "i") };
    }

    // Type filter
    if (type && type !== "all") {
      query.type = { $regex: new RegExp(type.replace(/-/g, " "), "i") };
    }

    // ✅ Multi-location filter (OR condition)
    if (location && location !== "all") {
      const locationsArray = location.split(",");

      // Apply OR condition
      query.location = {
        $in: locationsArray.map((loc) => new RegExp(loc, "i")),
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      properties,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch properties", error });
  }
};

// @desc    Get single property by slug
// @route   GET /api/properties/:slug
// @access  Public
exports.getPropertyBySlug = async (req, res) => {
  try {
    const property = await Property.findOne({ slug: req.params.slug });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }
    res.status(200).json(property);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch property", error });
  }
};

// controllers/propertyController.js
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOneAndDelete({ slug: req.params.slug });
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete property", error });
  }
};

// @desc    Update a property by slug (partial update)
// @route   PATCH /api/properties/:slug
// @access  Admin
exports.updateProperty = async (req, res) => {
  try {
    const existing = await Property.findOne({ slug: req.params.slug });
    if (!existing) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Parse existingImages from frontend (images to keep)
    let images = existing.images;
    if (req.body.existingImages) {
      images = JSON.parse(req.body.existingImages);
    }

    // Append new images if uploaded
    if (req.files?.images) {
      const newImages = req.files.images.map((file) => file.path);
      images = [...images, ...newImages];
    }

    // Handle brochure update
    let brochure = existing.brochure || "";
    if (req.files?.brochure && req.files.brochure[0]) {
      brochure = req.files.brochure[0].path;
    }

    // Generate new slug if title updated
    let slug = existing.slug;
    if (req.body.title) {
      slug = req.body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
    }

    const updatedFields = {
      title: req.body.title ?? existing.title,
      slug,
      description: req.body.description ?? existing.description,
      type: req.body.type ?? existing.type,
      purpose: req.body.purpose ?? existing.purpose,
      location: req.body.location ?? existing.location,
      price:
        req.body.price !== undefined && req.body.price !== ""
          ? Number(req.body.price)
          : existing.price,
      bedrooms:
        req.body.bedrooms !== undefined && req.body.bedrooms !== ""
          ? req.body.bedrooms
          : existing.bedrooms,
      bathrooms:
        req.body.bathrooms !== undefined && req.body.bathrooms !== ""
          ? req.body.bathrooms
          : existing.bathrooms,
      areaSqft:
        req.body.areaSqft !== undefined && req.body.areaSqft !== ""
          ? req.body.areaSqft
          : existing.areaSqft,
      highlights: req.body.highlights
        ? JSON.parse(req.body.highlights)
        : existing.highlights,
      featuresAmenities: req.body.featuresAmenities
        ? JSON.parse(req.body.featuresAmenities)
        : existing.featuresAmenities,
      nearby: req.body.nearby ? JSON.parse(req.body.nearby) : existing.nearby,
      googleMapUrl: req.body.googleMapUrl ?? existing.googleMapUrl,
      videoLink: req.body.videoLink ?? existing.videoLink,
      images,
      brochure,
      builder: req.body.builder ?? existing.builder,
      metatitle: req.body.metatitle ?? existing.metatitle, // ✅ added
      metadescription: req.body.metadescription ?? existing.metadescription, // ✅ added
      lastUpdated: Date.now(),
    };

    const property = await Property.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: updatedFields },
      { new: true },
    );

    res.status(200).json(property);
  } catch (error) {
    console.error("❌ Update Property Error:", error);
    res.status(400).json({ message: "Failed to update property", error });
  }
};
