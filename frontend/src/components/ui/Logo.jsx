import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export default function Logo({ to = "/", light = false }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2.5" aria-label="EstateHub home">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
          light ? "bg-white/15 text-white ring-1 ring-white/30" : "bg-brand-700 text-white"
        }`}
      >
        <Building2 size={20} />
      </span>
      <span className={`font-display text-xl font-bold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
        EstateHub
      </span>
    </Link>
  );
}