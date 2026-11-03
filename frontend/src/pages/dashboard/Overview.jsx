import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Building2, CheckCircle2, FileEdit, Inbox, Plus, ArrowRight, Globe } from "lucide-react";
import { api } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Feedback";
import { formatPrice } from "../../lib/format";
import { ROLES } from "../../lib/roles";

function Stat({ icon: Icon, label, value, tone = "brand", to }) {
  const tones = {
    brand: "bg-brand-50 text-brand-700",
    amber: "bg-amber-50 text-amber-700",
    sky: "bg-sky-50 text-sky-700",
    slate: "bg-slate-100 text-slate-600",
  };
  const body = (
    <div className="card flex items-center gap-4 p-5 transition hover:shadow-md">
      <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={22} /></span>
      <div>
        <p className="font-display text-3xl leading-none font-bold text-slate-900">{value}</p>
        <p className="mt-1 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
  return to ? <Link to={to}>{body}</Link> : body;
}

export default function Overview() {
  const { user, tenant } = useAuth();
  const [summary, setSummary] = useState(null);
  const [recent, setRecent] = useState([]);
  const tick = useSelector((s) => s.notifications.tick); // live updates (Step 17): new inquiry -> counters refresh

  useEffect(() => {
    Promise.all([
      api.get("/dashboard/summary"),
      api.get("/properties", { params: { scope: "agency", limit: 5 } }),
    ])
      .then(([s, p]) => {
        setSummary(s.data);
        setRecent(p.data.items);
      })
      .catch(() => setSummary({ properties: {}, inquiries: {} }));
  }, [tick]);

  const isAdmin = user.role === ROLES.AGENCY_ADMIN;

  return (
    <>
      <PageHeader
        title={`Hello, ${user.name.split(" ")[0]}`}
        subtitle={isAdmin ? `Here's how ${tenant?.name || "your agency"} is doing.` : "Here's how your own listings are doing."}
        action={
          <Link to="/dashboard/properties/new" className="btn btn-primary">
            <Plus size={18} /> Add property
          </Link>
        }
      />

      {!summary ? (
        <Spinner />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={Building2} label="Total properties" value={summary.properties.total ?? 0} to="/dashboard/properties" />
            <Stat icon={CheckCircle2} label="Available" value={summary.properties.available ?? 0} tone="sky" />
            <Stat icon={FileEdit} label="Drafts" value={summary.properties.draft ?? 0} tone="slate" />
            <Stat icon={Inbox} label="New inquiries" value={summary.inquiries.new ?? 0} tone="amber" to="/dashboard/inquiries" />
          </div>

          <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_20rem]">
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <h2 className="text-lg font-bold">Recent listings</h2>
                <Link to="/dashboard/properties" className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
                  View all <ArrowRight size={14} />
                </Link>
              </div>
              {recent.length === 0 ? (
                <p className="p-8 text-center text-sm text-slate-500">
                  Nothing here yet. <Link to="/dashboard/properties/new" className="font-semibold text-brand-700 underline">Add your first property</Link>.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recent.map((p) => (
                    <li key={p._id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">{p.title}</p>
                        <p className="text-sm text-slate-500">{formatPrice(p.price)}</p>
                      </div>
                      <Badge value={p.status} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card p-5">
              <h2 className="text-lg font-bold">Your public page</h2>
              <p className="mt-1 text-sm text-slate-500">Share this link — it shows only your agency's available listings.</p>
              {tenant?.slug && (
                <Link to={`/agency/${tenant.slug}`} className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm font-medium break-all text-brand-800 hover:bg-brand-50">
                  <Globe size={16} className="shrink-0" /> /agency/{tenant.slug}
                </Link>
              )}
            </section>
          </div>
        </>
      )}
    </>
  );
}