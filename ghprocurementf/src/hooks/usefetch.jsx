import React, { useEffect } from "react";

function useFetch({ url, method = "GET", body }) {
  useEffect(() => {
    const fetchdata = async () => {
      try {
        const req = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "Application/json",
          },
          body: body ? JSON.stringify(body) : undefined,
        });
        if (!req.ok) throw new Error("Bad Request");

        const data = await req.json();

        console.log(data);
      } catch (e) {
        console.log(e);
      }
    };
    fetchdata();
  }, [url, method, body]);
}

export default useFetch;
