// This is the service worker with the Cache-first network

const CACHE = "pjkr-winter-precache";

// Add list of files to cache here.
const precacheFiles = [
  '/',
  '/manifest.json',
  '/logo.png',
];

self.addEventListener("install", function (event) {
  console.log("[PWA] Install Event processing");

  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      console.log("[PWA] Cached offline page during install");
      return cache.addAll(precacheFiles);
    })
  );
});

self.addEventListener("activate", function (event) {
  console.log("[PWA] Activate Event processing");

  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (key !== CACHE) {
          console.log("[PWA] Removing old cache", key);
          return caches.delete(key);
        }
      }));
    })
  );
});

self.addEventListener("fetch", function (event) {
  console.log("[PWA] Fetch Event", event.request.url);

  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) {
        console.log("[PWA] Found in Cache", event.request.url);
        return response;
      }
      
      return fetch(event.request)
        .then(function (response) {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          let responseToCache = response.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(function () {
          return caches.match("/");
        });
    })
  );
});
