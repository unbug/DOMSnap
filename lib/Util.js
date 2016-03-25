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
exports.os = os;

exports.isNil = function isNil(val) {
  return val==undefined || val == null || val==false;
}

exports.isFunction = function isFunction(val) {
  return typeof val=='function';
}

exports.apply = function apply(obj, config, promise) {
  var conf = isFunction(config)?config.call(obj):config;
  if (conf) {
    var attr;
    for (attr in conf) {
      obj[attr] = promise ? promise(conf[attr]) : conf[attr];
    }
  }
}

exports.el = function el(cls){
  return document.querySelector(cls);
}
