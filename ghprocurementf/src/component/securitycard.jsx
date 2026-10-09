import { useState } from "react";
import { LuShieldCheck } from "react-icons/lu";
import { changePassword, currentUser } from "../auth/auth";
import { Field, Spinner, btnPrimary, inputClass } from "./ui";

// Change the dashboard password. Kept as its own form so it never touches the
// site-settings save flow.
export default function SecurityCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const edit = (setter) => (e) => {
    setter(e.target.value);
    setError("");
    setDone(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) {
      setError("The new passwords do not match.");
      return;
    }
    setBusy(true);
    const res = await changePassword(current, next);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    setDone(true);
  };

  return (
    <section
      aria-labelledby="s-security"
      className="rounded-2xl border border-line bg-white p-5 md:p-6 flex flex-col gap-5"
    >
      <div>
        <h2 id="s-security" className="text-lg font-extrabold">
          Security
        </h2>
        <p className="mt-1 text-[13px] text-muted">
          Change the password for {currentUser()?.email ?? "your account"}. Other signed-in sessions will need to sign in again.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="grid gap-5 md:grid-cols-3">
        <Field label="Current password" htmlFor="pw-current">
          <input
            id="pw-current"
            type="password"
            autoComplete="current-password"
            className={inputClass}
            value={current}
            onChange={edit(setCurrent)}
          />
        </Field>
        <Field label="New password" htmlFor="pw-new" hint="At least 8 characters, not too common or all numbers.">
          <input
            id="pw-new"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={next}
            onChange={edit(setNext)}
          />
        </Field>
        <Field label="Confirm new password" htmlFor="pw-confirm">
          <input
            id="pw-confirm"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={confirm}
            onChange={edit(setConfirm)}
          />
        </Field>

        <div className="md:col-span-3 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={busy || !current || !next || !confirm}
            className={btnPrimary}
          >
            {busy ? <Spinner className="text-peach text-xl" /> : "Change password"}
          </button>
          {error && (
            <p role="alert" className="text-sm font-semibold text-[#b42318]">
              {error}
            </p>
          )}
          {done && (
            <p
              role="status"
              className="flex items-center gap-2 text-sm font-semibold text-[#12633a]"
            >
              <LuShieldCheck className="text-lg" />
              Password changed. Use it next time you sign in.
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
