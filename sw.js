const CACHE = "ink-v2";
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const u = new URL(req.url);
  if (u.hostname.endsWith("supabase.co") || u.pathname.includes("/rest/v1/") || u.pathname.includes("/auth/v1/") || u.pathname.includes("/storage/v1/")) return;
  const cacheable = u.origin === location.origin || ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"].includes(u.hostname);
  if (!cacheable) return;
  const nav = req.mode === "navigate";
  e.respondWith(caches.open(CACHE).then(async (c) => {
    const hit = await c.match(nav ? "./index.html" : req);
    const net = fetch(req).then((r) => { if (r && r.ok) c.put(nav ? "./index.html" : req, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
