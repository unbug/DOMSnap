# capture

.capture(selector, id)
capture snapshot html of the element matches the selector and store the result with a capture id

**Parameters**

-   `selector` **string** selector of the element
-   `id` **string** [optional]capture id, if html is not null set id to null to store html as the default snapshot
-   `html` **string** [optional]snapshot html, set id to null to store html as the default snapshot

Returns **object** DOMSnap

# clear

.clear()
clear all captured snapshots

Returns **object** DOMSnap

# DOMSnap

DOMSnap(config,readyCallback)
Initialize DOMSnap

**Parameters**

-   `config`  [optional]
-   `readyCallback` **function** will be called when DOMSnap is ready

**Examples**

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

Returns **object** DOMSnap

# resume

.resume(selector, id, fallback)
set the html of the element matches the selector [and capture id] by it's captured snapshot html

**Parameters**

-   `selector` **string** selector of the element
-   `id` **string** [optional]capture id, the result will be the default snapshot if it's not specified
-   `fallback` **function** [optional]a callback function, will be called if no snapshot matched

Returns **object** DOMSnap
