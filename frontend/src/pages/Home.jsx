import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, MessageSquare, KeyRound, Building2, ArrowRight } from "lucide-react";
import { api } from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import { Spinner } from "../components/ui/Feedback";
import { useAuth } from "../hooks/useAuth";

const STEPS = [
  { icon: Search, title: "Search", text: "Filter by city, type, purpose and price across every agency on the platform." },
  { icon: MessageSquare, title: "Inquire", text: "Send a message to the agency in one click no phone tag." },
  { icon: KeyRound, title: "Move in", text: "Agents follow up, you visit, and you pick the place that fits." },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [purpose, setPurpose] = useState("");
  const [featured, setFeatured] = useState(null); // null = loading

  useEffect(() => {
    api
      .get("/properties", { params: { limit: 3 } })
      .then(({ data }) => setFeatured(data.items))
      .catch(() => setFeatured([]));
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (purpose) params.set("purpose", purpose);
    navigate(`/properties?${params}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-900 text-white">
        <div className="pointer-events-none absolute -top-32 -right-24 h-112 w-md rounded-full bg-brand-500/25 blur-3xl" />
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 w-full text-white/5" viewBox="0 0 800 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path fill="currentColor" d="M0 220V150h60V90h70v60h40V40h80v110h50V100h60v50h70V70h90v80h60V110h80v110z" />
        </svg>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-brand-100 uppercase ring-1 ring-white/20">
            <Building2 size={14} /> Many agencies · one marketplace
          </p>
          <h1 className="max-w-3xl text-4xl leading-[1.1] font-bold text-white sm:text-6xl">
            Find a home that fits your life.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-brand-100/90">
            Browse homes, apartments, plots and commercial space listed directly by real estate agencies.
          </p>

          <form
            onSubmit={onSearch}
            className="mt-10 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl sm:flex-row"
          >
            <div className="relative flex-1">
              <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="City, area or keyword e.g. Gulberg"
                className="input border-transparent bg-slate-50 pl-10"
                aria-label="Search properties"
              />
            </div>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="input border-transparent bg-slate-50 sm:w-40"
              aria-label="Sale or rent"
            >
              <option value="">Buy or rent</option>
              <option value="sale">Buy</option>
              <option value="rent">Rent</option>
            </select>
            <button type="submit" className="btn btn-primary px-6">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Latest listings */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-bold">Latest listings</h2>
            <p className="mt-1 text-slate-500">Freshly added by agencies on EstateHub.</p>
          </div>
          <Link to="/properties" className="hidden items-center gap-1 text-sm font-semibold text-brand-700 hover:underline sm:flex">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {featured === null ? (
          <Spinner />
        ) : featured.length === 0 ? (
          <p className="card p-8 text-center text-slate-500">No listings yet be the first agency to add one.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <div key={title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                  <Icon size={26} />
                </div>
                <p className="mt-4 text-xs font-bold tracking-widest text-brand-600 uppercase">Step {i + 1}</p>
                <h3 className="mt-1 text-lg font-semibold">{title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Agency CTA (hidden for logged-in users) */}
      {!user && (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex flex-col items-start justify-between gap-6 rounded-3xl bg-linear-to-br from-brand-800 to-brand-600 p-8 text-white sm:p-12 md:flex-row md:items-center">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-white">Run a real estate agency?</h2>
              <p className="mt-2 text-brand-100">
                Get a private workspace for your team: manage listings, assign agents and answer inquiries in one place.
              </p>
            </div>
            <Link to="/register-agency" className="btn bg-white text-brand-800 hover:bg-brand-50">
              Register your agency <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      )}
    </>
  );
}