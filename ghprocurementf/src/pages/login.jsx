import { useState } from "react";
import { LuEye, LuEyeOff, LuLock, LuMail } from "react-icons/lu";
import { BrandLogo } from "../component/sidenav";
import { login } from "../auth/auth";
import { Field, Spinner, btnPrimary, inputClass } from "../component/ui";

export default function Login({ onSuccess, notice = "" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await login(email, password);
    setBusy(false);
    if (res.ok) {
      onSuccess();
      return;
    }
    setPassword("");
    setError(res.error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bgcolor p-4">
      <form
        onSubmit={submit}
        noValidate
        className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 md:p-8 shadow-sm flex flex-col gap-6"
      >
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

        {notice && (
          <p
            role="status"
            className="rounded-xl border border-[#f0d9a3] bg-[#fbf0d3] px-4 py-3 text-sm text-[#7a4b00]"
          >
            {notice}
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
