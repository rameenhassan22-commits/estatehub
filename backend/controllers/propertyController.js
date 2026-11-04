import Property from "../models/Property.js";
import Inquiry from "../models/Inquiry.js";
import Tenant from "../models/Tenant.js";
import { escapeRegex } from "../utils/escapeRegex.js";

const isStaff = (user) => ["agency_admin", "agent"].includes(user?.role);

// 1. GET /api/properties
//    - Public / customer -> marketplace: only "available" listings of ACTIVE agencies
//    - Agency staff + ?scope=agency -> only their own agency's listings, any status (dashboard)
//    - ?agency=<slug> -> one agency's public page
export const listProperties = async (req, res) => {
  const { q, sort, page, limit, propertyType, purpose, status, minPrice, maxPrice, city, agency, scope } =
    req.validated.query;

  const filter = {};

  if (scope === "agency" && isStaff(req.user)) {
    // TENANT ISOLATION: tenantId comes from the logged-in user, never from the request
    filter.tenantId = req.user.tenantId;
    if (status) filter.status = status;
  } else {
    // Public marketplace: status is ALWAYS "available". The query string cannot change it,
    // otherwise any visitor could pass ?status=draft and read other agencies' drafts.
    filter.status = "available";

    const activeTenantIds = await Tenant.find({ status: "active" }).distinct("_id");
    filter.tenantId = { $in: activeTenantIds };

    if (agency) {
      const tenant = await Tenant.findOne({ slug: agency, status: "active" }).select("_id");
      if (!tenant) return res.json({ items: [], total: 0, page, pages: 0 });
      filter.tenantId = tenant._id;
    }
  }

  if (q) {
    const rx = new RegExp(escapeRegex(q), "i"); // user text is escaped: no regex injection
    filter.$or = [{ title: rx }, { "location.city": rx }, { "location.area": rx }];
  }
  if (propertyType) filter.propertyType = propertyType;
  if (purpose) filter.purpose = purpose;
  if (city) filter["location.city"] = new RegExp(escapeRegex(city), "i");
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {
      ...(minPrice !== undefined && { $gte: minPrice }),
      ...(maxPrice !== undefined && { $lte: maxPrice }),
    };
  }

  const [items, total] = await Promise.all([
    Property.find(filter)
      .sort(sort) // whitelisted by Zod
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("createdBy", "name")
      .populate("tenantId", "name slug"),
    Property.countDocuments(filter),
  ]);

  res.json({ items, total, page, pages: Math.ceil(total / limit) });
};

// 2. GET /api/properties/:id
export const getProperty = async (req, res) => {
  const property = await Property.findById(req.params.id)
    .populate("createdBy", "name")
    .populate("tenantId", "name slug email phone status");

  if (!property) return res.status(404).json({ message: "Property not found" });

  const ownerStaff = isStaff(req.user) && String(property.tenantId?._id) === String(req.user.tenantId);
  const isSuperAdmin = req.user?.role === "super_admin";

  // Visitors see only published listings of active agencies; staff can also see their own drafts
  const publiclyVisible = property.status === "available" && property.tenantId?.status === "active";
  if (!publiclyVisible && !ownerStaff && !isSuperAdmin) {
    return res.status(404).json({ message: "Property not found" });
  }

  res.json(property);
};
// GET /api/properties/manage/:id  -> used by the dashboard EDIT page
// Searched by id AND tenantId: another agency's property is simply "not found"
export const getManagedProperty = async (req, res) => {
  const property = await Property.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!property) return res.status(404).json({ message: "Property not found" });

  // Agents can only open their own listings
  if (req.user.role === "agent" && String(property.createdBy) !== String(req.user._id)) {
    return res.status(404).json({ message: "Property not found" });
  }
  res.json(property);
};
// 3. POST /api/properties (agency_admin, agent)
export const createProperty = async (req, res) => {
  const property = await Property.create({
    ...req.body, // validated + strict: only known fields can be here
    tenantId: req.user.tenantId, // forced from the logged-in user
    createdBy: req.user._id,
  });
  res.status(201).json(property);
};

// 4. PUT /api/properties/:id
export const updateProperty = async (req, res) => {
  // Searching by BOTH id and tenantId: another agency's property is simply "not found"
  const property = await Property.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!property) return res.status(404).json({ message: "Not found in your agency" });

  // Agents can only edit their own listings; agency_admin can edit all of the agency's
  if (req.user.role === "agent" && String(property.createdBy) !== String(req.user._id)) {
    return res.status(403).json({ message: "Agents can only edit their own listings" });
  }

  Object.assign(property, req.body); // tenantId/createdBy can't be here: the schema is strict
  await property.save();
  res.json(property);
};

// 5. DELETE /api/properties/:id (agency_admin only)
export const deleteProperty = async (req, res) => {
  const property = await Property.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!property) return res.status(404).json({ message: "Not found in your agency" });

  await Inquiry.deleteMany({ propertyId: property._id }); // don't leave orphan inquiries behind
  res.json({ message: "Property deleted" });
};