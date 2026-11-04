import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, LayoutDashboard, Inbox, ShieldCheck } from "lucide-react";
import Logo from "./ui/Logo";
import { useAuth } from "../hooks/useAuth";
import { ROLES, STAFF_ROLES, ROLE_LABELS } from "../lib/roles";
import { initials } from "../lib/format";

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? "bg-brand-700 text-white shadow-sm" : "text-slate-600 hover:bg-brand-50 hover:text-brand-800"
  }`;

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const handleLogout = () => {
    close();
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink to="/" end className={linkClass}>Home</NavLink>
            <NavLink to="/properties" className={linkClass}>Browse properties</NavLink>
            {!user && <NavLink to="/register-agency" className={linkClass}>For agencies</NavLink>}
            {user?.role === ROLES.CUSTOMER && <NavLink to="/my-inquiries" className={linkClass}>My inquiries</NavLink>}
          </nav>
        </div>

        {/* Desktop right side */}
        <div className="hidden items-center gap-2 md:flex">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost">Log in</Link>
              <Link to="/register-customer" className="btn btn-primary">Sign up</Link>
            </>
          ) : (
            <>
              {STAFF_ROLES.includes(user.role) && (
                <Link to="/dashboard" className="btn btn-secondary"><LayoutDashboard size={16} /> Dashboard</Link>
              )}
              {user.role === ROLES.SUPER_ADMIN && (
                <Link to="/admin" className="btn btn-secondary"><ShieldCheck size={16} /> Admin</Link>
              )}
              <div className="ml-2 flex items-center gap-3 border-l border-slate-200 pl-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                  {initials(user.name)}
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
                </div>
                <button onClick={handleLogout} className="btn btn-ghost px-2.5" aria-label="Log out" title="Log out">
                  <LogOut size={18} />
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="btn btn-ghost px-2.5 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 py-3">
            <NavLink to="/" end onClick={close} className={linkClass}>Home</NavLink>
            <NavLink to="/properties" onClick={close} className={linkClass}>Browse properties</NavLink>
            {!user && <NavLink to="/register-agency" onClick={close} className={linkClass}>For agencies</NavLink>}
            {user?.role === ROLES.CUSTOMER && (
              <NavLink to="/my-inquiries" onClick={close} className={linkClass}><Inbox size={15} className="mr-1.5 inline" />My inquiries</NavLink>
            )}
            {user && STAFF_ROLES.includes(user.role) && (
              <NavLink to="/dashboard" onClick={close} className={linkClass}>Dashboard</NavLink>
            )}
            {user?.role === ROLES.SUPER_ADMIN && <NavLink to="/admin" onClick={close} className={linkClass}>Admin</NavLink>}
          </nav>
          {!user ? (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login" onClick={close} className="btn btn-secondary">Log in</Link>
              <Link to="/register-customer" onClick={close} className="btn btn-primary">Sign up</Link>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-xs text-slate-500">{ROLE_LABELS[user.role]}</p>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary"><LogOut size={16} /> Log out</button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}