const BASE = "http://localhost:5000/api";

const post = async (path, body) =>
  (await fetch(BASE + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })).json();
const get = async (path, token) =>
  (await fetch(BASE + path, { headers: token ? { Authorization: `Bearer ${token}` } : {} })).json();

for (const email of ["admin@prime.test", "agent@prime.test", "admin@lahorehomes.test"]) {
  const { token, user, tenant } = await post("/auth/login", { email, password: "Demo@1234" });
  const mine = await get("/properties?scope=agency&limit=50", token);
  const titles = mine.items.map((p) => p.title);
  console.log(`\n${email}  (${user.role}, ${tenant.name})`);
  console.log(`  dashboard sees ${mine.total} listings:`, titles);
}

const pub = await get("/properties?limit=50");
console.log(`\nPublic marketplace sees ${pub.total} available listings (drafts are hidden)`);