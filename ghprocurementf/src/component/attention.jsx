import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LuChevronRight, LuCircleCheck } from "react-icons/lu";
import API from "../endpoints/endpoints";
import { authHeaders, notifyUnauthorized } from "../auth/auth";
import { Spinner } from "./ui";

const TONE = {
  red: "bg-[#fdeceb] text-[#8a1f15]",
  amber: "bg-[#fbf0d3] text-[#7a4b00]",
  green: "bg-[#e6f2ea] text-[#12633a]",
};
const LABEL = { quote: "waiting", accepted: "accepted", question: "waiting", stalled: "no update" };
const age = (h) => (h < 48 ? `${Math.max(h, 0)}h` : `${Math.floor(h / 24)}d`);

// How often the list checks for changes in the background. Traffic is light for now, so every few minutes is plenty.
const REFRESH_MS = 6 * 60 * 1000;
const keyOf = (i) => `${i.kind}-${i.rfq_id}`;

// Background refresh: new items go on top, items already shown keep their place (with fresh details), items that
// are no longer waiting drop out. Nothing changes on screen when nothing changed.
function merge(prev, fresh) {
  const byKey = new Map(fresh.map((i) => [keyOf(i), i]));
  const shown = new Set(prev.map(keyOf));
  const added = fresh.filter((i) => !shown.has(keyOf(i)));
  const kept = prev.filter((i) => byKey.has(keyOf(i))).map((i) => byKey.get(keyOf(i)));
  return [...added, ...kept];
}

// What a customer is waiting for, worst first. It reads what the CMS already stores. Only the first load shows a
// spinner; later refreshes happen in the background without touching the screen unless something changed.
export default function NeedsAttention() {
  const [items, setItems] = useState(null);   // null until the first load
  const [count, setCount] = useState(0);
  const [failed, setFailed] = useState(false);
  const lastLoad = useRef(0);
  const busy = useRef(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const res = await fetch(API.attention(), { headers: { ...authHeaders(), "Content-Type": "application/json" } });
        if (res.status === 401) { notifyUnauthorized(); return; }
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!alive) return;
        const fresh = data?.items ?? [];
        lastLoad.current = Date.now();
        setFailed(false);
        setCount(data?.count ?? fresh.length);
        setItems((prev) => (prev === null ? fresh : merge(prev, fresh)));
      } catch {
        // first load: say so; a background refresh that fails keeps the list on screen as it is
        if (alive && lastLoad.current === 0) setFailed(true);
      } finally {
        busy.current = false;
      }
    };
    load();
    const timer = setInterval(() => document.visibilityState === "visible" && load(), REFRESH_MS);
    const onShow = () => document.visibilityState === "visible" && Date.now() - lastLoad.current >= REFRESH_MS && load();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      alive = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, []);

  return (
    <section aria-labelledby="attention-title" className="rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between px-5 md:px-6 py-5 border-b border-line">
        <h2 id="attention-title" className="text-lg font-extrabold">Needs attention</h2>
        {items && items.length > 0 && (
          <span className="rounded-full bg-[#fdeceb] px-2.5 py-1 text-xs font-bold text-[#8a1f15]">{count} waiting</span>
        )}
      </div>
      {items === null && !failed ? (
        <div className="flex justify-center py-10"><Spinner className="text-3xl" /></div>
      ) : items === null ? (
        <p className="px-6 py-8 text-center text-sm text-muted">This list could not be loaded right now.</p>
      ) : items.length === 0 ? (
        <p className="flex items-center justify-center gap-2 px-6 py-8 text-center text-sm text-muted">
          <LuCircleCheck className="text-lg text-[#12633a]" aria-hidden="true" /> Nothing is waiting for a customer right now.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={`${i.kind}-${i.rfq_id}`}>
              <Link to={`/orders/${i.rfq_id}`} className="flex items-center gap-4 px-5 md:px-6 py-3.5 hover:bg-bgcolor/60" aria-label={`${i.title}, ${i.reference}`}>
                <span className={`flex min-w-[66px] flex-none flex-col items-center rounded-xl px-2 py-1.5 ${TONE[i.severity]}`}>
                  <span className="text-[15px] font-extrabold leading-tight">{i.kind === "accepted" && i.hours < 2 ? "New" : age(i.hours)}</span>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">{LABEL[i.kind]}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold text-ink">{i.title}</span>
                  <span className="block truncate text-[13px] text-muted">{i.reference} · {i.who}{i.detail ? ` · ${i.detail}` : ""}</span>
                </span>
                <LuChevronRight className="flex-none text-lg text-muted" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
