import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { generateToken } from "../utils/generateToken.js";

// Helper to create URL-friendly slug from Agency Name
const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// 1. Register a new Agency (Tenant) and its first Admin User
export const registerAgency = async (req, res) => {
  try {
    const { agencyName, name, email, password } = req.body;
    
    if (!agencyName || !name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email in use" });

    // Create the Agency (Tenant)
    const tenant = await Tenant.create({
      name: agencyName,
      slug: slugify(agencyName) + "-" + Date.now().toString(36),
      email,
    });

    // Create the Admin User linked to this Agency
    const admin = await User.create({
      name,
      email,
      password,
      role: "agency_admin",
      tenantId: tenant._id, // Link user to the agency!
    });

    res.status(201).json({
      token: generateToken(admin._id),
      user: sanitizeUser(admin),
      tenant,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 2. Register a Customer (Buyer/Renter)
export const registerCustomer = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: "Email in use" });

    // Customers don't belong to a specific agency (tenantId is null)
    const user = await User.create({ name, email, password, role: "customer" });
    
    res.status(201).json({ 
      token: generateToken(user._id), 
      user: sanitizeUser(user) 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 3. Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // We need to explicitly select the password since we set "select: false" in the model
    const user = await User.findOne({ email }).select("+password");
    
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ 
      token: generateToken(user._id), 
      user: sanitizeUser(user) 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 4. Get Current Logged-in User
export const getMe = async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
};

// Helper to hide password from response
function sanitizeUser(u) {
  return {
    _id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    tenantId: u.tenantId,
  };
}