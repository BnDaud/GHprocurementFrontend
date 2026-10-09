import { useState } from "react";
import { LuEye, LuEyeOff, LuLock, LuMail, LuShieldCheck, LuArrowLeft } from "react-icons/lu";
import { BrandLogo } from "../component/sidenav";
import { login, verifyMfa } from "../auth/auth";
import { Field, Spinner, btnPrimary, inputClass } from "../component/ui";

export default function Login({ onSuccess, notice = "" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // step 2 (only for accounts with two-step verification on)
  const [mfaToken, setMfaToken] = useState("");
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [info, setInfo] = useState(notice);

  const backToPassword = (message = "") => {
    setMfaToken("");
    setCode("");
    setUseRecovery(false);
    setPassword("");
    setError("");
    setInfo(message);
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    setInfo("");
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) {
      onSuccess();
      return;
    }
    if (res.mfaRequired) {
      setMfaToken(res.mfaToken);
      return;
    }
    setPassword("");
    setError(res.error);
  };

  const submitCode = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await verifyMfa(mfaToken, code);
    setBusy(false);
    if (res.ok) {
      onSuccess();
      return;
    }
    if (res.restart) {
      backToPassword(res.error);
      return;
    }
    setCode("");
    setError(res.error);
  };

  const card =
    "w-full max-w-sm rounded-2xl border border-line bg-white p-6 md:p-8 shadow-sm flex flex-col gap-6";

  const logo = (
    <div className="flex flex-col items-center gap-4 text-center">
      <BrandLogo width={168} />
    </div>
  );

  // ---------------- step 2: the code ----------------
  if (mfaToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bgcolor p-4">
        <form onSubmit={submitCode} noValidate className={card}>
          {logo}
          <div className="text-center">
            <div className="mx-auto mb-3 size-11 rounded-full bg-lilac text-purple flex items-center justify-center">
              <LuShieldCheck className="text-2xl" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-purple">
              Two-step verification
            </h1>
            <p className="mt-1 text-sm text-muted">
              {useRecovery
                ? "Enter one of your recovery codes. Each one works only once."
                : "Open your authenticator app and enter the 6-digit code for GH Procurement CMS."}
            </p>
          </div>

          <Field
            label={useRecovery ? "Recovery code" : "6-digit code"}
            htmlFor="login-code"
          >
            <input
              id="login-code"
              key={useRecovery ? "recovery" : "totp"}
              type="text"
              autoFocus
              autoComplete="one-time-code"
              inputMode={useRecovery ? "text" : "numeric"}
              maxLength={useRecovery ? 12 : 7}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                setError("");
              }}
              placeholder={useRecovery ? "XXXXX-XXXXX" : "123456"}
              className={`${inputClass} text-center text-lg tracking-[0.25em] font-bold`}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
            {error && (
              <p id="login-error" role="alert" className="text-xs font-semibold text-[#b42318]">
                {error}
              </p>
            )}
          </Field>

          <button
            type="submit"
            disabled={busy || code.trim().length < 6}
            className={`${btnPrimary} w-full`}
          >
            {busy ? <Spinner className="text-peach text-xl" /> : "Verify and sign in"}
          </button>

          <div className="flex flex-col items-center gap-2 text-[13px]">
            <button
              type="button"
              onClick={() => {
                setUseRecovery((r) => !r);
                setCode("");
                setError("");
              }}
              className="font-bold text-purple hover:underline"
            >
              {useRecovery ? "Use my authenticator app instead" : "Use a recovery code instead"}
            </button>
            <button
              type="button"
              onClick={() => backToPassword()}
              className="inline-flex items-center gap-1.5 font-semibold text-muted hover:text-ink"
            >
              <LuArrowLeft /> Back to sign in
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ---------------- step 1: email + password ----------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-bgcolor p-4">
      <form onSubmit={submitPassword} noValidate className={card}>
        <div className="flex flex-col items-center gap-4 text-center">
          <BrandLogo width={168} />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-purple">
              Sign in
            </h1>
            <p className="mt-1 text-sm text-muted">
              Use the admin email and password to manage the GH Procurement site.
            </p>
          </div>
        </div>

        {info && (
          <p
            role="status"
            className="rounded-xl border border-[#f0d9a3] bg-[#fbf0d3] px-4 py-3 text-sm text-[#7a4b00]"
          >
            {info}
          </p>
        )}

        <Field label="Email" htmlFor="login-email">
          <div className="relative">
            <LuMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="example@email.com"
              className={`${inputClass} pl-10`}
            />
          </div>
        </Field>

        <Field label="Password" htmlFor="login-password">
          <div className="relative">
            <LuLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="login-password"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className={`${inputClass} pl-10 pr-12`}
              aria-invalid={!!error}
              aria-describedby={error ? "login-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 -translate-y-1/2 size-10 flex items-center justify-center rounded-lg text-muted hover:bg-bgcolor"
            >
              {show ? <LuEyeOff /> : <LuEye />}
            </button>
          </div>
          {error && (
            <p id="login-error" role="alert" className="text-xs font-semibold text-[#b42318]">
              {error}
            </p>
          )}
        </Field>

        <button
          type="submit"
          disabled={busy || password.length === 0 || email.length === 0}
          className={`${btnPrimary} w-full`}
        >
          {busy ? <Spinner className="text-peach text-xl" /> : "Sign in"}
        </button>
      </form>
    </div>
  );
}
