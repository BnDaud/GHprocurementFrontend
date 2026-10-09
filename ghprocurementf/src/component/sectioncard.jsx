import { useEffect, useMemo, useRef, useState } from "react";
import { LuPlus, LuPencil, LuTrash2, LuSearch, LuInbox } from "react-icons/lu";
import Modal from "./modal";
import {
  PageHeader,
  StatusChip,
  Spinner,
  btnPrimary,
  btnSecondary,
} from "./ui";

const PAGE_SIZE = 10;
const right = ["views_count", "price", "min_quantity"];

const labelFor = (key) => {
  const map = { views_count: "Views" };
  if (map[key]) return map[key];
  return key.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
};

function SectionCard({
  name,
  subtitle,
  thead,
  button,
  tbody,
  fields,
  payload = {},
  url = "",
  updatepayload,
  incrementkey,
  updatedata = null, // a function that update the overall data
  loading = false,
  error = false,
  initialAddOpen = false,
  singular = "item",
  formatters = {}, // key -> (value, row) => node
  editMethod = "PUT",
}) {
  const [addNew, setAddNew] = useState(initialAddOpen);
  const [editdata, setEditData] = useState(false);
  const [deletedata, setDeleteData] = useState(false);
  const [id, setId] = useState(0);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(0);

  // the empty form, remembered so "add" never shows leftovers from a previous edit
  const emptyPayload = useRef(payload);

  const keys = useMemo(() => Object.keys(thead || {}), [thead]);
  const statusKey = keys.find((k) => k.toLowerCase() === "status");

  const openAdd = () => {
    updatepayload?.(emptyPayload.current);
    setAddNew(true);
  };
  const toggleaddnew = () => setAddNew((v) => !v);

  const handledit = (id_, obj) => {
    // PATCH sends only the form's own fields, so read-only server fields
    // (id, timestamps, derived urls) never go back to the API
    const source =
      editMethod === "PATCH"
        ? Object.fromEntries(
            Object.keys(emptyPayload.current).map((k) => [k, obj[k]])
          )
        : obj;
    updatepayload?.({ ...emptyPayload.current, ...source });
    setId(id_);
    setEditData(true);
  };
  const toggledit = () => setEditData((v) => !v);

  const handledelete = (id_) => {
    setId(id_);
    setDeleteData(true);
  };
  const toggleDelete = () => setDeleteData((v) => !v);

  const statusOptions = useMemo(() => {
    if (!statusKey) return [];
    return [...new Set(tbody.map((r) => r[statusKey]).filter(Boolean))];
  }, [tbody, statusKey]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tbody.filter((row) => {
      if (statusKey && statusFilter !== "All" && row[statusKey] !== statusFilter)
        return false;
      if (!q) return true;
      return keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q));
    });
  }, [tbody, query, statusFilter, keys, statusKey]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  // filters or deletes can leave the current page empty
  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const modalButton =
    "inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl text-sm font-bold transition disabled:opacity-60";

  return (
    <div className="space-y-6">
      {addNew && (
        <Modal
          togglestate={toggleaddnew}
          title={button}
          fields={fields}
          payload={payload} //data structure to be submit
          method={"POST"}
          url={url()}
          dataTobeUpdated={tbody}
          updatedata={updatedata}
          buttonstyle={`${modalButton} bg-purple text-peach hover:bg-purple/90`}
          submitLabel="Save"
          incrementkey={incrementkey}
        />
      )}
      {editdata && (
        <Modal
          togglestate={toggledit}
          title={`Edit ${singular}`}
          fields={fields}
          payload={payload} //data structure to be submit
          method={editMethod}
          url={url(id)}
          id={id} //
          updatedata={updatedata}
          dataTobeUpdated={tbody}
          buttonstyle={`${modalButton} bg-purple text-peach hover:bg-purple/90`}
          submitLabel="Save changes"
          incrementkey={incrementkey}
        />
      )}
      {deletedata && (
        <Modal
          togglestate={toggleDelete}
          title={`Delete ${singular}`}
          fields={[
            <p key="msg" data-full className="text-[15px] text-ink/80">
              This will permanently remove this {singular}. This cannot be
              undone.
            </p>,
          ]}
          buttonstyle={`${modalButton} bg-[#b42318] text-white hover:bg-[#912018]`}
          submitLabel="Delete"
          url={url(id)}
          id={id}
          updatedata={updatedata}
          dataTobeUpdated={tbody}
          method="DELETE"
          incrementkey={incrementkey}
        />
      )}

      <PageHeader title={name} subtitle={subtitle}>
        <button type="button" onClick={openAdd} className={btnPrimary}>
          <LuPlus className="text-lg" />
          {button}
        </button>
      </PageHeader>

      <section className="rounded-2xl border border-line bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-line">
          {statusKey && statusOptions.length > 0 ? (
            <div
              role="group"
              aria-label="Filter by status"
              className="flex gap-1 p-1 rounded-xl bg-bgcolor"
            >
              {["All", ...statusOptions].map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={statusFilter === s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(0);
                  }}
                  className={`h-9 px-3.5 rounded-[9px] text-[13px] font-bold transition ${
                    statusFilter === s
                      ? "bg-white shadow-sm text-ink"
                      : "text-ink/70 hover:text-ink"
                  }`}
                >
                  {s}
                  <span className="ml-1.5 font-semibold text-muted">
                    {s === "All"
                      ? tbody.length
                      : tbody.filter((r) => r[statusKey] === s).length}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">
              {tbody.length} {tbody.length === 1 ? singular : `${singular}s`}
            </p>
          )}

          <label className="relative block">
            <span className="sr-only">Search {name}</span>
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={`Search ${name.toLowerCase()}`}
              className="w-full sm:w-64 h-11 pl-10 pr-3.5 rounded-xl border border-[#d5d0dd] bg-white text-sm focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20"
            />
          </label>
        </div>

        {loading && tbody.length === 0 ? (
          <div className="flex justify-center py-16">
            <Spinner className="text-3xl" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center text-muted">
            <LuInbox className="text-3xl" />
            <p className="text-sm">
              {error && tbody.length === 0
                ? `${singular[0].toUpperCase()}${singular.slice(1)}s could not be loaded.`
                : tbody.length === 0
                ? `No ${singular}s yet.`
                : `No ${singular}s match your search.`}
            </p>
          </div>
        ) : (
          <div className="relative overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wider text-muted">
                  {keys.map((k) => (
                    <th
                      key={k}
                      scope="col"
                      className={`px-4 first:pl-5 py-3.5 ${
                        right.includes(k) ? "text-right" : ""
                      }`}
                    >
                      {thead[k] || labelFor(k)}
                    </th>
                  ))}
                  <th scope="col" className="px-5 py-3.5 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((obj) => (
                  <tr
                    key={obj.id}
                    className="border-t border-line hover:bg-bgcolor/50"
                  >
                    {keys.map((k, i) => (
                      <td
                        key={k}
                        className={`px-4 first:pl-5 py-3.5 max-w-xs ${
                          i === 0 ? "font-bold" : "text-ink/80"
                        } ${right.includes(k) ? "text-right tabular-nums" : ""}`}
                      >
                        {k === statusKey ? (
                          <StatusChip value={obj[k]} />
                        ) : formatters[k] ? (
                          formatters[k](obj[k], obj)
                        ) : (
                          <div className="truncate" title={String(obj[k] ?? "")}>
                            {obj[k] ?? ""}
                          </div>
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-2">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          aria-label={`Edit ${obj[keys[0]] ?? singular}`}
                          onClick={() => handledit(obj.id, obj)}
                          className="size-10 flex items-center justify-center rounded-[10px] text-ink/70 hover:bg-bgcolor"
                        >
                          <LuPencil className="text-lg" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${obj[keys[0]] ?? singular}`}
                          onClick={() => handledelete(obj.id)}
                          className="size-10 flex items-center justify-center rounded-[10px] text-[#a3261a] hover:bg-[#fbe9e7]"
                        >
                          <LuTrash2 className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-line text-[13px] text-muted">
            <span>
              Showing {safePage * PAGE_SIZE + 1} to{" "}
              {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} of{" "}
              {filtered.length}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={safePage === 0}
                onClick={() => setPage(safePage - 1)}
                className={`${btnSecondary} !h-10 !px-4 disabled:opacity-50`}
              >
                Previous
              </button>
              <button
                type="button"
                disabled={safePage >= pageCount - 1}
                onClick={() => setPage(safePage + 1)}
                className={`${btnSecondary} !h-10 !px-4 disabled:opacity-50`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default SectionCard;
