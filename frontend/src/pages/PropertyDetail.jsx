import { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ArrowLeft, MapPin, Bed, Maximize2, Building2, Loader2, Send } from "lucide-react";
import { api } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { Spinner, EmptyState, ErrorBanner } from "../components/ui/Feedback";
import { TextAreaField } from "../components/ui/Field";
import Badge from "../components/ui/Badge";
import { inquirySchema } from "../validation/schemas";
import { applyServerErrors } from "../lib/forms";
import { formatPrice, capitalize } from "../lib/format";
import { ROLES } from "../lib/roles";

export default function PropertyDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const location = useLocation();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(inquirySchema), defaultValues: { message: "" } });

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    api
      .get(`/properties/${id}`)
      .then(({ data }) => setProperty(data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const onSubmit = async (values) => {
    setFormError("");
    try {
      await api.post("/inquiries", { propertyId: id, message: values.message });
      toast.success("Inquiry sent! The agency will contact you soon.");
      setSent(true);
      reset();
    } catch (err) {
      setFormError(applyServerErrors(err.response?.data, setError));
    }
  };

  if (loading) return <Spinner />;
  if (notFound || !property) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20">
        <EmptyState
          icon={Building2}
          title="Property not found"
          action={<Link to="/properties" className="btn btn-primary">Browse properties</Link>}
        >
          It may have been sold, rented or removed by the agency.
        </EmptyState>
      </div>
    );
  }

  const place = [property.location?.address, property.location?.area, property.location?.city].filter(Boolean).join(", ");
  const agency = property.tenantId; // populated: { name, slug, email, phone }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft size={16} /> Back to properties
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_22rem]">
        {/* Left: details */}
        <div>
          <div className="flex h-56 items-center justify-center rounded-3xl bg-linear-to-br from-brand-100 via-brand-50 to-sand-100 sm:h-72">
            <Building2 size={80} className="text-brand-600/30" strokeWidth={1.2} />
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Badge value={property.status} />
            <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800">For {property.purpose}</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">{capitalize(property.propertyType)}</span>
          </div>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{property.title}</h1>
          <p className="mt-2 flex items-center gap-1.5 text-slate-500">
            <MapPin size={16} /> {place || "Location not specified"}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {property.bedrooms > 0 && (
              <div className="card flex items-center gap-2 px-4 py-3 text-sm"><Bed size={18} className="text-brand-700" /> <strong>{property.bedrooms}</strong> bedrooms</div>
            )}
            {property.area > 0 && (
              <div className="card flex items-center gap-2 px-4 py-3 text-sm"><Maximize2 size={17} className="text-brand-700" /> <strong>{property.area}</strong> area</div>
            )}
          </div>

          <h2 className="mt-10 text-xl font-bold">About this property</h2>
          <p className="mt-2 leading-relaxed whitespace-pre-line text-slate-600">
            {property.description || "The agency has not added a description yet."}
          </p>
        </div>

        {/* Right: price + inquiry */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <p className="text-sm text-slate-500">{property.purpose === "rent" ? "Rent" : "Price"}</p>
            <p className="font-display text-3xl font-bold text-brand-800">{formatPrice(property.price)}</p>
            {agency?.name && (
              <Link to={`/agency/${agency.slug}`} className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-brand-50">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-700 text-white"><Building2 size={18} /></span>
                <span>
                  <span className="block text-xs text-slate-500">Listed by</span>
                  <span className="block text-sm font-semibold text-slate-900">{agency.name}</span>
                </span>
              </Link>
            )}
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-bold">Interested?</h2>

            {!user ? (
              <>
                <p className="mt-1 text-sm text-slate-500">Log in as a customer to message the agency.</p>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link to="/login" state={{ from: location }} className="btn btn-primary">Log in</Link>
                  <Link to="/register-customer" state={{ from: location }} className="btn btn-secondary">Sign up</Link>
                </div>
              </>
            ) : user.role !== ROLES.CUSTOMER ? (
              <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">Only customer accounts can send inquiries.</p>
            ) : sent ? (
              <div className="mt-3 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                <p className="font-semibold">Inquiry sent</p>
                <p className="mt-1">Track the reply in <Link to="/my-inquiries" className="font-semibold underline">My inquiries</Link>.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-3 space-y-3">
                <ErrorBanner>{formError}</ErrorBanner>
                <TextAreaField
                  aria-label="Your message"
                  placeholder="Hi, I'm interested in this property. Is it still available for a visit this week?"
                  error={errors.message}
                  {...register("message")}
                />
                <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send inquiry
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}