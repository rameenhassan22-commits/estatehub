import User from "../models/User.js";
import Tenant from "../models/Tenant.js";
import { generateToken } from "../utils/generateToken.js";
import { sendMail, sendInBackground } from "../utils/mailer.js";
import { welcomeAgencyEmail, welcomeCustomerEmail } from "../utils/emailTemplates.js";

// "Prime Estate!" -> "prime-estate"
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// Never send the password hash to the browser
const sanitizeUser = (u) => ({
  _id: u._id,
  name: u.name,
  email: u.email,
  role: u.role,
  tenantId: u.tenantId,
});

const tenantSummary = (t) => (t ? { _id: t._id, name: t.name, slug: t.slug, status: t.status } : null);

// Same response shape for login / register / me
const authResponse = async (user, extra = {}) => {
  const tenant = extra.tenant ?? (user.tenantId ? await Tenant.findById(user.tenantId) : null);
  return { token: generateToken(user._id), user: sanitizeUser(user), tenant: tenantSummary(tenant) };
};

// POST /api/auth/register-agency -> creates the Tenant AND its first agency_admin
export const registerAgency = async (req, res) => {
  const { agencyName, name, email, password } = req.body; // already validated by Zod

  if (await User.exists({ email })) {
    return res.status(409).json({ message: "Email already in use", errors: { email: "Email already in use" } });
  }

  let tenant;
  try {
    tenant = await Tenant.create({
      name: agencyName,
      slug: `${slugify(agencyName) || "agency"}-${Date.now().toString(36)}`,
      email,
    });
    // THIS is where an agency admin gets its tenantId
    const admin = await User.create({ name, email, password, role: "agency_admin", tenantId: tenant._id });
    sendInBackground(sendMail({ to: email, ...welcomeAgencyEmail(admin, tenant) })); // welcome email, never blocks sign-up
    res.status(201).json(await authResponse(admin, { tenant }));
  } catch (err) {
    // If the 2nd write fails, undo the 1st so we never leave an orphan agency
    if (tenant) await Tenant.deleteOne({ _id: tenant._id });
    throw err;
  }
};

// POST /api/auth/register-customer (customers belong to no agency: tenantId = null)
export const registerCustomer = async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.exists({ email })) {
    return res.status(409).json({ message: "Email already in use", errors: { email: "Email already in use" } });
  }

  const user = await User.create({ name, email, password, role: "customer" });
  sendInBackground(sendMail({ to: email, ...welcomeCustomerEmail(user) }));
  res.status(201).json(await authResponse(user));
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  // password has select:false in the model, so we ask for it explicitly
  const user = await User.findOne({ email }).select("+password");

  // Same message for "no such user" and "wrong password", so attackers can't learn which emails exist
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }
  if (!user.isActive) {
    return res.status(403).json({ message: "This account has been deactivated" });
  }

  const payload = await authResponse(user);
  if (payload.tenant && payload.tenant.status !== "active") {
    return res.status(403).json({ message: "Your agency account is suspended. Contact support." });
  }
  res.json(payload);
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  const { token, ...rest } = await authResponse(req.user); // token not needed again
  res.json(rest);
};