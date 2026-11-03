// Socket.IO handshake + tenant isolation. No database needed:
// attachSocket() accepts a fake `loadUser`, so we can pretend to be different users.
process.env.NODE_ENV = "test";
process.env.MONGO_URI = "mongodb://127.0.0.1:1/unused";
process.env.JWT_SECRET = "test-secret-test-secret-123456";
process.env.LOG_LEVEL = "silent";

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import { io as connect } from "socket.io-client";

const { attachSocket, emitToRooms, closeSocket } = await import("../realtime/socket.js");

// token "adminA" -> admin of agency A, "adminB" -> admin of agency B, "cust" -> a customer
const USERS = {
  adminA: { _id: "u-adminA", role: "agency_admin", tenantId: "tA" },
  adminB: { _id: "u-adminB", role: "agency_admin", tenantId: "tB" },
  cust: { _id: "u-cust", role: "customer", tenantId: null },
};
const loadUser = async (token) => (USERS[token] ? { user: USERS[token] } : { error: "invalid" });

let server, url;
before(async () => {
  server = http.createServer();
  attachSocket(server, { loadUser });
  await new Promise((r) => server.listen(0, r));
  url = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await closeSocket();
});

const open = (token) =>
  new Promise((resolve, reject) => {
    const s = connect(url, { auth: token ? { token } : {}, transports: ["websocket"], reconnection: false });
    s.on("connect", () => resolve(s));
    s.on("connect_error", (e) => {
      s.close();
      reject(e);
    });
  });

const nextEvent = (socket, event, ms = 300) =>
  new Promise((resolve) => {
    const t = setTimeout(() => resolve(null), ms);
    socket.once(event, (p) => {
      clearTimeout(t);
      resolve(p);
    });
  });

test("socket handshake: no token -> refused", async () => {
  await assert.rejects(open(null), /unauthorized/);
});

test("socket handshake: bad token -> refused", async () => {
  await assert.rejects(open("nope"), /invalid/);
});

test("an agency admin receives events for THEIR agency only (tenant isolation)", async () => {
  const a = await open("adminA");
  const b = await open("adminB");
  const gotA = nextEvent(a, "inquiry:new");
  const gotB = nextEvent(b, "inquiry:new");
  emitToRooms(["user:someone-else", "admins:tA"], "inquiry:new", { propertyTitle: "Villa" });
  assert.equal((await gotA).propertyTitle, "Villa");
  assert.equal(await gotB, null); // agency B must never see agency A's inquiry
  a.close();
  b.close();
});

test("a customer receives status updates addressed to them, once even if two rooms match", async () => {
  const c = await open("cust");
  let count = 0;
  c.on("inquiry:updated", () => count++);
  emitToRooms(["user:u-cust", "user:u-cust"], "inquiry:updated", { status: "contacted" });
  await new Promise((r) => setTimeout(r, 200));
  assert.equal(count, 1);
  c.close();
});