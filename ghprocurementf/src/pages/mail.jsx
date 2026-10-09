import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { LuPaperclip, LuSend, LuX, LuCircleCheck } from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
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
  };
  // "Reply" in the Inbox opens this page with the sender and subject filled in
  const reply = useLocation().state?.reply;
  const [email, setEmail] = useState(() =>
    reply
      ? {
          ...initalState,
          recipient: String(reply.recipient || ""),
          recipient_name: String(reply.recipient_name || ""),
          subject: String(reply.subject || ""),
        }
      : initalState
  );
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [sentReference, setSentReference] = useState("");
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
            Email sent.{sentReference ? ` Reference ${sentReference}.` : ""}{" "}
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
                  hint: "Formal quotation with an automatic reference number and date.",
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
                The reference number (for example GHP-2026-0007) and today&apos;s
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
            <div className="px-4 py-5 space-y-3">
              {isRfq && (
                <div className="rounded-lg border border-line bg-bgcolor/60 px-3 py-2.5 text-[13px] leading-7">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                    Quotation
                  </div>
                  <div><span className="text-muted">Date</span> <b>{today}</b></div>
                  <div><span className="text-muted">Reference</span> <b>Assigned when sent</b></div>
                  <div className="truncate">
                    <span className="text-muted">Prepared for</span>{" "}
                    <b>{email.recipient_name || email.recipient || "name@email.com"}</b>
                  </div>
                  {validUntil && (
                    <div><span className="text-muted">Valid until</span> <b>{validUntil}</b></div>
                  )}
                </div>
              )}
              <div className="text-lg font-extrabold break-words">
                {email.title || "Topic of discussion"}
              </div>
              <div className="text-sm leading-relaxed text-ink/80 whitespace-pre-wrap break-words">
                {email.body || "Your message appears here as you type."}
              </div>
              {email.attachments.length > 0 && (
                <div className="border-t border-line pt-3 text-[13px] text-muted">
                  {email.attachments.length}{" "}
                  {email.attachments.length === 1 ? "attachment" : "attachments"}
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Mail;
