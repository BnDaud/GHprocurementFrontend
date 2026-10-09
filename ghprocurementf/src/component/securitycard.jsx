import { useState } from "react";
import { LuShieldCheck, LuCheck, LuEye, LuEyeOff } from "react-icons/lu";
import { changePassword, currentUser } from "../auth/auth";
import { Field, Spinner, btnPrimary, inputClass } from "./ui";

// The rules the server enforces that we can check while typing. (Whether the
// password is a commonly used one is only known to the server, which says so.)
const rulesFor = (current, next, confirm) => [
  { text: "At least 8 characters", ok: next.length >= 8 },
  { text: "Not only numbers", ok: next.length > 0 && !/^\d+$/.test(next) },
  { text: "Different from your current password", ok: next.length > 0 && next !== current },
  { text: "Matches the confirmation", ok: next.length > 0 && next === confirm },
];

// Change the dashboard password. Kept as its own form so it never touches the
// site-settings save flow.
export default function SecurityCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const rules = rulesFor(current, next, confirm);
  const allOk = rules.every((r) => r.ok);
  const type = show ? "text" : "password";

  const edit = (setter) => (e) => {
    setter(e.target.value);
    setError("");
    setDone(false);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!allOk) return;
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
          Change the password for {currentUser()?.email ?? "your account"}. Other
          signed-in sessions will need to sign in again.
        </p>
      </div>

      <form onSubmit={submit} noValidate className="grid gap-5 md:grid-cols-3">
        <Field label="Current password" htmlFor="pw-current">
          <input
            id="pw-current"
            type={type}
            autoComplete="current-password"
            className={inputClass}
            value={current}
            onChange={edit(setCurrent)}
          />
        </Field>
        <Field label="New password" htmlFor="pw-new">
          <input
            id="pw-new"
            type={type}
            autoComplete="new-password"
            className={inputClass}
            value={next}
            onChange={edit(setNext)}
            aria-describedby="pw-rules"
          />
        </Field>
        <Field label="Confirm new password" htmlFor="pw-confirm">
          <input
            id="pw-confirm"
            type={type}
            autoComplete="new-password"
            className={inputClass}
            value={confirm}
            onChange={edit(setConfirm)}
            aria-describedby="pw-rules"
          />
        </Field>

        <div className="md:col-span-3 flex flex-col gap-4">
          <ul id="pw-rules" aria-label="Password rules" className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
            {rules.map((r) => (
              <li
                key={r.text}
                data-ok={r.ok}
                className={`flex items-center gap-2 text-[13px] ${
                  r.ok ? "text-[#12633a] font-semibold" : "text-muted"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`size-4 shrink-0 rounded-full flex items-center justify-center ${
                    r.ok ? "bg-[#12633a] text-white" : "border border-[#c9bfd3]"
                  }`}
                >
                  {r.ok && <LuCheck className="text-[11px]" />}
                </span>
                {r.text}
                <span className="sr-only">{r.ok ? " (done)" : " (not yet)"}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            className="self-start inline-flex items-center gap-2 text-[13px] font-bold text-purple hover:underline"
          >
            {show ? <LuEyeOff /> : <LuEye />}
            {show ? "Hide passwords" : "Show passwords"}
          </button>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={busy || !current || !allOk}
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
        </div>
      </form>
    </section>
  );
}
