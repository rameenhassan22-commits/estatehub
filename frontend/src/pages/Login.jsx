import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { Loader2, Search, Building2 } from "lucide-react";
import { Field, PasswordField } from "../components/ui/Field";
import { ErrorBanner } from "../components/ui/Feedback";
import { login } from "../features/auth/authSlice";
import { loginSchema } from "../validation/schemas";
import { applyServerErrors } from "../lib/forms";

export default function Login() {
  const dispatch = useDispatch();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values) => {
    setFormError("");
    try {
      const data = await dispatch(login(values)).unwrap();
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);
      // No navigate() here: AuthLayout sees the user in the store and redirects by role.
    } catch (payload) {
      setFormError(applyServerErrors(payload, setError));
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-2 text-slate-500">Log in to manage your listings, inquiries and saved searches.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <ErrorBanner>{formError}</ErrorBanner>

        <Field
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email}
          {...register("email")}
        />
        <PasswordField
          label="Password"
          autoComplete="current-password"
          placeholder="Your password"
          error={errors.password}
          {...register("password")}
        />

        <button type="submit" disabled={isSubmitting} className="btn btn-primary w-full py-3">
          {isSubmitting && <Loader2 size={18} className="animate-spin" />}
          {isSubmitting ? "Logging in..." : "Log in"}
        </button>
      </form>

      <div className="my-8 flex items-center gap-3 text-xs font-medium tracking-wide text-slate-400 uppercase">
        <span className="h-px flex-1 bg-slate-200" /> New to EstateHub? <span className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Link to="/register-customer" className="card group p-4 transition hover:border-brand-500 hover:shadow-md">
          <Search size={20} className="text-brand-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">I'm looking for a property</p>
          <p className="text-xs text-slate-500">Create a customer account</p>
        </Link>
        <Link to="/register-agency" className="card group p-4 transition hover:border-brand-500 hover:shadow-md">
          <Building2 size={20} className="text-brand-700" />
          <p className="mt-2 text-sm font-semibold text-slate-900">I represent an agency</p>
          <p className="text-xs text-slate-500">Start your agency workspace</p>
        </Link>
      </div>
    </>
  );
}