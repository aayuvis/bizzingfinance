/* sw.js — offline-first is a hard rule (CLAUDE.md).

   Deliberately NOT a hard-coded file list: this app is served three ways —
   native ES modules in dev, a fingerprinted Vite build, and a single inlined
   file — and a shell list that has to match the build is a list that silently
   goes stale. So: cache the entry points on install, then runtime-cache every
   same-origin GET the app actually asks for. Cache-first, network-fills. */

const CACHE = 'bizzington-v2';
const ENTRY = ['./', './index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ENTRY.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // fonts and anything else: let the network decide

  e.respondWith(
    caches.match(req).then((hit) => {
      if (hit) return hit;
      return fetch(req).then((res) => {
        if (res && res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() =>
        /* offline and never seen: a navigation still gets the app shell */
        req.mode === 'navigate' ? caches.match('./index.html') : Promise.reject(new Error('offline'))
      );
    })
  );
});
