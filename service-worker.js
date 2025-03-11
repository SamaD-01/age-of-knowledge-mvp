const CACHE_NAME = "mvp-game-cache-v1";
const urlsToCache = [
    "index.html",
    "style.css",
    "main.js",
    "questions.json",
    "icons/icon-192x192.png",
    "icons/icon-512x512.png",
    "aces.png",
    "board.png",
    "card-back.png",
    "card-front.png",
    "clover.png",
    "DICE-1.png",
    "DICE-2.png",
    "DICE-3.png",
    "DICE-4.png",
    "DICE-5.png",
    "DICE-6.png",
    "pawn_blue.png",
    "pawn_yellow.png",
    "skull.png",
    "winner_banner.png",
    "slide.mp3",
    "winning.mp3",
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cache) => cache !== CACHE_NAME).map((cache) => caches.delete(cache))
            );
        })
    );
});
