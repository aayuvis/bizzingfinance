/* sw.js — offline-first is a hard rule (CLAUDE.md).

   Deliberately NOT a hard-coded file list: this app is served three ways —
   native ES modules in dev, a fingerprinted Vite build, and a single inlined
   file — and a shell list that has to match the build is a list that silently
   goes stale. So: cache the entry points on install, then runtime-cache every
   same-origin GET the app actually asks for.

   But cache-FIRST for everything was wrong, and it shipped a blank page.

   The shell names its assets by content hash, and deploy.sh replaces the
   published tree wholesale so stale hashed assets do not pile up forever.
   Serve a returning visitor their cached index.html and it asks for
   assets/index-<oldhash>.js — a file the deploy deleted. While the browser's
   own HTTP cache still holds it that merely pins them to an old version; once
   that expires it is a 404 and an empty <div id="app">. Reproduced: one visit,
   deploy, clear the HTTP cache, come back → 0 chars rendered.

   So freshness follows the URL, which is the only thing that knows:

     - a hashed asset is immutable by construction, so cache-first, no
       revalidation, no staleness possible — the name changes with the bytes.
     - everything else (navigations, sw.js, manifest, icon, and dev's unhashed
       modules) is network-first with a cache fallback. Online you always get
       the deploy that is actually published; offline you get the last one that
       worked, which is the whole point of the worker.

   Bumping CACHE is what rescues clients already stuck on the old logic: the
   activate handler drops every cache that is not this one. Bump it whenever
   the caching strategy changes. */

const CACHE = 'bizzington-v3';
const ENTRY = ['./', './index.html'];

/* Vite writes assets/<name>-<hash>.<ext>. The hash is what makes cache-first
   safe here, so match on it rather than on the directory: an unhashed file
   that happens to live in assets/ must not be pinned for ever. */
const immutable = (url) => /\/assets\/.+-[A-Za-z0-9_-]{8,}\.[a-z0-9]+$/.test(url.pathname);

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.allSettled(ENTRY.map((u) => c.add(u))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();

    /* Tempting to also client.navigate() every open window, so a visitor stuck
       on the old worker recovers without touching anything. Tried it: it
       deadlocks a window that is itself mid-navigation, which is exactly when
       activate fires. One reload is the honest cost of a worker upgrade, and
       the point of this version is that there is never a next time. */
  })());
});

const put = (req, res) => {
  if (res && res.ok && res.type === 'basic') {
    const copy = res.clone();
    caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
  }
  return res;
};

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;   // anything third-party: let the network decide

  /* Immutable by name — the cache can never be wrong about it. */
  if (immutable(url)) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => put(req, res))));
    return;
  }

  /* Everything else: what is published wins, and the cache is the safety net. */
  e.respondWith(
    fetch(req)
      .then((res) => put(req, res))
      .catch(async () =>
        (await caches.match(req)) ||
        /* offline and never seen: a navigation still gets the app shell */
        (req.mode === 'navigate' ? caches.match('./index.html') : Promise.reject(new Error('offline'))))
  );
});
