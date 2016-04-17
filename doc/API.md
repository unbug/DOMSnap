# capture

.capture(selector, options)
capture snapshot html of the element matches the selector and store the result with a capture id

**Parameters**

-   `selector` **string** selector of the element
-   `options` **object** [optional]
    -   `options.id` **string or function** capture id, if html is not null set id to null to store html as the default snapshot
    -   `options.html` **string or function** snapshot html, set id to null to store html as the default snapshot
    -   `options.expires` **number** Milliseconds of how long the snapshot will expires. Same value as initialize DOMSnap if it's not specified.

Returns **DOMSnap** 

# clear

.clear(version)
clear all captured snapshots

**Parameters**

-   `version` **number** [optional]Same value as initialize DOMSnap if it's not specified.

Returns **DOMSnap** 

# DOMSnap

DOMSnap(config)
Initialize DOMSnap

**Parameters**

-   `config` **object** [optional]
    -   `config.onReady` **function** will be called when DOMSnap is ready
    -   `config.version` **number** Version control, Nonzero. Update is required if web app has been updated. Default is 1
    -   `config.scope` **string** "host|path|or any string value".  "host": location.host; "path": location.host+location.pathname; default is "path"
    -   `config.storeType` **string** Data store to use. "IndexedDB" or "WebSQL", if not defined, use "WebSQL" for iOS and "IndexedDB" for others.
    -   `config.expires` **number** Milliseconds of how long every snapshot will expires, default is 1 week(1000_60_60_24_7).Note, new snapshots will never expires until the page reload.

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

Returns **object** {{capture: capture, resume: resume, get: get, getAll: getAll, remove: remove, clear: clear}|*}

# get

.get(selector, id)
retrun the captured snapshot html of the element matches the selector and capture id

**Parameters**

-   `selector` **string** selector of the element
-   `id` **string** [optional]capture id, the result be the default snapshot if it's not specified

Returns **string** html

# getAll

.getAll(selector)
retrun all the captured snapshots html of the element matches the selector

**Parameters**

-   `selector` **string** selector of the element

Returns **object** all snapshots as object - e.g. {DEFAULT_CAPTURE_ID: 'html of DEFAULT_CAPTURE', my_id: 'html of my_id'}

# remove

.remove(selector, id)
remove the captured snapshot html of the element matches the selector [and capture id]

**Parameters**

-   `selector` **string** selector of the element
-   `id` **string** [optional]capture id, will empty all snapshots if it's not specified

Returns **DOMSnap** 

# resume

.resume(selector, options)
set the html of the element matches the selector [and capture id] by it's captured snapshot html

**Parameters**

-   `selector` **string** selector of the element
-   `options` **object** [optional]
    -   `options.id` **string or function** capture id, if html is not null set id to null to store html as the default snapshot
    -   `options.fallback` **function** a callback function, will be called if no snapshot matched

Returns **DOMSnap** 

# watch

.watch(selector, options)
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
