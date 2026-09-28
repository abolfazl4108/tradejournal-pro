const CACHE_NAME = 'tradejournal-v3.6';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@300;400;500;600;700&family=Inter:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap'
];

self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(urlsToCache).catch(function(err){
        console.log('Cache addAll failed:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(cacheNames){
      return Promise.all(
        cacheNames.map(function(name){
          if(name !== CACHE_NAME) return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event){
  if(event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(response){
      if(response) return response;
      return fetch(event.request).then(function(networkResponse){
        if(!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'opaque'){
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(function(cache){
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(function(){
        return caches.match('./index.html');
      });
    })
  );
});
