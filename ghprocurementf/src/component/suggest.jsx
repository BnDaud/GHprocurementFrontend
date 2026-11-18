import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import API from "../endpoints/endpoints";
import { authHeaders } from "../auth/auth";

// People matching what is being typed (customers, quote requesters, staff, inbox senders, past recipients).
// The server ranks them: exact matches, then names/emails that start with the text, then who is emailed most.
const memo = new Map();   // text -> { rows, at }: the same text typed again (or reached by backspacing) is answered at once
const MEMO_MS = 60_000;

export function useSuggest(text, { skip = [] } = {}) {
  const [list, setList] = useState([]);
  const ticket = useRef(0);
  const q = (text || "").trim().toLowerCase();
  useEffect(() => {
    if (q.length < 1) { setList([]); return; }
    const mine = ++ticket.current;
    const hit = memo.get(q);
    if (hit && Date.now() - hit.at < MEMO_MS) { setList(hit.rows.filter((r) => !skip.includes(r.email))); return; }
    const ctl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(API.contacts(q), { headers: authHeaders(), signal: ctl.signal });
        if (!res.ok) return;
        const rows = await res.json();
        memo.set(q, { rows, at: Date.now() });
        if (mine === ticket.current) setList(rows.filter((r) => !skip.includes(r.email)));   // ignore answers to older text
      } catch { /* offline, or the text changed again: no suggestions, typing still works */ }
    }, 150);
    return () => { clearTimeout(t); ctl.abort(); };   // typing on cancels the request for the text before it
  }, [q, skip.join("|")]);
  return q ? list : [];
}

// The drop-down sits ABOVE the box, in its own floating layer: it never pushes the form around, is never clipped by the
// scrolling page, and clicking a name picks it without taking the focus away from the box. If there is no room above
// (the box is at the very top of the screen) it opens below instead.
export function SuggestList({ id, rows, active, onPick, onHover, anchor }) {
  const [box, setBox] = useState(null);
  useLayoutEffect(() => {
    if (!rows.length || !anchor?.current) { setBox(null); return; }
    const place = () => {
      const r = anchor.current.getBoundingClientRect();
      const room = r.top - 12;
      const above = room >= 150 || room >= window.innerHeight - r.bottom;
      setBox(above
        ? { left: r.left, width: r.width, bottom: window.innerHeight - r.top + 6, maxHeight: Math.min(300, room) }
        : { left: r.left, width: r.width, top: r.bottom + 6, maxHeight: Math.min(300, window.innerHeight - r.bottom - 12) });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => { window.removeEventListener("scroll", place, true); window.removeEventListener("resize", place); };
  }, [rows.length, anchor]);
  if (!rows.length || !box) return null;
  return createPortal(
    <ul
      id={id}
      role="listbox"
      style={{ position: "fixed", left: box.left, width: box.width, bottom: box.bottom, top: box.top, maxHeight: box.maxHeight }}
      className="z-[80] overflow-auto rounded-xl border border-line bg-white py-1 shadow-2xl"
    >
      {rows.map((r, i) => (
        <li key={r.email} role="option" aria-selected={i === active}>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={(e) => { e.preventDefault(); onPick(r); }}
            onMouseEnter={() => onHover(i)}
            className={`flex w-full cursor-pointer flex-col items-start px-3.5 py-2 text-left ${i === active ? "bg-lilac" : "hover:bg-bgcolor"}`}
          >
            <span className="text-sm font-bold text-ink">{r.name || r.email}</span>
            <span className="text-xs text-muted">{r.name ? r.email : ""}{r.company ? `${r.name ? " · " : ""}${r.company}` : ""}</span>
          </button>
        </li>
      ))}
    </ul>,
    document.body
  );
}

// Arrow keys move, Enter picks the highlighted one (and only then: plain Enter keeps its normal meaning), Escape closes.
export function suggestKeys(e, { rows, active, setActive, onPick, close }) {
  if (!rows.length) return false;
  if (e.key === "ArrowDown") { e.preventDefault(); setActive((active + 1) % rows.length); return true; }
  if (e.key === "ArrowUp") { e.preventDefault(); setActive((active - 1 + rows.length) % rows.length); return true; }
  if (e.key === "Enter" && active >= 0) { e.preventDefault(); onPick(rows[active]); return true; }
  if (e.key === "Escape") { close(); return true; }
  return false;
}
