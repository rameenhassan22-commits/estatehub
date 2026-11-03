import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center px-6 py-28 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <Compass size={30} />
      </div>
      <h1 className="mt-5 text-5xl font-bold">404</h1>
      <p className="mt-2 text-slate-500">This page doesn't exist — it may have been moved.</p>
      <Link to="/" className="btn btn-primary mt-6">Back to home</Link>
    </div>
  );
}