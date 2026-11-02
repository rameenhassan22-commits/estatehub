import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const backendDir = fileURLToPath(new URL("..", import.meta.url));

// Run config/env.js in a clean child process with ONLY the variables we choose
const runWith = (vars, code) =>
  spawnSync(process.execPath, ["-e", code], {
    env: {
      PATH: process.env.PATH,
      SystemRoot: process.env.SystemRoot, // needed by Node on Windows
      DOTENV_CONFIG_PATH: "does-not-exist.env", // do NOT load the real .env file
      DOTENV_CONFIG_QUIET: "true",
      ...vars,
    },
    encoding: "utf8",
    cwd: backendDir,
  });

// 12-Factor "fail fast": a bad environment must stop the app at start-up with a readable message
test("missing MONGO_URI / short JWT_SECRET -> process exits 1 and names the problems", () => {
  const r = runWith({ JWT_SECRET: "short" }, 'import("./config/env.js")');
  assert.equal(r.status, 1);
  assert.match(r.stderr, /MONGO_URI/);
  assert.match(r.stderr, /JWT_SECRET/);
});

test("valid environment loads with defaults and a parsed CORS allow-list", () => {
  const r = runWith(
    { MONGO_URI: "mongodb://x", JWT_SECRET: "x".repeat(20), CLIENT_URL: "https://a.app/, http://localhost:5173" },
    'import("./config/env.js").then(m=>console.log(JSON.stringify([m.config.PORT,m.config.clientOrigins])))'
  );
  assert.equal(r.status, 0, r.stderr);
  const lastLine = r.stdout.trim().split("\n").pop();
  assert.deepEqual(JSON.parse(lastLine), [5000, ["https://a.app", "http://localhost:5173"]]);
});