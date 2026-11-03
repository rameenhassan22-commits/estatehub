import { useState } from "react";
import { useDispatch } from "react-redux";
import { login } from "../features/auth/authSlice";
import { ErrorBanner } from "../components/ui/Feedback";

// TEMPORARY quick-login form for testing layouts. Step 13 replaces it with the real validated page.
export default function Login() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("admin@prime.test");
  const [password, setPassword] = useState("Demo@1234");
  const [error, setError] = useState("");

  const submit = async (e, creds) => {
    e?.preventDefault();
    const res = await dispatch(login(creds || { email, password }));
    if (res.error) setError(res.payload.message);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Temporary login</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <ErrorBanner>{error}</ErrorBanner>
        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-primary w-full">Log in</button>
      </form>
      <p className="mt-6 text-sm text-slate-500">Quick login:</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {[["Admin", "admin@prime.test"], ["Agent", "agent@prime.test"], ["Customer", "customer@demo.test"]].map(([label, mail]) => (
          <button key={mail} type="button" className="btn btn-secondary" onClick={() => submit(null, { email: mail, password: "Demo@1234" })}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}