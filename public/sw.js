/* ============================================================================
   Bihar AI Mission — Progressive Web App Service Worker (PWA)
   ============================================================================ */

const CACHE_NAME = 'bihar-ai-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/bi_logo.png',
  '/favicon.png',
  '/static/js/bundle.js'
];

// 1. Install Event — Cache Core Static Assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => console.warn('[PWA SW] Cache warning:', err));
    })
  );
});

// 2. Activate Event — Clean up Old Caches & Take Control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[PWA SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event — Network-First for Navigation, Stale-While-Revalidate for Assets
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests or Supabase/API calls
  if (
    event.request.method !== 'GET' ||
    event.request.url.includes('/supabase.co') ||
    event.request.url.includes('chrome-extension') ||
    event.request.url.includes('loca.lt')
  ) {
    return;
  }

  // For HTML navigation requests, ALWAYS prioritize the network to prevent stale page caches
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Stale-While-Revalidate for other static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
