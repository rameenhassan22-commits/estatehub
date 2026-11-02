// Separate file = separate process, so we can use a tiny limit just for this test.
process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:1/unused";
process.env.JWT_SECRET = "test-secret-test-secret-123456";
process.env.LOG_LEVEL = "silent";
process.env.AUTH_RATE_LIMIT = "3";

import { test, before, after } from "node:test";
import assert from "node:assert/strict";

const { app } = await import("../app.js");

let server, base;
before(async () => {
  await new Promise((r) => (server = app.listen(0, r)));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => server.close());

test("login is rate limited: the 4th attempt in a row gets 429", async () => {
  const statuses = [];
  for (let i = 0; i < 4; i++) {
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "x", password: "y" }), // invalid on purpose: 400 before the DB
    });
    statuses.push(res.status);
    if (i === 3) assert.ok(res.headers.get("ratelimit") || res.headers.get("retry-after"));
  }
  assert.deepEqual(statuses, [400, 400, 400, 429]);
});

test("health checks are never rate limited", async () => {
  for (let i = 0; i < 20; i++) assert.equal((await fetch(`${base}/api/health`)).status, 200);
});