export const applyServerErrors = (payload, setError, fieldMap = {}) => {
  const entries = Object.entries(payload?.errors || {});
  let attached = 0;

  for (const [field, message] of entries) {
    if (field === "_form") continue;
    setError(fieldMap[field] || field, { type: "server", message });
    attached += 1;
  }

  return attached > 0 ? "" : payload?.message || "Something went wrong. Please try again.";
};