import { useEffect } from "react";
import useFetch from "./usefetch";
import API from "../endpoints/endpoints";
import { currentUser } from "../auth/auth";

// true / false once we know whether the signed-in admin is the super admin; null while still unknown.
// The API enforces it too; this only decides what to show.
export default function useIsSuper() {
  const me = useFetch();
  useEffect(() => {
    me.doFetch({ url: API.me(), method: "GET" });
  }, []);
  if (me.data) return !!me.data.is_super_admin;
  const stored = currentUser()?.is_super_admin;
  return stored === undefined ? null : !!stored;
}
