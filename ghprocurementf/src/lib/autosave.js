// Keeps an unfinished email safe on this computer, at every change, so that a closed tab, a crash, a power cut or no
// connection loses nothing. The text goes to localStorage at once; attached files go to IndexedDB (they are too big for
// localStorage). The server gets a copy a moment after typing stops (see Mail), and again when the connection returns.
import { currentUser } from "../auth/auth";

const keyFor = () => `gh_cms_mail_autosave_v1_${currentUser()?.id || "me"}`;
const DB = "gh_cms_autosave";
const STORE = "files";

export function loadLocal() {
  try { return JSON.parse(localStorage.getItem(keyFor()) || "null"); } catch { return null; }
}
export function saveLocal(obj) {
  try { localStorage.setItem(keyFor(), JSON.stringify({ ...obj, savedAt: Date.now() })); return true; } catch { return false; }
}

const open = () => new Promise((res, rej) => {
  if (typeof indexedDB === "undefined") return rej(new Error("no indexedDB"));
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(STORE);
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});

export async function saveFiles(files) {
  try {
    const db = await open();
    await new Promise((res, rej) => {
      const tx = db.transaction(STORE, "readwrite");
      const s = tx.objectStore(STORE);
      s.clear();
      files.forEach((f, i) => s.put({ name: f.name, type: f.type, blob: f }, `${keyFor()}_${i}`));
      tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
    db.close();
  } catch { /* private mode or storage blocked: the text is still kept */ }
}

export async function loadFiles() {
  try {
    const db = await open();
    const rows = await new Promise((res, rej) => {
      const r = db.transaction(STORE).objectStore(STORE).getAll();
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    db.close();
    return rows.map((x) => new File([x.blob], x.name, { type: x.type }));
  } catch { return []; }
}

export async function clearAutosave() {
  try { localStorage.removeItem(keyFor()); } catch { /* ignore */ }
  await saveFiles([]);
}
