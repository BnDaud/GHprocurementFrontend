import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LuTimer } from "react-icons/lu";
import { idleLeft, stayActive, WARN_MS } from "../auth/auth";
import { btnPrimary, btnSecondary } from "./ui";

// After 5 minutes with nothing touched, a modal counts down the last 5 minutes before the inactivity sign-out
// (10 minutes in all). Moving the mouse does not close it; "Stay signed in" does, in every open tab.
export default function IdleCountdown({ onSignOut }) {
  const [left, setLeft] = useState(null);
  const stayRef = useRef(null);
  useEffect(() => {
    const tick = () => { const l = idleLeft(); setLeft(l !== null && l <= WARN_MS ? Math.max(0, l) : null); };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  const open = left !== null;
  useEffect(() => { if (open) stayRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") { stayActive(); setLeft(null); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!open) return null;
  const m = Math.floor(left / 60000), s = Math.floor((left % 60000) / 1000);
  const stay = () => { stayActive(); setLeft(null); };
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4">
      <div role="alertdialog" aria-modal="true" aria-labelledby="idle-title" aria-describedby="idle-text"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-peach text-purple">
          <LuTimer className="text-3xl" />
        </div>
        <h2 id="idle-title" className="text-lg font-extrabold text-purple">You will be signed out soon</h2>
        <p id="idle-text" className="mt-2 text-sm text-muted">
          Nothing has been touched for a while. For security, you will be signed out in
        </p>
        <p className="my-3 text-4xl font-extrabold tabular-nums text-ink" aria-live="polite">{m}:{String(s).padStart(2, "0")}</p>
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          {onSignOut && <button type="button" onClick={onSignOut} className={btnSecondary}>Sign out now</button>}
          <button ref={stayRef} type="button" onClick={stay} className={btnPrimary}>Stay signed in</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
