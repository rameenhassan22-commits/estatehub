import { capitalize } from "../../lib/format";

const STYLES = {
  // property status
  available: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  sold: "bg-slate-100 text-slate-700 ring-slate-500/20",
  rented: "bg-sky-50 text-sky-700 ring-sky-600/20",
  draft: "bg-amber-50 text-amber-700 ring-amber-600/20",
  // inquiry status
  new: "bg-amber-50 text-amber-700 ring-amber-600/20",
  contacted: "bg-sky-50 text-sky-700 ring-sky-600/20",
  closed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  // tenant status
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  inactive: "bg-red-50 text-red-700 ring-red-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  // roles
  super_admin: "bg-violet-50 text-violet-700 ring-violet-600/20",
  agency_admin: "bg-brand-50 text-brand-700 ring-brand-600/20",
  agent: "bg-sky-50 text-sky-700 ring-sky-600/20",
  customer: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

export default function Badge({ value, label, className = "" }) {
  const text = label ?? capitalize(String(value).replace("_", " "));
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
        STYLES[value] || STYLES.customer
      } ${className}`}
    >
      {text}
    </span>
  );
}