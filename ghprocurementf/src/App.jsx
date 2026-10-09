import { createContext, useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { LuMenu, LuX } from "react-icons/lu";
import Sidenav, { BrandLogo } from "./component/sidenav";
import DashBoard from "./pages/dashboard";
import Catalog from "./pages/catalog";
import Settings from "./pages/settings";
import User from "./pages/user";

import Services from "./pages/services";
import Faqs from "./pages/faq";
import Mail from "./pages/mail";
import SentMail from "./pages/sentmail";
import Login from "./pages/login";
import { isSignedIn, signOut as clearSession, TOKEN_STORAGE_KEY } from "./auth/auth";

export const globalContext = createContext();

function App() {
  const [allcatalogs, setAllCatalogs] = useState([]);
  const [allservices, setAllServices] = useState([]);
  const [total, setTotals] = useState({
    TotalBlogs: 0,
    TotalPortfolio: 0,
    TotalUsers: 0,
    TotalServices: 0,
    TotalFaq: 0,
  });
  const [allusers, setAllUsers] = useState([]);
  const [allfaqs, setAllFaqs] = useState([]);
  const [meta, setMeta] = useState({});

  const [authed, setAuthed] = useState(isSignedIn);
  const [expired, setExpired] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const mainRef = useRef(null);
  const { pathname } = useLocation();

  // the API rejected our token (expired, or the password changed elsewhere)
  useEffect(() => {
    const onExpired = () => {
      setExpired(true);
      setAuthed(false);
    };
    window.addEventListener("gh-session-expired", onExpired);
    return () => window.removeEventListener("gh-session-expired", onExpired);
  }, []);

  // signing out in another tab signs this one out too
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_STORAGE_KEY && !e.newValue) {
        setExpired(false);
        setAuthed(false);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // each route starts at the top, and the phone menu closes after navigating
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0 });
    setMenuOpen(false);
  }, [pathname]);

  const signOut = () => {
    clearSession();
    setExpired(false);
    setAuthed(false);
    setMenuOpen(false);
  };

  // nothing below mounts (so no API calls are made) until signed in
  if (!authed)
    return (
      <Login
        notice={expired ? "Your session ended. Sign in again." : ""}
        onSuccess={() => {
          setExpired(false);
          setAuthed(true);
        }}
      />
    );

  return (
    <globalContext.Provider
      value={{
        allcatalogs,
        setAllCatalogs,
        total,
        setTotals,
        allusers,
        setAllUsers,
        allfaqs,
        setAllFaqs,
        meta,
        setMeta,
        setAllServices,
        allservices,
        signOut,
      }}
    >
      <div className="flex h-screen bg-bgcolor">
        {/* desktop sidebar */}
        <div className="hidden md:block w-56 shrink-0">
          <Sidenav />
        </div>

        {/* phone drawer */}
        {menuOpen && (
          <div
            className="fixed inset-0 z-40 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div
              className="absolute inset-0 bg-ink/50"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 max-w-[85%] overflow-hidden">
              <Sidenav onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0 flex flex-col">
          {/* phone top bar */}
          <header className="md:hidden flex items-center justify-between h-16 px-4 bg-peach-50 border-b border-peach-line shrink-0">
            <BrandLogo width={126} />
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
              className="size-11 flex items-center justify-center text-ink"
            >
              {menuOpen ? <LuX className="text-2xl" /> : <LuMenu className="text-2xl" />}
            </button>
          </header>

          <main
            ref={mainRef}
            className="relative flex-1 overflow-y-auto px-4 py-4 md:px-10 md:py-8 space-y-5"
          >
            <Routes>
              <Route path="/" element={<DashBoard />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/blog" element={<Navigate to="/catalog" replace />} />
              <Route path="/services" element={<Services />} />
              <Route path="/users" element={<User />} />
              <Route path="/faqs" element={<Faqs />} />
              <Route path="/mail" element={<Mail />} />
              <Route path="/sent" element={<SentMail />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </globalContext.Provider>
  );
}

export default App;
