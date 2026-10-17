import { useState } from "react";
import { LuDownload, LuFileText, LuTrash2, LuUpload } from "react-icons/lu";
import API from "../endpoints/endpoints";
import { authHeaders, notifyUnauthorized } from "../auth/auth";
import { Field, Spinner, btnPrimary, inputClass } from "./ui";

const KINDS = [
  ["invoice", "Invoice"],
  ["packing_list", "Packing list"],
  ["airway_bill", "Airway bill"],
  ["bill_of_lading", "Bill of lading"],
  ["receipt", "Receipt"],
  ["other", "Other document"],
];
const size = (b) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`);
const when = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

// PDFs the customer can download from their order page (invoice, packing list, airway bill...).
export default function OrderDocuments({ id, items, onChanged }) {
  const [kind, setKind] = useState("invoice");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const call = async (url, options = {}) => {
    const res = await fetch(url, { ...options, headers: { ...authHeaders(), ...(options.headers || {}) } });
    if (res.status === 401) notifyUnauthorized();
    return res;
  };

  const upload = async (e) => {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setError("");
    const body = new FormData();
    body.append("file", file);
    body.append("kind", kind);
    if (title.trim()) body.append("title", title.trim());
    try {
      const res = await call(API.rfqDocuments(id), { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Could not add the document.");
      setFile(null);
      setTitle("");
      e.target.reset();
      onChanged?.();
    } catch (err) {
      setError(err.message || "Could not add the document.");
    }
    setBusy(false);
  };

  const open = async (d) => {
    setError("");
    try {
      const res = await call(`${API.rfqDocuments(id)}${d.id}/`);
      if (!res.ok) throw new Error("The file could not be loaded.");
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement("a");
      a.href = url;
      a.download = `${d.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (d) => {
    if (!window.confirm(`Remove "${d.title}"? The customer will no longer see it.`)) return;
    setError("");
    const res = await call(`${API.rfqDocuments(id)}${d.id}/`, { method: "DELETE" });
    if (res.ok) onChanged?.();
    else setError("Could not remove it. Please try again.");
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-5 md:p-6" aria-labelledby="docs-title">
      <h2 id="docs-title" className="text-base font-extrabold text-purple mb-1">Documents</h2>
      <p className="mb-4 text-xs text-muted">PDFs the customer can download from their order page, such as the invoice or airway bill.</p>
      {items.length > 0 && (
        <ul className="mb-4 divide-y divide-line rounded-xl border border-line" aria-label="Documents on this order">
          {items.map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
              <LuFileText className="shrink-0 text-lg text-purple" aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-bold" title={d.title}>{d.title}</span>
                <span className="block text-xs text-muted">{d.kind_label} · {size(d.size)} · {when(d.created_at)}</span>
              </span>
              <button type="button" onClick={() => open(d)} aria-label={`Download ${d.title}`} className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-lg text-purple hover:bg-lilac"><LuDownload /></button>
              <button type="button" onClick={() => remove(d)} aria-label={`Remove ${d.title}`} className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-lg text-[#a3261a] hover:bg-[#fbe9e7]"><LuTrash2 /></button>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={upload} className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Type" htmlFor="doc-kind">
            <select id="doc-kind" value={kind} onChange={(e) => setKind(e.target.value)} className={inputClass}>
              {KINDS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </Field>
          <Field label="Name (optional)" htmlFor="doc-title">
            <input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Invoice 0042" className={inputClass} />
          </Field>
        </div>
        <Field label="PDF file (up to 8 MB)" htmlFor="doc-file">
          <input id="doc-file" type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-sm" />
        </Field>
        {error && <p role="alert" className="text-sm font-semibold text-[#b42318]">{error}</p>}
        <button type="submit" disabled={!file || busy} className={`${btnPrimary} self-start`}>
          {busy ? <Spinner className="text-peach text-xl" /> : <><LuUpload className="text-lg" /> Add document</>}
        </button>
      </form>
    </section>
  );
}
