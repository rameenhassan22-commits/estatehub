import User from "../models/User.js";

// POST /api/users  (agency_admin only)
export const createAgencyUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Admin can only create agents or other admins for their agency
    if (!["agency_admin", "agent"].includes(role)) {
      return res.status(400).json({ message: "Role must be agency_admin or agent" });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email in use" });

    const user = await User.create({
      name, 
      email, 
      password, 
      role,
      tenantId: req.user.tenantId, // <-- Force tenantId from the logged-in admin!
    });

    res.status(201).json({ 
      _id: user._id, 
      name, 
      email, 
      role, 
      tenantId: user.tenantId 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/users  (agency_admin only — own agency)
export const listAgencyUsers = async (req, res) => {
  try {
    // Only find users where tenantId matches the logged-in admin's tenantId
    const users = await User.find({ tenantId: req.user.tenantId }).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/users/:id
export const deleteAgencyUser = async (req, res) => {
  try {
    const target = await User.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId, // <-- Cross-tenant security check
    });

    if (!target) {
      return res.status(404).json({ message: "User not found in your agency" });
    }

    if (String(target._id) === String(req.user._id)) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }

    await target.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};