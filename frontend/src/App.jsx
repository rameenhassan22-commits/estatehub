import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "./features/auth/authSlice";
import { useAuth } from "./hooks/useAuth";
import { api, errorMessage } from "./api/axios";
import { formatPrice } from "./lib/format";

export default function App() {
  const dispatch = useDispatch();
  const { user, tenant, isAuthenticated, logout } = useAuth();
  const [log, setLog] = useState([]);
  // If the page ever reloads, this time changes. It proves a wrong password does NOT reload the page.
  const [loadedAt] = useState(() => new Date().toLocaleTimeString());
  const say = (m) => setLog((l) => [m, ...l].slice(0, 8));

  const doLogin = async (email, password) => {
    const res = await dispatch(login({ email, password }));
    say(res.error ? `login failed: ${res.payload.message}` : `login ok: ${email}`);
  };

  const callTeam = async () => {
    try {
      const { data } = await api.get("/users");
      say(`GET /users ok: ${data.length} team members`);
    } catch (e) {
      say(`GET /users failed (${e.response?.status}): ${errorMessage(e)}`);
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-3xl font-bold text-brand-800">Step 11: auth logic test</h1>
      <p className="mt-1 text-sm text-slate-500">Page loaded at {loadedAt} | {formatPrice(25000000)}</p>

      <div className="card mt-6 p-5">
        {isAuthenticated ? (
          <p className="font-semibold text-brand-700">
            Logged in: {user.name} ({user.role}) {tenant ? `- ${tenant.name}` : ""}
          </p>
        ) : (
          <p className="text-slate-500">Not logged in</p>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={() => doLogin("admin@prime.test", "Demo@1234")}>Login admin</button>
        <button className="btn btn-primary" onClick={() => doLogin("agent@prime.test", "Demo@1234")}>Login agent</button>
        <button className="btn btn-secondary" onClick={() => doLogin("admin@prime.test", "WrongPass1")}>Wrong password</button>
        <button className="btn btn-secondary" onClick={callTeam}>Call GET /users</button>
        <button className="btn btn-danger" onClick={logout}>Logout</button>
      </div>

      <ul className="mt-6 space-y-1 text-sm text-slate-700">
        {log.map((m, i) => <li key={i} className="card px-3 py-2">{m}</li>)}
      </ul>
    </main>
  );
}