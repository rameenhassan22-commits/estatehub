import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Field, PasswordField } from "../components/ui/Field";
import PasswordChecklist from "../components/ui/PasswordChecklist";
import { ErrorBanner } from "../components/ui/Feedback";
import { registerAgency } from "../features/auth/authSlice";
import { registerAgencySchema } from "../validation/schemas";
import { applyServerErrors } from "../lib/forms";

export default function RegisterAgency() {
  const dispatch = useDispatch();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerAgencySchema),
    mode: "onTouched",
    defaultValues: { agencyName: "", name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ agencyName, name, email, password }) => {
    const payload = { agencyName, name, email, password }; // no confirmPassword: the API is strict
    setFormError("");
    try {
      await dispatch(registerAgency(payload)).unwrap();
      toast.success("Your agency workspace is ready!");
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Start your agency workspace</h1>
      <p className="mt-2 text-slate-500">
        You become the agency admin. Add agents later and keep every listing and inquiry private to your team.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <ErrorBanner>{formError}</ErrorBanner>

        <Field
          label="Agency name"
          placeholder="Prime Estate"
          error={errors.agencyName}
          {...register("agencyName")}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Your full name" autoComplete="name" placeholder="Ahmed Raza" error={errors.name} {...register("name")} />
          <Field
            label="Work email"
            type="email"
            autoComplete="email"
            placeholder="you@agency.com"
            error={errors.email}
            {...register("email")}
          />
        </div>

        <div>
          <PasswordField
            label="Password"
            autoComplete="new-password"
            placeholder="Create a strong password"
            error={errors.password}
            {...register("password")}
          />
          <PasswordChecklist value={watch("password")} />
        </div>
        <PasswordField
          label="Confirm password"
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Type it again"
          error={errors.confirmPassword}
          {...register("confirmPassword")}
        />

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3">
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {isSubmitting ? "Creating workspace..." : "Create agency workspace"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-600">
        Just looking for a property?{" "}
        <Link to="/register-customer" className="font-semibold text-brand-700 hover:underline">
          Create a customer account
        </Link>
      </p>
    </>
  );
}