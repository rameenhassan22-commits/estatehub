import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Home } from "lucide-react";
import { api } from "../api/axios";
import PropertyCard from "../components/PropertyCard";
import Pagination from "../components/ui/Pagination";
import { Spinner, EmptyState, ErrorBanner } from "../components/ui/Feedback";

export default function Properties() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const q = params.get("q") || "";
  const propertyType = params.get("propertyType") || "";
  const purpose = params.get("purpose") || "";
  const sort = params.get("sort") || "-createdAt";
  const page = Number(params.get("page")) || 1;

  // The search box is typed live, but only pushed to the URL (-> API) after a short pause
  const [text, setText] = useState(q);
  useEffect(() => {
    if (text === q) return;
    const t = setTimeout(() => update({ q: text }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // Change filters; empty values are removed from the URL; filter changes go back to page 1
  const update = (changes, keepPage = false) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(changes)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!keepPage) next.delete("page");
    setParams(next, { replace: true });
  };

  useEffect(() => {
    let cancelled = false; // ignore a slow, outdated response if the filters changed meanwhile
    setLoading(true);
    api
      .get("/properties", { params: { q, propertyType, purpose, sort, page, limit: 9 } })
      .then(({ data }) => {
        if (cancelled) return;
        setData(data);
        setError("");
      })
      .catch(() => !cancelled && setError("Could not load properties. Is the server running?"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [q, propertyType, purpose, sort, page]);

  const hasFilters = q || propertyType || purpose;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold sm:text-4xl">Browse properties</h1>
      <p className="mt-1 text-slate-500">
        {loading ? "Searching..." : `${data.total} ${data.total === 1 ? "property" : "properties"} found`}
      </p>

      {/* Filters */}
      <div className="card mt-6 grid gap-3 p-4 md:grid-cols-[1fr_repeat(3,11rem)]">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search by city, area or title"
            className="input pl-10"
            aria-label="Search"
          />
        </div>
        <select value={propertyType} onChange={(e) => update({ propertyType: e.target.value })} className="input" aria-label="Property type">
          <option value="">All types</option>
          <option value="house">House</option>
          <option value="apartment">Apartment</option>
          <option value="plot">Plot</option>
          <option value="commercial">Commercial</option>
        </select>
        <select value={purpose} onChange={(e) => update({ purpose: e.target.value })} className="input" aria-label="Sale or rent">
          <option value="">Sale or rent</option>
          <option value="sale">For sale</option>
          <option value="rent">For rent</option>
        </select>
        <select value={sort} onChange={(e) => update({ sort: e.target.value === "-createdAt" ? "" : e.target.value })} className="input" aria-label="Sort">
          <option value="-createdAt">Newest first</option>
          <option value="createdAt">Oldest first</option>
          <option value="price">Price: low to high</option>
          <option value="-price">Price: high to low</option>
        </select>
      </div>

      {hasFilters && (
        <button
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
          onClick={() => {
            setText("");
            setParams({}, { replace: true });
          }}
        >
          <SlidersHorizontal size={14} /> Clear filters
        </button>
      )}

      <div className="mt-8">
        {error ? (
          <ErrorBanner>{error}</ErrorBanner>
        ) : loading ? (
          <Spinner label="Loading properties..." />
        ) : data.items.length === 0 ? (
          <EmptyState icon={Home} title="No properties match your search">
            Try removing a filter or searching for a different area.
          </EmptyState>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {data.items.map((p) => (
                <PropertyCard key={p._id} property={p} />
              ))}
            </div>
            <Pagination page={page} pages={data.pages} onChange={(n) => update({ page: String(n) }, true)} />
          </>
        )}
      </div>
    </div>
  );
}