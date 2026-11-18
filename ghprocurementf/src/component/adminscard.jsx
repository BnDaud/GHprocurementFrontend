import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuShieldCheck, LuUserPlus, LuTrash2, LuX, LuEye, LuEyeOff, LuPencil, LuPlus } from "react-icons/lu";
import StaffEditor from "./staffeditor";
import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import { Field, Spinner, ErrorBanner, btnPrimary, btnSecondary, inputClass } from "./ui";

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "never";

const Chip = ({ tone, children }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ${
      tone === "purple"
        ? "bg-lilac text-purple"
        : tone === "green"
        ? "bg-[#e6f2ea] text-[#12633a]"
        : "bg-bgcolor text-muted"
    }`}
  >
    {children}
  </span>
);

function ConfirmDelete({ admin, busy, error, onConfirm, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Delete administrator"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-line">
          <h2 className="text-lg font-extrabold text-purple">Delete administrator</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="size-10 -mr-2 flex items-center justify-center rounded-lg text-muted hover:bg-bgcolor"
          >
            <LuX className="text-xl" />
          </button>
        </div>
        <div className="px-6 py-5 text-[15px] text-ink/80 space-y-3">
          <p>
            Delete <b className="text-ink">{admin.email}</b>? They will be signed
            out straight away and will no longer be able to sign in.
          </p>
          {error && (
            <p role="alert" className="rounded-lg bg-[#fdeceb] px-3 py-2 text-sm text-[#8a1f15]">
              {error}
            </p>
          )}
        </div>
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 border-t border-line">
          <button type="button" onClick={onClose} className={btnSecondary}>
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#b42318] text-white text-sm font-bold hover:bg-[#912018] disabled:opacity-60"
          >
            {busy ? <Spinner className="text-white text-xl" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Add and remove the other people who can sign in to the CMS. Only shown to
// the super admin (the API refuses everyone else as well).
export default function AdminsCard() {
  const { data: me, doFetch: fetchMe } = useFetch();
  const { data: list, loading, err, doFetch: fetchList } = useFetch();
  const create = useFetch();
  const remove = useFetch();

  const [admins, setAdmins] = useState([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ email: "", first_name: "", last_name: "", designation: "", role: "admin", password: "" });
  const desig = useFetch();
  const addPos = useFetch();
  const delPos = useFetch();
  const [positions, setPositions] = useState([]);
  const [newPos, setNewPos] = useState("");
  const [posError, setPosError] = useState("");
  const [editing, setEditing] = useState(null);
  const [show, setShow] = useState(false);
  const [formError, setFormError] = useState("");
  const [added, setAdded] = useState("");
  const [toDelete, setToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const isSuper = !!me?.is_super_admin;

  useEffect(() => {
    fetchMe({ url: API.me(), method: "GET" });
  }, []);
  useEffect(() => {
    if (isSuper) { fetchList({ url: API.admins(), method: "GET" }); desig.doFetch({ url: API.designations(), method: "GET" }); }
  }, [isSuper]);
  useEffect(() => { if (Array.isArray(desig.data)) setPositions(desig.data); }, [desig.data]);
  useEffect(() => {
    if (addPos.success && addPos.data) { setPositions((p) => [...p, addPos.data]); setNewPos(""); setPosError(""); }
  }, [addPos.success]);
  useEffect(() => { if (addPos.err) setPosError(addPos.errDetail?.name?.[0] || addPos.errDetail?.detail || "That position could not be added."); }, [addPos.err]);
  useEffect(() => { if (delPos.success) desig.doFetch({ url: API.designations(), method: "GET" }); }, [delPos.success]);
  useEffect(() => { if (delPos.err) setPosError(delPos.errDetail?.detail || "That position could not be removed."); }, [delPos.err]);
  useEffect(() => {
    if (list) setAdmins(list);
  }, [list]);

  // new admin created
  useEffect(() => {
    if (create.success && create.data) {
      setAdmins((prev) => [...prev, create.data]);
      setAdded(create.data.email);
      setForm({ email: "", first_name: "", last_name: "", designation: "", role: "admin", password: "" });
      setAdding(false);
      setFormError("");
    }
  }, [create.success]);
  useEffect(() => {
    if (create.err) {
      const d = create.errDetail;
      setFormError(
        (d && (d.detail || Object.values(d).flat().join(" "))) ||
          "The administrator could not be added."
      );
    }
  }, [create.err]);

  // admin deleted
  useEffect(() => {
    if (remove.success && toDelete) {
      setAdmins((prev) => prev.filter((a) => a.id !== toDelete.id));
      setToDelete(null);
    }
  }, [remove.success]);
  useEffect(() => {
    if (remove.err) {
      setDeleteError(remove.errDetail?.detail || "Could not delete this administrator.");
    }
  }, [remove.err]);

  if (!isSuper) return null; // regular admins do not see this card

  const submit = (e) => {
    e.preventDefault();
    setFormError("");
    setAdded("");
    create.doFetch({
      url: API.admins(),
      method: "POST",
      body: { email: form.email.trim(), first_name: form.first_name.trim(), last_name: form.last_name.trim(), designation: form.designation, role: form.role, password: form.password },
    });
  };

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFormError("");
  };

  return (
    <section
      aria-labelledby="s-admins"
      className="rounded-2xl border border-line bg-white p-5 md:p-6 flex flex-col gap-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="s-admins" className="text-lg font-extrabold">
            Staff
          </h2>
          <p className="mt-1 text-[13px] text-muted max-w-xl">
            People who can sign in to this CMS. Each has a registered name, a position in the company (shown in the
            emails they send) and a permission level (Admin or Super admin). The position never changes what they can do.
            Only a super admin can add, edit or remove staff. Customer accounts are on the Users page.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setAdded("");
            }}
            className={btnPrimary}
          >
            <LuUserPlus className="text-lg" />
            Add staff member
          </button>
        )}
      </div>

      {added && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-xl border border-[#bfe0cb] bg-[#e6f2ea] px-4 py-3 text-sm font-semibold text-[#12633a]"
        >
          <LuShieldCheck className="mt-0.5 shrink-0 text-lg" />
          <span>
            {added} was added. Give them the email and password privately. They
            can change the password and turn on two-step verification in
            Settings.
          </span>
        </p>
      )}

      {adding && (
        <form
          onSubmit={submit}
          noValidate
          className="grid gap-5 rounded-xl border border-line p-4 md:grid-cols-3"
        >
          <Field label="Email" htmlFor="admin-email">
            <input
              id="admin-email"
              type="email"
              autoComplete="off"
              className={inputClass}
              value={form.email}
              onChange={set("email")}
              placeholder="name@email.com"
            />
          </Field>
          <Field label="First name" htmlFor="admin-first" hint="The registered name, used in the email signature.">
            <input id="admin-first" className={inputClass} value={form.first_name} onChange={set("first_name")} placeholder="Nia" autoComplete="off" />
          </Field>
          <Field label="Last name" htmlFor="admin-last">
            <input id="admin-last" className={inputClass} value={form.last_name} onChange={set("last_name")} placeholder="Okafor" autoComplete="off" />
          </Field>
          <Field label="Position in the company" htmlFor="admin-position" hint="Shown under their name in their emails.">
            <select id="admin-position" className={inputClass} value={form.designation} onChange={set("designation")}>
              <option value="">No position set</option>
              {positions.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Permission level" htmlFor="admin-role" hint="Admin is the normal choice. A job title does not make someone a super admin.">
            <select id="admin-role" className={inputClass} value={form.role} onChange={set("role")}>
              <option value="admin">Admin</option>
              <option value="super_admin">Super admin</option>
            </select>
          </Field>
          <Field
            label="Temporary password"
            htmlFor="admin-password"
            hint="At least 8 characters, not all numbers, not a common password."
          >
            <div className="relative">
              <input
                id="admin-password"
                type={show ? "text" : "password"}
                autoComplete="new-password"
                className={`${inputClass} pr-12`}
                value={form.password}
                onChange={set("password")}
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
          </Field>

          <div className="md:col-span-3 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={create.loading || !form.email || !form.password || !form.first_name.trim()}
              className={btnPrimary}
            >
              {create.loading ? <Spinner className="text-peach text-xl" /> : "Add staff member"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setFormError("");
              }}
              className={btnSecondary}
            >
              Cancel
            </button>
            {formError && (
              <p role="alert" className="text-sm font-semibold text-[#b42318]">
                {formError}
              </p>
            )}
          </div>
        </form>
      )}

      {err && !list && <ErrorBanner onRetry={() => fetchList({ url: API.admins(), method: "GET" })}>Administrators could not be loaded.</ErrorBanner>}
      {loading && admins.length === 0 && (
        <div className="flex justify-center py-6">
          <Spinner className="text-2xl" />
        </div>
      )}

      {admins.length > 0 && (
        <ul className="divide-y divide-line rounded-xl border border-line" aria-label="Administrators">
          {admins.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 px-4 py-3.5">
              <div className="size-9 shrink-0 rounded-full bg-purple text-peach flex items-center justify-center text-sm font-bold">
                {(a.name || a.email)[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1 basis-48">
                <div className="truncate font-bold text-sm">{a.name || a.username}</div>
                <div className="truncate text-xs text-muted">{a.designation ? `${a.designation} · ` : ""}{a.email}</div>
              </div>
              <Chip tone={a.role === "super_admin" ? "purple" : "grey"}>
                {a.role === "super_admin" ? "Super admin" : "Admin"}
              </Chip>
              <Chip tone={a.mfa_enabled ? "green" : "grey"}>
                2-step {a.mfa_enabled ? "on" : "off"}
              </Chip>
              <span className="hidden md:block w-28 text-xs text-muted">
                Last sign-in: {fmtDate(a.last_login)}
              </span>
              {!a.is_active && <Chip tone="grey">Inactive</Chip>}
              <button type="button" aria-label={`Edit ${a.name || a.email}`} onClick={() => setEditing(a)} className="size-10 flex items-center justify-center rounded-[10px] text-purple hover:bg-lilac">
                <LuPencil className="text-lg" />
              </button>
              {a.protected ? (
                <span className="w-10" aria-hidden="true" />
              ) : (
                <button
                  type="button"
                  aria-label={`Delete ${a.email}`}
                  onClick={() => {
                    setDeleteError("");
                    setToDelete(a);
                  }}
                  className="size-10 flex items-center justify-center rounded-[10px] text-[#a3261a] hover:bg-[#fbe9e7]"
                >
                  <LuTrash2 className="text-lg" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-xl border border-line p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-sm font-extrabold">Positions</h3>
          <p className="text-xs text-muted">The list staff are given a position from. Add the ones your company uses. A position that someone holds cannot be removed.</p>
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Positions">
          {positions.map((p) => (
            <li key={p.id} className="inline-flex items-center gap-1 rounded-full bg-lilac pl-3 pr-1 py-1 text-xs font-bold text-purple">
              {p.name}
              <button type="button" aria-label={`Remove ${p.name}`} onClick={() => { setPosError(""); delPos.doFetch({ url: API.designations(p.id), method: "DELETE" }); }} className="rounded-full p-1 hover:bg-white/70"><LuX className="text-[12px]" /></button>
            </li>
          ))}
        </ul>
        <form onSubmit={(e) => { e.preventDefault(); if (newPos.trim()) addPos.doFetch({ url: API.designations(), method: "POST", body: { name: newPos.trim() } }); }} className="flex flex-wrap items-center gap-2">
          <input aria-label="New position" className={`${inputClass} !w-72 max-w-full`} value={newPos} onChange={(e) => { setNewPos(e.target.value); setPosError(""); }} placeholder="e.g. Warehouse Supervisor" maxLength={80} autoComplete="off" />
          <button type="submit" disabled={!newPos.trim() || addPos.loading} className={btnSecondary}><LuPlus /> Add position</button>
          {posError && <p role="alert" className="text-sm font-semibold text-[#b42318]">{posError}</p>}
        </form>
      </div>

      {editing && (
        <StaffEditor
          admin={editing}
          positions={positions}
          meId={me?.id}
          onClose={() => setEditing(null)}
          onSaved={(u) => { setAdmins((prev) => prev.map((x) => (x.id === u.id ? u : x))); setEditing(null); }}
        />
      )}

      {toDelete && (
        <ConfirmDelete
          admin={toDelete}
          busy={remove.loading}
          error={deleteError}
          onClose={() => setToDelete(null)}
          onConfirm={() => remove.doFetch({ url: API.admins(toDelete.id), method: "DELETE" })}
        />
      )}
    </section>
  );
}
