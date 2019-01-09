document.addEventListener("DOMContentLoaded", async function(event) {
  if (navigator.serviceWorker.controller) {
    console.log('[PWALab] Active service worker found, no need to register');
  } else {
    let reg = await navigator.serviceWorker.register('sw.js', { scope: './'});
    console.log('[PWALab] Service worker has been registered for scope: ' + reg.scope);
  }
});