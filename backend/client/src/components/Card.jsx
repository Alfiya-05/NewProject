export function Card({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm shadow-slate-200/50 ${className}`}
    >
      {title && <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>}
      {children}
    </div>
  );
}
