/* =========================================================================
   TELECORP ERP - ADVANCED OFFLINE / ONLINE SERVICE WORKER
   Version: 1.0.0
   ========================================================================= */

const CACHE_NAME = 'telecorp-erp-v1';

// Critical shell resources to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon.svg'
];

// Install Event: Precache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Precache asset fetch issue:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent Offline/Online Interception
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST, PUT, DELETE)
  if (request.method !== 'GET') {
    return;
  }

  // Ignore Chrome Extensions and special schemes
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation Requests (Page reloads, deep URLs like /dashboard, /inventory)
  // Strategy: Network-First with Cache fallback for Offline support
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback: serve cached index.html or root
          const cachedResponse = await caches.match(request);
          if (cachedResponse) return cachedResponse;

          const indexFallback = await caches.match('/index.html');
          if (indexFallback) return indexFallback;

          const rootFallback = await caches.match('/');
          if (rootFallback) return rootFallback;

          return new Response('TeleCorp ERP is running in offline mode. Please reload.', {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          });
        })
    );
    return;
  }

  // 2. Same-Origin Static Assets (Vite chunks: .js, .css, .woff2, .svg, .png)
  // Strategy: Stale-While-Revalidate (serve fast from cache, update in background)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch((err) => {
            // When offline, this catch will trigger if not in cache
            return cachedResponse;
          });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // 3. External Resources (Google Fonts, Supabase API, Icons CDN)
  // Strategy: Network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        // Cache successful responses for CDNs/fonts
        if (networkResponse && networkResponse.status === 200 && url.origin !== self.location.origin) {
          // Do not cache authenticated Supabase REST queries
          if (!url.hostname.includes('supabase.co')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Return synthetic offline response if offline
        return new Response(JSON.stringify({ offline: true, error: 'Network unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      })
  );
});

// Listen for message events (e.g. skipWaiting trigger from UI)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
