//Install stage sets up the index page (home page) in the cache and opens a new cache
self.addEventListener('install', function(event) {
  event.waitUntil(preLoad());
});

var preLoad = async function() {
  console.log('[Service Worker] Install Event processing');
  let cache = await caches.open('pwabuilder-offline');
  console.log('[Service Worker] Cached index and offline page during Install');
  return cache.addAll(
    [
      '/index.html', 
      '/404.html', 
      '/blank.html', 
      '/charts.html',
      '/tables.html',
      '/offline.html'
    ]);
}

self.addEventListener('fetch', function (event) {

  var updateCache = async function (request) {
    let cache = await caches.open('pwabuilder-offline');
    let response = await fetch(request);
    await cache.put(request, response);
  }

  var fetchRequest = async function(request) {
    try {
      let response = await fetch(request);
      return response;
    }
    catch (error) {
      console.log( '[PWA Builder] Network request Failed. Serving content from cache: ' + error );
      let cache = await caches.open('pwabuilder-offline');
      let matching = await cache.match(event.request);
      let report =  !matching || matching.status == 404 ? await cache.match('offline.html'): matching;
      return report;
    }
  }

  event.waitUntil(updateCache(event.request));
  event.respondWith(fetchRequest(event.request));
});

self.addEventListener('push', function (event) {
  var data = JSON.parse(event.data.text());

  event.waitUntil(
      registration.showNotification(data.title, {
          body: data.message,
          icon: "/images/contoso.png"
      })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var notification = event.notification;
  var title = notification.title;
  var message = notification.body;

  event.waitUntil(clients.openWindow('notifications.html?title='+title+'&message='+message));
});

