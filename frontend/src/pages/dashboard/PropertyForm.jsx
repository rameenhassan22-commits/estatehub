import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import { api } from "../../api/axios";
import PageHeader from "../../components/PageHeader";
import { Field, SelectField, TextAreaField } from "../../components/ui/Field";
import { Spinner, ErrorBanner } from "../../components/ui/Feedback";
import { propertySchema } from "../../validation/schemas";
import { applyServerErrors } from "../../lib/forms";

const EMPTY = {
  title: "",
  description: "",
  price: "", // empty box -> NaN -> "Price must be a number"
  propertyType: "house",
  purpose: "sale",
  status: "available",
  bedrooms: 0,
  area: 0,
  city: "",
  areaLocation: "",
  address: "",
};

// Backend names -> form names, so server errors land under the right input
const FIELD_MAP = { "location.city": "city", "location.area": "areaLocation", "location.address": "address" };

export default function PropertyForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(propertySchema), mode: "onTouched", defaultValues: EMPTY });

  // Edit mode: load the property and fill the form
  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/properties/${id}`)
      .then(({ data: p }) =>
        reset({
          title: p.title,
          description: p.description || "",
          price: p.price,
          propertyType: p.propertyType,
          purpose: p.purpose,
          status: p.status,
          bedrooms: p.bedrooms ?? 0,
          area: p.area ?? 0,
          city: p.location?.city || "",
          areaLocation: p.location?.area || "",
          address: p.location?.address || "",
        })
      )
      .catch(() => setFormError("Could not load this property."))
      .finally(() => setLoading(false));
  }, [id, isEdit, reset]);

  const onSubmit = async (v) => {
    setFormError("");
    // Reshape the flat form values into what the API expects
    const payload = {
      title: v.title,
      description: v.description,
      price: v.price,
      propertyType: v.propertyType,
      purpose: v.purpose,
      status: v.status,
      bedrooms: v.bedrooms,
      area: v.area,
      location: { city: v.city, area: v.areaLocation, address: v.address },
    };

    try {
      if (isEdit) await api.put(`/properties/${id}`, payload);
      else await api.post("/properties", payload);
      toast.success(isEdit ? "Property updated" : "Property created");
      navigate("/dashboard/properties");
    } catch (err) {
      setFormError(applyServerErrors(err.response?.data, setError, FIELD_MAP));
    }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <Link to="/dashboard/properties" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-700">
        <ArrowLeft size={16} /> Back to properties
      </Link>
      <PageHeader
        title={isEdit ? "Edit property" : "Add property"}
        subtitle="Fields marked * are required. Drafts are visible only to your team."
      />

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-3xl space-y-6">
        <ErrorBanner>{formError}</ErrorBanner>

        <section className="card space-y-5 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Basics</h2>
          <Field label="Title *" placeholder="e.g. Modern 3 bed house near the park" error={errors.title} {...register("title")} />
          <TextAreaField label="Description" placeholder="Describe the property, nearby facilities, condition..." error={errors.description} {...register("description")} />
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField label="Type *" error={errors.propertyType} {...register("propertyType")}>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
            </SelectField>
            <SelectField label="Purpose *" error={errors.purpose} {...register("purpose")}>
              <option value="sale">For sale</option>
              <option value="rent">For rent</option>
            </SelectField>
          </div>
        </section>

        <section className="card space-y-5 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Price & size</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Price (PKR) *" type="number" min="0" inputMode="numeric" placeholder="25000000" error={errors.price} {...register("price", { valueAsNumber: true })} />
            <Field label="Bedrooms" type="number" min="0" error={errors.bedrooms} {...register("bedrooms", { valueAsNumber: true })} />
            <Field label="Area (marla / sq ft)" type="number" min="0" error={errors.area} {...register("area", { valueAsNumber: true })} />
          </div>
        </section>

        <section className="card space-y-5 p-5 sm:p-6">
          <h2 className="text-lg font-bold">Location</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="City *" placeholder="Islamabad" error={errors.city} {...register("city")} />
            <Field label="Area / neighbourhood" placeholder="F-7" error={errors.areaLocation} {...register("areaLocation")} />
          </div>
          <Field label="Street address" placeholder="House 12, Street 4" error={errors.address} {...register("address")} />
        </section>

        <section className="card p-5 sm:p-6">
          <SelectField label="Status" error={errors.status} className="max-w-xs" {...register("status")}>
            <option value="available">Available visible to everyone</option>
            <option value="draft">Draft only my team</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </SelectField>
        </section>

        <div className="flex gap-3">
          <button type="submit" disabled={isSubmitting} className="btn btn-primary px-6">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isEdit ? "Save changes" : "Create property"}
          </button>
          <Link to="/dashboard/properties" className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </>
  );
}