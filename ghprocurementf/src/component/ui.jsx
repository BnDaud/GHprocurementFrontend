import { LuLoaderCircle } from "react-icons/lu";

export const PageHeader = ({ title, subtitle, children }) => (
  <header className="flex flex-wrap items-center justify-between gap-4">
    <div>
      <h1 className="text-2xl md:text-[28px] font-extrabold tracking-tight text-purple">
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
    </div>
    {children && <div className="flex flex-wrap items-center gap-3">{children}</div>}
  </header>
);

const chipStyles = {
  published: "bg-[#e6f2ea] text-[#12633a]",
  active: "bg-[#e6f2ea] text-[#12633a]",
  draft: "bg-[#fbf0d3] text-[#7a4b00]",
  inactive: "bg-[#fbf0d3] text-[#7a4b00]",
};
const dotStyles = {
  published: "bg-[#12633a]",
  active: "bg-[#12633a]",
  draft: "bg-[#b77a00]",
  inactive: "bg-[#b77a00]",
};

export const StatusChip = ({ value }) => {
  const key = String(value ?? "").toLowerCase();
  const style = chipStyles[key] ?? "bg-bgcolor text-ink/70";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${style}`}
    >
      <span className={`size-1.5 rounded-full ${dotStyles[key] ?? "bg-muted"}`} />
      {value}
    </span>
  );
};

export const Spinner = ({ className = "" }) => (
  <LuLoaderCircle className={`animate-spin text-purple ${className}`} />
);

export const ErrorBanner = ({ children, onRetry }) => (
  <div
    role="alert"
    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#f1c0bb] bg-[#fdeceb] px-4 py-3 text-sm text-[#8a1f15]"
  >
    <span>{children}</span>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="font-bold underline underline-offset-2 hover:no-underline"
      >
        Try again
      </button>
    )}
  </div>
);

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-purple text-peach text-sm font-bold transition hover:bg-purple/90 disabled:opacity-60 disabled:cursor-not-allowed";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-[#d5d0dd] bg-white text-ink text-sm font-bold transition hover:bg-bgcolor";
export const inputClass =
  "w-full h-11 px-3.5 rounded-xl border border-[#d5d0dd] bg-white text-[15px] text-ink placeholder:text-muted/70 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20";
export const textareaClass =
  "w-full px-3.5 py-3 rounded-xl border border-[#d5d0dd] bg-white text-[15px] leading-relaxed text-ink placeholder:text-muted/70 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20";

export const Field = ({ label, hint, htmlFor, children }) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={htmlFor} className="text-sm font-bold text-ink">
      {label}
    </label>
    {children}
    {hint && <p className="text-xs text-muted">{hint}</p>}
  </div>
);
