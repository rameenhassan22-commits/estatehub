import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { registerGracefulShutdown, state } from "../utils/gracefulShutdown.js";

const silent = { info() {}, error() {}, fatal() {}, warn() {} };

const setup = ({ closeFails = false, cleanup } = {}) => {
  state.shuttingDown = false;
  const calls = [];
  const proc = new EventEmitter(); // stands in for `process` so we can "send" signals safely
  const server = {
    close: (cb) => { calls.push("server.close"); setImmediate(() => cb(closeFails ? new Error("boom") : undefined)); },
    closeIdleConnections: () => calls.push("closeIdle"),
  };
  const exitCodes = [];
  registerGracefulShutdown({
    server, logger: silent, proc, timeoutMs: 200,
    cleanup: cleanup || (async () => calls.push("cleanup")),
    exit: (c) => exitCodes.push(c),
  });
  return { proc, calls, exitCodes };
};
const tick = (ms = 30) => new Promise((r) => setTimeout(r, ms));

test("SIGTERM: stops the server, runs cleanup, exits 0, in that order", async () => {
  const { proc, calls, exitCodes } = setup();
  proc.emit("SIGTERM");
  await tick();
  assert.deepEqual(calls.filter((c) => c !== "closeIdle"), ["server.close", "cleanup"]);
  assert.deepEqual(exitCodes, [0]);
  assert.equal(state.shuttingDown, true); // readiness probe now returns 503
});

test("a second signal does not start a second shutdown", async () => {
  const { proc, calls } = setup();
  proc.emit("SIGINT");
  proc.emit("SIGTERM");
  await tick();
  assert.equal(calls.filter((c) => c === "server.close").length, 1);
});

test("unhandled rejection: shuts down with exit code 1", async () => {
  const { proc, exitCodes } = setup();
  proc.emit("unhandledRejection", new Error("bug"));
  await tick();
  assert.deepEqual(exitCodes, [1]);
});

test("if closing fails, exit code is 1", async () => {
  const { proc, exitCodes } = setup({ closeFails: true });
  proc.emit("SIGTERM");
  await tick();
  assert.deepEqual(exitCodes, [1]);
});

test("a cleanup that hangs is force-killed after the timeout", async () => {
  const { proc, exitCodes } = setup({ cleanup: () => new Promise(() => {}) });
  proc.emit("SIGTERM");
  await tick(350);
  assert.deepEqual(exitCodes, [1]);
});