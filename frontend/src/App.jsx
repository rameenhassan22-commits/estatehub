import { useEffect, useState } from "react";

export default function App() {
  const [health, setHealth] = useState({ text: "Checking the API...", ok: null });

  // Proves two things: the frontend can reach the backend, and CORS is configured correctly
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then((r) => r.json())
      .then((d) => setHealth({ text: `API is ${d.status}`, ok: true }))
      .catch(() => setHealth({ text: "API not reachable (is the backend running?)", ok: false }));
  }, []);

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-4xl font-bold text-brand-800">EstateHub</h1>
      <p className="mt-2 text-slate-600">Frontend setup check</p>

      <div className="card mt-8 space-y-4 p-6">
        <p className={health.ok === false ? "text-red-600" : health.ok ? "font-semibold text-brand-700" : "text-slate-500"}>
          {health.text}
        </p>
        <input className="input" placeholder="This is a styled input" />
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-secondary">Secondary</button>
          <button className="btn btn-danger">Danger</button>
          <button className="btn btn-ghost">Ghost</button>
        </div>
      </div>
    </main>
  );
}