import { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  LuLayoutDashboard,
  LuPackage,
  LuBriefcase,
  LuCircleHelp,
  LuUsers,
  LuMail,
  LuHistory,
  LuInbox,
  LuSettings,
  LuActivity,
  LuLogOut,
} from "react-icons/lu";
import { globalContext } from "../App";
import { currentUser } from "../auth/auth";
import Logo from "./../images/Logo.png";

const iconClass = "text-[17px] shrink-0";

export const navGroups = [
  {
    label: null,
    items: [
      { to: "/", name: "Dashboard", icon: <LuLayoutDashboard className={iconClass} />, end: true },
    ],
  },
  {
    label: "Content",
    items: [
      { to: "/catalog", name: "Catalog", icon: <LuPackage className={iconClass} /> },
      { to: "/services", name: "Services", icon: <LuBriefcase className={iconClass} /> },
      { to: "/faqs", name: "FAQs", icon: <LuCircleHelp className={iconClass} /> },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/users", name: "Users", icon: <LuUsers className={iconClass} /> },
      { to: "/inbox", name: "Inbox", icon: <LuInbox className={iconClass} />, badge: "inbox" },
      { to: "/mail", name: "Mail", icon: <LuMail className={iconClass} /> },
      { to: "/sent", name: "Sent mail", icon: <LuHistory className={iconClass} /> },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/activity", name: "Activity", icon: <LuActivity className={iconClass} />, superOnly: true },
      { to: "/settings", name: "Settings", icon: <LuSettings className={iconClass} /> },
    ],
  },
];

// The logo file is a square with lots of white space; crop to the wordmark.
export const BrandLogo = ({ width = 168 }) => {
  const scale = width / 1670;
  return (
    <div
      className="relative overflow-hidden"
      style={{ width, height: Math.round(520 * scale) }}
    >
      <img
        src={Logo}
        alt="Gadgets Home"
        className="absolute max-w-none"
        style={{
          width: 1920 * scale,
          left: -130 * scale,
          top: -730 * scale,
        }}
      />
    </div>
  );
};

const linkClass = ({ isActive }) =>
  `flex items-center gap-2.5 h-9 [@media(max-height:700px)]:h-8 px-3 rounded-lg text-[13px] transition-colors ${
    isActive
      ? "bg-purple text-peach font-bold"
      : "text-ink/70 font-semibold hover:bg-peach-100 hover:text-ink"
  }`;

export const NavList = ({ onNavigate }) => {
  const { inboxUnread, inboxTotal } = useContext(globalContext);
  const isSuper = !!currentUser()?.is_super_admin;
  return (
  <nav aria-label="Main" className="flex flex-col gap-0.5">
    {navGroups.map((group, i) => (
      <div key={i} className="flex flex-col gap-0.5">
        {group.label && (
          <p className="mt-3 [@media(max-height:700px)]:mt-1.5 mb-1 [@media(max-height:700px)]:mb-0.5 px-3 text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
            {group.label}
          </p>
        )}
        {group.items.filter((item) => !item.superOnly || isSuper).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={linkClass}
            onClick={onNavigate}
          >
            {({ isActive }) => (
              <>
                <span className="relative shrink-0 flex">
                  {item.icon}
                  {item.badge === "inbox" && inboxUnread > 0 && (
                    <span
                      aria-label={`${inboxUnread} unread`}
                      className="absolute -top-2 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#d92d20] text-white text-[10px] font-extrabold leading-none flex items-center justify-center shadow-sm"
                    >
                      {inboxUnread > 99 ? "99+" : inboxUnread}
                    </span>
                  )}
                </span>
                <span className="flex-1">{item.name}</span>
                {item.badge === "inbox" && inboxTotal > 0 && (
                  <span
                    aria-label={`${inboxTotal} in total`}
                    className={`min-w-6 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      isActive ? "bg-white/20 text-peach" : "bg-ink/[0.07] text-ink/70"
                    }`}
                  >
                    {inboxTotal > 999 ? "999+" : inboxTotal}
                  </span>
                )}
                {isActive && !(item.badge === "inbox" && inboxTotal > 0) && (
                  <span className="size-1.5 rounded-full bg-peach" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    ))}
  </nav>
  );
};

const Sidenav = ({ onNavigate }) => {
  const { signOut } = useContext(globalContext);
  const user = currentUser();
  return (
  <div className="flex flex-col gap-5 [@media(max-height:700px)]:gap-3 h-full overflow-hidden bg-peach-50 border-r border-peach-line px-3 py-5 [@media(max-height:700px)]:py-3">
    <div className="ml-1.5">
      <BrandLogo />
    </div>
    <NavList onNavigate={onNavigate} />
    <div className="mt-auto flex items-center gap-2.5 p-2.5 bg-white border border-line rounded-xl">
      <div className="size-8 rounded-full bg-purple text-peach flex items-center justify-center font-bold text-[13px]">
        A
      </div>
      <div className="leading-tight flex-1 min-w-0">
        <div className="text-[13px] font-bold truncate">
          {user?.name || user?.username || "Admin"}
        </div>
        <div className="text-[11px] text-muted truncate" title={user?.email}>
          {user?.email || "GH Procurement"}
        </div>
      </div>
      <button
        type="button"
        onClick={signOut}
        aria-label="Sign out"
        title="Sign out"
        className="size-8 shrink-0 flex items-center justify-center rounded-lg text-muted hover:bg-peach-100 hover:text-ink"
      >
        <LuLogOut className="text-base" />
      </button>
    </div>
  </div>
  );
};

export default Sidenav;
