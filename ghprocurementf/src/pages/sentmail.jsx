import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { LuSearch, LuInbox, LuPaperclip, LuX, LuMail } from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import {
  PageHeader,
  StatusChip,
  Spinner,
  ErrorBanner,
  btnPrimary,
  btnSecondary,
} from "../component/ui";

const KINDS = {
  rfq_reply: "Quote reply",
  outreach: "Outreach",
};

const fmtDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

const fmtSize = (bytes) =>
  bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const Row = ({ label, children }) => (
  <div className="grid grid-cols-[120px_1fr] gap-3 py-2 text-sm">
    <dt className="text-muted">{label}</dt>
    <dd className="min-w-0 break-words font-semibold">{children}</dd>
  </div>
);

function Detail({ id, onClose }) {
  const { data, loading, err, doFetch } = useFetch();

  useEffect(() => {
    doFetch({ url: API.sentEmails(id), method: "GET" });
  }, [id]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sent email"
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-line">
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-purple break-words">
              {data?.subject ?? "Sent email"}
            </h2>
            {data?.reference && (
              <p className="mt-0.5 text-sm font-bold text-muted">{data.reference}</p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="size-10 -mr-2 shrink-0 flex items-center justify-center rounded-lg text-muted hover:bg-bgcolor"
          >
            <LuX className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && !data ? (
            <div className="flex justify-center py-12">
              <Spinner className="text-3xl" />
            </div>
          ) : err ? (
            <ErrorBanner>This email could not be loaded.</ErrorBanner>
          ) : data ? (
            <>
              <dl className="divide-y divide-line">
                <Row label="Status">
                  <StatusChip value={data.status} />
                </Row>
                <Row label="Type">{KINDS[data.kind] ?? data.kind}</Row>
                <Row label="To">
                  {data.recipient_name ? `${data.recipient_name} · ` : ""}
                  {data.recipient}
                </Row>
                <Row label="Sent">{fmtDate(data.sent_at || data.created_at)}</Row>
                {data.valid_days ? (
                  <Row label="Valid for">{data.valid_days} days</Row>
                ) : null}
                <Row label="Heading">{data.title}</Row>
              </dl>

              {data.status === "failed" && data.error && (
                <p
                  role="alert"
                  className="mt-3 rounded-lg bg-[#fdeceb] px-3 py-2 text-sm text-[#8a1f15] break-words"
                >
                  {data.error}
                </p>
              )}

              <h3 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                Message
              </h3>
              <div className="rounded-xl border border-line bg-bgcolor/60 p-4 text-sm leading-relaxed whitespace-pre-wrap break-words">
                {data.body}
              </div>

              <h3 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                Attachments ({data.attachments_count})
              </h3>
              {data.attachments?.length ? (
                <ul className="space-y-2">
                  {data.attachments.map((a, i) => (
                    <li
                      key={`${a.name}-${i}`}
                      className="flex items-center gap-3 rounded-lg border border-line px-3 py-2 text-sm"
                    >
                      <LuPaperclip className="shrink-0 text-muted" />
                      <span className="min-w-0 flex-1 truncate font-semibold" title={a.name}>
                        {a.name}
                      </span>
                      <span className="shrink-0 text-muted">{fmtSize(a.size)}</span>
                    </li>
                  ))}
                </ul>
              ) : data.attachments_count > 0 ? (
                <p className="text-sm text-muted">
                  {data.attachments_count} file{data.attachments_count === 1 ? "" : "s"} were
                  attached; their names were not recorded for this older email.
                </p>
              ) : (
                <p className="text-sm text-muted">No attachments.</p>
              )}
              {data.attachments?.length > 0 && (
                <p className="mt-2 text-xs text-muted">
                  Only the file names are kept. The files themselves are not stored.
                </p>
              )}
            </>
          ) : null}
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-line">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function SentMail() {
  const { data, loading, err, doFetch } = useFetch();
  const [kind, setKind] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const load = () => doFetch({ url: API.sentEmails(), method: "GET" });
  useEffect(() => {
    load();
  }, []);

  const all = data ?? [];
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((m) => {
      if (kind !== "all" && m.kind !== kind) return false;
      if (!q) return true;
      return [m.reference, m.recipient, m.recipient_name, m.subject]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [all, kind, query]);

  const count = (k) => (k === "all" ? all.length : all.filter((m) => m.kind === k).length);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sent mail"
        subtitle="Every email sent from the CMS. Attachments are listed by name only; the files are not kept."
      >
        <Link to="/mail" className={btnPrimary}>
          <LuMail className="text-lg" />
          New email
        </Link>
      </PageHeader>

      {err && <ErrorBanner onRetry={load}>Sent mail could not be loaded.</ErrorBanner>}

      <section className="rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line">
          <div
            role="group"
            aria-label="Filter by type"
            className="flex gap-1 p-1 rounded-xl bg-bgcolor"
          >
            {[
              ["all", "All"],
              ["rfq_reply", "Quote replies"],
              ["outreach", "Outreach"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={kind === value}
                onClick={() => setKind(value)}
                className={`h-9 px-3.5 rounded-[9px] text-[13px] font-bold transition ${
                  kind === value ? "bg-white shadow-sm text-ink" : "text-ink/70 hover:text-ink"
                }`}
              >
                {label}
                <span className="ml-1.5 font-semibold text-muted">{count(value)}</span>
              </button>
            ))}
          </div>

          <label className="relative block">
            <span className="sr-only">Search sent mail</span>
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reference, person, subject"
              className="w-full sm:w-80 h-11 pl-10 pr-3.5 rounded-xl border border-[#d5d0dd] bg-white text-sm focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20"
            />
          </label>
        </div>

        {loading && !data ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-3xl" />
          </div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-muted">
            <LuInbox className="text-3xl" />
            <p className="text-sm">
              {all.length === 0 ? "No emails sent yet." : "No emails match your search."}
            </p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted">
                  <th scope="col" className="px-4 pl-5 py-3.5">Reference</th>
                  <th scope="col" className="px-4 py-3.5">Date</th>
                  <th scope="col" className="px-4 py-3.5">To</th>
                  <th scope="col" className="px-4 py-3.5">Subject</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Files</th>
                  <th scope="col" className="px-4 py-3.5">Status</th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    <span className="sr-only">Open</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {shown.map((m) => (
                  <tr key={m.id} className="border-t border-line hover:bg-bgcolor/50">
                    <td className="px-4 pl-5 py-3.5 whitespace-nowrap font-bold">
                      {m.reference || <span className="font-normal text-muted">{KINDS[m.kind]}</span>}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-ink/80">
                      {fmtDate(m.sent_at || m.created_at)}
                    </td>
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="truncate font-semibold">{m.recipient_name || m.recipient}</div>
                      {m.recipient_name && (
                        <div className="truncate text-xs text-muted">{m.recipient}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="truncate" title={m.subject}>{m.subject}</div>
                    </td>
                    <td className="px-4 py-3.5 text-right tabular-nums">{m.attachments_count}</td>
                    <td className="px-4 py-3.5"><StatusChip value={m.status} /></td>
                    <td className="px-5 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setOpenId(m.id)}
                        aria-label={`Open ${m.reference || m.subject}`}
                        className="h-9 px-3.5 rounded-lg text-[13px] font-bold text-purple hover:bg-lilac"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {openId && <Detail id={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
