const trim = (n) => Number(n.toFixed(2)).toString(); // 2.50 -> "2.5"

// 25,000,000 -> "PKR 2.5 Crore", 7,500,000 -> "PKR 75 Lakh" (how prices are quoted in Pakistan)
export const formatPrice = (value) => {
  if (value >= 10_000_000) return `PKR ${trim(value / 10_000_000)} Crore`;
  if (value >= 100_000) return `PKR ${trim(value / 100_000)} Lakh`;
  return `PKR ${Number(value).toLocaleString("en-PK")}`;
};

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

export const capitalize = (s = "") => s.charAt(0).toUpperCase() + s.slice(1);