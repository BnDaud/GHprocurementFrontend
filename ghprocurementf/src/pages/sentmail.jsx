import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { LuSearch, LuInbox, LuPaperclip, LuX, LuMail, LuDownload, LuImage, LuPencil, LuTrash2 } from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import { authHeaders } from "../auth/auth";
import watermark from "../images/watermark.png";
import logoWhite from "../images/logo-white.png";
import logoDark from "../images/logo-dark.png";
import { elementToPdf, emailHtmlToPdf } from "../lib/pdf";
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

const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// The details page as plain HTML with inline styles, so the PDF looks the same wherever it is made.
function detailsMarkup(d, logo, kinds, fmtDate, fmtSize) {
  const row = (k, v) => (v ? `<tr><td style="padding:9px 0;color:#6b6277;width:140px;vertical-align:top">${k}</td><td style="padding:9px 0;font-weight:700;word-break:break-word">${v}</td></tr>` : "");
  const q = d.quote?.rows?.length ? d.quote : null;
  const table = q
    ? `<h3 style="margin:26px 0 8px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6b6277">Price table (${esc(q.currency)})</h3>
       <table style="width:100%;border-collapse:collapse;border:1px solid #e6e0ec;font-size:13px">
         <tr style="background:#f6f2f9;color:#6b6277;font-size:11px;text-transform:uppercase;letter-spacing:.06em"><td style="padding:8px 10px">Item</td><td style="padding:8px 10px;text-align:right">Qty</td><td style="padding:8px 10px;text-align:right">Unit price</td><td style="padding:8px 10px;text-align:right">Total</td></tr>
         ${q.rows.map((r) => `<tr style="border-top:1px solid #e6e0ec"><td style="padding:9px 10px;word-break:break-word">${r.has_image ? '<div style="font-size:11px;color:#6b6277;margin-bottom:3px">[ picture sent ]</div>' : ""}${esc(r.description)}</td><td style="padding:9px 10px;text-align:right">${esc(r.quantity)}</td><td style="padding:9px 10px;text-align:right">${esc(r.unit_price_text)}</td><td style="padding:9px 10px;text-align:right;font-weight:700">${esc(r.line_total_text)}</td></tr>`).join("")}
         <tr style="border-top:1px solid #e6e0ec"><td colspan="3" style="padding:7px 10px;text-align:right;color:#6b6277">Subtotal</td><td style="padding:7px 10px;text-align:right">${esc(q.subtotal_text)}</td></tr>
         ${q.shipping_text ? `<tr><td colspan="3" style="padding:5px 10px;text-align:right;color:#6b6277">Delivery</td><td style="padding:5px 10px;text-align:right">${esc(q.shipping_text)}</td></tr>` : ""}
         ${q.vat_text ? `<tr><td colspan="3" style="padding:5px 10px;text-align:right;color:#6b6277">VAT (${esc(q.vat_percent)}%)</td><td style="padding:5px 10px;text-align:right">${esc(q.vat_text)}</td></tr>` : ""}
         <tr style="border-top:1px solid #e6e0ec;color:#420e51;font-weight:800"><td colspan="3" style="padding:10px;text-align:right">Total</td><td style="padding:10px;text-align:right">${esc(q.total_text)}</td></tr>
       </table>`
    : "";
  const files = d.attachments?.length
    ? `<h3 style="margin:26px 0 8px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6b6277">Attachments (${d.attachments.length})</h3>${d.attachments.map((a) => `<div style="padding:7px 0;border-top:1px solid #eee9f1;font-size:13px">${esc(a.name)} <span style="color:#6b6277">${esc(fmtSize(a.size))}</span></div>`).join("")}`
    : "";
  return `<div style="font-family:Manrope,Arial,Helvetica,sans-serif;color:#1d1527;padding:40px 44px 44px;font-size:14px;line-height:1.5">
    <table style="width:100%;border-collapse:collapse"><tr>
      <td style="vertical-align:top"><div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6b6277;font-weight:700">Sent email</div>
        <div style="margin-top:4px;font-size:22px;font-weight:800;color:#420e51;word-break:break-word">${esc(d.subject)}</div>
        ${d.reference ? `<div style="margin-top:2px;font-weight:700;color:#6b6277">${esc(d.reference)}</div>` : ""}</td>
      <td style="vertical-align:top;text-align:right;width:190px"><img src="${logo}" alt="GH Procurement" style="height:46px;width:auto"></td>
    </tr></table>
    <div style="height:2px;background:#febcbd;margin:20px 0 8px"></div>
    <table style="width:100%;border-collapse:collapse">
      ${row("Status", esc(d.status))}${row("Type", esc(kinds[d.kind] ?? d.kind))}
      ${row("To", esc((d.recipient_name ? `${d.recipient_name} · ` : "") + d.recipient))}
      ${row("Sent", esc(fmtDate(d.sent_at || d.created_at)))}
      ${row("Valid for", d.valid_days ? `${esc(d.valid_days)} days` : "")}
      ${row("Heading", esc(d.title))}${row("Order", esc(d.order_reference))}${row("Quoted total", esc(d.total))}
    </table>
    <h3 style="margin:26px 0 8px;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#6b6277">Message</h3>
    <div style="background:#f6f2f9;border:1px solid #e6e0ec;border-radius:12px;padding:14px 16px;white-space:pre-wrap;word-break:break-word">${esc(d.body)}</div>
    ${table}${files}
    <div style="margin-top:34px;font-size:11px;color:#8a8196;text-align:center">GH Procurement · Sent mail record</div>
  </div>`;
}

function Detail({ id, onClose, onChanged }) {
  const { data, loading, err, doFetch } = useFetch();
  const navigate = useNavigate();
  const isDraft = data?.status === "draft";
  const [removing, setRemoving] = useState(false);

  const editDraft = () => navigate("/mail", { state: { draft: data } });
  const removeDraft = async () => {
    if (!window.confirm("Delete this draft? This cannot be undone.")) return;
    setRemoving(true);
    try {
      const r = await fetch(`${API.sentEmails(id)}discard/`, { method: "POST", headers: authHeaders() });
      if (r.ok) {
        onChanged?.();
        onClose();
        return;
      }
    } catch {
      /* shown below */
    }
    setRemoving(false);
    setHtmlErr(true);
  };

  useEffect(() => {
    doFetch({ url: API.sentEmails(id), method: "GET" });
  }, [id]);

  // "details" = the record; "email" = the email as it went out (rebuilt from the record)
  const [view, setView] = useState("details");
  const [html, setHtml] = useState(null);
  const [htmlErr, setHtmlErr] = useState(false);
  const [saving, setSaving] = useState(false);
  const htmlUrl = `${API.sentEmails(id)}html/`;

  useEffect(() => {
    if (view !== "email" || html !== null) return undefined;
    let live = true;
    fetch(htmlUrl, { headers: authHeaders() })
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error("failed"))))
      .then((t) => live && setHtml(t))
      .catch(() => live && setHtmlErr(true));
    return () => {
      live = false;
    };
  }, [view, html, htmlUrl]);

  // Download saves the page you are looking at: the details page, or the email as it was sent.
  const download = async () => {
    setSaving(true);
    try {
      const name = data?.reference || "email";
      if (view === "email" && !isDraft) {
        const markup = html ?? (await fetch(htmlUrl, { headers: authHeaders() }).then((r) => (r.ok ? r.text() : Promise.reject(new Error("failed")))));
        await emailHtmlToPdf(markup, { filename: `${name}.pdf`, mark: logoWhite });
      } else {
        const box = document.createElement("div");
        box.style.cssText = "position:fixed;left:-10000px;top:0;width:760px;background:#fff";
        box.innerHTML = detailsMarkup(data, logoDark, KINDS, fmtDate, fmtSize);
        document.body.appendChild(box);
        try {
          await Promise.all([...box.querySelectorAll("img")].map((img) => (img.complete ? null : new Promise((res) => { img.onload = res; img.onerror = res; }))));
          await elementToPdf(box, { filename: `${name}-details.pdf`, mark: logoDark, markAlpha: 0.06, width: 760 });
        } finally {
          box.remove();
        }
      }
    } catch {
      setHtmlErr(true);
    } finally {
      setSaving(false);
    }
  };

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
        className="flex flex-col w-full max-w-3xl h-[92vh] sm:h-[85vh] sm:max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
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
          <img src={logoDark} alt="GH Procurement" className="ml-auto hidden h-9 w-auto shrink-0 sm:block" />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="size-10 -mr-2 shrink-0 flex items-center justify-center rounded-lg text-muted hover:bg-bgcolor"
          >
            <LuX className="text-xl" />
          </button>
        </div>

        {data && !isDraft && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-2.5">
            <div role="tablist" aria-label="View" className="inline-flex rounded-xl bg-bgcolor p-1">
              {[["details", "Details"], ["email", "Email as sent"]].map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={view === k}
                  onClick={() => setView(k)}
                  className={`h-9 cursor-pointer rounded-lg px-4 text-sm font-bold ${view === k ? "bg-white text-purple shadow-sm" : "text-muted hover:text-ink"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <button type="button" onClick={download} disabled={saving} className={`${btnSecondary} !h-9 !px-3 text-sm`}>
              <LuDownload /> {saving ? "Preparing…" : "Download"}
            </button>
          </div>
        )}

        {view === "email" && data && !isDraft ? (
          <div className="flex flex-1 min-h-0 flex-col bg-[#efecf3]">
            {htmlErr ? (
              <div className="p-6"><ErrorBanner>The email could not be shown.</ErrorBanner></div>
            ) : html === null ? (
              <div className="flex justify-center py-12"><Spinner className="text-3xl" /></div>
            ) : (
              <iframe title="Email as sent" sandbox="" srcDoc={html} className="min-h-0 w-full flex-1 border-0" />
            )}
            <p className="shrink-0 border-t border-line bg-white px-4 py-1.5 text-center text-[11px] font-semibold text-muted">
              Rebuilt from what was saved. Item pictures are not kept.
            </p>
          </div>
        ) : (
        <div className="relative flex-1 min-h-0 overflow-hidden">
        <img src={watermark} alt="" aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 w-[min(70%,520px)] -translate-x-1/2 -translate-y-1/2 -rotate-[22deg] select-none opacity-[0.045]" />
        <div className="relative h-full overflow-y-auto px-6 py-4">
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
                <Row label={isDraft ? "Saved" : "Sent"}>{fmtDate(data.sent_at || data.created_at)}</Row>
                {data.valid_days ? (
                  <Row label="Valid for">{data.valid_days} days</Row>
                ) : null}
                <Row label="Heading">{data.title}</Row>
                {data.order_reference && <Row label="Order">{data.order_reference}</Row>}
                {data.total && <Row label="Quoted total">{data.total}</Row>}
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

              {data.quote?.rows?.length > 0 && (
                <>
                  <h3 className="mt-5 mb-2 text-xs font-bold uppercase tracking-wider text-muted">
                    Price table ({data.quote.currency})
                  </h3>
                  <div className="overflow-x-auto rounded-xl border border-line">
                    <table className="w-full min-w-[420px] text-sm" aria-label="Price table sent">
                      <thead>
                        <tr className="bg-bgcolor/60 text-left text-xs font-bold uppercase tracking-wider text-muted">
                          <th className="px-3 py-2">Item</th>
                          <th className="px-3 py-2 text-right">Qty</th>
                          <th className="px-3 py-2 text-right">Unit price</th>
                          <th className="px-3 py-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.quote.rows.map((r, i) => (
                          <tr key={i} className="border-t border-line">
                            <td className="px-3 py-2 break-words">
                              {r.has_image && (
                                <span className="mb-1 inline-flex items-center gap-1 rounded-md border border-dashed border-[#b9a6c4] bg-lilac/50 px-1.5 py-0.5 text-[11px] font-semibold text-muted" title="A picture was sent here; pictures are not kept">
                                  <LuImage aria-hidden="true" /> Picture sent
                                </span>
                              )}
                              {r.has_image && <br />}
                              {r.description}
                            </td>
                            <td className="px-3 py-2 text-right tabular-nums">{r.quantity}</td>
                            <td className="px-3 py-2 text-right tabular-nums">{r.unit_price_text}</td>
                            <td className="px-3 py-2 text-right font-semibold tabular-nums">{r.line_total_text}</td>
                          </tr>
                        ))}
                        <tr className="border-t border-line"><td colSpan={3} className="px-3 py-1.5 text-right text-muted">Subtotal</td><td className="px-3 py-1.5 text-right tabular-nums">{data.quote.subtotal_text}</td></tr>
                        {data.quote.shipping_text && <tr><td colSpan={3} className="px-3 py-1 text-right text-muted">Delivery</td><td className="px-3 py-1 text-right tabular-nums">{data.quote.shipping_text}</td></tr>}
                        {data.quote.vat_text && <tr><td colSpan={3} className="px-3 py-1 text-right text-muted">VAT ({data.quote.vat_percent}%)</td><td className="px-3 py-1 text-right tabular-nums">{data.quote.vat_text}</td></tr>}
                        <tr className="border-t border-line font-extrabold text-purple"><td colSpan={3} className="px-3 py-2 text-right">Total</td><td className="px-3 py-2 text-right tabular-nums">{data.quote.total_text}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}

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
        </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4 border-t border-line">
          {isDraft && (
            <>
              <button type="button" onClick={removeDraft} disabled={removing} className={`${btnSecondary} mr-auto !text-[#a3261a]`}>
                <LuTrash2 /> Delete draft
              </button>
              <button type="button" onClick={editDraft} className={btnPrimary}>
                <LuPencil /> Edit and send
              </button>
            </>
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
      if (kind === "draft" ? m.status !== "draft" : kind !== "all" && m.kind !== kind) return false;
      if (!q) return true;
      return [m.reference, m.recipient, m.recipient_name, m.subject]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(q));
    });
  }, [all, kind, query]);

  const count = (k) => (k === "all" ? all.length : k === "draft" ? all.filter((m) => m.status === "draft").length : all.filter((m) => m.kind === k).length);

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
              ["draft", "Drafts"],
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
            <table className="w-full min-w-[920px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted">
                  <th scope="col" className="px-4 pl-5 py-3.5">Reference</th>
                  <th scope="col" className="px-4 py-3.5">Date</th>
                  <th scope="col" className="px-4 py-3.5">To</th>
                  <th scope="col" className="px-4 py-3.5">Subject</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Total</th>
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
                      {m.reference || <span className="font-normal text-muted">{m.status === "draft" ? "Draft" : KINDS[m.kind]}</span>}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-ink/80">
                      {fmtDate(m.sent_at || m.created_at)}
                    </td>
                    <td className="px-4 py-3.5 max-w-[220px]">
                      <div className="truncate font-semibold">{m.recipient_name || m.recipient || <span className="font-normal text-muted">No recipient yet</span>}</div>
                      {m.recipient_name && (
                        <div className="truncate text-xs text-muted">{m.recipient}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="truncate" title={m.subject}>{m.subject}</div>
                      {m.order_reference && <div className="truncate text-xs text-muted">Order {m.order_reference}</div>}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap font-semibold tabular-nums">{m.total || <span className="font-normal text-muted">-</span>}</td>
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

      {openId && <Detail id={openId} onClose={() => setOpenId(null)} onChanged={load} />}
    </div>
  );
}
