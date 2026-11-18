import { useEffect, useState } from "react";
import { LuTimer } from "react-icons/lu";
import { idleLeft, stayActive, WARN_MS } from "../auth/auth";

// In the last 5 minutes before the inactivity sign-out, a countdown stays on screen. Moving the mouse, typing or pressing
// "Stay signed in" starts the 20 minutes again.
export default function IdleCountdown() {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const tick = () => { const l = idleLeft(); setLeft(l !== null && l <= WARN_MS ? Math.max(0, l) : null); };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  if (left === null) return null;
  const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
  return (
    <div role="alert" aria-live="polite" className="fixed inset-x-0 top-0 z-[90] flex flex-wrap items-center justify-center gap-x-4 gap-y-2 bg-[#7a4b00] px-4 py-3 text-sm font-semibold text-white shadow-lg">
      <LuTimer className="text-lg shrink-0" />
      <span>
        You will be signed out in <b className="tabular-nums text-base">{m}:{String(s).padStart(2, "0")}</b> because nothing has been touched for a while.
      </span>
      <button type="button" onClick={stayActive} className="rounded-lg bg-white px-3.5 py-1.5 text-[#7a4b00] font-extrabold hover:bg-peach">Stay signed in</button>
    </div>
  );
}
