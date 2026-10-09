const BASEURL = import.meta.env.VITE_API_BASE;

const API = {
  gettotal: () => `${BASEURL}/gettotal?format=json`,

  users: (arg = "") => `${BASEURL}/user${arg && "/" + arg}/?format=json`,

  portfolio: (arg = "") =>
    `${BASEURL}/portfolio${arg && "/" + arg}/?format=json`,

  catalogs: (arg = "") => `${BASEURL}/catalogs${arg && "/" + arg}/?format=json`,
  metadata: (arg = "") => `${BASEURL}/metadata${arg && "/" + arg}/?format=json`,
  faq: (arg = "") => `${BASEURL}/faqs${arg && "/" + arg}/?format=json`,
  services: (arg = "") => `${BASEURL}/services${arg && "/" + arg}/?format=json`,
  emails: () => `${BASEURL}/emails/`,
  me: () => `${BASEURL}/auth/me/`,
  inbox: (arg = "") => `${BASEURL}/inbox/${arg && arg + "/"}`,
  inboxSummary: () => `${BASEURL}/inbox/summary/`,
  inboxBulkDelete: () => `${BASEURL}/inbox/bulk-delete/`,
  inboxMarkAllRead: () => `${BASEURL}/inbox/mark-all-read/`,
  admins: (arg = "") => `${BASEURL}/admins/${arg && arg + "/"}`,
  rfqs: (arg = "") => `${BASEURL}/rfqs/${arg && arg + "/"}`,
  rfqUpdates: (id, uid = "") => `${BASEURL}/rfqs/${id}/updates/${uid && uid + "/"}`,
  audit: (qs = "") => `${BASEURL}/audit/${qs}`,
  sentEmails: (arg = "") => `${BASEURL}/sent-emails/${arg && arg + "/"}`,
};

export default API;
