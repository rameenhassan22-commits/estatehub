import { Navigate, Outlet, useLocation, Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { FullPageSpinner } from "./ui/Feedback";
import { homePathFor } from "../lib/roles";

export default function ProtectedRoute({ roles }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <FullPageSpinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-sand-50 px-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldAlert size={30} />
        </div>
        <h1 className="text-3xl font-bold">403 Access denied</h1>
        <p className="max-w-md text-slate-500">Your role ({user.role.replace("_", " ")}) is not allowed to open this page.</p>
        <Link to={homePathFor(user.role)} className="btn btn-primary mt-2">
          Go to my home
        </Link>
      </div>
    );
  }

  return <Outlet />;
}