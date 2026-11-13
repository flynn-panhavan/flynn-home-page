/* Flynn Home Page service worker: offline support.
   Bump VERSION when you change this file's caching rules. */
const VERSION = 'v1';
const SHELL = 'flynn-shell-' + VERSION;
const RUNTIME = 'flynn-runtime-' + VERSION;
const PRECACHE = [
  './', 'index.html', 'style.css', 'script.js', 'favicon.svg', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'
];
/* third-party files the page needs to look right offline */
const CDN = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];
const FAVICONS = 'www.google.com';          /* only /s2/favicons */
const NETWORK_TIMEOUT = 3500;               /* ms before falling back to cache */

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keep = [SHELL, RUNTIME];
    for (const k of await caches.keys()) if (k.startsWith('flynn-') && !keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

/* own files: network first (always fresh when online), cache when offline or slow */
async function networkFirst(req) {
  const cache = await caches.open(SHELL);
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), NETWORK_TIMEOUT))
    ]);
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req, { ignoreSearch: true });
    if (hit) return hit;
    if (req.mode === 'navigate') { const page = await cache.match('index.html'); if (page) return page; }
    throw err;
  }
}

/* third-party files: serve cached copy instantly, refresh in the background */
async function staleWhileRevalidate(req) {
  const cache = await caches.open(RUNTIME);
  const hit = await cache.match(req);
  const fresh = fetch(req).then(res => {
    if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return hit || (await fresh) || Response.error();
}

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    if (url.pathname.endsWith('/sw.js')) return;   /* let the browser handle updates */
    e.respondWith(networkFirst(req));
  } else if (CDN.includes(url.hostname) || (url.hostname === FAVICONS && url.pathname.startsWith('/s2/favicons'))) {
    e.respondWith(staleWhileRevalidate(req));
  }
  /* everything else (weather API, searches, shortcuts) goes straight to the network */
});
