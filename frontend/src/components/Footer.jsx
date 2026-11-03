import { Link } from "react-router-dom";
import Logo from "./ui/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Logo />
          <p className="text-sm text-slate-500">Multi-tenant real estate platform — capstone project.</p>
        </div>
        <nav className="flex gap-6 text-sm text-slate-600">
          <Link to="/properties" className="hover:text-brand-700">Browse</Link>
          <Link to="/register-agency" className="hover:text-brand-700">List your agency</Link>
          <Link to="/login" className="hover:text-brand-700">Log in</Link>
        </nav>
      </div>
    </footer>
  );
}