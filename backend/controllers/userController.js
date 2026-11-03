import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { sendMail, sendInBackground } from "../utils/mailer.js";
import { teamInviteEmail } from "../utils/emailTemplates.js";
// POST /api/users (agency_admin only)
export const createAgencyUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (await User.exists({ email })) {
    return res.status(409).json({ message: "Email already in use", errors: { email: "Email already in use" } });
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    tenantId: req.user.tenantId, // the agent gets the ADMIN's tenantId
  });

  const tenant = await Tenant.findById(req.user.tenantId).select("name");
  sendInBackground(sendMail({ to: email, ...teamInviteEmail(user, tenant, req.user) }));
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    tenantId: user.tenantId,
  });
};

// GET /api/users (agency_admin only, own agency)
export const listAgencyUsers = async (req, res) => {
  const users = await User.find({ tenantId: req.user.tenantId }).select("-password").sort("role name");
  res.json(users);
};

// PATCH /api/users/:id -> activate / deactivate a team member
export const updateAgencyUser = async (req, res) => {
  const target = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!target) return res.status(404).json({ message: "User not found in your agency" });

  if (String(target._id) === String(req.user._id)) {
    return res.status(400).json({ message: "You cannot deactivate yourself" });
  }

  target.isActive = req.body.isActive;
  await target.save();
  res.json({ _id: target._id, isActive: target.isActive });
};

// DELETE /api/users/:id
export const deleteAgencyUser = async (req, res) => {
  const target = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!target) return res.status(404).json({ message: "User not found in your agency" });

  if (String(target._id) === String(req.user._id)) {
    return res.status(400).json({ message: "Cannot delete yourself" });
  }

  await target.deleteOne();
  res.json({ message: "User deleted successfully" });
};