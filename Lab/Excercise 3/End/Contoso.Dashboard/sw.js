//This is the "Offline copy of pages" service worker

//Install stage sets up the index page (home page) in the cache and opens a new cache
self.addEventListener('install', function(event) {
    event.waitUntil(preLoad());
  });

  var preLoad = function(){
    console.log('[PWA Builder] Install Event processing');
    return caches.open('pwabuilder-offline').then(function(cache) {
      console.log('[PWA Builder] Cached index and offline page during Install');
      return cache.addAll(
        [
          '/index.html', 
          '/404.html', 
          '/blank.html', 
          '/charts.html',
          '/tables.html'
        ]);
    });
  }

  // self.addEventListener('fetch', function(event) {
  //   event.respondWith(
  //     fetch(event.request)
  //     .catch(function (error) {
  //       return caches.open('pwabuilder-offline').then(function (cache) {
  //         return cache.match(event.request).then(function (matching) {
  //           var report =  !matching || matching.status == 404 ? cache.match('404.html'): matching;
  //           return report;
  //         });
  //       });
  //     })
  //   );
  // });


  
  //If any fetch fails, it will look for the request in the cache and serve it from there first
  self.addEventListener('fetch', function(event) {
    var updateCache = function(request){
      return caches.open('pwabuilder-offline').then(function (cache) {
        return fetch(request.clone()).then(function (response) {
          console.log('[PWA Builder] add page to offline '+response.url);
          return cache.put(request, response);
        });
      });
    };
  
    event.waitUntil(updateCache(event.request));
  
    event.respondWith(
      fetch(event.request).catch(function(error) {
        console.log( '[PWA Builder] Network request Failed. Serving content from cache: ' + error );
  
        //Check to see if you have it in the cache
        //Return response
        //If not in the cache, then return error page
        return caches.open('pwabuilder-offline').then(function (cache) {
          return cache.match(event.request).then(function (matching) {
            var report =  !matching || matching.status == 404 ? cache.match('404.html'): matching;
            return report;
          });
        });
      })
    );
  });
  
self.addEventListener('push', function (event) {
  var data = JSON.parse(event.data.text());

  event.waitUntil(
      registration.showNotification(data.title, {
          body: data.message,
          icon: "/images/contoso.jpg"
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

