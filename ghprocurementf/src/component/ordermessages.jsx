import { useEffect, useRef, useState } from "react";
import { LuSend } from "react-icons/lu";
import API from "../endpoints/endpoints";
import { authHeaders, notifyUnauthorized } from "../auth/auth";
import { Spinner, btnPrimary, textareaClass } from "./ui";

const when = (iso) =>
  new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

// The thread with the customer on one order. Opening it marks their questions as read; a reply is emailed to them.
export default function OrderMessages({ id }) {
  const [list, setList] = useState(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const box = useRef(null);

  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch(API.rfqMessages(id), { headers: authHeaders() })
        .then((r) => {
          if (r.status === 401) notifyUnauthorized();
          return r.ok ? r.json() : null;
        })
        .then((d) => alive && d && setList(d))
        .catch(() => {});
    load();
    const again = () => document.visibilityState === "visible" && load();
    const timer = setInterval(again, 30000);
    document.addEventListener("visibilitychange", again);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", again);
    };
  }, [id]);

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [list?.length]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(API.rfqMessages(id), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ body }),
      });
      if (res.status === 401) notifyUnauthorized();
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || "Could not send the reply.");
      setText("");
      setList((l) => [...(l || []), data]);
    } catch (err) {
      setError(err.message || "Could not send the reply.");
    }
    setBusy(false);
  };

  return (
    <section className="rounded-2xl border border-line bg-white p-5 md:p-6" aria-labelledby="msgs-title">
      <h2 id="msgs-title" className="text-base font-extrabold text-purple mb-1">Messages</h2>
      <p className="mb-4 text-xs text-muted">Questions from the customer, and your replies. Each reply is emailed to them.</p>
      <div ref={box} className="mb-4 flex max-h-[340px] min-h-[88px] flex-col gap-3 overflow-y-auto rounded-xl bg-bgcolor p-3" aria-live="polite">
        {list === null ? (
          <div className="flex justify-center py-5"><Spinner className="text-2xl" /></div>
        ) : list.length === 0 ? (
          <p className="m-auto text-center text-sm text-muted">No messages yet.</p>
        ) : (
          list.map((m) => (
            <div key={m.id} className={`max-w-[88%] ${m.sender === "team" ? "self-end" : "self-start"}`}>
              <p className={`whitespace-pre-line break-words px-3.5 py-2.5 text-sm leading-snug ${m.sender === "team" ? "rounded-2xl rounded-br-md bg-purple text-white" : "rounded-2xl rounded-bl-md bg-lilac text-ink"}`}>{m.body}</p>
              <p className={`mt-1 text-[11px] text-muted ${m.sender === "team" ? "text-right" : ""}`}>
                {m.sender === "team" ? (m.author ? `${m.author} · ` : "You · ") : "Customer · "}
                {when(m.created_at)}
              </p>
            </div>
          ))
        )}
      </div>
      <form onSubmit={send} className="flex flex-col gap-2.5">
        <label htmlFor="msg-reply" className="sr-only">Reply to the customer</label>
        <textarea id="msg-reply" rows={3} maxLength={2000} value={text} onChange={(e) => { setText(e.target.value); setError(""); }} placeholder="Write a reply…" className={`${textareaClass} h-24`} />
        {error && <p role="alert" className="text-sm font-semibold text-[#b42318]">{error}</p>}
        <button type="submit" disabled={busy || !text.trim()} className={`${btnPrimary} self-start`}>
          {busy ? <Spinner className="text-peach text-xl" /> : <><LuSend className="text-lg" /> Send reply</>}
        </button>
      </form>
    </section>
  );
}
