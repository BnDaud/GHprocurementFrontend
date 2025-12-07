import { useContext, useEffect, useState } from "react";
import { AiOutlineLoading } from "react-icons/ai";
import useFetch from "../hooks/usefetch";
import { globalContext } from "../App";

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
}) {
  const { total, setTotals } = useContext(globalContext);
  const [submit, setSubmit] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    setSubmit(!submit);
  };

  const { data, loading, err, success, doFetch } = useFetch();
  useEffect(() => {
    if (submit) {
      let body = undefined;

      const methodSupportsBody = ["POST", "PUT", "PATCH"].includes(method);

      const containsFile =
        payload &&
        Object.values(payload).some(
          (value) =>
            value instanceof File ||
            value instanceof Blob ||
            value instanceof FileList ||
            (Array.isArray(value) && value.some((item) => item instanceof File))
        );

      if (methodSupportsBody) {
        if (containsFile) {
          // ⭐ Build FormData (single or multiple files)
          body = new FormData();

          Object.entries(payload).forEach(([key, value]) => {
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
          // ⭐ JSON body for non-file endpoints
          body = JSON.stringify(payload);
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
        // setTotals(0);

        console.log(total);
        console.log(total[incrementkey] - 1);
      } else if (id && method === "PUT") {
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
        console.log(total);
        console.log(total[incrementkey]);
      }

      togglestate();
    }
  }, [success, incrementkey]);

  return (
    <form
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 overflow-auto p-4"
      onClick={togglestate}
    >
      <div
        className="bg-sidenav w-full max-w-2xl rounded-xl shadow-lg overflow-y-auto max-h-[80vh] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fields.length > 0 ? (
            fields.map((field, index) => (
              <div key={index} className="w-full">
                {field}
              </div>
            ))
          ) : (
            <p className="text-red-500 text-center text-2xl capitalize col-span-2">
              Empty Form
            </p>
          )}
        </div>

        {fields.length > 0 ? (
          <div className="mt-4 w-full flex justify-center md:justify-end">
            <button
              type="submit"
              className={buttonstyle}
              onClick={(e) => handleSubmit(e)}
            >
              {loading ? (
                <div className="flex justify-center">
                  <AiOutlineLoading className="text-2xl animate-spin" />
                </div>
              ) : (
                "Submit"
              )}
            </button>
          </div>
        ) : (
          ""
        )}
      </div>
    </form>
  );
}

export default Modal;
