/**
 * Service Worker for FunWebGames
 * Provides offline support by caching all game assets
 */

const CACHE_NAME = 'funwebgames-v1';
const OFFLINE_URL = 'offline.html';

// Files to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/shared.css',
  '/js/highscore.js',
  '/js/help-modal.js',
  '/js/sound-toggle.js',
  '/manifest.json',
  '/offline.html'
];

// Game files to cache
const GAME_ASSETS = [
  '/games/color-match/index.html',
  '/games/color-match/style.css',
  '/games/color-match/script.js',
  '/games/animal-puzzle/index.html',
  '/games/animal-puzzle/style.css',
  '/games/animal-puzzle/script.js',
  '/games/bubble-pop/index.html',
  '/games/bubble-pop/style.css',
  '/games/bubble-pop/script.js',
  '/games/shape-builder/index.html',
  '/games/shape-builder/style.css',
  '/games/shape-builder/script.js',
  '/games/counting-garden/index.html',
  '/games/counting-garden/style.css',
  '/games/counting-garden/script.js',
  '/games/letter-explorer/index.html',
  '/games/letter-explorer/style.css',
  '/games/letter-explorer/script.js',
  '/games/music-maker/index.html',
  '/games/music-maker/style.css',
  '/games/music-maker/script.js',
  '/games/maze-runner/index.html',
  '/games/maze-runner/style.css',
  '/games/maze-runner/script.js',
  '/games/star-catcher/index.html',
  '/games/star-catcher/style.css',
  '/games/star-catcher/script.js',
  '/games/dress-up/index.html',
  '/games/dress-up/style.css',
  '/games/dress-up/script.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      // Cache game assets
      return caches.open(CACHE_NAME).then((cache) => {
        console.log('[ServiceWorker] Caching game assets');
        return cache.addAll(GAME_ASSETS);
      });
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached response
        return cachedResponse;
      }
      
      // Not in cache - fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Don't cache non-successful responses
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // Clone the response
        const responseToCache = networkResponse.clone();
        
        // Add to cache
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // Offline - return offline page for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match(OFFLINE_URL);
        }
        
        // For other requests, return a simple offline response
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});
