import Property from "../models/Property.js";
import Inquiry from "../models/Inquiry.js";
import { inquiryScopeFor } from "../utils/inquiryScope.js";

// GET /api/dashboard/summary (agency_admin, agent)
//   admin -> numbers for the whole agency; agent -> numbers for their own listings only
export const summary = async (req, res) => {
  const match = { tenantId: req.user.tenantId };
  if (req.user.role === "agent") match.createdBy = req.user._id;

  const scope = await inquiryScopeFor(req.user);

  const [byStatus, newInquiries, totalInquiries] = await Promise.all([
    Property.aggregate([{ $match: match }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
    Inquiry.countDocuments({ ...scope, status: "new" }),
    Inquiry.countDocuments(scope),
  ]);

  const properties = { available: 0, sold: 0, rented: 0, draft: 0 };
  for (const row of byStatus) properties[row._id] = row.n;

  res.json({
    properties: { ...properties, total: Object.values(properties).reduce((a, b) => a + b, 0) },
    inquiries: { new: newInquiries, total: totalInquiries },
  });
};