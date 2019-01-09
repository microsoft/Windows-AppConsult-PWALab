document.addEventListener("DOMContentLoaded", async function(event) {
  if (navigator.serviceWorker.controller) {
    console.log('[PWALab] Active service worker found, no need to register');
  } else {
    let reg = await navigator.serviceWorker.register('sw.js', { scope: './'});
    console.log('[PWALab] Service worker has been registered for scope: ' + reg.scope);
  }


let permission = await Notification.requestPermission();
console.log("[PWALab] Notification permission: " + permission);

let reg = await navigator.serviceWorker.ready;
  let perm = await Notification.requestPermission();
  if (perm === 'granted') {
    let subscription = await reg.pushManager.getSubscription();
    if (subscription) {
      console.log('Push subscription already exists');
      return subscription;
    }
    else {
      console.log('[PWALab] Push subscription does not exist. We will request a new one');
      let vapidKey = await getVAPIDkey();
      let subscription = await reg.pushManager.subscribe({
        userVisibleOnly : true,
        applicationServerKey : urlBase64ToUint8Array(vapidKey)
      });
      
      await postSubscription(subscription);
    }
  }
  else {
    console.log('[PWALab] Permission not granted for push notifications');
  }
});

async function getVAPIDkey() {
  let response = await fetch('http://localhost:5000/api/push/key');
  let json = await response.json();
  return json;
}

async function postSubscription(subscription) {
  try {
    let response = await fetch('http://localhost:5000/api/push/channel', {
      method: 'post',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ subscription: subscription })
    });
    console.log('[PWALab] The push subscription has been stored succesfully');
  }
  catch (error) {
    console.log('[PWALab] Error saving the subscription: ' + error);
  }
}
  

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);

  for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

 