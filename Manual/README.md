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
5.	Wait for the server to start and for the website to open inside Chrome. Notice that the website is loading properly, since the connection is active.
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














