import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LuSearch, LuTruck, LuRefreshCw, LuArrowLeft, LuPencil, LuTrash2, LuX } from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import {
  PageHeader,
  Spinner,
  ErrorBanner,
  Field,
  btnPrimary,
  btnSecondary,
  inputClass,
  textareaClass,
} from "../component/ui";

// the same eight steps the customer sees (the server is the source of truth)
const STAGES = [
  ["received", "Request received"],
  ["quoted", "Quoted"],
  ["confirmed", "Confirmed"],
  ["sourcing", "Sourcing"],
  ["quality", "Quality check"],
  ["shipped", "Shipped"],
  ["customs", "Customs"],
  ["delivered", "Delivered"],
];
const LABEL = Object.fromEntries(STAGES);
const stepOf = (key) => STAGES.findIndex(([k]) => k === key) + 1;

const fmt = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

const chip = (status) =>
  status === "delivered"
    ? "bg-[#e6f2ea] text-[#12633a]"
    : status === "customs"
    ? "bg-[#fbf0d3] text-[#7a4b00]"
    : "bg-lilac text-purple";

const Chip = ({ status }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${chip(status)}`}>
    {LABEL[status] || status}
  </span>
);

const firstLine = (text = "") => {
  const t = text.trim().split("\n")[0] || "Quote request";
  return t.length > 70 ? t.slice(0, 67).trimEnd() + "..." : t;
};

// ------------------------------------------------------------------ list
function OrdersList() {
  const { data, loading, err, doFetch } = useFetch();
  const [tab, setTab] = useState("all");
  const [stage, setStage] = useState("all");
  const [sort, setSort] = useState("newest");
  const [query, setQuery] = useState("");
  const load = () => doFetch({ url: API.rfqs(), method: "GET" });
  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = (data || []).filter((r) => {
      if (tab === "open" && r.status === "delivered") return false;
      if (tab === "done" && r.status !== "delivered") return false;
      if (stage !== "all" && r.status !== stage) return false;
      if (!q) return true;
      return [r.reference, r.name, r.company, r.email, r.item].filter(Boolean).some((v) => v.toLowerCase().includes(q));
    });
    const by = {
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      stage: (a, b) => stepOf(a.status) - stepOf(b.status) || new Date(b.created_at) - new Date(a.created_at),
      customer: (a, b) => (a.company || "").localeCompare(b.company || "") || new Date(b.created_at) - new Date(a.created_at),
    }[sort];
    return list.sort(by);
  }, [data, tab, stage, sort, query]);

  const count = (fn) => (data || []).filter(fn).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Orders" subtitle="Quote requests from the website. Post progress and the customer sees it on their account.">
        <button type="button" onClick={load} className={btnSecondary} aria-label="Refresh orders">
          <LuRefreshCw className={`text-lg ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </PageHeader>

      {err && !data && <ErrorBanner onRetry={load}>The orders could not be loaded.</ErrorBanner>}

      <section className="rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line">
          <div role="group" aria-label="Filter" className="flex gap-1 p-1 rounded-xl bg-bgcolor">
            {[
              ["all", "All", count(() => true)],
              ["open", "In progress", count((r) => r.status !== "delivered")],
              ["done", "Delivered", count((r) => r.status === "delivered")],
            ].map(([value, label, n]) => (
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
                <span className="ml-1.5 font-semibold text-muted">{n}</span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label>
              <span className="sr-only">Filter by stage</span>
              <select value={stage} onChange={(e) => setStage(e.target.value)} className="h-11 rounded-xl border border-[#d5d0dd] bg-white px-3 text-sm font-semibold focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20">
                <option value="all">All stages ({(data || []).length})</option>
                {STAGES.map(([k, l], i) => (
                  <option key={k} value={k}>{i + 1} · {l} ({count((r) => r.status === k)})</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Sort orders</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="h-11 rounded-xl border border-[#d5d0dd] bg-white px-3 text-sm font-semibold focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="stage">By stage</option>
                <option value="customer">By company</option>
              </select>
            </label>
            <label className="relative block">
              <span className="sr-only">Search orders</span>
              <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search reference, customer or item"
                className="w-full sm:w-72 h-11 pl-10 pr-3.5 rounded-xl border border-[#d5d0dd] bg-white text-sm focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20"
              />
            </label>
          </div>
        </div>

        {loading && !data ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-3xl" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-muted">
            <LuTruck className="text-3xl" />
            <p className="text-sm">{(data || []).length === 0 ? "No quote requests yet." : "No orders match these filters."}</p>
          </div>
        ) : (
          <ul aria-label="Orders" className="divide-y divide-line">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/orders/${r.id}`}
                  className="flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 hover:bg-bgcolor/60"
                  aria-label={`Open ${r.reference || "order"} from ${r.name}`}
                >
                  <div className="min-w-0 flex-1 basis-60">
                    <p className="text-xs font-bold text-muted">
                      {r.reference || "No reference"} · {fmt(r.created_at)}
                    </p>
                    <p className="truncate text-[15px] font-extrabold text-purple">{firstLine(r.item)}</p>
                    <p className="truncate text-[13px] text-muted">
                      {r.name} · {r.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:block text-xs text-muted tabular-nums">
                      Step {stepOf(r.status)} of {STAGES.length}
                    </span>
                    <Chip status={r.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- detail
const blank = { stage: "received", headline: "", details: "", location: "", estimated_delivery: "" };

function OrderDetail({ id }) {
  const navigate = useNavigate();
  const rfq = useFetch();
  const ups = useFetch();
  const post = useFetch();
  const edit = useFetch();
  const del = useFetch();
  const addr = useFetch();

  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [address, setAddress] = useState("");
  const [savedAddress, setSavedAddress] = useState(false);

  const reload = () => {
    rfq.doFetch({ url: API.rfqs(id), method: "GET" });
    ups.doFetch({ url: API.rfqUpdates(id), method: "GET" });
  };
  useEffect(() => {
    reload();
  }, [id]);

  const r = rfq.data;
  useEffect(() => {
    if (r) {
      setAddress(r.delivery_address || "");
      // new updates start at the order's current stage
      setForm((f) => (f.headline || editingId ? f : { ...f, stage: r.status, estimated_delivery: r.estimated_delivery || "" }));
    }
  }, [r]);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
    setError("");
  };
  const failure = (res, fallback) => res.errDetail?.detail || fallback;

  // a finished call: refresh and clear
  useEffect(() => {
    if (post.success) {
      setForm({ ...blank, stage: form.stage, estimated_delivery: form.estimated_delivery });
      reload();
    }
  }, [post.success]);
  useEffect(() => {
    if (edit.success) {
      setEditingId(null);
      setForm(blank);
      reload();
    }
  }, [edit.success]);
  useEffect(() => {
    if (del.success) {
      setConfirmDelete(null);
      reload();
    }
  }, [del.success]);
  useEffect(() => {
    if (post.err) setError(failure(post, "The update could not be posted."));
  }, [post.err]);
  useEffect(() => {
    if (edit.err) setError(failure(edit, "The update could not be saved."));
  }, [edit.err]);
  useEffect(() => {
    if (addr.success) {
      setSavedAddress(true);
      rfq.doFetch({ url: API.rfqs(id), method: "GET" });
    }
  }, [addr.success]);

  const submit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.headline.trim()) {
      setError("Add a headline.");
      return;
    }
    const body = {
      stage: form.stage,
      headline: form.headline.trim(),
      details: form.details.trim(),
      location: form.location.trim(),
    };
    if (editingId) {
      edit.doFetch({ url: API.rfqUpdates(id, editingId), method: "PATCH", body });
    } else {
      post.doFetch({
        url: API.rfqUpdates(id),
        method: "POST",
        body: { ...body, estimated_delivery: form.estimated_delivery || null },
      });
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setForm({ stage: u.stage, headline: u.headline, details: u.details || "", location: u.location || "", estimated_delivery: r?.estimated_delivery || "" });
    setError("");
    document.getElementById("post-title")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setForm({ ...blank, stage: r?.status || "received", estimated_delivery: r?.estimated_delivery || "" });
    setError("");
  };

  const busy = post.loading || edit.loading;
  const updates = ups.data || [];

  if (rfq.err && !r) {
    return (
      <div className="space-y-6">
        <Link to="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-purple">
          <LuArrowLeft /> All orders
        </Link>
        <ErrorBanner onRetry={reload}>This order could not be loaded.</ErrorBanner>
      </div>
    );
  }
  if (!r) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="text-3xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <button type="button" onClick={() => navigate("/orders")} className="inline-flex items-center gap-2 text-sm font-bold text-purple mb-3 cursor-pointer">
          <LuArrowLeft /> All orders
        </button>
        <PageHeader title={firstLine(r.item)} subtitle={`${r.reference || "No reference"} · sent ${fmt(r.created_at)}`}>
          <Chip status={r.status} />
        </PageHeader>
      </div>

      <div className="flex flex-wrap gap-6 items-start">
        {/* post / edit an update */}
        <section aria-labelledby="post-title" className="flex-[3_1_420px] min-w-0 rounded-2xl border border-line bg-white p-5 md:p-6">
          <h2 id="post-title" className="text-lg font-extrabold text-purple">
            {editingId ? "Edit update" : "Post an update"}
          </h2>
          <p className="mt-1 mb-5 text-[13px] text-muted">
            {editingId ? "Changing an update does not email the customer again." : "It shows on the customer's tracking page straight away."}
          </p>
          <form onSubmit={submit} noValidate className="flex flex-col gap-5">
            <Field label="Stage" htmlFor="up-stage" hint="Pick the same stage to add a note without moving the order forward.">
              <select id="up-stage" value={form.stage} onChange={set("stage")} className={inputClass}>
                {STAGES.map(([k, l], i) => (
                  <option key={k} value={k}>
                    {i + 1} · {l}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Headline" htmlFor="up-headline">
              <input id="up-headline" className={inputClass} value={form.headline} onChange={set("headline")} placeholder="Packed and handed to the carrier" maxLength={200} />
            </Field>
            <Field label="Details (optional)" htmlFor="up-details">
              <textarea id="up-details" rows={3} className={textareaClass} value={form.details} onChange={set("details")} placeholder="Anything the customer should know" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Where (optional)" htmlFor="up-where">
                <input id="up-where" className={inputClass} value={form.location} onChange={set("location")} placeholder="Lagos port" />
              </Field>
              {!editingId && (
                <Field label="Estimated delivery" htmlFor="up-eta">
                  <input id="up-eta" type="date" className={inputClass} value={form.estimated_delivery} onChange={set("estimated_delivery")} />
                </Field>
              )}
            </div>
            {!editingId && <p className="text-[13px] text-muted">{r.name?.split(" ")[0] || "The customer"} is emailed about this update automatically ({r.email}).</p>}
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" disabled={busy} className={btnPrimary}>
                {busy ? <Spinner className="text-peach text-xl" /> : editingId ? "Save changes" : "Post update"}
              </button>
              {editingId && (
                <button type="button" onClick={cancelEdit} className={btnSecondary}>
                  Cancel
                </button>
              )}
              {error && (
                <p role="alert" className="text-sm font-semibold text-[#b42318]">
                  {error}
                </p>
              )}
              {!error && post.success && <p role="status" className="text-sm font-semibold text-[#12633a]">Update posted{post.data?.emailed ? ", and the customer was emailed." : "."}</p>}
            </div>
          </form>
        </section>

        <div className="flex-[2_1_320px] min-w-0 flex flex-col gap-6">
          <section className="rounded-2xl border border-line bg-white p-5 md:p-6">
            <h2 className="text-base font-extrabold text-purple mb-4">Customer</h2>
            <dl className="grid grid-cols-[88px_1fr] gap-x-3 gap-y-2.5 text-sm">
              <dt className="text-muted">Name</dt><dd className="font-bold break-words">{r.name}</dd>
              <dt className="text-muted">Company</dt><dd className="font-bold break-words">{r.company}</dd>
              <dt className="text-muted">Email</dt><dd className="font-bold break-all">{r.email}</dd>
              <dt className="text-muted">Phone</dt><dd className="font-bold">{r.phone || "-"}</dd>
            </dl>
            <p className="mt-4 mb-1 text-xs font-bold uppercase tracking-wider text-muted">What they asked for</p>
            <p className="whitespace-pre-wrap break-words text-sm">{r.item}</p>
            {r.file_url && (
              <a href={r.file_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-bold text-purple underline">
                Open their picture
              </a>
            )}
            <form
              className="mt-5 flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                setSavedAddress(false);
                addr.doFetch({ url: API.rfqs(id), method: "PATCH", body: { delivery_address: address.trim() } });
              }}
            >
              <label htmlFor="up-address" className="text-sm font-bold">Delivery address</label>
              <input id="up-address" className={inputClass} value={address} onChange={(e) => { setAddress(e.target.value); setSavedAddress(false); }} placeholder="Where it will be delivered" />
              <div className="flex items-center gap-3">
                <button type="submit" disabled={addr.loading} className={btnSecondary}>Save address</button>
                {savedAddress && <span role="status" className="text-sm font-semibold text-[#12633a]">Saved</span>}
              </div>
            </form>
          </section>

          <section className="rounded-2xl border border-line bg-white p-5 md:p-6" aria-labelledby="seen-title">
            <h2 id="seen-title" className="text-base font-extrabold text-purple mb-4">What the customer sees</h2>
            {ups.loading && updates.length === 0 ? (
              <div className="flex justify-center py-6"><Spinner className="text-2xl" /></div>
            ) : (
              <ol aria-label="Updates" className="flex flex-col">
                {updates.map((u, i) => (
                  <li key={u.id} data-stage={u.stage} className="flex gap-3 pb-4 last:pb-0">
                    <span className="flex flex-col items-center">
                      <span className={`mt-1.5 size-3 rounded-full ${i === 0 ? "bg-purple ring-4 ring-lilac" : "bg-[#b9a9c2]"}`} />
                      {i < updates.length - 1 && <span className="mt-1.5 w-0.5 flex-1 bg-line" />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-muted">{fmt(u.created_at)} · {u.stage_label}</p>
                      <p className="text-[15px] font-extrabold break-words">{u.headline}</p>
                      {u.details && <p className="mt-0.5 text-[13.5px] text-ink/80 whitespace-pre-wrap break-words">{u.details}</p>}
                      {u.location && <p className="mt-0.5 text-xs text-muted">Where: {u.location}</p>}
                      {u.posted_by && <p className="mt-0.5 text-xs text-muted">Posted by {u.posted_by}</p>}
                      <div className="mt-2 flex gap-2">
                        <button type="button" onClick={() => startEdit(u)} aria-label={`Edit ${u.headline}`} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#d5d0dd] text-[13px] font-bold hover:bg-bgcolor">
                          <LuPencil /> Edit
                        </button>
                        <button type="button" onClick={() => setConfirmDelete(u)} aria-label={`Remove ${u.headline}`} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#f1c0bb] text-[13px] font-bold text-[#b42318] hover:bg-[#fdeceb]">
                          <LuTrash2 /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 p-0 sm:p-4" onClick={() => setConfirmDelete(null)}>
          <div role="alertdialog" aria-modal="true" aria-label="Remove update" onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-line">
              <h2 className="text-lg font-extrabold text-purple">Remove update</h2>
              <button type="button" aria-label="Close" onClick={() => setConfirmDelete(null)} className="size-10 -mr-2 flex items-center justify-center rounded-lg text-muted hover:bg-bgcolor"><LuX className="text-xl" /></button>
            </div>
            <div className="px-6 py-5 space-y-3 text-[15px] text-ink/80">
              <p>Remove <b className="text-ink">{confirmDelete.headline}</b>? The customer will no longer see it, and the order's stage is worked out again from the updates that are left.</p>
              {del.err && <p role="alert" className="rounded-lg bg-[#fdeceb] px-3 py-2 text-sm text-[#8a1f15]">{del.errDetail?.detail || "Could not remove it."}</p>}
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 border-t border-line">
              <button type="button" onClick={() => setConfirmDelete(null)} className={btnSecondary}>Cancel</button>
              <button type="button" disabled={del.loading} onClick={() => del.doFetch({ url: API.rfqUpdates(id, confirmDelete.id), method: "DELETE" })} className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#b42318] text-white text-sm font-bold hover:bg-[#912018] disabled:opacity-60">
                {del.loading ? <Spinner className="text-white text-xl" /> : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Orders() {
  const { id } = useParams();
  return id ? <OrderDetail id={id} key={id} /> : <OrdersList />;
}
