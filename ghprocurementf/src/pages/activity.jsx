import { useEffect, useRef, useState } from "react";
import { LuSearch, LuRefreshCw, LuActivity } from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import { PageHeader, Spinner, ErrorBanner, btnSecondary } from "../component/ui";

const GROUPS = [
  ["all", "Everything", ""],
  ["signins", "Sign-ins & security", "sign_in,sign_in_failed,password_changed,two_step_on,two_step_off,recovery_codes"],
  ["changes", "Changes", "created,updated,deleted"],
  ["mail", "Emails & quotes", "email_sent,quote_received"],
];

const DOT = {
  sign_in: "bg-[#12633a]",
  sign_in_failed: "bg-[#d92d20]",
  deleted: "bg-[#d92d20]",
  created: "bg-purple",
  updated: "bg-[#b7791f]",
  email_sent: "bg-[#2563eb]",
  quote_received: "bg-[#2563eb]",
};

const fmt = (iso) =>
  new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

// "regular@x.com deleted the service "Sourcing""
function sentence(e) {
  const who = e.actor_email || "Someone";
  const what = e.target_label ? ` “${e.target_label}”` : "";
  switch (e.action) {
    case "sign_in":
      return <><b>{who}</b> signed in</>;
    case "sign_in_failed":
      return <>Failed sign-in{e.actor_email ? <> for <b>{e.actor_email}</b></> : null}</>;
    case "password_changed":
      return <><b>{who}</b> changed their password</>;
    case "two_step_on":
      return <><b>{who}</b> turned two-step verification on</>;
    case "two_step_off":
      return <><b>{who}</b> turned two-step verification off</>;
    case "recovery_codes":
      return <><b>{who}</b> made new recovery codes</>;
    case "created":
      return <><b>{who}</b> added {e.target_type}{what}</>;
    case "updated":
      return <><b>{who}</b> edited {e.target_type}{what}</>;
    case "deleted":
      return <><b>{who}</b> deleted {e.target_type}{what}</>;
    case "email_sent":
      return <><b>{who}</b> sent the email{what}</>;
    case "quote_received":
      return <>New quote request from <b>{e.target_label}</b></>;
    default:
      return <><b>{who}</b> {e.action_label}</>;
  }
}

export default function Activity() {
  const { data, loading, err, errDetail, doFetch } = useFetch();
  const [group, setGroup] = useState("all");
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const offset = useRef(0);

  const load = (reset = true) => {
    if (reset) offset.current = 0;
    const p = new URLSearchParams();
    const actions = GROUPS.find((g) => g[0] === group)[2];
    if (actions) p.set("action", actions);
    if (query.trim()) p.set("q", query.trim());
    if (offset.current) p.set("offset", String(offset.current));
    doFetch({ url: API.audit(`?${p}`), method: "GET" });
  };

  // reload when the filter changes (search waits a moment for typing to stop)
  useEffect(() => {
    const t = setTimeout(() => load(true), query ? 300 : 0);
    return () => clearTimeout(t);
  }, [group, query]);

  useEffect(() => {
    if (!data) return;
    setTotal(data.total);
    setRows((prev) => (data.offset ? [...prev, ...data.results] : data.results));
  }, [data]);

  const more = () => {
    offset.current = rows.length;
    load(false);
  };

  const forbidden = err && errDetail?.detail && /super admin/i.test(errDetail.detail);

  return (
    <div className="space-y-6">
      <PageHeader title="Activity" subtitle="Who signed in, changed content, sent email or deleted something. Only a super admin can see this, and entries cannot be edited or removed.">
        <button type="button" onClick={() => load(true)} className={btnSecondary} aria-label="Refresh activity">
          <LuRefreshCw className={`text-lg ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </PageHeader>

      {forbidden ? (
        <ErrorBanner>Only a super admin can see the activity.</ErrorBanner>
      ) : (
        <section className="rounded-2xl border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line">
            <div role="group" aria-label="Filter" className="flex flex-wrap gap-1 p-1 rounded-xl bg-bgcolor">
              {GROUPS.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={group === value}
                  onClick={() => setGroup(value)}
                  className={`h-9 px-3.5 rounded-[9px] text-[13px] font-bold transition ${
                    group === value ? "bg-white shadow-sm text-ink" : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="relative block">
              <span className="sr-only">Search the activity</span>
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search item or details"
                className="w-full sm:w-72 h-11 pl-10 pr-3.5 rounded-xl border border-[#d5d0dd] bg-white text-sm focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20"
              />
            </label>
          </div>

          {err && rows.length === 0 ? (
            <div className="p-5"><ErrorBanner onRetry={() => load(true)}>The activity could not be loaded.</ErrorBanner></div>
          ) : loading && rows.length === 0 ? (
            <div className="flex justify-center py-16"><Spinner className="text-3xl" /></div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-muted">
              <LuActivity className="text-3xl" />
              <p className="text-sm">Nothing recorded yet.</p>
            </div>
          ) : (
            <>
              <ul aria-label="Activity" className="divide-y divide-line">
                {rows.map((e) => (
                  <li key={e.id} data-action={e.action} className="flex items-start gap-3 px-5 py-3.5">
                    <span aria-hidden="true" className={`mt-2 size-2 shrink-0 rounded-full ${DOT[e.action] || "bg-muted"}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm break-words">{sentence(e)}</p>
                      {e.detail && <p className="text-[13px] text-muted break-words">{e.detail}</p>}
                    </div>
                    <time dateTime={e.created_at} className="shrink-0 text-xs text-muted tabular-nums">
                      {fmt(e.created_at)}
                    </time>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-line text-[13px] text-muted">
                <span>Showing {rows.length} of {total}</span>
                {rows.length < total && (
                  <button type="button" onClick={more} disabled={loading} className={btnSecondary}>
                    {loading ? <Spinner className="text-xl" /> : "Show older"}
                  </button>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
