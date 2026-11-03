import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { UserPlus, Trash2, UserX, UserCheck, Loader2, X } from "lucide-react";
import { api, errorMessage } from "../../api/axios";
import { useAuth } from "../../hooks/useAuth";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/ui/Badge";
import { Field, PasswordField, SelectField } from "../../components/ui/Field";
import PasswordChecklist from "../../components/ui/PasswordChecklist";
import { Spinner, ErrorBanner } from "../../components/ui/Feedback";
import { teamMemberSchema } from "../../validation/schemas";
import { applyServerErrors } from "../../lib/forms";

// agency_admin only: add / deactivate / remove the people who work for the agency
export default function Team() {
  const { user } = useAuth();
  const [members, setMembers] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(teamMemberSchema),
    mode: "onTouched",
    defaultValues: { name: "", email: "", password: "", role: "agent" },
  });

  const load = () =>
    api
      .get("/users")
      .then(({ data }) => setMembers(data))
      .catch((err) => toast.error(errorMessage(err, "Could not load team")));

  useEffect(() => {
    load();
  }, []);

  const onSubmit = async (values) => {
    setFormError("");
    try {
      await api.post("/users", values);
      toast.success(`${values.name} was added to your team`);
      reset();
      setShowForm(false);
      load();
    } catch (err) {
      setFormError(applyServerErrors(err.response?.data, setError));
    }
  };

  const toggleActive = async (m) => {
    try {
      await api.patch(`/users/${m._id}`, { isActive: !m.isActive });
      toast.success(m.isActive ? `${m.name} deactivated` : `${m.name} reactivated`);
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const remove = async (m) => {
    if (!window.confirm(`Remove ${m.name} from your agency? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${m._id}`);
      toast.success("Member removed");
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <>
      <PageHeader
        title="Team"
        subtitle="People who can sign in to your agency workspace."
        action={
          <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={18} /> : <UserPlus size={18} />} {showForm ? "Close" : "Add team member"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="card mb-8 space-y-5 p-5 sm:p-6">
          <h2 className="text-lg font-bold">New team member</h2>
          <ErrorBanner>{formError}</ErrorBanner>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" placeholder="Bilal Ahmed" error={errors.name} {...register("name")} />
            <Field label="Email" type="email" placeholder="bilal@agency.com" error={errors.email} {...register("email")} />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <PasswordField label="Temporary password" autoComplete="new-password" error={errors.password} {...register("password")} />
              <PasswordChecklist value={watch("password")} />
            </div>
            <SelectField label="Role" error={errors.role} {...register("role")}>
              <option value="agent">Agent — manages own listings</option>
              <option value="agency_admin">Agency admin — full access</option>
            </SelectField>
          </div>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary">
            {isSubmitting && <Loader2 size={16} className="animate-spin" />} Add member
          </button>
        </form>
      )}

      {!members ? (
        <Spinner />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-136 text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="px-5 py-3 font-semibold">Member</th>
                <th className="px-5 py-3 font-semibold">Role</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {members.map((m) => {
                const isMe = m._id === user._id;
                return (
                  <tr key={m._id}>
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-900">{m.name} {isMe && <span className="text-xs font-normal text-slate-400">(you)</span>}</p>
                      <p className="text-xs text-slate-500">{m.email}</p>
                    </td>
                    <td className="px-5 py-3.5"><Badge value={m.role} /></td>
                    <td className="px-5 py-3.5"><Badge value={m.isActive ? "active" : "inactive"} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end gap-1">
                        {!isMe && (
                          <>
                            <button onClick={() => toggleActive(m)} className="btn btn-ghost px-2.5" title={m.isActive ? "Deactivate" : "Reactivate"} aria-label={m.isActive ? `Deactivate ${m.name}` : `Reactivate ${m.name}`}>
                              {m.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                            <button onClick={() => remove(m)} className="btn btn-ghost px-2.5 text-red-600 hover:bg-red-50" title="Remove" aria-label={`Remove ${m.name}`}>
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}