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
import { registerCustomer } from "../features/auth/authSlice";
import { registerCustomerSchema } from "../validation/schemas";
import { applyServerErrors } from "../lib/forms";

export default function RegisterCustomer() {
  const dispatch = useDispatch();
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerCustomerSchema),
    mode: "onTouched", // validate a field when the user leaves it, then live while fixing it
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async ({ name, email, password }) => {
    // send only what the API accepts: confirmPassword is a browser-only field and the API is strict
    const payload = { name, email, password };
    setFormError("");
    try {
      await dispatch(registerCustomer(payload)).unwrap();
      toast.success("Account created. Welcome to EstateHub!");
    } catch (err) {
      setFormError(applyServerErrors(err, setError));
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-2 text-slate-500">Save the homes you like and send inquiries straight to agencies.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-5">
        <ErrorBanner>{formError}</ErrorBanner>

        <Field label="Full name" autoComplete="name" placeholder="Ayesha Khan" error={errors.name} {...register("name")} />
        <Field
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email}
          {...register("email")}
        />
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
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-slate-600">
        Run an agency?{" "}
        <Link to="/register-agency" className="font-semibold text-brand-700 hover:underline">
          Register it here
        </Link>
      </p>
    </>
  );
}