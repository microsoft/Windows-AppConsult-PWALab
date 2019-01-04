if (navigator.serviceWorker.controller) {
    console.log('[PWA Builder] Active service worker found, no need to register');
} else {
  //Register the ServiceWorker
  navigator.serviceWorker.register('sw.js', {
    scope: './'
  }).then(function(reg) {
    console.log('[PWA Builder] Service worker has been registered for scope: ' + reg.scope);    
  });
}