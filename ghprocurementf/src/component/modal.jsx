import { useContext, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import useFetch from "../hooks/usefetch";
import { globalContext } from "../App";
import { Spinner, btnSecondary } from "./ui";

function Modal({
  togglestate,
  fields = [],
  payload,
  id,
  dataTobeUpdated,
  updatedata,
  method = "GET",
  url,
  buttonstyle,
  incrementkey,
  title,
  submitLabel = "Submit",
}) {
  const { setTotals } = useContext(globalContext);
  const [submit, setSubmit] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmit(!submit);
  };

  const { data, loading, err, success, doFetch } = useFetch();

  // Escape closes the dialog
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") togglestate();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglestate]);

  useEffect(() => {
    if (submit) {
      let body = undefined;

      const methodSupportsBody = ["POST", "PUT", "PATCH"].includes(method);

      // On PATCH, an image that is still just the server's URL is unchanged:
      // leave it out so the API keeps the stored file.
      let sendPayload = payload;
      if (method === "PATCH" && payload) {
        sendPayload = Object.fromEntries(
          Object.entries(payload).filter(
            ([, v]) => !(typeof v === "string" && /^https?:\/\//.test(v))
          )
        );
      }

      const containsFile =
        sendPayload &&
        Object.values(sendPayload).some(
          (value) =>
            value instanceof File ||
            value instanceof Blob ||
            value instanceof FileList ||
            (Array.isArray(value) && value.some((item) => item instanceof File))
        );

      if (methodSupportsBody) {
        if (containsFile) {
          // Build FormData (single or multiple files)
          body = new FormData();

          Object.entries(sendPayload).forEach(([key, value]) => {
            if (value instanceof FileList) {
              // Handle <input multiple> file lists
              Array.from(value).forEach((file) => body.append(key, file));
            } else if (Array.isArray(value) && value[0] instanceof File) {
              // Handle arrays of files
              value.forEach((file) => body.append(key, file));
            } else {
              // Handle text or single file
              body.append(key, value);
            }
          });
        } else {
          // JSON body for non-file endpoints
          body = sendPayload;
        }
      }

      doFetch({
        url,
        method,
        body,
      });

      setSubmit(false);
    }
  }, [submit]);

  useEffect(() => {
    if (success) {
      if (id && method === "DELETE") {
        const newData = dataTobeUpdated.filter((t) => t.id !== id);
        updatedata(newData);

        // Decrement safely
        setTotals((prev) => ({
          ...prev,
          [incrementkey]: Math.max((prev[incrementkey] || 1) - 1, 0),
        }));
      } else if (id && (method === "PUT" || method === "PATCH")) {
        const newData = dataTobeUpdated.map((t) =>
          t.id === id ? { ...t, ...data } : t
        );
        updatedata(newData);
        // PUT doesn't change the count, so no total update
      } else {
        // POST or add new
        updatedata([...dataTobeUpdated, data]);

        // Increment safely
        setTotals((prev) => ({
          ...prev,
          [incrementkey]: (prev[incrementkey] || 0) + 1,
        }));
      }

      togglestate();
    }
  }, [success, incrementkey]);

  // portal to <body> so no ancestor layout can clip or offset the overlay
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-ink/50 p-0 sm:p-4"
      onClick={togglestate}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label={title}
        noValidate
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="flex flex-col w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-line">
          <h2 className="text-lg font-extrabold text-purple">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={togglestate}
            className="size-10 -mr-2 flex items-center justify-center rounded-lg text-muted hover:bg-bgcolor"
          >
            <LuX className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {fields.length > 0 ? (
              fields.map((field, index) => (
                <div
                  key={index}
                  className={(field.props?.full || field.props?.["data-full"]) ? "md:col-span-2" : ""}
                >
                  {field}
                </div>
              ))
            ) : (
              <p className="text-red-500 text-center text-2xl capitalize col-span-2">
                Empty Form
              </p>
            )}
          </div>

          {err && (
            <p
              role="alert"
              className="mt-4 rounded-lg bg-[#fdeceb] px-3 py-2 text-sm text-[#8a1f15]"
            >
              Could not save. Check the details and try again.
            </p>
          )}
        </div>

        {fields.length > 0 && (
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 px-6 py-4 border-t border-line">
            <button type="button" onClick={togglestate} className={btnSecondary}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className={buttonstyle}>
              {loading ? <Spinner className="text-white text-xl" /> : submitLabel}
            </button>
          </div>
        )}
      </form>
    </div>,
    document.body
  );
}

export default Modal;
