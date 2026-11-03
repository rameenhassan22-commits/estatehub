// One place that defines roles, so pages don't repeat string literals.
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  AGENCY_ADMIN: "agency_admin",
  AGENT: "agent",
  CUSTOMER: "customer",
};

export const STAFF_ROLES = [ROLES.AGENCY_ADMIN, ROLES.AGENT];

export const ROLE_LABELS = {
  super_admin: "Platform Admin",
  agency_admin: "Agency Admin",
  agent: "Agent",
  customer: "Customer",
};

// Where each role lands after login
export const homePathFor = (role) => {
  if (role === ROLES.SUPER_ADMIN) return "/admin";
  if (STAFF_ROLES.includes(role)) return "/dashboard";
  return "/";
};