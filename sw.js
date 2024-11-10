const CACHE_NAME = "my-site-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/dist/img/apk-192x192.png",
  "/dist/img/apk-512x512.png",
  "/dist/img/html.webp",
  "/dist/img/css.webp",
  "/dist/img/tailwindcss.webp",
  "/dist/img/boostrap.webp",
  "/dist/img/reactjs.webp",
  "/dist/img/javascript.webp",
  "/dist/img/laravel.webp",
  "/dist/img/mysql.webp",
  "/dist/img/portfolio_profile.png",
  "/dist/img/profile.png",
  "/dist/img/portfolio/project1.jpg",
  "/dist/img/portfolio/project2.jpg",
  "/dist/img/portfolio/project3.jpg",
  "/dist/img/portfolio/project4.jpg",
  "/dist/img/portfolio/project5.png",
  "/dist/img/portfolio/project6.jpg",
  "/dist/img/certificate/certificate1.jpg",
  "/dist/img/certificate/certificate2.webp",
  "/dist/img/certificate/certificate3.webp",
  "/dist/img/certificate/certificate4.webp",
  "/dist/img/certificate/certificate5.jpg",
  "/dist/img/certificate/certificate6.jpg",
  "/dist/img/certificate/certificate7.jpg",
  "/dist/img/certificate/certificate8.jpg",
  "/dist/img/certificate/certificate9.png",
  "/dist/img/certificate/certificate10.jpg",
  "/dist/img/certificate/certificate11.jpg",
  "/dist/img/certificate/certificate12.jpg",
  "/dist/img/certificate/certificate13.jpg",
  "/dist/img/certificate/certificate14.webp",
  "/dist/img/certificate/certificate15.webp",
  "/firebase-messaging-sw.js",
  "/notification.js",
  "/dist/output.css",
  "/dist/script.js",
  "/manifest.json",
];

// Event instal Service Worker
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("error membuka cache:", error);
      })
  );
});

// aktif service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
      .catch((error) => {
        console.error("error serverWorker activate:", error);
      })
  );
});

// permintaan fetch
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isPrecachedRequest = urlsToCache.includes(url.pathname);

  if (isPrecachedRequest) {
    // Jika permintaan cache ada di urlstocache (ambil dari cache), akan kembali respond cachce
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              // Jika tidak ada di cache, ambil dari jaringan/server
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      })
    );
  } else {
    // jika tidak ada cache di urlsToCache ambil dari jaringan
    event.respondWith(fetch(event.request));
  }
});
