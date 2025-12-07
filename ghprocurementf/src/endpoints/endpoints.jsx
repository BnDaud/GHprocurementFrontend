const BASEURL = import.meta.env.VITE_API_BASE;

const API = {
  gettotal: () => `${BASEURL}/gettotal?format=json`,

  users: (arg = "") => `${BASEURL}/user${arg && "/" + arg}/?format=json`,

  portfolio: (arg = "") =>
    `${BASEURL}/portfolio${arg && "/" + arg}/?format=json`,

  blogs: (arg = "") => `${BASEURL}/blogs${arg && "/" + arg}/?format=json`,
  metadata: (arg = "") => `${BASEURL}/metadata${arg && "/" + arg}/?format=json`,
  faq: (arg = "") => `${BASEURL}/faqs${arg && "/" + arg}/?format=json`,
  services: (arg = "") => `${BASEURL}/services${arg && "/" + arg}/?format=json`,
};

export default API;
