const CACHE_NAME = 'laurel-library-v1.1';
const OFFLINE_URL = '/index.html';

const PRECACHE_URLS = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/features.js',
    '/assets/js/search.js',
    '/assets/js/app.js',
    '/manifest.json'
];

// Install: precache shell assets
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(PRECACHE_URLS);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    return name !== CACHE_NAME;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener('fetch', function(event) {
    var request = event.request;

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // HTML pages: network first, fallback to cache
    if (request.headers.get('Accept') && request.headers.get('Accept').includes('text/html')) {
        event.respondWith(
            fetch(request).then(function(response) {
                // Cache successful responses
                if (response.ok) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(request, clone);
                    });
                }
                return response;
            }).catch(function() {
                return caches.match(request).then(function(cached) {
                    return cached || caches.match(OFFLINE_URL);
                });
            })
        );
        return;
    }

    // Static assets: cache first, fallback to network
    event.respondWith(
        caches.match(request).then(function(cached) {
            if (cached) return cached;
            return fetch(request).then(function(response) {
                if (response.ok) {
                    var clone = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(request, clone);
                    });
                }
                return response;
            });
        })
    );
});
