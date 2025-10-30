const CACHE_NAME = 'simple-pwa-v1';
const ASSETS = [
    '/simple-pwa/',
    '/simple-pwa/index.html',
    '/simple-pwa/styles.css',
    '/simple-pwa/app.js',
    '/simple-pwa/manifest.json',
    '/simple-pwa/offline.html'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const req = event.request;
    if (req.mode === 'navigate') {
        event.respondWith(fetch(req).catch(() => caches.match('/simple-pwa/offline.html')));
        return;
    }
    event.respondWith(caches.match(req).then(cached => cached || fetch(req)));
});
