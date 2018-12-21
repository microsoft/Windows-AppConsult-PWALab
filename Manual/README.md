# Turn your website into a fully featured app with PWA

## Introduction

### Estimated time
90 minutes

### Objectives
- Understand which are the key components that make a Progressive Web App
- Learn how you can turn an existing website into a Progressive Web App
- Learn how to create a manifest file for your website
- Learn how to build a service worker
- Understand how a service worker can help you caching the incoming requests so that you can provide an offline experience
- Learn some of the caching techniques which are available
- Learn how a service worker can support push notifications
- Understand which the requirements for a backend are to send push notifications to a Progressive Web App

### Prerequisites

- Good knowledge of HTML and JavaScript
- Basic knowledge of C#

### Overview of the lab

The lab consists of three exercises, which will help you to take an existing website and gradually enhance it to turn it into a Progressive Web App. 
1. In the first exercise you will add a manifest to the website, which is a JSON file that describes it. Thanks to the manifest, you will be able to directly “install” the website from the browser and use it on your phone or PC like if it’s a native application.
2. In the second exercise you will add a service worker, which is a special JavaScript process that runs in background and acts as a middle man between the browser and the website. Thanks to the Service Worker you’ll be able to implement different caching techniques, which will allow the website to be partially used also when you’re offline.
3. In the third and last exercise, you will leverage the service worker to add support for push notifications. Your Progressive Web App will be able to receive notifications from a backend even when the browser is closed.

### Computers in this lab
This lab uses a single Virtual Machine to provide you with the development environment. The VM settings are reported in the table below. Before you begin the lab, please make sure the VM is started and you are logged on to using the credentials provided below. 

- **Username**: 
- **Password**:

The virtual machine is based on Windows 10 October Update (1809) and it includes:
- Visual Studio 2017
- Visual Studio Code
- Google Chrome

If you already have these tools on your computer, feel free to directly use it for the lab instead of the virtual machine.

### Scenario
Contoso Dashboard is a web application used by internal support team to keep track of all the activities that are happening inside the company. The website provides, at a glance, important information like the number of received support tickets, the open tasks, the incoming orders, the list of employees, etc.
The website is satisfying all the requirements of a modern websites: it's based on HTML5, JavaScript and CSS and it leverages an adaptive layout. The user interface quickly adapts to the size of the screen, so that it can be used on any device, regardless if it's a desktop machine or a mobile phone.

The development team is now looking to further enhance the website and to provide to the users a "native-like" experience, so that it could be easily installed and launched like if it's a native desktop or mobile application. Additionally, they're looking to provide some offline capabilities, so that the critical information provided by the dashboard can be accessed even when the Internet connection is missing.

### The project
The Contoso Dashboard website is built using [Bootstrap](https://getbootstrap.com/), the popular web framework to build responsive web applications. It doesn't have a server-side component. The whole project runs client side and it's based only on HTML, CSS and JavaScript.
The information displayed in the dashboard are taken from a set of REST services, which are deployed on Azure using the Azure Functions offering. However, for the purpose of this lab, you will just consume these services and you don't have to worry how they have been implemented.

### Key concepts that will be used during the lab

#### Service Workers
In the typical web workflow, when you visit a website there's a direct connection between the browser and Internet. The browser sends a bunch of HTTP requests to the server, which replies back with the requested resources.

Service workers are a separate process, hosted by a JavaScript file, which can be installed by a website. In this scenario, the service worker is injected as a middle man between the browser and Internet. When the browser performs a HTTP request, it isn't directly sent to the server but it's intercepted first by the service worker. At this point, the service worker has the opportunity to perform different operations, based on the strategy we want to implement as developers. It could forward the request directly to the server and then cache it; it could send the request to the cache and, only if it isn't found, forward it to the server. During this lab we'll explore different caching techniques that can be implemented with a service worker.

Another important feature is that service workers can run in the background, even when the browser is not opened. As a consequence, service workers are leveraged also to support push notifications. This way, a Progressive Web App or a website can receive notifications even when the user isn't browsing the website or he's using another application.

#### Promises
Promises are a modern way to handle with asynchronous operations in JavaScript. In the past, this scenario has typically been implemented with callbacks. You define one or more functions and then you assign them to handle different events. For example, this how you implement a HTTP request using the **XMLHttpRequest** API, which is based on the callback approach:

```javascript
function success() {
  var data = JSON.parse(this.responseText);
  console.log(data);
}

function error(err) {
  console.log('Fetch Error :-S', err);
}

var request = new XMLHttpRequest();
request.onload = success;
request.onerror = error;
request.open('get', './api/data.json', true);
request.send();
```

The API exposes two events, **onload** (which is invoked when the operation has been completed with success) and **onerror** (which is invoked when the connection has failed). The first one is associated to a function called **success()**, which takes the response and parses it; the second one, instead, triggers a function called **error** which logs the exception in the console.

This approach has multiple downsides, like:

- It's hard to understand the chain of events
- It's hard to combine multiple asynchronous events together
- Callbacks may be called before the completion of the current JavaScript run loop

A **Promise** is an object representing the eventual completion or failure of an asynchronous operation. This is, for example, how the previous sample could be written using the Fetch API, which is based on the Promises approach:

```javascript
fetch('./api/data.json')
  .then(
    function(response) {
       // Examine the text in the response
      response.json().then(function(data) {
        console.log(data);
      });
    }
  )
  .catch(function(err) {
    console.log('Fetch Error :-S', err);
  });
```

The actions that must be executed only when the operation is completed are specified using the **then()** constructor. The error, instead, can be easily intercepted by chaining a **catch()** statement.
Since the **then()** method returns another Promise, it's easy to chain multiple asynchronous events together. For example, in the previous sample you can notice how, if the network operation has completed successfully, we call another asynchronous method, **json()**, which parses the response as a JSON document. 

We're going to heavily use Promises during the lab, since all the APIs exposed by the service worker are based on this approach.

#### Fetch APIs
We have already seen this API in action talking about Promises. Fetch is a new modern API to perform HTTP operations in JavaScript. Despite the name, these APIs can be used to perform any kind of HTTP requests, not only GET but also POST, PUT, DELETE, etc.

The service worker is able to intercept all the fetch operations happening inside the page. This is a key requirement to implement offline scenarios, since it will allow us to intercept all the network operations and cache them, based on the technique we have decided to adopt.

#### Cache APIs
The Cache interface provides a storage mechanism specific for handling network requests. Its purpose, in fact, isn't to store generic key / value pairs, but specifically Request / Responses object pairs. This is how caching implemented using these APIs looks like:

![](CachingPreview.png)

For each request, the Cache interface stores all the information about the HTTP request. The key identifier is the path of the resource, while the associated value is the full HTTP request, including the content.
This means that, when we load a resource from the cache, we are able to retrieve its full content, regardless if it's a HTML page, a JavaScript file, a JSON response, etc.

We're going to leverage the cache APIs in the service worker, in combination with the Fetch APIs. If the Fetch operation fails, we're going to return the response from the cache instead from the server. However, cache APIs can be leveraged also from web pages if you need to implement more complex scenarios. For example, to make the website more responsive, you could immediately load some data from the Cache directly inside the page and, only later, update it with the response coming from the network.

### The tools
For this lab we're going to use [Visual Studio Code](https://code.visualstudio.com/), the popular open source and cross-platform code editor. We will use it to edit the website and add the require code to implement the various features which will turn your website into a Progressive Web App.

Inside Visual Studio Code we're going to leverage also an extension called [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), which is able to quicly spin a web server to host web applications. Thanks to this extension, we'll be able to quickly test the changes we're going to make to the website. The server supports also live reloading: every time we're going to make any change to the code of the website, the browser will be automatically reloaded.
Using this extension is very easy. Just open in Visual Studio Folder which contains the website and press the **Go Live** button highlighted in the image below:

![](golive.png)

Lastly, we're going to use Google Chrome as a web browser for testing. The included developer tools, in fact, supports many useful features for our scenario, like displaying the registered service workers, exploring the cache, simulating the lack of Internet connection, etc.

## Exercise 2 - Adding offline capabilities
One of the key requirements to turn our Contoso Dashboard website into an application is adding offline capabilities, so that at least some portions of it could be used also when the user doesn’t have an Internet connection or when he might be in a situation where the connection drops frequently (e.g. he’s in an area with a weak cellular connection).

The current web application doesn’t have any kind of offline capability. Since our website is running with a local server, it will continue to work even if we disconnect our computer from Internet. However, we can test this scenario using the developer’s tools included in Chrome.

1.	Open Visual Studio Code and choose Open folder.
2.	Select the folder *add the path of the folder*, which contains the final output of Exercise 1
3.	Select the **index.html** file from the Explorer on the left
4.	Press the **Go live** button in the bottom taskbar
5.	Wait for the server to start and for the website to open inside Chrome. It will be available ath the address **http://127.0.0.1:5050**. Notice that the website is loading properly, since the connection is active.
6.	Now press F12 to turn on the developer tools.
7.	Move to the **Network** tab.
8.	Click on **Offline**
9.	Reload the website. Notice how the browser is returning an error because it can’t reach the server anymore.

![](nointernet.png)

### Task 1 - Add a service worker
As already mentioned at the beginning of the lab, the Service Worker is a component that acts as a middle man between the browser and the server. When a website registers a service worker it’s able to intercept all requests, so that it can redirect them to the most appropriate source: Internet or the browser’s cache.

Let’s start to add a basic service worker to our Contoso Dashboard website. 

1. Go back to Visual Studio Code and press the **New file** button in the Explorer panel.

    ![](newfile.png)

2. Name it **sw.js**
3. For the moment, we aren't going to implement any special caching strategy. We're just going to forward all the incoming requests to the server. Copy and paste the following snippet inside the **sw.js** file:

    ```javascript
    self.addEventListener('fetch', function (event) {
        event.respondWith(fetch(event.request));
      });
    ```
    
    We subscribe to the **fetch** event, which is triggered every time the browser performs a HTTP request against the server. Thanks to the **event.respondWith()** function we intercept the operation, so that we can handle it instead of the browser. However, in this case we are going to behave exactly like the browser, so we simply invoke the **fetch** API passing, as parameter, the original request. This way, it will be forwarded to the server.

4.	Now expand the **js** folder in the Explorer panel and press again the **New file** button. Name it **sb-pwa.js**. This is the file where we're going to implement all the logic to register the service worker.
5.	Copy and paste the following code snippet:

    ```javascript
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
    ```

    This code first checks if a Service Worker is already registered, by checking if the **navigator.serviceWorker.controller** exists. If that’s the case, we don’t have to do anything. Otherwise, we move on with the registration process by calling the **navigator.serviceWorker.register()** method, which requires two parameters:
    - The filename of the JavaScript file which will act as a service worker. The path should be relative to the root of the website. We specify the name of the file we have previously created, which is **sw.js**.
    - A set of additional parameters for the configuration. The key one is called **scope**, which specifies the resources the service worker will be able to access to. Since we want to handle the whole website, we have placed the sw.js file in the root and we specify **./** as scope. 
    The **register()** method is asynchronous and it’s based on the Promises approach. As such, we can use the **then()** function to chain another operation which must be executed once the operation has been completed. In our case, we just log a message in the browser’s console.

That’s it! If you want to test that the service worker has been installed properly, open the URL **http://127.0.0.1:5050** in Chrome and press F12 to enable the developer tools. Move to the **Application** tab and you should see something like this:

![](serviceworkerinstalled.png)

The service worker has been properly installed and it’s up and running. We can verify that it's indeed acting as a middle man between the browser and the server by moving to the **Network** tab and reloading the page. You will notice that all the request will be coming from the service worker and not directly from the server:

![](networkserviceworker.png)

However, the current implementation of the service worker is basically useless. We're just forwarding all the incoming requests to the server, which is something the browser would do anyway.
Let's move to the second task to start adding offline capabilities.

### Task 2 - Enable caching at install time
A common scenario for a Progressive Web App is to cache, immediately when the service worker is installed for the first time, a set of pages that could be commonly visited by the user or which content could be leveraged also offline.

Let’s take a look at the structure of our web application in the Explorer panel of Visual Studio Code:

![](explorerproject.png)

We can identify the following HTML pages:

- 404.html
- blank.html
- charts.html
- forgot-password.html
- index.html
- login.html
- register.html
- tables.html

> Can you identify which are good candidates for being cached when the service worker is installed?

Here is the list with, highlighted in bold, the pages which should be cached when the service worker is installed:

- **404.html**
- **blank.html**
- **charts.html**
- forgot-password.html
- **index.html**
- login.html
- register.html
- **tables.html**

These are the pages that contains information which should be available to the user regarldess of the status of his Internet connection. All the others aren’t a good candidate since they are dedicated to performing actions (logging in, registering a new account, etc.) which would be impossible to complete anyway offline.

Let’s define a new function to cache these pages inside the service worker:

1.	Open in Visual Studio Code the **sw.js** file
2.	Copy and paste the following snippet at the beginning of the file:

    ```javascript
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
    ```
    
    This code uses the Cache APIs to open the cache we have created for our application, by using the **open()** method exposed by the caches object. The name of the cache doesn’t have to follow a specific naming convention, you can use the one you prefer. In our case, we're using **pwabuilder-offline**. This method will created the cache if it doesn't exist, so it's safe to call it even if it's the first time the web application is opened. When the open operation is completed with success, we can move on and store some pages using the **addAll()** method, passing as parameter an array of strings with the list of pages we want to include in the cache.
    
3.	The next step is to invoke the above function as soon as the service worker is installed. We can use one of the events exposed by the service worker, called install. Copy and paste the follow snippet before the **preLoad()** function:

    ```javascript
    self.addEventListener('install', function(event) {
        event.waitUntil(preLoad());
      });
    ```
    
    The **waitUntil()** method exposed by the event API is used to tell to the browser that work is ongoing until the promise settles, and it shouldn't terminate the service worker if it wants that work to complete. This way the **preLoad()** function will be invoked as soon as the service worker is deployed and the caching operation won’t be aborted as long as it’s still running.

4.	Now return to Chrome, make sure it’s still open on the website and that the developers tools are turned on. 
5.	Move to the **Application** tab and press **Unregister** near the service worker. Then close Chrome. This step will make sure that the updated service worker will be deployed and it will replace the old one.
6.  Open again the Chrome on the Contoso Dashboard website. In case you need it, remember that the URL of the local server is **http://127.0.0.1:5050**
7.	Press again F12 and open the developer tools. Move again to the **Application** tab.
8.	Expand the **Cache** section: you should see a cache with the same name you have used in the JavaScript code, which is **pwabuilder-offline**. On the right, you will see all the content that has been cached.
9.	Notice how, despite you have visited only the main page of the websites, also other pages have been cached:

    ![](cacheall.png)
    
    These are the pages that we have manually added to the cache when the service worker has been installed.

However, the code we have written so far isn't enough. If we move to the **Network** tab, we check **Offline** and we reload the website we will see the same offline browser error.

> Can you guess why is it happening?

The code we have written simply takes care of adding the desired pages in the cache, but the event handler of the **fetch** event is still the same. As such, all the incoming requests are directly forwarded to the web server.

We need to change the current handler of the **fetch** event in a way that, if the request can't be forwarded to the server, it will be returned from the cache.

1. Open again the **sw.js** file in Visual Studio Code
2. Look for the snippet we have previously added to handle the **fetch** event and delete it
3. Copy and paste the following new handler:

    ```javascript
    self.addEventListener('fetch', function(event) {
      event.respondWith(
        fetch(event.request)
        .catch(function (error) {
          return caches.open('pwabuilder-offline').then(function (cache) {
            return cache.match(event.request).then(function (matching) {
              var report =  !matching || matching.status == 404 ? cache.match('404.html'): matching;
              return report;
            });
          });
        })
      );
    });
    ```
    We are still intercepting the browser request with the **event.respondWith()** method and we're still forwarding it directly to the server with the **fetch()** API. However, we have added a **catch()** handler, which is triggered in case the connection to the server fails.
    In this scenario we use the **caches.open()** method to get access to the cache we have created when we have registered the service worker. Then, using the **cache.match()** method, we look if the current request is available inside the cache. If you remember what we have explained in the introduction, the caching interface uses a key / value pair implementation where the key is the request itself. As such, we use the **event.request** property as identifier. In case we get a match, we return the cached response. Otherwise, we will redirect the user to a dedicated offline page called **offline.html**.

It's now time to test the code:

1. Open Chrome, make sure it’s still open on the website and that the developers tools are turned on. 
2. Move to the **Application** tab and press **Unregister** near the service worker. Then close Chrome. This step will make sure that the updated service worker will be deployed and it will replace the old one.
3. Open again the Chrome on the Contoso Dashboard website. In case you need it, remember that the URL of the local server is **http://127.0.0.1:5050**
4. Press F12 and open the developer tools.
5. Move to the **Applications** tab and make sure to select the **Service Workers** tab. 
6. Check the **Offline** option.
7. Now reload the website again. You will see something similar to the image below:

![](websitewithoutcss.png)

Compared to the previous tests, this time we're indeed getting something back and we aren't seeing anymore the offline error message provided by the browser. However, the outcome isn't really exciting.

> Can you guess why we are seeing a broken page?

When we have registered the Service Worker, we have cached only the HTML pages. However, the Contoso Dashboard application is composed also by styles defined in CSS files; or by scripts stored in JavaScript files. None of them has been added in the cache.

We can verify that this is indeed the case with the developer tools. Move to the **Network** tab. You will notice how the **index.html** is indeed being returned by the Service Worker, while all the other requests are failing:

![](indexfromserviceworker.png)

A way to solve this problem would be update the Service Worker initialization code in order to register all the other files which are required to properly render the web application. However, woudln't be simpler if we would add all the incoming requests to the cache? This is what we're going to implement in the next task.

### Task 3 - Enable cache at request time
In the previous task we have intercepted the **fetch** event to handle caching. However, we were focused only in reading from the cache. If the current request couldn't be satisfied because Internet connection was missing, we tried to read it from the cache.

However, this event can be used also to write to the cache. This is what we're going to do in this task. Whenever the browser sends a request to the server and it's succesfull, we're going to save it in the cache. This way, if the connection drops, we will be able to provide an offline experience not only for the pages we have cached in the beginning, but also for all the others that are performed while the user browses the web application.

1. Open the **sw.js** file in Visual Studio Code
2. Look for the function which handles the **fetch** event we have created in task 2 and delete it.
3. Copy and paste the following code in replacement:

    ```javascript
    //If any fetch fails, it will look for the request in the cache and serve it from there first
    self.addEventListener('fetch', function(event) {
      var updateCache = function(request){
        return caches.open('pwabuilder-offline').then(function (cache) {
          return fetch(request).then(function (response) {
            console.log('[PWA Builder] add page to offline '+response.url)
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
    ```
    
    The main part of the snippet is the same we have created in task 2. When the **fetch** event is raised, we intercept the request and, in case the connection fails, we look if it was already cached. If yes, we return it; otherwise, we redirect the user to the offline page.
    
    However, inside the event handler we have defined also a new function called **updateCache()**. This operation does the opposite process: it sends the request to the server, it takes the response and, by using the **put()** method offered by the **cache** object, it stores it inside the cache.
    
    The **updateCache()** function is then invoked using the **event.waitUntil()** method. This approach makes sure that the operation doesn't get terminated until the response has been properly stored in the cache.
    
Let's see the new behavior.

1. Open Chrome, make sure it’s still open on the website and that the developers tools are turned on. 
2. Move to the **Application** tab and press **Unregister** near the service worker. Then close Chrome. This step will make sure that the updated service worker will be deployed and it will replace the old one.
3. Open again the Chrome on the Contoso Dashboard website. In case you need it, remember that the URL of the local server is **http://127.0.0.1:5050**
4. Press F12 and open the developer tools.
5. Move to the **Applications** tab and expand the **Cache Storage** element in the left panel
6. Click on the available cache, named **pwabuilder-offline**.
7. Observe, in the center of the panel, the content of the cache. As you can see, now it contains many more items and not just the pages that are cached when the Service Worker is installed for the first time.

    ![](realtimecache.png)

8. Stay in the **Applications** tab of the developer tools and choose, this time, **Service Worker**.
9. Check **Offline** at the top of the panel.
10. Now reload the page. You will notice that, this time, the offline page will look exactly like the online one, without errors or noticeable issues. The reason is that, this time, also all the required CSS and JavaScript files have been cached and not just the HTML ones.












