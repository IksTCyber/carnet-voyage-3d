// Service worker : l'application marche hors ligne et se met à jour toute seule
const CACHE = 'carnet3d-049e191851';
const FILES = ["./", "index.html", "manifest.webmanifest", "three.min.js", "OrbitControls.js", "world.json", "cities.txt", "tex-day.jpg", "tex-night.jpg", "tex-clouds.jpg", "tex-water.jpg", "tex-topo.jpg", "icon-192.png", "icon-512.png", "favicon.png", "apple-touch-icon.png"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('carnet3d-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Page : réseau d'abord (pour avoir la dernière version), cache si hors ligne
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(ca => ca.put('index.html', c)); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  // Fichiers de l'appli et polices : cache d'abord
  if (url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok || r.type === 'opaque') { const c = r.clone(); caches.open(CACHE).then(ca => ca.put(req, c)); }
      return r;
    })));
  }
});
