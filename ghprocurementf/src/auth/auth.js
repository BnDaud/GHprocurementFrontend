// Sign-in for the CMS. The API issues a signed token on login; every request
// then carries it as `Authorization: Bearer <token>` and the API enforces it.
// The token is kept in localStorage for the 12 hours the server allows, so it
// survives closing the tab or the browser and is shared between tabs. Signing
// out (in any tab) clears it everywhere.

const BASEURL = import.meta.env.VITE_API_BASE;
const KEY_TOKEN = "gh_cms_token";
const KEY_EXPIRES = "gh_cms_expires";
const KEY_USER = "gh_cms_user";

const read = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage blocked: sign-in lasts until the page reloads */
  }
};

export function signOut() {
  try {
    [KEY_TOKEN, KEY_EXPIRES, KEY_USER].forEach((k) => localStorage.removeItem(k));
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

export const SESSION_HOURS = 12;
export const TOKEN_STORAGE_KEY = KEY_TOKEN;

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
  if (res.ok && data.mfa_required) {
    // password accepted; the app code is still needed before there is a session
    return { ok: false, mfaRequired: true, mfaToken: data.mfa_token };
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

// step two of sign-in: the 6-digit app code, or a recovery code
export async function verifyMfa(mfaToken, code) {
  const { res, data } = await post("/auth/login/mfa/", { mfa_token: mfaToken, code });
  if (!res) {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }
  if (res.ok) {
    keep(data);
    return { ok: true, usedRecovery: !!data.used_recovery_code, recoveryLeft: data.recovery_codes_left };
  }
  if (data.restart) return { ok: false, restart: true, error: data.detail };
  if (res.status === 429) {
    return { ok: false, error: data.detail || "Too many attempts. Wait a few minutes and try again." };
  }
  return { ok: false, error: data.detail || "That code is not right. Try again." };
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


// ---- two-step verification management (all need an active session) ----
async function authed(path, body = {}) {
  const { res, data } = await post(path, body, true);
  if (!res) {
    return { ok: false, error: "Could not reach the server. Check your connection and try again." };
  }
  if (res.status === 401) {
    notifyUnauthorized();
    return { ok: false, error: "Your session has ended. Sign in again." };
  }
  if (res.status === 429) {
    return { ok: false, error: data.detail || "Too many attempts. Wait a few minutes and try again." };
  }
  if (!res.ok) return { ok: false, error: data.detail || "Something went wrong. Try again." };
  return { ok: true, data };
}

export const mfaSetup = () => authed("/auth/mfa/setup/");

// turning 2FA on or off ends every older session, so the reply carries a fresh token
export async function mfaConfirm(code) {
  const r = await authed("/auth/mfa/confirm/", { code });
  if (r.ok) keep(r.data);
  return r.ok ? { ok: true, recoveryCodes: r.data.recovery_codes } : r;
}

export async function mfaDisable(password, code) {
  const r = await authed("/auth/mfa/disable/", { password, code });
  if (r.ok) keep(r.data);
  return r;
}

export async function mfaNewRecoveryCodes(password, code) {
  const r = await authed("/auth/mfa/recovery-codes/", { password, code });
  return r.ok ? { ok: true, recoveryCodes: r.data.recovery_codes } : r;
}
