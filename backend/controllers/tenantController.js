import Tenant from "../models/Tenant.js";
import Property from "../models/Property.js";

// GET /api/tenants/:slug (public): powers the agency page /agency/:slug
export const getTenantBySlug = async (req, res) => {
  const tenant = await Tenant.findOne({ slug: req.params.slug.toLowerCase(), status: "active" }).select(
    "name slug email phone address logoUrl createdAt"
  );
  if (!tenant) return res.status(404).json({ message: "Agency not found" });

  const listings = await Property.countDocuments({ tenantId: tenant._id, status: "available" });
  res.json({ ...tenant.toObject(), listings });
};