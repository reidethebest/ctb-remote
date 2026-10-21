// Service worker: la app abre al instante y sin internet (la conexión con el juego es aparte, por WebSocket).
const CACHE = 'ctb-remote-b19ccd715d';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-180.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // ntfy y el juego van directo
  const key = e.request.mode === 'navigate' ? './index.html' : e.request;
  // Caché primero (instantáneo) y se actualiza en segundo plano para la próxima vez
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(key, { ignoreSearch: e.request.mode === 'navigate' });
    const net = fetch(e.request).then(r => { if (r.ok && e.request.mode !== 'navigate') c.put(e.request, r.clone()); return r; }).catch(() => hit);
    return hit || net;
  }));
});
