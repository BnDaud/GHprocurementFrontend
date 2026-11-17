import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuCirclePlay, LuX } from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";

// A YouTube link (watch, share, shorts or embed) as an embeddable address; "" if it is not one.
export function youtubeEmbed(url) {
  try {
    const u = new URL(String(url || "").trim());
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id = "";
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      const parts = u.pathname.split("/").filter(Boolean);
      id = u.searchParams.get("v") || (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : "");
    }
    return /^[\w-]{6,20}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}?rel=0` : "";
  } catch {
    return "";
  }
}

// Side-menu button that plays the CMS how-to video. Shows only when a link is saved in Settings.
export default function HelpVideo() {
  const { data, doFetch } = useFetch();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    doFetch({ url: API.metadata(1), method: "GET" });
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  const src = youtubeEmbed(data?.cms_video_url);
  if (!src) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2.5 h-9 px-3 rounded-lg text-[13px] font-semibold text-ink/70 hover:bg-peach-100 hover:text-ink transition-colors"
      >
        <LuCirclePlay className="text-[17px] shrink-0" /> How to use the CMS
      </button>
      {open &&
        createPortal(
          <div role="dialog" aria-modal="true" aria-label="How to use the CMS" className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
            <div className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-base font-extrabold">How to use the CMS</h2>
                <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-lg p-1.5 hover:bg-peach-100"><LuX /></button>
              </div>
              <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
                <iframe src={src} title="How to use the CMS" className="size-full" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
