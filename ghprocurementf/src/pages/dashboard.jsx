import { useContext, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  LuPackage,
  LuBriefcase,
  LuUsers,
  LuCircleHelp,
  LuPlus,
  LuMail,
  LuImage,
  LuInbox,
} from "react-icons/lu";

import useFetch from "../hooks/usefetch";
import API from "../endpoints/endpoints";
import { globalContext } from "../App";
import { categoryLabel, secureUrl, formatPrice } from "./catalog";
import { PageHeader, Spinner, ErrorBanner, btnPrimary } from "../component/ui";

const stats = [
  {
    key: "TotalBlogs", // the API still calls the catalog count "TotalBlogs"
    label: "Catalog items",
    to: "/catalog",
    icon: LuPackage,
    tile: "bg-peach text-purple",
  },
  {
    key: "TotalServices",
    label: "Services",
    to: "/services",
    icon: LuBriefcase,
    tile: "bg-[#e3f0f8] text-[#0b4f78]",
  },
  {
    key: "TotalUsers",
    label: "Users",
    to: "/users",
    icon: LuUsers,
    tile: "bg-[#fbf0d3] text-[#7a5a00]",
  },
  {
    key: "TotalFaq",
    label: "FAQs",
    to: "/faqs",
    icon: LuCircleHelp,
    tile: "bg-[#e6f2ea] text-[#12633a]",
  },
];

const quickActions = [
  { label: "Add a catalog item", to: "/catalog", state: { openNew: true }, icon: LuPlus },
  { label: "Add a service", to: "/services", state: { openNew: true }, icon: LuPlus },
  { label: "Add a FAQ", to: "/faqs", state: { openNew: true }, icon: LuPlus },
  { label: "Send an email", to: "/mail", icon: LuMail },
];

const barColors = ["bg-purple", "bg-peach", "bg-[#0b4f78]", "bg-[#e0a21b]", "bg-[#12633a]"];

const DashBoard = () => {
  const { total, setTotals, allcatalogs, setAllCatalogs, inboxUnread, inboxTotal } =
    useContext(globalContext);

  const {
    data: totalData,
    loading: totalLoading,
    err: totalErr,
    doFetch: fetchTotal,
  } = useFetch();
  const {
    data: items,
    loading: itemsLoading,
    err: itemsErr,
    doFetch: fetchItems,
  } = useFetch();

  const load = () => {
    fetchTotal({ url: API.gettotal(), method: "GET" });
    fetchItems({ url: API.catalogs(), method: "GET" });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (totalData) setTotals(totalData);
  }, [totalData]);

  useEffect(() => {
    if (items) setAllCatalogs(items);
  }, [items]);

  // newest first when the API gives timestamps, otherwise last added first
  const recent = useMemo(() => {
    const list = [...allcatalogs];
    if (list.every((i) => i.created_at)) {
      return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);
    }
    return list.slice(-3).reverse();
  }, [allcatalogs]);

  const byCategory = useMemo(() => {
    const counts = {};
    allcatalogs.forEach((i) => {
      const k = i.category || "Uncategorised";
      counts[k] = (counts[k] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [allcatalogs]);

  return (
    <div className="space-y-7">
      <PageHeader
        title="Dashboard"
        subtitle="Everything on the GH Procurement site, at a glance."
      >
        <Link to="/catalog" state={{ openNew: true }} className={btnPrimary}>
          <LuPlus className="text-lg" />
          Add catalog item
        </Link>
      </PageHeader>

      {(totalErr || itemsErr) && (
        <ErrorBanner onRetry={load}>
          {itemsErr && !totalErr
            ? "The catalog could not be loaded."
            : "Some dashboard data could not be loaded."}
        </ErrorBanner>
      )}

      <section
        aria-label="Totals"
        className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4"
      >
        {stats.map(({ key, label, to, icon: Icon, tile }) => (
          <Link
            key={key}
            to={to}
            className="group flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 md:p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div
                className={`size-10 rounded-xl flex items-center justify-center ${tile}`}
              >
                <Icon className="text-xl" />
              </div>
              <span className="text-[13px] font-bold text-purple group-hover:underline">
                View
              </span>
            </div>
            <div>
              <div
                className="text-3xl md:text-[34px] font-extrabold leading-none tracking-tight"
                data-testid={`stat-${key}`}
              >
                {totalLoading && !totalData ? <Spinner /> : total[key] ?? 0}
              </div>
              <div className="mt-1.5 text-sm text-muted">{label}</div>
            </div>
          </Link>
        ))}
        <Link
          to="/inbox"
          className="group col-span-2 lg:col-span-1 flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 md:p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="size-10 rounded-xl flex items-center justify-center bg-[#fdeceb] text-[#b42318]">
              <LuInbox className="text-xl" />
            </div>
            <span className="text-[13px] font-bold text-purple group-hover:underline">View</span>
          </div>
          <div>
            <div className="text-3xl md:text-[34px] font-extrabold leading-none tracking-tight" data-testid="stat-Inbox">
              {inboxTotal}
            </div>
            <div className="mt-1.5 text-sm text-muted">
              Inbox
              {inboxUnread > 0 && (
                <span className="ml-2 rounded-full bg-[#d92d20] px-2 py-0.5 text-[11px] font-bold text-white">
                  {inboxUnread} unread
                </span>
              )}
            </div>
          </div>
        </Link>
      </section>

      <div className="flex flex-wrap items-start gap-5">
        <section
          aria-labelledby="recent"
          className="flex-[999_1_480px] min-w-0 rounded-2xl border border-line bg-white"
        >
          <div className="flex items-center justify-between px-5 md:px-6 py-5 border-b border-line">
            <h2 id="recent" className="text-lg font-extrabold">
              Recent catalog items
            </h2>
            <Link to="/catalog" className="text-sm font-bold text-purple hover:underline">
              View all
            </Link>
          </div>

          {itemsLoading && allcatalogs.length === 0 ? (
            <div className="flex justify-center py-12">
              <Spinner className="text-3xl" />
            </div>
          ) : itemsErr && allcatalogs.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted">
              The catalog could not be loaded right now.
            </p>
          ) : recent.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-muted">
              No catalog items yet. Add your first one.
            </p>
          ) : (
            <ul>
              {recent.map((b) => {
                const img = secureUrl(b.featured_image_url || b.featured_image);
                return (
                  <li
                    key={b.id}
                    className="flex items-center gap-3 md:gap-4 px-5 md:px-6 py-4 border-b border-line last:border-b-0 hover:bg-bgcolor/60"
                  >
                    <div className="size-12 shrink-0 rounded-[10px] bg-lilac overflow-hidden flex items-center justify-center text-purple">
                      {typeof img === "string" && img ? (
                        <img
                          src={img}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      ) : (
                        <LuImage className="text-xl" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold text-[15px]">{b.name}</div>
                      <div className="truncate text-[13px] text-muted mt-0.5">
                        {categoryLabel(b.category)}
                        {b.min_quantity ? ` · min ${b.min_quantity}` : ""}
                      </div>
                    </div>
                    <span className="text-sm font-bold tabular-nums">
                      {formatPrice(b.price)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="flex-[1_1_300px] min-w-0 flex flex-col gap-5">
          <section
            aria-labelledby="bycat"
            className="rounded-2xl border border-line bg-white px-6 py-5"
          >
            <h2 id="bycat" className="text-lg font-extrabold mb-4">
              Items by category
            </h2>
            {byCategory.length === 0 ? (
              <p className="text-sm text-muted">Nothing to show yet.</p>
            ) : (
              <ul className="flex flex-col gap-3.5">
                {byCategory.map(([cat, n], i) => (
                  <li key={cat}>
                    <div className="flex justify-between gap-3 text-sm mb-1.5">
                      <span className="truncate">{categoryLabel(cat)}</span>
                      <b className="font-extrabold tabular-nums">{n}</b>
                    </div>
                    <div className="h-2 rounded-full bg-bgcolor overflow-hidden">
                      <div
                        className={`h-full rounded-full ${barColors[i % barColors.length]}`}
                        style={{ width: `${(n / allcatalogs.length) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="quick"
            className="rounded-2xl border border-peach bg-peach-50 px-6 py-5"
          >
            <h2 id="quick" className="text-lg font-extrabold mb-3">
              Quick actions
            </h2>
            <div className="flex flex-col gap-1">
              {quickActions.map(({ label, to, state, icon: Icon }) => (
                <Link
                  key={label}
                  to={to}
                  state={state}
                  className="flex items-center gap-3 min-h-11 px-2.5 rounded-[10px] text-sm font-semibold hover:bg-peach-100"
                >
                  <Icon className="text-lg text-purple" />
                  {label}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;
