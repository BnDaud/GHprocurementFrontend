// Sign-in for the CMS. The API issues a signed token on login; every request
// then carries it as `Authorization: Bearer <token>` and the API enforces it.
// The token lives in sessionStorage, so closing the tab signs you out.

const BASEURL = import.meta.env.VITE_API_BASE;
const KEY_TOKEN = "gh_cms_token";
const KEY_EXPIRES = "gh_cms_expires";
const KEY_USER = "gh_cms_user";

const read = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* storage blocked: sign-in lasts until the page reloads */
  }
};

export function signOut() {
  try {
    [KEY_TOKEN, KEY_EXPIRES, KEY_USER].forEach((k) => sessionStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}

export function getToken() {
  const token = read(KEY_TOKEN);
  if (!token) return null;
  if (Date.now() >= Number(read(KEY_EXPIRES) || 0)) {
    signOut();
    return null;
  }
  return token;
}

export const isSignedIn = () => !!getToken();

export function currentUser() {
  try {
    return JSON.parse(read(KEY_USER) || "null");
  } catch {
    return null;
  }
}

export const authHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// the API said 401: the session is over (expired, or the password changed elsewhere)
export function notifyUnauthorized() {
  signOut();
  window.dispatchEvent(new Event("gh-session-expired"));
}

function keep({ token, expires_in, user }) {
  write(KEY_TOKEN, token);
  write(KEY_EXPIRES, String(Date.now() + expires_in * 1000));
  if (user) write(KEY_USER, JSON.stringify(user));
}

async function post(path, body, withAuth = false) {
  try {
    const res = await fetch(`${BASEURL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(withAuth ? authHeaders() : {}) },
      body: JSON.stringify(body),
    });
    let data = {};
    try {
      data = await res.json();
    } catch {
      /* non-JSON error page */
    }
    return { res, data };
  } catch {
    return { res: null, data: {} };
  }
}

export async function login(email, password) {
  const { res, data } = await post("/auth/login/", { email: email.trim(), password });
  if (!res) {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }
  if (res.ok) {
    keep(data);
    return { ok: true };
  }
  if (res.status === 429) {
    return { ok: false, error: "Too many attempts. Wait a minute and try again." };
  }
  if (res.status === 401) {
    return { ok: false, error: "Wrong email or password." };
  }
  return { ok: false, error: data.detail || "Something went wrong. Try again." };
}

export async function changePassword(current, next) {
  const { res, data } = await post(
    "/auth/change-password/",
    { current_password: current, new_password: next },
    true
  );
  if (!res) {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }
  if (res.status === 401) {
    notifyUnauthorized();
    return { ok: false, error: "Your session has ended. Sign in again." };
  }
  if (res.ok) {
    keep({ ...data, user: currentUser() }); // the old token is dead; this one is fresh
    return { ok: true };
  }
  if (res.status === 429) {
    return { ok: false, error: "Too many attempts. Wait a minute and try again." };
  }
  return { ok: false, error: data.detail || "Could not change the password." };
}
