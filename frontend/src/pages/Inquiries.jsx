import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearUnread } from "../features/notifications/notificationsSlice";
import toast from "react-hot-toast";
import { Inbox, Mail } from "lucide-react";
import { api, errorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import PageHeader from "../components/PageHeader";
import Badge from "../components/ui/Badge";
import { Spinner, EmptyState } from "../components/ui/Feedback";
import { formatDate, formatPrice } from "../lib/format";
import { ROLES } from "../lib/roles";

/**
 * ONE page, TWO audiences. The API already returns only what the role may see:
 *   customer     -> the inquiries they sent (read-only status)
 *   agency_admin -> all inquiries of the agency (can change status)
 *   agent        -> inquiries about their own listings (can change status)
 */
export default function Inquiries() {
  const { user } = useAuth();
  const isCustomer = user.role === ROLES.CUSTOMER;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const dispatch = useDispatch();
  const tick = useSelector((s) => s.notifications.tick); // changes when the server pushes an event (Step 17)

  useEffect(() => {
    dispatch(clearUnread()); // opening the inbox = "read"
    api
      .get("/inquiries")
      .then(({ data }) => setItems(data))
      .catch((err) => toast.error(errorMessage(err, "Could not load inquiries")))
      .finally(() => setLoading(false));
  }, [tick, dispatch]); // refetch automatically whenever a live event arrives

  const changeStatus = async (id, status) => {
    const before = items;
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, status } : i))); // optimistic update
    try {
      await api.patch(`/inquiries/${id}`, { status });
      toast.success("Status updated");
    } catch (err) {
      setItems(before); // roll back
      toast.error(errorMessage(err, "Failed to update status"));
    }
  };

  const visible = filter === "all" ? items : items.filter((i) => i.status === filter);
  const newCount = items.filter((i) => i.status === "new").length;

  const header = (
    <PageHeader
      title={isCustomer ? "My inquiries" : "Inbox"}
      subtitle={
        isCustomer
          ? "Messages you sent to agencies and their progress."
          : `${newCount} new ${newCount === 1 ? "inquiry" : "inquiries"} waiting for a reply.`
      }
    />
  );

  const body = loading ? (
    <Spinner />
  ) : items.length === 0 ? (
    <EmptyState
      icon={Inbox}
      title={isCustomer ? "You haven't sent any inquiries" : "No inquiries yet"}
      action={isCustomer && <Link to="/properties" className="btn btn-primary">Browse properties</Link>}
    >
      {isCustomer ? "Open a property and use “Send inquiry” to contact the agency." : "When customers message you about a listing, it appears here."}
    </EmptyState>
  ) : (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {["all", "new", "contacted", "closed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition ${
              filter === s ? "bg-brand-700 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <ul className="space-y-4">
        {visible.map((i) => (
          <li key={i._id} className="card p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <Link to={`/properties/${i.propertyId?._id}`} className="font-semibold text-slate-900 hover:text-brand-700 hover:underline">
                  {i.propertyId?.title || "Property no longer available"}
                </Link>
                {i.propertyId?.price != null && <span className="ml-2 text-sm text-slate-500">{formatPrice(i.propertyId.price)}</span>}
                <p className="mt-1 text-sm text-slate-500">
                  {isCustomer ? (
                    <>To: {i.tenantId?.name}</>
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={14} /> {i.customerId?.name} · {i.customerId?.email}
                    </span>
                  )}
                  {" · "}
                  {formatDate(i.createdAt)}
                </p>
              </div>

              {isCustomer ? (
                <Badge value={i.status} />
              ) : (
                <select
                  value={i.status}
                  onChange={(e) => changeStatus(i._id, e.target.value)}
                  className="input w-40 py-2 font-medium"
                  aria-label="Inquiry status"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="closed">Closed</option>
                </select>
              )}
            </div>
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-line text-slate-700">{i.message}</p>
          </li>
        ))}
        {visible.length === 0 && <li className="py-10 text-center text-sm text-slate-500">No “{filter}” inquiries.</li>}
      </ul>
    </>
  );

  // Customers see it inside the public layout (it already has a container); staff inside the dashboard layout.
  return isCustomer ? (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {header}
      {body}
    </div>
  ) : (
    <>
      {header}
      {body}
    </>
  );
}