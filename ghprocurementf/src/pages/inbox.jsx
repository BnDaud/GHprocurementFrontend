import { useContext, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  LuSearch,
  LuInbox,
  LuPaperclip,
  LuX,
  LuRefreshCw,
  LuCheckCheck,
  LuReply,
  LuTriangleAlert,
} from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import { globalContext } from "../App";
import { PageHeader, Spinner, ErrorBanner, btnSecondary } from "../component/ui";

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay
    ? d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: d.getFullYear() === now.getFullYear() ? undefined : "numeric",
      });
};
const fmtFull = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", {
        weekday: "short",
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
  <div className="grid grid-cols-[72px_1fr] gap-3 py-1.5 text-sm">
    <dt className="text-muted">{label}</dt>
    <dd className="min-w-0 break-words">{children}</dd>
  </div>
);

function Message({ id, onClose, onRead }) {
  const { data, loading, err, doFetch } = useFetch();
  const mark = useFetch();
  const [isRead, setIsRead] = useState(true);

  useEffect(() => {
    doFetch({ url: API.inbox(id), method: "GET" });
  }, [id]);

  // opening a message marks it read
  useEffect(() => {
    if (data) {
      setIsRead(data.is_read);
      if (!data.is_read) {
        setIsRead(true);
        (async () => {
          await mark.doFetch({ url: API.inbox(id), method: "PATCH", body: { is_read: true } });
          onRead(id, true); // refresh the badge only once the server has saved it
        })();
      }
    }
  }, [data]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const markUnread = async () => {
    setIsRead(false);
    await mark.doFetch({ url: API.inbox(id), method: "PATCH", body: { is_read: false } });
    onRead(id, false);
    onClose();
  };

  const sender = data ? (data.from_name ? `${data.from_name} <${data.from_email}>` : data.from_email) : "";
  const replyHref = data
    ? `mailto:${encodeURIComponent(data.from_email)}?subject=${encodeURIComponent(
        /^re:/i.test(data.subject) ? data.subject : `Re: ${data.subject}`
      )}`
    : "#";

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Message"
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full max-w-2xl max-h-[92vh] sm:max-h-[88vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-line">
          <h2 className="text-lg font-extrabold text-purple break-words min-w-0">
            {data ? data.subject || "(no subject)" : "Message"}
          </h2>
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
            <ErrorBanner>This message could not be loaded.</ErrorBanner>
          ) : data ? (
            <>
              {data.is_spam && (
                <p
                  role="alert"
                  className="mb-3 flex items-start gap-2 rounded-lg bg-[#fbf0d3] px-3 py-2 text-sm text-[#7a4b00]"
                >
                  <LuTriangleAlert className="mt-0.5 shrink-0" />
                  This message looks like spam. Be careful with links and attachments.
                </p>
              )}
              <dl className="divide-y divide-line">
                <Row label="From"><span className="font-semibold">{sender}</span></Row>
                <Row label="To">{(data.to || []).join(", ")}</Row>
                <Row label="Date">{fmtFull(data.received_at)}</Row>
              </dl>

              <div
                data-testid="message-body"
                className="mt-4 rounded-xl border border-line bg-bgcolor/60 p-4 text-sm leading-relaxed whitespace-pre-wrap break-words"
              >
                {data.text_body || "(no text)"}
              </div>

              {data.attachments?.length > 0 && (
                <>
                  <h3 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                    Attachments ({data.attachments.length})
                  </h3>
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
                  <p className="mt-2 text-xs text-muted">
                    Only the file names are shown here. Open the original email in
                    Zoho Mail to get the files.
                  </p>
                </>
              )}
            </>
          ) : null}
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 border-t border-line">
          <button type="button" onClick={markUnread} disabled={!data || !isRead} className={btnSecondary}>
            Mark as unread
          </button>
          {data && (
            <a href={replyHref} className={btnSecondary}>
              <LuReply /> Reply by email
            </a>
          )}
          <button type="button" onClick={onClose} className={btnSecondary}>
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function Inbox() {
  const { refreshInbox } = useContext(globalContext);
  const { data, loading, err, doFetch } = useFetch();
  const markAll = useFetch();
  const [messages, setMessages] = useState([]);
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

  const load = () => doFetch({ url: API.inbox(), method: "GET" });
  useEffect(() => {
    load();
    const timer = setInterval(load, 60000); // new mail shows up without reloading
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (data) {
      setMessages(data);
      refreshInbox?.(); // keep the sidebar badge in step with the list
    }
  }, [data]);
  useEffect(() => {
    if (markAll.success) {
      setMessages((prev) => prev.map((m) => ({ ...m, is_read: true })));
      refreshInbox?.();
    }
  }, [markAll.success]);

  const setRead = (id, value) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, is_read: value } : m)));
    refreshInbox?.();
  };

  const counts = {
    all: messages.length,
    unread: messages.filter((m) => !m.is_read && !m.is_spam).length,
    spam: messages.filter((m) => m.is_spam).length,
  };

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return messages.filter((m) => {
      if (tab === "unread" && (m.is_read || m.is_spam)) return false;
      if (tab === "spam" && !m.is_spam) return false;
      if (!q) return true;
      return [m.from_email, m.from_name, m.subject, m.snippet]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [messages, tab, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inbox"
        subtitle="Mail sent to info@ghprocurement.com. Read-only: reply from your mail app."
      >
        <button
          type="button"
          onClick={() => markAll.doFetch({ url: API.inboxMarkAllRead(), method: "POST" })}
          disabled={counts.unread === 0 || markAll.loading}
          className={`${btnSecondary} disabled:opacity-50`}
        >
          <LuCheckCheck className="text-lg" /> Mark all read
        </button>
        <button type="button" onClick={load} className={btnSecondary} aria-label="Refresh inbox">
          <LuRefreshCw className={`text-lg ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </PageHeader>

      {err && !data && <ErrorBanner onRetry={load}>The inbox could not be loaded.</ErrorBanner>}

      <section className="rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line">
          <div role="group" aria-label="Filter" className="flex gap-1 p-1 rounded-xl bg-bgcolor">
            {[
              ["all", "All"],
              ["unread", "Unread"],
              ["spam", "Spam"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={tab === value}
                onClick={() => setTab(value)}
                className={`h-9 px-3.5 rounded-[9px] text-[13px] font-bold transition ${
                  tab === value ? "bg-white shadow-sm text-ink" : "text-ink/70 hover:text-ink"
                }`}
              >
                {label}
                <span className="ml-1.5 font-semibold text-muted">{counts[value]}</span>
              </button>
            ))}
          </div>

          <label className="relative block">
            <span className="sr-only">Search the inbox</span>
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search sender, subject or text"
              className="w-full sm:w-80 h-11 pl-10 pr-3.5 rounded-xl border border-[#d5d0dd] bg-white text-sm focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20"
            />
          </label>
        </div>

        {loading && !data ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-3xl" />
          </div>
        ) : shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-muted">
            <LuInbox className="text-3xl" />
            {messages.length === 0 ? (
              <>
                <p className="text-sm font-semibold text-ink">No mail yet.</p>
                <p className="text-sm max-w-md">
                  Mail sent to info@ghprocurement.com appears here once forwarding to
                  Postmark is set up. New mail arrives within seconds.
                </p>
              </>
            ) : (
              <p className="text-sm">No messages match.</p>
            )}
          </div>
        ) : (
          <ul aria-label="Messages" className="divide-y divide-line">
            {shown.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(m.id)}
                  aria-label={`Open ${m.subject || "message"} from ${m.from_name || m.from_email}`}
                  className={`w-full text-left flex items-start gap-3 px-5 py-3.5 hover:bg-bgcolor/60 ${
                    m.is_read ? "" : "bg-lilac/30"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-2 size-2 shrink-0 rounded-full ${m.is_read ? "bg-transparent" : "bg-purple"}`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={`truncate text-sm ${m.is_read ? "font-semibold" : "font-extrabold"}`}>
                        {m.from_name || m.from_email}
                      </span>
                      <span className="shrink-0 text-xs text-muted tabular-nums">{fmtDate(m.received_at)}</span>
                    </span>
                    <span className={`block truncate text-sm ${m.is_read ? "text-ink/80" : "font-bold"}`}>
                      {m.subject || "(no subject)"}
                      {m.is_spam && (
                        <span className="ml-2 rounded bg-[#fbf0d3] px-1.5 py-0.5 text-[11px] font-bold text-[#7a4b00]">
                          Possible spam
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-2 text-[13px] text-muted">
                      <span className="truncate">{m.snippet}</span>
                      {m.attachments_count > 0 && (
                        <span className="inline-flex shrink-0 items-center gap-1">
                          <LuPaperclip /> {m.attachments_count}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {openId && <Message id={openId} onClose={() => setOpenId(null)} onRead={setRead} />}
    </div>
  );
}
