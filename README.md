[![NPM](https://nodei.co/npm/domsnap.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/domsnap/)

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
1.Include [`dist/DOMSnap.min.js`](https://github.com/unbug/DOMSnap/tree/master/dist) file in your HTML
```
<script src="DOMSnap.min.js"></script>

```

2.Or insttall the package
```
npm install --save domsnap
```
and require it in your files
```
var DOMSnap = require('domsnap');
```

**Examples**

```javascript
//init DOMSnap
var DS = DOMSnap({
  onReady: function(){
    console.log('DOMSnap is ready');
  }
});

//capture snapshot html of #main
DS.capture('#main');
//capture with specified capture id
DS.capture('#main', {id: 'my_id'});

//set the html of #main by it's captured snapshot html
DS.resume('#main');
//set by specified capture id
DS.resume('#main',{id: 'my_id'});
```


![domsnap](https://cloud.githubusercontent.com/assets/799578/14100241/a6c6174e-f5be-11e5-94a5-409fcba78bc3.gif)

APIs
=========
### DOMSnap(config)

Initialize DOMSnap

**Parameters**

-   `config` **object** [optional]
    -   `config.onReady` **function** will be called when DOMSnap is ready

Returns **object** {{capture: capture, resume: resume, get: get, getAll: getAll, remove: remove, clear: clear}|*}

### .capture(selector, options)

capture snapshot html of the element matches the selector and store the result with a capture id

**Parameters**

-   `selector` **string** selector of the element
-   `options` **object** [optional]
    -   `options.id` **string or function** capture id, if html is not null set id to null to store html as the default snapshot
    -   `options.html` **string or function** snapshot html, set id to null to store html as the default snapshot

Returns **DOMSnap** 

### .resume(selector, options)

set the html of the element matches the selector [and capture id] by it's captured snapshot html

**Parameters**

-   `selector` **string** selector of the element
-   `options` **object** [optional]
    -   `options.id` **string or function** capture id, if html is not null set id to null to store html as the default snapshot
    -   `options.fallback` **function** a callback function, will be called if no snapshot matched

Returns **DOMSnap** 

### .watch(selector, options)

watch and auto capture the element matches the selector

**Parameters**

-   `selector` **string or array** selector[s] of the element[s]
-   `options` **object** [optional]
    -   `options.id` **string or function** capture id
    -   `options.html` **string or function** snapshot html

**Examples**

```javascript
//e.g.1
DS.watch('#main');

//e.g.2
DS.watch('#main',{
  id: 'my_capture_id',//capture id
  html: 'my_snapshot_html'//snapshot html
});

//e.g.3
DS.watch('#main',{
  id: function(selector){ return 'generated_capture_id_for_'+selector;}, //return capture id
  html: function(selector){ return 'generated_snapshot_html_for_'+selector;} //return snapshot html
});

//e.g.4
DS.watch(['#main', '#another']);//watch multi elements
```

Returns **DOMSnap** 

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

Returns **DOMSnap** 

### .clear()

clear all captured snapshots

Returns **DOMSnap** 

Roadmap & Make contributions
==============
 - **on-going** Auto watch and auto resume.
 - **on-going** Auto clear expired capture.
 - **on-going** Multi scopes in one domain.
 - Resume with DOM diff.
 - **on-going** Events(ready, before resume, after resume, before capture, after capture)
 - Replace lovefiled with a lightweight IndexedDB/WebSQL.

Build
==============
1. install requirements run ```npm install```
2. build and watch run ```gulp```

Find me
=================
  * Twitter [@unbug](https://twitter.com/unbug)
  * 微博 [@听奏](http://weibo.com/unbug)
  
Dependencies
=================
  * [Google Lovefield](https://github.com/google/lovefield)
  
LICENSE
=========
The MIT License (MIT)

Copyright (c) <2016> <unbug>

[MIT](http://opensource.org/licenses/mit-license.php)
