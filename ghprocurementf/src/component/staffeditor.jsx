import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import { Field, Spinner, btnPrimary, btnSecondary, inputClass } from "./ui";

// Correct a staff member's details. The registered name, the permission level and the account status are changed
// here by the super admin only (the API checks it as well). A job title never changes what someone may do.
export default function StaffEditor({ admin, positions, meId, onSaved, onClose }) {
  const save = useFetch();
  const [f, setF] = useState({
    first_name: admin.first_name || "",
    last_name: admin.last_name || "",
    email: admin.email || "",
    designation: admin.designation || "",
    role: admin.role,
    is_active: admin.is_active,
  });
  const [error, setError] = useState("");
  const isMe = admin.id === meId;
  const roleLocked = isMe || admin.owner;
  const set = (k) => (e) => { setF((x) => ({ ...x, [k]: e.target.value })); setError(""); };

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  useEffect(() => { if (save.success && save.data) onSaved(save.data); }, [save.success]);
  useEffect(() => {
    if (save.err) setError(save.errDetail?.detail || Object.values(save.errDetail || {}).flat().join(" ") || "The changes could not be saved.");
  }, [save.err]);

  const submit = (e) => {
    e.preventDefault();
    if (!f.first_name.trim()) return setError("Enter the registered name.");
    // send only what changed, so a name is never rewritten by accident
    const body = {};
    for (const k of Object.keys(f)) {
      const was = k === "is_active" ? admin.is_active : k === "role" ? admin.role : (admin[k] || "");
      if (f[k] !== was) body[k] = typeof f[k] === "string" ? f[k].trim() : f[k];
    }
    if (!Object.keys(body).length) return onClose();
    save.doFetch({ url: API.admins(admin.id), method: "PATCH", body });
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 p-0 sm:p-4" onClick={onClose}>
      <form onSubmit={submit} noValidate role="dialog" aria-modal="true" aria-label="Edit staff member" onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-line">
          <h2 className="text-lg font-extrabold text-purple">Edit staff member</h2>
          <button type="button" aria-label="Close" onClick={onClose} className="size-10 -mr-2 flex items-center justify-center rounded-lg text-muted hover:bg-bgcolor"><LuX className="text-xl" /></button>
        </div>
        <div className="px-6 py-5 grid gap-5 sm:grid-cols-2">
          <Field label="First name" htmlFor="st-first" hint="The registered name. It is used in the email signature.">
            <input id="st-first" className={inputClass} value={f.first_name} onChange={set("first_name")} autoComplete="off" />
          </Field>
          <Field label="Last name" htmlFor="st-last">
            <input id="st-last" className={inputClass} value={f.last_name} onChange={set("last_name")} autoComplete="off" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Email" htmlFor="st-email" hint="They sign in with this address.">
              <input id="st-email" type="email" className={inputClass} value={f.email} onChange={set("email")} autoComplete="off" />
            </Field>
          </div>
          <Field label="Position in the company" htmlFor="st-pos" hint="Shown under their name in the emails they send. It does not change what they can do.">
            <select id="st-pos" className={inputClass} value={f.designation} onChange={set("designation")}>
              <option value="">No position set</option>
              {positions.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Permission level" htmlFor="st-role" hint={admin.owner ? "An owner account always stays a super admin." : isMe ? "You cannot change your own level." : "Super admins manage staff, settings and customer accounts. Admins handle orders, mail and uploads."}>
            <select id="st-role" className={inputClass} value={f.role} onChange={set("role")} disabled={roleLocked}>
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
          </Field>
          <label className="sm:col-span-2 flex items-center gap-3 text-sm font-semibold">
            <input type="checkbox" className="size-5 accent-purple" checked={f.is_active} disabled={isMe || admin.owner} onChange={(e) => setF((x) => ({ ...x, is_active: e.target.checked }))} />
            Account is active (untick to stop them signing in, without deleting anything)
          </label>
          {error && <p role="alert" className="sm:col-span-2 rounded-lg bg-[#fdeceb] px-3 py-2 text-sm text-[#8a1f15]">{error}</p>}
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 border-t border-line">
          <button type="button" onClick={onClose} className={btnSecondary}>Cancel</button>
          <button type="submit" disabled={save.loading} className={btnPrimary}>{save.loading ? <Spinner className="text-peach text-xl" /> : "Save changes"}</button>
        </div>
      </form>
    </div>,
    document.body
  );
}
