import { useState } from "react";

function useFetch() {
  const [data, setData] = useState(null);
  const [success, setSuccess] = useState(false); // ⭐ new
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const doFetch = async ({ url, method = "GET", body }) => {
    setLoading(true);
    setSuccess(false); // reset
    setData(null); // reset old data

    try {
      const isFormData = body instanceof FormData;
      console.log("i got here", body);
      console.log(isFormData);

      const res = await fetch(url, {
        method,
        headers: isFormData
          ? undefined
          : { "Content-Type": "application/json" },
        body: isFormData ? body : body ? body : null,
      });

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = await res.text();
        }
        console.error("Fetch error:", {
          status: res.status,
          statusText: res.statusText,
          structure: errorData,
        });

        throw new Error(`Bad Request: ${res.status} ${res.statusText}`);
      }

      // ⭐ Handle DELETE (no JSON body)
      let json = null;
      try {
        json = await res.json();
      } catch (_) {
        // No JSON returned → DELETE or empty response
      }

      setData(json);
      setSuccess(true); // ⭐ mark request as successful
    } catch (e) {
      console.error("Caught fetch error:", e);
      setErr(e);
    } finally {
      setLoading(false);
    }
  };

  return { data, success, loading, err, doFetch };
}

export default useFetch;
