import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
      <button className="btn btn-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <ChevronLeft size={16} /> Prev
      </button>
      <span className="text-sm text-slate-600">
        Page <strong>{page}</strong> of {pages}
      </span>
      <button className="btn btn-secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>
        Next <ChevronRight size={16} />
      </button>
    </nav>
  );
}