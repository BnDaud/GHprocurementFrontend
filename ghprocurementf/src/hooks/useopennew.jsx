import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Dashboard shortcuts navigate with { openNew: true } so the page opens its
// "add" form straight away. Read it once, then clear it so a refresh or the
// back button does not reopen the form.
export default function useOpenNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const [openNew] = useState(() => !!location.state?.openNew);

  useEffect(() => {
    if (openNew) navigate(location.pathname, { replace: true, state: null });
  }, []);

  return openNew;
}
