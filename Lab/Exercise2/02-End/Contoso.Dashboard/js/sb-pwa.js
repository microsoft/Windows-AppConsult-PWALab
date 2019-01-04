if (navigator.serviceWorker.controller) {
    console.log('[PWALab] Active service worker found, no need to register');
} else {
  //Register the ServiceWorker
  navigator.serviceWorker.register('sw.js', {
    scope: './'
  }).then(function(reg) {
    console.log('[PWALab] Service worker has been registered for scope: ' + reg.scope);    
  });
}