import { Outlet, Navigate, useLocation } from "react-router-dom";
import { ShieldCheck, Building2, Users, Zap } from "lucide-react";
import Logo from "../components/ui/Logo";
import { useAuth } from "../hooks/useAuth";
import { homePathFor } from "../lib/roles";

const YEAR = new Date().getFullYear();

const POINTS = [
  { icon: Building2, text: "Every agency gets its own private workspace" },
  { icon: Users, text: "Admins, agents and customers — each sees only what they should" },
  { icon: ShieldCheck, text: "Secure sign-in with hashed passwords and JWT sessions" },
  { icon: Zap, text: "Manage listings and inquiries from one dashboard" },
];

// Split-screen shell for login / sign-up: brand panel on the left (desktop only), form on the right.
export default function AuthLayout() {
  const { user } = useAuth();
  const location = useLocation();

  // Logged in (already, or because the form just succeeded) -> leave the auth pages.
  // If a ProtectedRoute sent them here, go back to the page they wanted; else their role's home.
  // This is the ONLY place that redirects after login, so the pages must not also navigate.
  if (user) {
    const target = location.state?.from?.pathname || homePathFor(user.role);
    return <Navigate to={target} replace />;
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        {/* decorative skyline */}
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 w-full text-white/6" viewBox="0 0 800 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
          <path fill="currentColor" d="M0 220V150h60V90h70v60h40V40h80v110h50V100h60v50h70V70h90v80h60V110h80v110z" />
        </svg>
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />

        <Logo light />

        <div className="relative max-w-md">
          <h1 className="font-display text-4xl leading-tight font-bold text-white">
            The platform where agencies and buyers meet.
          </h1>
          <ul className="mt-10 space-y-5">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-brand-100">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Icon size={17} />
                </span>
                <span className="text-[15px] leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-brand-200/70">© {YEAR} EstateHub</p>
      </aside>

      <main className="flex items-center justify-center bg-white px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}