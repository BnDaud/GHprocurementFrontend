import { useState } from "react";
import { authHeaders, notifyUnauthorized } from "../auth/auth";

function useFetch() {
  const [data, setData] = useState(null);
  const [success, setSuccess] = useState(false); // ⭐ new
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [errDetail, setErrDetail] = useState(null); // what the server said, if it said anything

  const doFetch = async ({ url, method = "GET", body }) => {
    setLoading(true);
    setSuccess(false); // reset
    setErr(null); // a retry must not keep showing the previous error
    setErrDetail(null);
    setData(null); // reset old data

    try {
      const isFormData = body instanceof FormData;
      console.log("i got here", body);
      console.log(isFormData);

      const res = await fetch(url, {
        method,
        headers: {
          ...authHeaders(),
          ...(isFormData ? {} : { "Content-Type": "application/json" }),
        },
        body: isFormData ? body : body ? JSON.stringify(body) : null,
      });

      if (res.status === 401) notifyUnauthorized();

      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
        } catch {
          errorData = await res.text();
        }
        setErrDetail(errorData);
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

  return { data, success, loading, err, errDetail, doFetch };
}

export default useFetch;
