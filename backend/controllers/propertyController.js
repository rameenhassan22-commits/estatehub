import Property from "../models/Property.js";

// 1. GET /api/properties (Public browse + Agency filtering)
export const listProperties = async (req, res) => {
  try {
    const {
      q, sort = "-createdAt", page = 1, limit = 10,
      propertyType, purpose, status, minPrice, maxPrice, city,
    } = req.query;

    let filter = {};

    // TENANT ISOLATION: If logged in as agency staff, ONLY show their properties
    if (req.user && ["agency_admin", "agent"].includes(req.user.role)) {
      filter.tenantId = req.user.tenantId;
    } else {
      // Public / Customer: ONLY show available properties
      filter.status = "available";
    }

    // Search query
    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { "location.city": { $regex: q, $options: "i" } },
        { "location.area": { $regex: q, $options: "i" } },
      ];
    }
    
    // Filters
    if (propertyType) filter.propertyType = propertyType;
    if (purpose) filter.purpose = purpose;
    if (status) filter.status = status;
    if (city) filter["location.city"] = { $regex: city, $options: "i" };
    if (minPrice || maxPrice) {
      filter.price = {
        ...(minPrice && { $gte: Number(minPrice) }),
        ...(maxPrice && { $lte: Number(maxPrice) }),
      };
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Property.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate("createdBy", "name email"),
      Property.countDocuments(filter),
    ]);

    res.json({ items, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. GET /api/properties/:id
export const getProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate("createdBy", "name");
    if (!property) return res.status(404).json({ message: "Property not found" });

    // TENANT ISOLATION: Agency staff cannot view another agency's property by changing the ID
    const isAgencyUser = ["agency_admin", "agent"].includes(req.user?.role);
    if (isAgencyUser && String(property.tenantId) !== String(req.user.tenantId)) {
      return res.status(403).json({ message: "Forbidden: cross-tenant access" });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. POST /api/properties (Admin/Agent only)
export const createProperty = async (req, res) => {
  try {
    const property = await Property.create({
      ...req.body,
      tenantId: req.user.tenantId,   // <-- FORCED from the logged-in user
      createdBy: req.user._id,
    });
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 4. PUT /api/properties/:id
export const updateProperty = async (req, res) => {
  try {
    // Find the property AND ensure it belongs to the user's tenant
    const property = await Property.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId, 
    });

    if (!property) return res.status(404).json({ message: "Not found in your agency" });

    // Agents can only edit properties they created
    if (req.user.role === "agent" && String(property.createdBy) !== String(req.user._id)) {
      return res.status(403).json({ message: "Agents can only edit their own listings" });
    }

    // Prevent changing the tenantId or createdBy
    const { tenantId, createdBy, ...safeUpdates } = req.body;
    Object.assign(property, safeUpdates);
    
    await property.save();
    res.json(property);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 5. DELETE /api/properties/:id (Agency Admin only)
export const deleteProperty = async (req, res) => {
  try {
    // Find the property AND ensure it belongs to the user's tenant
    const property = await Property.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId,
    });

    if (!property) return res.status(404).json({ message: "Not found in your agency" });
    res.json({ message: "Property deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};