const CACHE_NAME = 'eco-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Helper to identify API requests (Open Charge Map)
function isApiRequest(request) {
  return request.url.startsWith('https://api.openchargemap.io/');
}

self.addEventListener('fetch', event => {
  const request = event.request;

  // Network-first for API calls, with cache fallback
  if (isApiRequest(request)) {
    event.respondWith(
      fetch(request)
        .then(networkRes => {
          // optionally cache a clone
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, resClone));
          return networkRes;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // For navigation requests, try cache first, then network, fallback offline page
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Cache-first for other assets
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request).catch(() => cached))
  );
});
