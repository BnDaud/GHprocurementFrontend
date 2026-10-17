import { useEffect } from "react";
import { Link } from "react-router-dom";
import { LuChevronRight, LuCircleCheck } from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import { Spinner } from "./ui";

const TONE = {
  red: "bg-[#fdeceb] text-[#8a1f15]",
  amber: "bg-[#fbf0d3] text-[#7a4b00]",
  green: "bg-[#e6f2ea] text-[#12633a]",
};
const LABEL = { quote: "waiting", accepted: "accepted", question: "waiting", stalled: "no update" };
const age = (h) => (h < 48 ? `${Math.max(h, 0)}h` : `${Math.floor(h / 24)}d`);

// What a customer is waiting for, worst first. It reads what the CMS already stores and refreshes by itself.
export default function NeedsAttention() {
  const { data, loading, err, doFetch } = useFetch();

  useEffect(() => {
    const load = () => doFetch({ url: API.attention(), method: "GET" });
    load();
    const again = () => document.visibilityState === "visible" && load();
    const timer = setInterval(again, 60000);
    document.addEventListener("visibilitychange", again);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", again);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = data?.items ?? [];
  return (
    <section aria-labelledby="attention-title" className="rounded-2xl border border-line bg-white">
      <div className="flex items-center justify-between px-5 md:px-6 py-5 border-b border-line">
        <h2 id="attention-title" className="text-lg font-extrabold">Needs attention</h2>
        {data && items.length > 0 && (
          <span className="rounded-full bg-[#fdeceb] px-2.5 py-1 text-xs font-bold text-[#8a1f15]">{data.count} waiting</span>
        )}
      </div>
      {loading && !data ? (
        <div className="flex justify-center py-10"><Spinner className="text-3xl" /></div>
      ) : err && !data ? (
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
