import { useState } from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Building2, Inbox, Users, Globe, LogOut, Menu, X, ShieldCheck } from "lucide-react";
import Logo from "../components/ui/Logo";
import Badge from "../components/ui/Badge";
import { useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { ROLES } from "../lib/roles";

// Menu items per role. `roles` decides who sees an item (UI only: the API enforces it for real).
const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true, roles: [ROLES.AGENCY_ADMIN, ROLES.AGENT] },
  { to: "/dashboard/properties", label: "Properties", icon: Building2, roles: [ROLES.AGENCY_ADMIN, ROLES.AGENT] },
  { to: "/dashboard/inquiries", label: "Inquiries", icon: Inbox, roles: [ROLES.AGENCY_ADMIN, ROLES.AGENT] },
  { to: "/dashboard/team", label: "Team", icon: Users, roles: [ROLES.AGENCY_ADMIN] },
  { to: "/admin", label: "Platform", icon: ShieldCheck, end: true, roles: [ROLES.SUPER_ADMIN] },
];

const itemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
    isActive ? "bg-white/15 text-white" : "text-brand-100/80 hover:bg-white/10 hover:text-white"
  }`;

export default function DashboardLayout() {
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unread = useSelector((s) => s.notifications.unreadInquiries);

  const items = NAV.filter((i) => i.roles.includes(user.role));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col bg-brand-900 p-4 text-white">
      <div className="px-2 pt-1 pb-6">
        <Logo light to="/" />
      </div>

      <div className="mb-5 rounded-xl bg-white/10 p-3">
        <p className="truncate text-sm font-semibold">{tenant?.name || "EstateHub Platform"}</p>
        <div className="mt-1.5">
          <Badge value={user.role} className="bg-white/90!" />
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={itemClass} onClick={() => setOpen(false)}>
            <Icon size={18} /> {label}
            {to === "/dashboard/inquiries" && unread > 0 && (
              <span className="ml-auto rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-brand-900">{unread}</span>
            )}
          </NavLink>
        ))}
        <Link to="/" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-100/80 hover:bg-white/10 hover:text-white">
          <Globe size={18} /> View public site
        </Link>
      </nav>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="truncate px-2 text-sm font-medium">{user.name}</p>
        <p className="truncate px-2 text-xs text-brand-200/70">{user.email}</p>
        <button onClick={handleLogout} className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-100/80 hover:bg-white/10 hover:text-white">
          <LogOut size={18} /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>

      {/* Mobile top bar + drawer */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <Logo to="/" />
        <button className="btn btn-ghost px-2.5" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85%]">
            <button className="absolute top-3 right-3 z-10 text-white" onClick={() => setOpen(false)} aria-label="Close menu">
              <X size={22} />
            </button>
            {sidebar}
          </div>
        </div>
      )}

      <main className="min-w-0 p-4 sm:p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
}