import { useEffect, useState } from "react";
import QRCode from "qrcode";
import {
  LuShieldCheck,
  LuShieldOff,
  LuCopy,
  LuDownload,
  LuCheck,
  LuTriangleAlert,
} from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import {
  mfaSetup,
  mfaConfirm,
  mfaDisable,
  mfaNewRecoveryCodes,
} from "../auth/auth";
import { Field, Spinner, ErrorBanner, btnPrimary, btnSecondary, inputClass } from "./ui";

const groupKey = (secret) => secret.match(/.{1,4}/g)?.join(" ") ?? secret;

// Shown once, right after turning 2FA on or making a new set.
function RecoveryCodes({ codes, onDone }) {
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const text = codes.join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      /* clipboard blocked: the codes are on screen and can be downloaded */
    }
  };
  const download = () => {
    const blob = new Blob(
      [`GH Procurement CMS recovery codes\nEach code works once.\n\n${text}\n`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "gh-procurement-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2.5 rounded-xl border border-[#f0d9a3] bg-[#fbf0d3] px-4 py-3 text-sm text-[#7a4b00]">
        <LuTriangleAlert className="mt-0.5 shrink-0 text-lg" />
        <span>
          <b>Save these recovery codes now.</b> If you lose your phone, each code
          signs you in once. They will not be shown again.
        </span>
      </div>

      <ul
        aria-label="Recovery codes"
        className="grid grid-cols-2 gap-2 rounded-xl border border-line bg-bgcolor/60 p-4 font-mono text-[15px] font-bold tracking-wider sm:grid-cols-5"
      >
        {codes.map((c) => (
          <li key={c}>{c}</li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={copy} className={btnSecondary}>
          {copied ? <LuCheck /> : <LuCopy />}
          {copied ? "Copied" : "Copy codes"}
        </button>
        <button type="button" onClick={download} className={btnSecondary}>
          <LuDownload /> Download .txt
        </button>
      </div>

      <label className="flex items-center gap-2.5 text-sm font-semibold">
        <input
          type="checkbox"
          checked={saved}
          onChange={(e) => setSaved(e.target.checked)}
          className="size-4 accent-purple"
        />
        I have saved these codes somewhere safe
      </label>
      <div>
        <button type="button" disabled={!saved} onClick={onDone} className={btnPrimary}>
          Done
        </button>
      </div>
    </div>
  );
}

// password + current code, needed to change anything sensitive
function ConfirmWithCode({ title, action, busy, error, onSubmit, onCancel, danger }) {
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(password, code);
      }}
      noValidate
      className="flex flex-col gap-4 rounded-xl border border-line p-4"
    >
      <p className="text-sm font-bold">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your password" htmlFor="mfa-password">
          <input
            id="mfa-password"
            type="password"
            autoComplete="current-password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field
          label="Code from your app (or a recovery code)"
          htmlFor="mfa-code"
        >
          <input
            id="mfa-code"
            autoComplete="one-time-code"
            inputMode="numeric"
            className={inputClass}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
          />
        </Field>
      </div>
      {error && (
        <p role="alert" className="text-sm font-semibold text-[#b42318]">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy || !password || code.trim().length < 6}
          className={
            danger
              ? "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#b42318] text-white text-sm font-bold hover:bg-[#912018] disabled:opacity-60"
              : btnPrimary
          }
        >
          {busy ? <Spinner className="text-white text-xl" /> : action}
        </button>
        <button type="button" onClick={onCancel} className={btnSecondary}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function TwoStepCard() {
  const { data: me, loading, err, doFetch } = useFetch();
  const [mode, setMode] = useState("idle"); // idle | setup | codes | disable | regenerate
  const [setup, setSetup] = useState(null); // { secret, qr }
  const [code, setCode] = useState("");
  const [codes, setCodes] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(null);
  const [left, setLeft] = useState(0);

  const load = () => doFetch({ url: API.me(), method: "GET" });
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (me) {
      setEnabled(!!me.mfa_enabled);
      setLeft(me.recovery_codes_left ?? 0);
    }
  }, [me]);

  const reset = () => {
    setMode("idle");
    setSetup(null);
    setCode("");
    setError("");
  };

  const start = async () => {
    setBusy(true);
    setError("");
    const r = await mfaSetup();
    if (!r.ok) {
      setBusy(false);
      setError(r.error);
      return;
    }
    const qr = await QRCode.toDataURL(r.data.otpauth_uri, { margin: 1, width: 192 });
    setSetup({ secret: r.data.secret, qr });
    setBusy(false);
    setMode("setup");
  };

  const confirm = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await mfaConfirm(code);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setCodes(r.recoveryCodes);
    setEnabled(true);
    setLeft(r.recoveryCodes.length);
    setSetup(null);
    setCode("");
    setMode("codes");
  };

  const turnOff = async (password, c) => {
    setBusy(true);
    setError("");
    const r = await mfaDisable(password, c);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setEnabled(false);
    reset();
  };

  const regenerate = async (password, c) => {
    setBusy(true);
    setError("");
    const r = await mfaNewRecoveryCodes(password, c);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setCodes(r.recoveryCodes);
    setLeft(r.recoveryCodes.length);
    setMode("codes");
  };

  return (
    <section
      aria-labelledby="s-twostep"
      className="rounded-2xl border border-line bg-white p-5 md:p-6 flex flex-col gap-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="s-twostep" className="text-lg font-extrabold">
            Two-step verification
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            Adds a code from an authenticator app (Google Authenticator,
            Microsoft Authenticator, Authy) after your password.
          </p>
        </div>
        {enabled !== null && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${
              enabled ? "bg-[#e6f2ea] text-[#12633a]" : "bg-bgcolor text-muted"
            }`}
          >
            {enabled ? <LuShieldCheck /> : <LuShieldOff />}
            {enabled ? "On" : "Off"}
          </span>
        )}
      </div>

      {err && !me && <ErrorBanner onRetry={load}>Could not check the two-step status.</ErrorBanner>}
      {loading && !me && (
        <div className="flex justify-center py-6">
          <Spinner className="text-2xl" />
        </div>
      )}

      {/* OFF */}
      {enabled === false && mode === "idle" && (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-ink/80">
            Two-step verification is off. Turn it on so a stolen password alone
            can&apos;t open the CMS.
          </p>
          <button type="button" onClick={start} disabled={busy} className={btnPrimary}>
            {busy ? <Spinner className="text-peach text-xl" /> : "Set up two-step verification"}
          </button>
          {error && (
            <p role="alert" className="text-sm font-semibold text-[#b42318]">{error}</p>
          )}
        </div>
      )}

      {/* SETUP */}
      {mode === "setup" && setup && (
        <form onSubmit={confirm} noValidate className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div className="flex flex-col items-center gap-2">
            <img
              src={setup.qr}
              alt="QR code to add GH Procurement CMS to your authenticator app"
              width="192"
              height="192"
              className="rounded-xl border border-line"
            />
            <span className="text-xs text-muted">Scan with your app</span>
          </div>
          <div className="flex flex-col gap-4">
            <ol className="list-decimal pl-5 text-sm leading-relaxed space-y-1">
              <li>Open your authenticator app and add an account by scanning the QR code.</li>
              <li>
                Can&apos;t scan? Enter this key by hand:{" "}
                <code
                  data-testid="mfa-secret"
                  className="font-mono font-bold tracking-wider break-all"
                >
                  {groupKey(setup.secret)}
                </code>
              </li>
              <li>Type the 6-digit code the app shows, to finish.</li>
            </ol>
            <Field label="6-digit code" htmlFor="mfa-setup-code">
              <input
                id="mfa-setup-code"
                autoComplete="one-time-code"
                inputMode="numeric"
                maxLength={7}
                className={`${inputClass} max-w-48 text-center text-lg tracking-[0.25em] font-bold`}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                placeholder="123456"
              />
            </Field>
            {error && (
              <p role="alert" className="text-sm font-semibold text-[#b42318]">{error}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={busy || code.trim().length < 6}
                className={btnPrimary}
              >
                {busy ? <Spinner className="text-peach text-xl" /> : "Turn on"}
              </button>
              <button type="button" onClick={reset} className={btnSecondary}>
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      {/* RECOVERY CODES (shown once) */}
      {mode === "codes" && (
        <RecoveryCodes codes={codes} onDone={() => { setCodes([]); reset(); }} />
      )}

      {/* ON */}
      {enabled === true && mode === "idle" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink/80">
            Signing in now asks for a code from your app after the password.
            You have{" "}
            <b data-testid="codes-left" className={left <= 3 ? "text-[#b42318]" : ""}>
              {left} recovery code{left === 1 ? "" : "s"}
            </b>{" "}
            left.
            {left <= 3 && " Make a new set soon."}
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => { setError(""); setMode("regenerate"); }} className={btnSecondary}>
              New recovery codes
            </button>
            <button type="button" onClick={() => { setError(""); setMode("disable"); }} className={btnSecondary}>
              Turn off
            </button>
          </div>
        </div>
      )}

      {mode === "disable" && (
        <ConfirmWithCode
          title="Turn off two-step verification"
          action="Turn off"
          danger
          busy={busy}
          error={error}
          onSubmit={turnOff}
          onCancel={reset}
        />
      )}
      {mode === "regenerate" && (
        <ConfirmWithCode
          title="Make new recovery codes. The old ones will stop working."
          action="Make new codes"
          busy={busy}
          error={error}
          onSubmit={regenerate}
          onCancel={reset}
        />
      )}
    </section>
  );
}
