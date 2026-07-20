'use strict';

const CACHE_NAME =
  'cartelera-tv-v2';

const LOCAL_FILES = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener(
  'install',
  function (event) {
    event.waitUntil(
      caches
        .open(CACHE_NAME)
        .then(function (cache) {
          return cache.addAll(
            LOCAL_FILES
          );
        })
        .then(function () {
          return self.skipWaiting();
        })
    );
  }
);

self.addEventListener(
  'activate',
  function (event) {
    event.waitUntil(
      caches
        .keys()
        .then(function (cacheNames) {
          return Promise.all(
            cacheNames.map(
              function (cacheName) {
                if (
                  cacheName !== CACHE_NAME
                ) {
                  return caches.delete(
                    cacheName
                  );
                }

                return null;
              }
            )
          );
        })
        .then(function () {
          return self.clients.claim();
        })
    );
  }
);

self.addEventListener(
  'fetch',
  function (event) {
    const requestUrl =
      new URL(event.request.url);

    /*
     * No intenta almacenar Apps Script ni Google Drive.
     */
    if (
      requestUrl.origin !==
      self.location.origin
    ) {
      return;
    }

    event.respondWith(
      fetch(event.request)
        .then(function (response) {
          const responseCopy =
            response.clone();

          caches
            .open(CACHE_NAME)
            .then(function (cache) {
              cache.put(
                event.request,
                responseCopy
              );
            });

          return response;
        })
        .catch(function () {
          return caches.match(
            event.request
          );
        })
    );
  }
);
