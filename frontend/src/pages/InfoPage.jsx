import { Link, useLocation } from "react-router-dom";
import PageHeader from "../components/PageHeader";

// Simple text pages linked from the footer. Replace the wording with your own before going live.
const PAGES = {
  "/contact": {
    title: "Contact us",
    subtitle: "We usually reply within one working day.",
    body: [
      "Questions about a listing? Open the property and use “Send inquiry” it goes straight to the agency.",
      "For help with your account or to report a problem, email hello@estatehub.example.",
    ],
  },
  "/privacy": {
    title: "Privacy policy",
    subtitle: "What we collect and why.",
    body: [
      "We store the details you give us when you register (name, email and a securely hashed password) and the inquiries you send to agencies.",
      "Your inquiries are visible only to the agency you contacted. We never sell your data.",
      "You can ask for your account to be deleted at any time by contacting us.",
    ],
  },
  "/terms": {
    title: "Terms & conditions",
    subtitle: "The rules for using EstateHub.",
    body: [
      "EstateHub connects buyers with real estate agencies. Listings are created and maintained by the agencies, who are responsible for their accuracy.",
      "Do not post false or misleading listings or misuse the inquiry form. Accounts that do may be suspended.",
      "This site is a capstone project provided as-is, without warranty.",
    ],
  },
};

export default function InfoPage() {
  const { pathname } = useLocation();
  const page = PAGES[pathname];
  if (!page) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <PageHeader title={page.title} subtitle={page.subtitle} />
      <div className="card space-y-4 p-6 leading-relaxed text-slate-700">
        {page.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <Link to="/" className="mt-6 inline-block text-sm font-semibold text-brand-700 hover:underline">
        ← Back to home
      </Link>
    </div>
  );
}