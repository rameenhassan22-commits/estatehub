// Temporary placeholder. Each one is replaced by the real page in a later step.
export default function Stub({ title, step }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-slate-500">Placeholder page. The real version is built in Step {step}.</p>
    </div>
  );
}