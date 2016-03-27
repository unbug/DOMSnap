DOMSnap
=================
Offline web pages by persisting DOM to IndexedDB/WebSQL.
Please try the [demo](http://unbug.github.io/DOMSnap/).

How it works
============= 
HTML5 provides LocalStorage, IndexedDB, and [window.caches](https://googlechrome.github.io/samples/service-worker/window-caches/) to build offline web apps.
But all of [these technologies](http://www.html5rocks.com/en/features/offline), we can't miss local database.
DOMSnap takes full advantage of [offline technologies](http://www.html5rocks.com/en/features/offline).
Storing HTML to local IndexedDB/WebSQL and resumeing when you're offline.
With DOMSnap, web pages can resume to their last state with less request to the server and less template render.
Think offline is a long way out, why not just give DOMSnap a try?


Usage
=========
1.Include [`dist/DOMSnap.min.js`](https://github.com/unbug/DOMSnap/tree/master/dist) file in your HTML:
```
<script src="DOMSnap.min.js"></script>

```

2.Or insttall the package and require it in your files
```
npm install --save domsnap
```
then
```
var DOMSnap = require('domsnap');
```

***Examples***

```javascript
//init DOMSnap
var DS = DOMSnap(function(){
  console.log('DOMSnap is ready');
});

//capture snapshot html of #main
DS.capture('#main');
//capture with specified capture id
DS.capture('#main','my_id');

//set the html of #main by it's captured snapshot html
DS.resume('#main');
//set by specified capture id
DS.resume('#main','my_id');
```

![domsnap](https://cloud.githubusercontent.com/assets/799578/14041602/91577d80-f2ad-11e5-806e-19ef26a25a38.gif)

APIs
=========
### DOMSnap(config,readyCallback)

Initialize DOMSnap

**Parameters**

-   `config`  [optional]
-   `readyCallback` **function** will be called when DOMSnap is ready


Returns **object** {{capture: capture, resume: resume, get: get, getAll: getAll, remove: remove, clear: clear}|*}

### .capture(selector, id)

capture snapshot html of the element matches the selector and store the result with a capture id

**Parameters**

-   `id` **string** [optional]capture id, if html is not null set id to null to store html as the default snapshot
-   `html` **string** [optional]snapshot html, set id to null to store html as the default snapshot

Returns **object** DOMSnap

### .resume(selector, id, fallback)

set the html of the element matches the selector [and capture id] by it's captured snapshot html

**Parameters**

-   `selector` **string** selector of the element
-   `id` **string** [optional]capture id, the result will be the default snapshot if it's not specified
-   `fallback` **function** [optional]a callback function, will be called if no snapshot matched

Returns **object** DOMSnap


### .get(selector, id)

retrun the captured snapshot html of the element matches the selector and capture id

**Parameters**

-   `selector` **string** selector of the element
-   `id` **string** [optional]capture id, the result be the default snapshot if it's not specified

Returns **string** html

### .getAll(selector)

retrun all the captured snapshots html of the element matches the selector

**Parameters**

-   `selector` **string** selector of the element

Returns **object** all snapshots as object - e.g. {DEFAULT_CAPTURE_ID: 'html of DEFAULT_CAPTURE', my_id: 'html of my_id'}

### .remove(selector, id)

remove the captured snapshot html of the element matches the selector [and capture id]

**Parameters**

-   `selector` **string** selector of the element
-   `id` **string** [optional]capture id, will empty all snapshots if it's not specified

Returns **object** DOMSnap

### .clear()

clear all captured snapshots

Returns **object** DOMSnap


Thanks
=================
  * [Google Lovefield](https://github.com/google/lovefield)
  

Find me
=================
  * Twitter [@unbug](https://twitter.com/unbug)
  * 微博 [@听奏](http://weibo.com/unbug)
