import Property from "../models/Property.js";

export const inquiryScopeFor = async (user) => {
  if (user.role === "customer") return { customerId: user._id };
  if (user.role === "agent") {
    const mine = await Property.find({ tenantId: user.tenantId, createdBy: user._id }).distinct("_id");
    return { tenantId: user.tenantId, propertyId: { $in: mine } };
  }
  return { tenantId: user.tenantId }; // agency_admin
};