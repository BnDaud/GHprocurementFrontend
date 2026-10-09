import mark from "../images/watermark.png";

// The company logo as a faint watermark. It sits on top of the page but lets
// every click, scroll and text selection pass straight through it.
export default function Watermark({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none select-none absolute inset-0 z-[5] flex items-center justify-center overflow-hidden ${className}`}
    >
      <img
        src={mark}
        alt=""
        draggable="false"
        data-testid="watermark"
        className="w-[min(72%,640px)] h-auto opacity-[0.055]"
      />
    </div>
  );
}
