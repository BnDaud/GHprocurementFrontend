import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuPaperclip, LuSend, LuX, LuCircleCheck, LuPlus, LuTrash2 } from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import logoWhite from "../images/logo-white.png";
import {
  PageHeader,
  Field,
  Spinner,
  ErrorBanner,
  btnPrimary,
  inputClass,
  textareaClass,
} from "../component/ui";

// Keep in step with the API (cms/serial.py): extension decides, limits per email.
const ALLOWED_EXT = ["pdf", "docx", "xlsx", "pptx", "jpg", "jpeg", "png", "webp"];
const ACCEPT = ALLOWED_EXT.map((e) => `.${e}`).join(",");
const MAX_FILES = 10;
const MAX_FILE_MB = 10;
const MAX_TOTAL_MB = 10;
const mb = (bytes) => (bytes / (1024 * 1024)).toFixed(1);
const fmtSize = (bytes) =>
  bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${mb(bytes)} MB`;
const extOf = (name) => (name.includes(".") ? name.split(".").pop().toLowerCase() : "");

// split newly picked files into the ones we can send and a reason for each we cannot
function checkFiles(existing, incoming) {
  const accepted = [];
  const problems = [];
  let total = existing.reduce((sum, f) => sum + f.size, 0);
  for (const f of incoming) {
    if (!ALLOWED_EXT.includes(extOf(f.name))) {
      problems.push(`${f.name}: ${extOf(f.name) ? "." + extOf(f.name) : "this"} files are not allowed.`);
    } else if (f.size > MAX_FILE_MB * 1024 * 1024) {
      problems.push(`${f.name}: ${mb(f.size)} MB is over the ${MAX_FILE_MB} MB limit for one file.`);
    } else if (existing.length + accepted.length >= MAX_FILES) {
      problems.push(`${f.name}: you can attach at most ${MAX_FILES} files.`);
    } else if (total + f.size > MAX_TOTAL_MB * 1024 * 1024) {
      problems.push(`${f.name}: attachments would go over ${MAX_TOTAL_MB} MB in total.`);
    } else {
      accepted.push(f);
      total += f.size;
    }
  }
  return { accepted, problems };
}

// DRF validation errors look like {attachments: ["..."], recipient: ["..."]}
function readableError(detail) {
  if (!detail || typeof detail !== "object") return "";
  const parts = [];
  const walk = (v) => {
    if (typeof v === "string") parts.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(detail);
  return parts.join(" ");
}

// the currencies the API accepts, and how each is written (the server adds the figures up and has the last word)
const CURRENCIES = [
  ["USD", "US dollar ($)", "$"],
  ["NGN", "Nigerian naira (₦)", "₦"],
  ["GBP", "British pound (£)", "£"],
  ["EUR", "Euro (€)", "€"],
  ["CNY", "Chinese yuan (¥)", "¥"],
  ["GHS", "Ghanaian cedi (GH₵)", "GH₵"],
  ["ZAR", "South African rand (R)", "R"],
  ["AED", "UAE dirham (AED)", "AED "],
];
const symbolOf = (code) => CURRENCIES.find((c) => c[0] === code)?.[2] ?? `${code} `;
const money = (n, code) =>
  `${symbolOf(code)}${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (v) => {
  const n = Number(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const blankRow = (description = "") => ({ description, quantity: "1", unit_price: "" });

function Mail() {
  const initalState = {
    subject: "",
    recipient: "",
    body: "",
    title: "",
    attachments: [],
    kind: "outreach", // "outreach" | "rfq_reply"
    recipient_name: "",
    valid_days: "",
    items: [], // the price table of a quotation
    currency: "",
    shipping: "",
    vat_percent: "",
    rfq: "", // the order this quotation is for
  };
  // "Reply" in the Inbox opens this page with the sender and subject filled in;
  // "Send quotation" on an order opens it with the quotation for that order started
  const location = useLocation();
  const reply = location.state?.reply;
  const order = location.state?.quote; // { id, reference, recipient, recipient_name, item }
  const [email, setEmail] = useState(() =>
    order
      ? {
          ...initalState,
          kind: "rfq_reply",
          recipient: String(order.recipient || ""),
          recipient_name: String(order.recipient_name || ""),
          subject: `Your quotation, ${order.reference}`,
          title: "Your quotation",
          body: `Hello ${String(order.recipient_name || "").split(" ")[0] || "there"},\n\nThank you for your request ${order.reference}. Please find our prices below.\n\nLet us know if you would like to go ahead.`,
          items: [blankRow(String(order.item || "").split("\n")[0].slice(0, 200))],
          rfq: String(order.id),
        }
      : reply
      ? {
          ...initalState,
          recipient: String(reply.recipient || ""),
          recipient_name: String(reply.recipient_name || ""),
          subject: String(reply.subject || ""),
        }
      : initalState
  );
  const meta = useFetch();
  useEffect(() => {
    meta.doFetch({ url: API.metadata(1), method: "GET" }); // the currency chosen in Settings is the default
  }, []);
  const currency = email.currency || meta.data?.currency || "USD";
  const rows = email.items;
  const filled = rows.filter((r) => r.description.trim() || r.unit_price !== "");
  const lines = filled.map((r) => Math.round(num(r.quantity) * num(r.unit_price) * 100) / 100);
  const subtotal = lines.reduce((a, b) => a + b, 0);
  const ship = num(email.shipping);
  const vat = Math.round((subtotal + ship) * num(email.vat_percent)) / 100;
  const total = subtotal + ship + vat;
  const setRow = (i, key, value) => {
    setErrors((prev) => ({ ...prev, items: undefined }));
    setSent(false);
    setEmail((prev) => ({ ...prev, items: prev.items.map((r, k) => (k === i ? { ...r, [key]: value } : r)) }));
  };
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sentReference, setSentReference] = useState("");
  const [sentOrder, setSentOrder] = useState("");
  const [submit, setSubmit] = useState(false);
  const { data, success, loading, err, errDetail, doFetch } = useFetch();

  const updateEmail = (key, new_value) => {
    setEmail((prev) => ({ ...prev, [key]: new_value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSent(false);
  };

  const isRfq = email.kind === "rfq_reply";
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const validUntil =
    isRfq && Number(email.valid_days) > 0
      ? new Date(Date.now() + Number(email.valid_days) * 86400000).toLocaleDateString(
          "en-GB",
          { day: "numeric", month: "long", year: "numeric" }
        )
      : "";

  const [fileProblems, setFileProblems] = useState([]);
  const addFiles = (files) => {
    const { accepted, problems } = checkFiles(email.attachments, files);
    setFileProblems(problems);
    if (accepted.length) updateEmail("attachments", [...email.attachments, ...accepted]);
  };
  const removeFile = (index) => {
    setFileProblems([]);
    setSent(false);
    setEmail((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const handlesubmit = (e) => {
    e.preventDefault();
    const next = {};
    if (email.body.length === 0) next.body = "Write a message.";
    if (email.recipient.length === 0) next.recipient = "Enter the recipient's email.";
    if (email.subject.length === 0) next.subject = "Add a subject.";
    if (isRfq) {
      const bad = filled.findIndex((r) => !r.description.trim() || !(num(r.quantity) > 0) || r.unit_price === "" || num(r.unit_price) < 0);
      if (bad >= 0) next.items = `Row ${bad + 1}: add a description, a quantity and a price.`;
      else if ((ship || num(email.vat_percent)) && filled.length === 0) next.items = "Add at least one row to the price table, or clear delivery and VAT.";
    }
    setErrors(next);
    if (Object.keys(next).length === 0) setSubmit(true);
  };

  useEffect(() => {
    if (submit) {
      const formData = new FormData();
      formData.append("body", email.body);
      formData.append("recipient", email.recipient);
      formData.append("subject", email.subject);
      // the API requires a title, so fall back to the subject
      formData.append("title", email.title || email.subject);
      formData.append("kind", email.kind);
      if (email.kind === "rfq_reply") {
        formData.append("recipient_name", email.recipient_name);
        formData.append("valid_days", email.valid_days); // blank = no validity line
        if (filled.length) {
          formData.append("items", JSON.stringify(filled.map((r) => ({ description: r.description.trim(), quantity: String(num(r.quantity)), unit_price: String(num(r.unit_price)) }))));
          formData.append("currency", currency);
          formData.append("shipping", email.shipping);
          formData.append("vat_percent", email.vat_percent);
        }
        if (email.rfq) formData.append("rfq", email.rfq);
      }

      email.attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      doFetch({ url: API.emails(), method: "POST", body: formData });
      setSubmit(false); // reset submit
    }
  }, [submit]);

  useEffect(() => {
    if (success) {
      setSent(true);
      setSentReference(data?.reference || "");
      setSentOrder(email.rfq ? String(email.rfq) : "");
      setEmail((prev) => ({ ...initalState, kind: prev.kind })); // keep the chosen template
    }
  }, [success]);

  const errorText = (key) =>
    errors[key] && (
      <p role="alert" className="text-xs font-semibold text-[#b42318]">
        {errors[key]}
      </p>
    );
  const invalid = (key) => (errors[key] ? "!border-[#b42318]" : "");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Send email"
        subtitle="Compose a message from GH Procurement. Attachments are optional."
      />

      {sent && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-[#bfe0cb] bg-[#e6f2ea] px-4 py-3 text-sm font-semibold text-[#12633a]"
        >
          <LuCircleCheck className="text-lg" />
          <span>
            Email sent.{sentReference ? ` Reference ${sentReference}.` : ""}
            {sentOrder && " The order now shows as Quoted."}{" "}
            {sentOrder && (
              <>
                <Link to={`/orders/${sentOrder}`} className="underline underline-offset-2 hover:no-underline">
                  Open the order
                </Link>{" · "}
              </>
            )}
            <Link to="/sent" className="underline underline-offset-2 hover:no-underline">
              View sent mail
            </Link>
          </span>
        </div>
      )}
      {err && (
        <ErrorBanner>
          {readableError(errDetail) ||
            "The email could not be sent. Check the details and try again."}
        </ErrorBanner>
      )}

      <div className="flex flex-wrap items-start gap-5">
        <form
          noValidate
          onSubmit={handlesubmit}
          className="flex-[999_1_480px] min-w-0 flex flex-col gap-5 rounded-2xl border border-line bg-white p-5 md:p-6"
        >
          {email.rfq && order && (
            <p className="rounded-xl border border-peach bg-peach-50 px-4 py-3 text-sm font-semibold text-purple">
              Quotation for order <b>{order.reference}</b>. Sending it moves that order to Quoted and records it in Activity.
            </p>
          )}
          <fieldset className="flex flex-col gap-2.5">
            <legend className="mb-2 text-sm font-bold">Email type</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  value: "outreach",
                  name: "Reach out / general",
                  hint: "A friendly email to a potential customer or contact.",
                },
                {
                  value: "rfq_reply",
                  name: "Reply to a quote request",
                  hint: "Formal quotation with a reference number, date and an optional price table.",
                },
              ].map((o) => (
                <label
                  key={o.value}
                  className={`flex cursor-pointer gap-3 rounded-xl border p-3.5 transition ${
                    email.kind === o.value
                      ? "border-purple bg-lilac/50 ring-1 ring-purple"
                      : "border-line hover:bg-bgcolor"
                  }`}
                >
                  <input
                    type="radio"
                    name="mail-kind"
                    value={o.value}
                    checked={email.kind === o.value}
                    onChange={() => updateEmail("kind", o.value)}
                    className="mt-1 accent-purple"
                  />
                  <span>
                    <span className="block text-sm font-bold">{o.name}</span>
                    <span className="block text-xs text-muted">{o.hint}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <Field label="Recipient" htmlFor="mail-recipient">
            <input
              id="mail-recipient"
              type="email"
              className={`${inputClass} ${invalid("recipient")}`}
              value={email.recipient}
              placeholder="name@email.com"
              onChange={(e) => updateEmail("recipient", e.target.value)}
            />
            {errorText("recipient")}
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Subject" htmlFor="mail-subject">
              <input
                id="mail-subject"
                className={`${inputClass} ${invalid("subject")}`}
                value={email.subject}
                placeholder="What's this email about?"
                onChange={(e) => updateEmail("subject", e.target.value)}
              />
              {errorText("subject")}
            </Field>
            <Field
              label="Heading (optional)"
              htmlFor="mail-title"
              hint="Shown at the top of the email. Defaults to the subject."
            >
              <input
                id="mail-title"
                className={inputClass}
                value={email.title}
                placeholder="Topic of discussion"
                onChange={(e) => updateEmail("title", e.target.value)}
              />
            </Field>
          </div>

          {isRfq && (
            <div className="grid gap-5 md:grid-cols-2 rounded-xl border border-peach bg-peach-50 p-4">
              <Field
                label="Recipient name (optional)"
                htmlFor="mail-recipient-name"
                hint='Shown as "Prepared for". Defaults to the email address.'
              >
                <input
                  id="mail-recipient-name"
                  className={inputClass}
                  value={email.recipient_name}
                  placeholder="Sulaimon"
                  onChange={(e) => updateEmail("recipient_name", e.target.value)}
                />
              </Field>
              <Field
                label="Quote valid for, in days (optional)"
                htmlFor="mail-valid-days"
                hint="Leave blank to show no validity."
              >
                <input
                  id="mail-valid-days"
                  type="number"
                  min="1"
                  max="365"
                  inputMode="numeric"
                  className={inputClass}
                  value={email.valid_days}
                  placeholder="30"
                  onChange={(e) => updateEmail("valid_days", e.target.value)}
                />
              </Field>
              <p className="md:col-span-2 text-xs text-muted">
                The reference number (for example GHP-2026-K7M2Q9) and today&apos;s
                date are added automatically when you send, and the reference is
                saved.
              </p>
            </div>
          )}

          <Field label="Message" htmlFor="mail-body">
            <textarea
              id="mail-body"
              className={`${textareaClass} h-56 ${invalid("body")}`}
              value={email.body}
              placeholder="Hello from GH Procurement"
              onChange={(e) => updateEmail("body", e.target.value)}
            />
            {errorText("body")}
          </Field>

          {isRfq && (
            <fieldset className="flex flex-col gap-3 rounded-xl border border-line p-4" aria-describedby="price-hint">
              <legend className="px-1 text-sm font-bold">Price table (optional)</legend>
              <p id="price-hint" className="-mt-1 text-xs text-muted">
                List each item with its price, for example Milo, 4999. Quantity starts at 1. The line totals and the grand total are added up for you and shown in the email.
              </p>
              {rows.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <div className="hidden md:grid grid-cols-[1fr_84px_120px_110px_36px] gap-2 px-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                    <span>Item</span><span>Qty</span><span>Unit price</span><span className="text-right">Total</span><span />
                  </div>
                  {rows.map((r, i) => (
                    <div key={i} className="grid grid-cols-2 md:grid-cols-[1fr_84px_120px_110px_36px] gap-2 items-center">
                      <input aria-label={`Row ${i + 1} item`} placeholder="Description" value={r.description} maxLength={200} onChange={(e) => setRow(i, "description", e.target.value)} className={`${inputClass} col-span-2 md:col-span-1`} />
                      <input aria-label={`Row ${i + 1} quantity`} inputMode="decimal" placeholder="Qty" value={r.quantity} onChange={(e) => setRow(i, "quantity", e.target.value)} className={inputClass} />
                      <input aria-label={`Row ${i + 1} unit price`} inputMode="decimal" placeholder="Unit price" value={r.unit_price} onChange={(e) => setRow(i, "unit_price", e.target.value)} className={inputClass} />
                      <span className="md:text-right text-sm font-bold tabular-nums">{money(num(r.quantity) * num(r.unit_price), currency)}</span>
                      <button type="button" aria-label={`Remove row ${i + 1}`} onClick={() => setEmail((prev) => ({ ...prev, items: prev.items.filter((_, k) => k !== i) }))} className="size-9 flex items-center justify-center rounded-lg text-[#a3261a] hover:bg-[#fbe9e7] justify-self-end"><LuTrash2 /></button>
                    </div>
                  ))}
                </div>
              )}
              {errorText("items")}
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={() => setEmail((prev) => ({ ...prev, items: [...prev.items, blankRow()] }))} className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-[#d5d0dd] text-sm font-bold hover:bg-bgcolor">
                  <LuPlus /> {rows.length ? "Add another item" : "Add an item (name and price)"}
                </button>
                {rows.length > 0 && (
                  <label className="flex items-center gap-2 text-sm font-bold">
                    Currency
                    <select value={currency} onChange={(e) => updateEmail("currency", e.target.value)} className="h-10 rounded-xl border border-[#d5d0dd] bg-white px-2.5 text-sm font-semibold">
                      {CURRENCIES.map(([code, label]) => <option key={code} value={code}>{label}</option>)}
                    </select>
                  </label>
                )}
              </div>
              {rows.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr]">
                  <Field label="Delivery (optional)" htmlFor="mail-shipping">
                    <input id="mail-shipping" inputMode="decimal" className={inputClass} value={email.shipping} placeholder="0.00" onChange={(e) => updateEmail("shipping", e.target.value)} />
                  </Field>
                  <Field label="VAT % (optional)" htmlFor="mail-vat">
                    <input id="mail-vat" inputMode="decimal" className={inputClass} value={email.vat_percent} placeholder="7.5" onChange={(e) => updateEmail("vat_percent", e.target.value)} />
                  </Field>
                  <div className="flex flex-col justify-end rounded-xl bg-lilac/50 px-4 py-2.5 text-sm" aria-live="polite">
                    <span className="text-muted">Subtotal {money(subtotal, currency)}</span>
                    <span className="font-extrabold text-purple">Total {money(total, currency)}</span>
                  </div>
                </div>
              )}
            </fieldset>
          )}

          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-bold">Attachments</span>
            <p className="-mt-1 text-xs text-muted">
              PDF, Word (.docx), Excel (.xlsx), PowerPoint (.pptx), JPG, PNG or WebP.
              Up to {MAX_FILES} files, {MAX_FILE_MB} MB each and {MAX_TOTAL_MB} MB in total.
            </p>
            <label
              htmlFor="mail-files"
              className="flex items-center gap-3 min-h-[72px] px-4 rounded-[14px] border-[1.5px] border-dashed border-[#b9a6c4] bg-lilac/50 text-purple cursor-pointer hover:bg-lilac focus-within:outline-2 focus-within:outline-purple"
            >
              <LuPaperclip className="text-xl" />
              <span className="text-sm font-bold">
                Add files{" "}
                <span className="font-medium text-muted">or drop them here</span>
              </span>
              <input
                id="mail-files"
                type="file"
                multiple
                accept={ACCEPT}
                className="sr-only"
                onChange={(e) => {
                  addFiles(Array.from(e.target.files));
                  e.target.value = "";
                }}
              />
            </label>
            {fileProblems.length > 0 && (
              <ul role="alert" className="rounded-xl border border-[#f1c0bb] bg-[#fdeceb] px-4 py-3 text-sm text-[#8a1f15] space-y-1">
                {fileProblems.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            )}
            {email.attachments.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {email.attachments.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="inline-flex items-center gap-2 h-9 pl-3 pr-1.5 rounded-full border border-line text-[13px] font-semibold"
                  >
                    <span className="max-w-48 truncate">{f.name}</span>
                    <span className="text-muted font-medium">{fmtSize(f.size)}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => removeFile(i)}
                      className="size-6 flex items-center justify-center rounded-full bg-bgcolor text-ink/70 hover:bg-peach-100"
                    >
                      <LuX />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-line">
            <span className="text-[13px] text-muted">
              Sends immediately. The form clears after a successful send.
            </span>
            <button type="submit" disabled={loading} className={btnPrimary}>
              {loading ? (
                <Spinner className="text-peach text-xl" />
              ) : (
                <>
                  <LuSend className="text-lg" />
                  Send email
                </>
              )}
            </button>
          </div>
        </form>

        <aside
          aria-labelledby="mail-preview"
          className="flex-[1_1_300px] min-w-0 rounded-2xl border border-line bg-white p-5 md:p-6 flex flex-col gap-4"
        >
          <h2 id="mail-preview" className="text-base font-extrabold">
            Preview
          </h2>
          <div className="rounded-xl border border-line overflow-hidden">
            <div className="bg-peach-50 border-b border-peach-line px-4 py-3.5 text-[13px] text-ink/80 space-y-0.5">
              <div className="truncate">
                <span className="text-muted">To</span>{" "}
                {email.recipient || "name@email.com"}
              </div>
              <div className="truncate">
                <span className="text-muted">Subject</span>{" "}
                {email.subject || "What's this email about?"}
              </div>
            </div>
            {/* the email as it will look: dark layout with the photo header */}
            <div className="bg-[#1c0624] text-[#f1e3f5]">
              <div className="relative px-4 pt-3.5 pb-4 min-h-[120px] flex flex-col justify-between" style={{ backgroundImage: "url(/email/header.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}>
                <div className="flex items-center justify-between">
                  <img src={logoWhite} alt="GH Procurement" className="h-6 w-auto" />
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-peach">{isRfq ? "Quotation" : "From the GH Procurement team"}</span>
                </div>
                <div className="text-lg font-extrabold leading-tight text-white break-words mt-6">{email.title || email.subject || "Topic of discussion"}</div>
              </div>
              <div className="px-4 py-4 space-y-3">
                {isRfq && (
                  <div className="rounded-lg bg-[#2a0a36] px-3 py-2.5 text-[12.5px] leading-7">
                    <div className="flex justify-between gap-3"><span className="text-[#c7b0cf]">Date</span><b className="text-white">{today}</b></div>
                    <div className="flex justify-between gap-3"><span className="text-[#c7b0cf]">Reference</span><b className="text-white">Assigned when sent</b></div>
                    <div className="flex justify-between gap-3"><span className="text-[#c7b0cf]">Prepared for</span><b className="text-white truncate">{email.recipient_name || email.recipient || "name@email.com"}</b></div>
                    {order && email.rfq && <div className="flex justify-between gap-3"><span className="text-[#c7b0cf]">Your request</span><b className="text-white">{order.reference}</b></div>}
                    {validUntil && <div className="flex justify-between gap-3"><span className="text-[#c7b0cf]">Valid until</span><b className="text-peach">{validUntil}</b></div>}
                  </div>
                )}
                <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {email.body || "Your message appears here as you type."}
                </div>
                {isRfq && filled.length > 0 && (
                  <div className="rounded-lg bg-[#2a0a36] overflow-hidden text-[12.5px]" aria-label="Price breakdown preview">
                    <div className="px-3 pt-2.5 pb-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-peach">Price breakdown ({currency})</div>
                    {filled.map((r, i) => (
                      <div key={i} className="grid grid-cols-[1fr_auto] gap-x-3 px-3 py-2 border-t border-[#35114a]">
                        <span className="break-words text-white">{r.description || "Item"} <span className="text-[#c7b0cf]">× {r.quantity || 0} @ {money(num(r.unit_price), currency)}</span></span>
                        <b className="text-white tabular-nums">{money(lines[i], currency)}</b>
                      </div>
                    ))}
                    <div className="px-3 py-1.5 border-t border-[#43185a] flex justify-between text-[#c7b0cf]"><span>Subtotal</span><span className="text-white tabular-nums">{money(subtotal, currency)}</span></div>
                    {ship > 0 && <div className="px-3 py-1 flex justify-between text-[#c7b0cf]"><span>Delivery</span><span className="text-white tabular-nums">{money(ship, currency)}</span></div>}
                    {num(email.vat_percent) > 0 && <div className="px-3 py-1 flex justify-between text-[#c7b0cf]"><span>VAT ({num(email.vat_percent)}%)</span><span className="text-white tabular-nums">{money(vat, currency)}</span></div>}
                    <div className="px-3 py-2.5 border-t border-[#43185a] flex justify-between font-extrabold text-peach"><span>TOTAL</span><span className="tabular-nums text-base">{money(total, currency)}</span></div>
                  </div>
                )}
                {email.attachments.length > 0 && (
                  <div className="rounded-lg bg-[#2a0a36] px-3 py-2 text-[12.5px] text-[#c7b0cf]">
                    {email.attachments.length} {email.attachments.length === 1 ? "attachment" : "attachments"}
                  </div>
                )}
                {!isRfq && <div className="text-center"><span className="inline-block rounded-full bg-peach px-5 py-2 text-[12.5px] font-extrabold text-purple">Reply to this email</span></div>}
                {isRfq && email.rfq && <div className="text-center"><span className="inline-block rounded-full bg-peach px-5 py-2 text-[12.5px] font-extrabold text-purple">See my order</span></div>}
                <div className="border-t border-[#3d1649] pt-3 text-center text-[12.5px]">Regards,<br /><b className="text-peach">Lawal Abdur-Razaq</b></div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Mail;
