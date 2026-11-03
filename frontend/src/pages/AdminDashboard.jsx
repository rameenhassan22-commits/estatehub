import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, Users, Home, Inbox } from "lucide-react";
import { api, errorMessage } from "../api/axios";
import PageHeader from "../components/PageHeader";
import Badge from "../components/ui/Badge";
import { Spinner } from "../components/ui/Feedback";
import { formatDate } from "../lib/format";

// super_admin only: the platform owner sees every agency and can suspend / reactivate one
export default function AdminDashboard() {
  const [data, setData] = useState(null);

  const load = () =>
    api
      .get("/admin/overview")
      .then(({ data }) => setData(data))
      .catch((err) => toast.error(errorMessage(err, "Could not load platform data")));

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (tenant, status) => {
    const verb = status === "active" ? "reactivate" : "suspend";
    if (!window.confirm(`Do you want to ${verb} ${tenant.name}? ${status === "inactive" ? "Its staff will be locked out and its listings hidden." : ""}`)) return;
    try {
      await api.patch(`/admin/tenants/${tenant._id}`, { status });
      toast.success(`${tenant.name} ${status === "active" ? "reactivated" : "suspended"}`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  if (!data) return <Spinner />;
  const { stats, tenants } = data;

  const cards = [
    { icon: Building2, label: "Agencies", value: stats.tenants },
    { icon: Users, label: "Users", value: stats.users },
    { icon: Home, label: "Properties", value: stats.properties },
    { icon: Inbox, label: "Inquiries", value: stats.inquiries },
  ];

  return (
    <>
      <PageHeader title="Platform overview" subtitle="Every agency (tenant) on EstateHub." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card flex items-center gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon size={22} /></span>
            <div>
              <p className="font-display text-3xl leading-none font-bold">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
            <tr>
              <th className="px-5 py-3 font-semibold">Agency</th>
              <th className="px-5 py-3 font-semibold">Users</th>
              <th className="px-5 py-3 font-semibold">Listings</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tenants.map((t) => (
              <tr key={t._id}>
                <td className="px-5 py-3.5">
                  <Link to={`/agency/${t.slug}`} className="font-medium text-slate-900 hover:text-brand-700 hover:underline">{t.name}</Link>
                  <p className="text-xs text-slate-500">{t.email}</p>
                </td>
                <td className="px-5 py-3.5">{t.userCount}</td>
                <td className="px-5 py-3.5">{t.propertyCount}</td>
                <td className="px-5 py-3.5 whitespace-nowrap text-slate-600">{formatDate(t.createdAt)}</td>
                <td className="px-5 py-3.5"><Badge value={t.status} /></td>
                <td className="px-5 py-3.5 text-right">
                  {t.status === "active" ? (
                    <button onClick={() => setStatus(t, "inactive")} className="btn btn-secondary px-3 py-1.5 text-red-600">Suspend</button>
                  ) : (
                    <button onClick={() => setStatus(t, "active")} className="btn btn-secondary px-3 py-1.5">Reactivate</button>
                  )}
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">No agencies have registered yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}