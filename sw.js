const CACHE_NAME = 'temponovo-catalogs-v1';
const ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap',
  'https://www.temponovo.cl/asset/img/temponovo-logo-color.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => 
      cache.addAll(ASSETS).catch(err => console.log('Cache error:', err))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // API calls - network only, no cache
  if (url.hostname.includes('odoo.com')) {
    e.respondWith(
      fetch(e.request).catch(() => 
        new Response('[]', { 
          headers: { 'Content-Type': 'application/json' } 
        })
      )
    );
    return;
  }

  // App shell - cache first, then network
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match('/index.html'));
    })
  );
});
