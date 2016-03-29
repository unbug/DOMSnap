var ua = navigator.userAgent,
  android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
  ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
  ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
  iphone = !ipad && ua.match(/(iPhone\sOS)\s([\d_]+)/),
  os = {};

if (android) os.android = true, os.version = android[2];
if (iphone && !ipod) os.ios = os.iphone = true, os.version = iphone[2].replace(/_/g, '.')
if (ipad) os.ios = os.ipad = true, os.version = ipad[2].replace(/_/g, '.')
if (ipod) os.ios = os.ipod = true, os.version = ipod[3] ? ipod[3].replace(/_/g, '.') : null;

function isNil(val) {
  return val==undefined || val == null || val==false;
}

function isFunction(val) {
  return typeof val=='function';
}

function isArray(val) {
  return toString.call(val) === '[object Array]';
}

function apply(obj, config, promise) {
  var conf = isFunction(config)?config.call(obj):config;
  if (conf) {
    var attr;
    for (attr in conf) {
      obj[attr] = promise ? promise(conf[attr]) : conf[attr];
    }
  }
}

function el(selector){
  return document.querySelector(selector);
}

function html(selector, htm){
  var ele = el(selector);
  return isNil(htm)?ele.innerHTML:(ele.innerHTML = htm);
}

exports.os = os;
exports.isNil = isNil;
exports.isFunction = isFunction;
exports.isArray = isArray;
exports.apply = apply;
exports.el = el;
exports.html = html;
