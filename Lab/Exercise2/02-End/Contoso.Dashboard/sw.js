//Install stage sets up the index page (home page) in the cache and opens a new cache
self.addEventListener('install', function(event) {
    event.waitUntil(preLoad());
  });

  var preLoad = function(){
    console.log('[PWALab] Install Event processing');
    return caches.open('pwabuilder-offline').then(function(cache) {
      console.log('[PWALab] Cached index and offline page during Install');
      return cache.addAll(
        [
          '/index.html', 
          '/404.html', 
          '/blank.html', 
          '/charts.html',
          '/tables.html'
        ]);
    });
  };
  
  //If any fetch fails, it will look for the request in the cache and serve it from there first
  self.addEventListener('fetch', function(event) {
    var updateCache = function(request){
      return caches.open('pwabuilder-offline').then(function (cache) {
        return fetch(request).then(function (response) {
          console.log('[PWALab] add page to offline ' + response.url);
          return cache.put(request, response);
        });
      });
    };
  
    event.waitUntil(updateCache(event.request));
  
    event.respondWith(
      fetch(event.request).catch(function(error) {
        console.log( '[PWALab] Network request Failed. Serving content from cache: ' + error );
  
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