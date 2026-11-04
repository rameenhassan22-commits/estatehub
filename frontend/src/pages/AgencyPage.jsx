import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Mail, Phone, MapPin, Building2 } from "lucide-react";
import { api } from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import Pagination from "../components/ui/Pagination";
import { Spinner, EmptyState } from "../components/ui/Feedback";
import { initials } from "../lib/format";

export default function AgencyPage() {
  const { slug } = useParams();
  const [tenant, setTenant] = useState(null);
  const [listings, setListings] = useState({ items: [], pages: 0 });
  const [page, setPage] = useState(1);
  const [state, setState] = useState("loading"); // loading | ready | missing

  useEffect(() => {
    setState("loading");
    api
      .get(`/tenants/${slug}`)
      .then(({ data }) => {
        setTenant(data);
        setState("ready");
      })
      .catch(() => setState("missing"));
  }, [slug]);

  useEffect(() => {
    if (state !== "ready") return;
    api.get("/properties", { params: { agency: slug, page, limit: 9 } }).then(({ data }) => setListings(data));
  }, [slug, page, state]);

  if (state === "loading") return <Spinner />;
  if (state === "missing") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState icon={Building2} title="Agency not found" action={<Link to="/properties" className="btn btn-primary">Browse properties</Link>}>
          This agency does not exist or is currently suspended.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-brand-700 font-display text-3xl font-bold text-white">
          {initials(tenant.name)}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{tenant.name}</h1>
          <p className="mt-1 text-slate-500">{tenant.listings} active {tenant.listings === 1 ? "listing" : "listings"}</p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-slate-600">
            {tenant.email && <span className="flex items-center gap-1.5"><Mail size={15} /> {tenant.email}</span>}
            {tenant.phone && <span className="flex items-center gap-1.5"><Phone size={15} /> {tenant.phone}</span>}
            {tenant.address && <span className="flex items-center gap-1.5"><MapPin size={15} /> {tenant.address}</span>}
          </div>
        </div>
      </div>

      <h2 className="mt-10 mb-5 text-2xl font-bold">Listings by {tenant.name}</h2>
      {listings.items.length === 0 ? (
        <EmptyState icon={Building2} title="No active listings">This agency has nothing published right now.</EmptyState>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.items.map((p) => <PropertyCard key={p._id} property={p} />)}
          </div>
          <Pagination page={page} pages={listings.pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}