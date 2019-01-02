if (navigator.serviceWorker.controller) {
    console.log('[PWA Builder] active service worker found, no need to register');
  } else {
    //Register the ServiceWorker
    navigator.serviceWorker.register('sw.js', {
      scope: './'
    }).then(function(reg) {
      console.log('Service worker has been registered for scope:'+ reg.scope);    
    });
  }
  
  navigator.serviceWorker.ready.then(function(reg) {
    reg.pushManager.getSubscription()
      .then(function (subscription) {
        if (subscription) {
            console.log('Push subscription already exists');
            return subscription;
        }
        else {
          console.log('Push subscription does not exist. We will request a new one');
          fetch('http://localhost:5000/api/push/key')
          .then(function(response) {
            response.json()
            .then(function(data) {
              reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(data)
              })
              .then(function (subscription) {
                fetch('http://localhost:5000/api/push/channel', {
                      method: 'post',
                      headers: { 'Content-type': 'application/json' },
                      body: JSON.stringify({ subscription: subscription })
                }).then(function (result) {
                    console.log('The push subscription has been stored succesfully');
                })
                .catch(function (error) {
                    console.log(error);
                });
              });
            });
          });
        }
      });
  });
  
  
  
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

 