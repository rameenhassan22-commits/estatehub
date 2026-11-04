import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Building2, Search } from "lucide-react";
import { api, errorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import { Spinner, EmptyState } from "../../components/ui/Feedback";
import { formatPrice, capitalize } from "../../lib/format";
import { ROLES } from "../../lib/roles";

export default function ManageProperties() {
  const { user } = useAuth();
  const isAdmin = user.role === ROLES.AGENCY_ADMIN;

  const [data, setData] = useState({ items: [], total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [q, setQ] = useState("");

  // debounce the search box
  useEffect(() => {
    const t = setTimeout(() => {
      setQ(text);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [text]);

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/properties", { params: { scope: "agency", q, status, page, limit: 10 } })
      .then(({ data }) => setData(data))
      .catch((err) => toast.error(errorMessage(err, "Could not load properties")))
      .finally(() => setLoading(false));
  }, [q, status, page]);

  useEffect(load, [load]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? Its inquiries will be deleted too.`)) return;
    try {
      await api.delete(`/properties/${p._id}`);
      toast.success("Property deleted");
      load();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete"));
    }
  };

  // PERMISSION RULE mirrored in the UI: admins edit everything, agents edit only their own listings
  const canEdit = (p) => isAdmin || String(p.createdBy?._id) === String(user._id);

  return (
    <>
      <PageHeader
        title="Properties"
        subtitle={isAdmin ? "Every listing of your agency." : "Every listing of your agency you can edit the ones you created."}
        action={<Link to="/dashboard/properties/new" className="btn btn-primary"><Plus size={18} /> Add property</Link>}
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_12rem]">
        <div className="relative">
          <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400" />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Search title, city or area" className="input pl-10" aria-label="Search" />
        </div>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input" aria-label="Status">
          <option value="">All statuses</option>
          <option value="available">Available</option>
          <option value="draft">Draft</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : data.items.length === 0 ? (
        <EmptyState icon={Building2} title="No properties found" action={<Link to="/dashboard/properties/new" className="btn btn-primary">Add a property</Link>}>
          {q || status ? "Nothing matches these filters." : "Your agency has no listings yet."}
        </EmptyState>
      ) : (
        <>
          <div className="card overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3 font-semibold">Property</th>
                  <th className="px-5 py-3 font-semibold">Price</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Added by</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{p.title}</p>
                      <p className="text-xs text-slate-500">
                        {capitalize(p.propertyType)} · For {p.purpose} · {p.location?.city}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">{formatPrice(p.price)}</td>
                    <td className="px-5 py-3.5"><Badge value={p.status} /></td>
                    <td className="px-5 py-3.5 text-slate-600">{p.createdBy?.name || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        {canEdit(p) && (
                          <Link to={`/dashboard/properties/${p._id}/edit`} className="btn btn-ghost px-2.5" aria-label={`Edit ${p.title}`} title="Edit">
                            <Pencil size={16} />
                          </Link>
                        )}
                        {isAdmin && (
                          <button onClick={() => handleDelete(p)} className="btn btn-ghost px-2.5 text-red-600 hover:bg-red-50" aria-label={`Delete ${p.title}`} title="Delete">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pages={data.pages} onChange={setPage} />
        </>
      )}
    </>
  );
}