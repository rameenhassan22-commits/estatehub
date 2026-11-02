import Tenant from "../models/Tenant.js";
import User from "../models/User.js";
import Property from "../models/Property.js";
import Inquiry from "../models/Inquiry.js";

// Turns [{_id: tenantId, n: 3}] into { "<tenantId>": 3 }
const toMap = (rows) => Object.fromEntries(rows.map((r) => [String(r._id), r.n]));
const countBy = (Model) =>
  Model.aggregate([{ $match: { tenantId: { $ne: null } } }, { $group: { _id: "$tenantId", n: { $sum: 1 } } }]);

// GET /api/admin/overview (super_admin only): platform numbers + every agency
export const overview = async (req, res) => {
  const [tenants, users, properties, totals] = await Promise.all([
    Tenant.find().sort("-createdAt").lean(),
    countBy(User),
    countBy(Property),
    Promise.all([
      Tenant.countDocuments(),
      User.countDocuments({ role: { $ne: "super_admin" } }),
      Property.countDocuments(),
      Inquiry.countDocuments(),
    ]),
  ]);

  const userMap = toMap(users);
  const propMap = toMap(properties);

  res.json({
    stats: { tenants: totals[0], users: totals[1], properties: totals[2], inquiries: totals[3] },
    tenants: tenants.map((t) => ({
      ...t,
      userCount: userMap[String(t._id)] || 0,
      propertyCount: propMap[String(t._id)] || 0,
    })),
  });
};

// PATCH /api/admin/tenants/:id (super_admin only): suspend / reactivate an agency
export const updateTenantStatus = async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!tenant) return res.status(404).json({ message: "Agency not found" });
  res.json(tenant);
};