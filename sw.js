const CACHE_NAME = 'minmaxmd-v5';

// Resources to cache immediately
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event: Cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude Gemini API calls from caching
  if (url.hostname.includes('generativelanguage.googleapis.com')) {
    return;
  }

  // Navigation requests (HTML): Network First, Fallback to Cache
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Check for valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
             // If network returns 404 or error, try cache
             return caches.match('/index.html')
               .then(cached => cached || response); 
          }
          
          // Cache the fresh copy
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Network failed, return cached index.html
          return caches.match('/index.html').then(cachedResponse => {
              if (cachedResponse) {
                  return cachedResponse;
              }
              // If index.html isn't in cache, return a basic offline response to prevent crash
              return new Response(
                  '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="background:#f0f2f5;font-family:sans-serif;padding:2rem;text-align:center;"><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
                  { headers: { 'Content-Type': 'text/html' } }
              );
          });
        })
    );
    return;
  }

  // Assets (JS, CSS, Images): Cache First, Fallback to Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        // Check for valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
          // If asset fetch fails, return undefined (browser handles missing image)
          // or you could return a placeholder image here
          return undefined;
      });
    })
  );
});