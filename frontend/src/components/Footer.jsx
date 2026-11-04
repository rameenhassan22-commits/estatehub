import { Link } from "react-router-dom";
import Logo from "./ui/Logo";

const YEAR = new Date().getFullYear(); // computed once, not on every render

// lucide-react no longer ships brand logos, so these are tiny inline SVGs (24x24, stroke style).
const icon = (children) =>
  function Icon() {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    );
  };

const Facebook = icon(<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />);
const Instagram = icon(
  <>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </>
);
const Linkedin = icon(
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </>
);
const Twitter = icon(
  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
);

// Replace these with your real pages.
const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
  { label: "LinkedIn", href: "https://linkedin.com", Icon: Linkedin },
  { label: "Twitter", href: "https://twitter.com", Icon: Twitter },
];

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { to: "/", label: "Home" },
      { to: "/properties", label: "Browse Properties" },
      { to: "/properties?purpose=sale", label: "Properties for Sale" },
      { to: "/properties?purpose=rent", label: "Properties for Rent" },
    ],
  },
  {
    title: "For Agencies",
    links: [
      { to: "/register-agency", label: "Register Agency" },
      { to: "/login", label: "Agency Login" },
      { to: "/dashboard/properties", label: "Manage Listings" },
      { to: "/dashboard", label: "Agent Portal" },
    ],
  },
  {
    title: "Support",
    links: [
      { to: "/contact", label: "Contact Us" },
      { to: "/my-inquiries", label: "My Inquiries" },
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/terms", label: "Terms & Conditions" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-brand-900 text-brand-50">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs leading-relaxed text-brand-50/90">
            Your trusted platform for discovering properties and managing real estate businesses.
          </p>
          <div className="mt-5 flex gap-3">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-brand-100 transition hover:bg-white/20 hover:text-white"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="font-semibold tracking-wide text-brand-300 uppercase">{col.title}</h3>
            <ul className="mt-5 space-y-4">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-brand-50/90 transition hover:text-white hover:underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-brand-50/80 sm:flex-row sm:px-6">
          <p>&copy; {YEAR} EstateHub. All rights reserved.</p>
          <p>Privacy Policy · Terms of Service</p>
        </div>
      </div>
    </footer>
  );
}