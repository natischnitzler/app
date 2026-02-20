const CACHE_VERSION = 'v3-images';
const CACHE_STATIC = 'temponovo-static-v3';
const CACHE_IMAGES = 'temponovo-images-v3';
const CACHE_API = 'temponovo-api-v3';

// Archivos estáticos para cachear
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap'
];

// Instalación del SW
self.addEventListener('install', event => {
  console.log('SW: Instalando...');
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      console.log('SW: Cacheando archivos estáticos');
      return cache.addAll(STATIC_FILES.map(url => new Request(url, {cache: 'reload'})));
    })
  );
  self.skipWaiting();
});

// Activación del SW - limpiar caches viejos
self.addEventListener('activate', event => {
  console.log('SW: Activando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (![CACHE_STATIC, CACHE_IMAGES, CACHE_API].includes(cacheName)) {
            console.log('SW: Eliminando cache viejo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercepción de requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // IMÁGENES: Cache-first con fallback a network
  if (url.pathname.includes('/api/product-image/')) {
    event.respondWith(
      caches.open(CACHE_IMAGES).then(cache => {
        return cache.match(event.request).then(cached => {
          if (cached) {
            console.log('SW: Imagen desde cache:', url.pathname);
            return cached;
          }
          
          // Si no está en cache, traer de red y guardar
          return fetch(event.request).then(response => {
            if (response && response.status === 200) {
              console.log('SW: Guardando imagen en cache:', url.pathname);
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(err => {
            console.log('SW: Error cargando imagen:', url.pathname);
            // Devolver imagen placeholder o vacía
            return new Response(JSON.stringify({error: 'Imagen no disponible offline'}), {
              headers: {'Content-Type': 'application/json'}
            });
          });
        });
      })
    );
    return;
  }
  
  // API STOCK: Network-first con fallback a cache
  if (url.pathname.includes('/api/stock')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          caches.open(CACHE_API).then(cache => {
            console.log('SW: Actualizando cache de productos');
            cache.put(event.request, response.clone());
          });
        }
        return response;
      }).catch(err => {
        console.log('SW: Sin conexión, usando cache de productos');
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          return new Response(JSON.stringify([]), {
            headers: {'Content-Type': 'application/json'}
          });
        });
      })
    );
    return;
  }
  
  // API CARACTERÍSTICAS: Network-first con fallback a cache
  if (url.pathname.includes('/api/caracteristicas')) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response && response.status === 200) {
          caches.open(CACHE_API).then(cache => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      }).catch(err => {
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          return new Response(JSON.stringify({}), {
            headers: {'Content-Type': 'application/json'}
          });
        });
      })
    );
    return;
  }
  
  // ARCHIVOS ESTÁTICOS: Cache-first
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200 && event.request.method === 'GET') {
          caches.open(CACHE_STATIC).then(cache => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      });
    })
  );
});

// Mensaje para pre-cachear imágenes
self.addEventListener('message', event => {
  if (event.data.type === 'PRECACHE_IMAGES') {
    const imageUrls = event.data.urls;
    console.log(`SW: Pre-cacheando ${imageUrls.length} imágenes...`);
    
    caches.open(CACHE_IMAGES).then(cache => {
      // Cachear de a 5 imágenes a la vez
      const BATCH_SIZE = 5;
      let processed = 0;
      
      async function processBatch(start) {
        const batch = imageUrls.slice(start, start + BATCH_SIZE);
        if (batch.length === 0) {
          console.log('SW: Pre-cache completado');
          return;
        }
        
        await Promise.all(
          batch.map(url => 
            fetch(url)
              .then(response => {
                if (response && response.status === 200) {
                  cache.put(url, response.clone());
                  processed++;
                  // Notificar progreso
                  self.clients.matchAll().then(clients => {
                    clients.forEach(client => {
                      client.postMessage({
                        type: 'PRECACHE_PROGRESS',
                        processed,
                        total: imageUrls.length
                      });
                    });
                  });
                }
              })
              .catch(err => console.log('SW: Error pre-cacheando:', url))
          )
        );
        
        // Procesar siguiente lote
        await processBatch(start + BATCH_SIZE);
      }
      
      processBatch(0);
    });
  }
});
