
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
  }

  if (require.aliases.hasOwnProperty(index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-indexof/index.js", function(exports, require, module){

var indexOf = [].indexOf;

module.exports = function(arr, obj){
  if (indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture || false);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture || false);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-event-manager/index.js", function(exports, require, module){


/**
 * Expose `EventManager`.
 */

module.exports = EventManager;

/**
 * Initialize an `EventManager` with the given
 * `target` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} target
 * @param {Object} obj
 * @api public
 */

function EventManager(target, obj) {
  this.target = target;
  this.obj = obj;
  this._bindings = {};
}

/**
 * Register bind function.
 *
 * @param {Function} fn
 * @return {EventManager} self
 * @api public
 */

EventManager.prototype.onbind = function(fn){
  this._bind = fn;
  return this;
};

/**
 * Register unbind function.
 *
 * @param {Function} fn
 * @return {EventManager} self
 * @api public
 */

EventManager.prototype.onunbind = function(fn){
  this._unbind = fn;
  return this;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 *    events.bind('login') // implies "onlogin"
 *    events.bind('login', 'onLogin')
 *
 * @param {String} event
 * @param {String} [method]
 * @return {Function} callback
 * @api public
 */

EventManager.prototype.bind = function(event, method){
  var fn = this.addBinding.apply(this, arguments);
  if (this._onbind) this._onbind(event, method, fn);
  this._bind(event, fn);
  return fn;
};

/**
 * Add event binding.
 *
 * @param {String} event
 * @param {String} method
 * @return {Function} callback
 * @api private
 */

EventManager.prototype.addBinding = function(event, method){
  var obj = this.obj;
  var method = method || 'on' + event;
  var args = [].slice.call(arguments, 2);

  // callback
  function callback() {
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // subscription
  this._bindings[event] = this._bindings[event] || {};
  this._bindings[event][method] = callback;

  return callback;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 *     evennts.unbind('login', 'onLogin')
 *     evennts.unbind('login')
 *     evennts.unbind()
 *
 * @param {String} [event]
 * @param {String} [method]
 * @return {Function} callback
 * @api public
 */

EventManager.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);
  var fn = this._bindings[event][method];
  if (this._onunbind) this._onunbind(event, method, fn);
  this._unbind(event, fn);
  return fn;
};

/**
 * Unbind all events.
 *
 * @api private
 */

EventManager.prototype.unbindAll = function(){
  for (var event in this._bindings) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

EventManager.prototype.unbindAllOf = function(event){
  var bindings = this._bindings[event];
  if (!bindings) return;
  for (var method in bindings) {
    this.unbind(event, method);
  }
};

});
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Manager = require('event-manager')
  , event = require('event');

/**
 * Return a new event manager.
 */

module.exports = function(target, obj){
  var manager = new Manager(target, obj);

  manager.onbind(function(name, fn){
    event.bind(target, name, fn);
  });

  manager.onunbind(function(name, fn){
    event.unbind(target, name, fn);
  });

  return manager;
};

});
require.register("yields-merge/index.js", function(exports, require, module){

/**
 * merge `b`'s properties with `a`'s.
 *
 * example:
 *
 *        var user = {};
 *        merge(user, console);
 *        // > { log: fn, dir: fn ..}
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 */

module.exports = function (a, b) {
  for (var k in b) a[k] = b[k];
  return a;
};

});
require.register("colorpicker/index.js", function(exports, require, module){

/**
 * dependencies
 */

var emitter = require('emitter')
  , events = require('events')
  , merge = require('merge');

/**
 * export `Picker`
 */

module.exports = Picker;

/**
 * Initialize new `Picker` with `el`.
 * 
 * @param {Element} el
 */

function Picker(el){
  if (!(this instanceof Picker)) return new Picker(el);
  if (!el) throw new TypeError('colorpicker() requires an element');
  this._color = {};
  this.el = el;
  this.bind();
  this.refresh();
  this.color({
    hue: 180,
    sat: 50,
    lit: 50
  });
}

/**
 * mixins.
 */

emitter(Picker.prototype);

/**
 * Bind events.
 * 
 * @return {Picker}
 */

Picker.prototype.bind = function(){
  this.events = events(this.el, this);
  this.events.bind('mousemove');
  this.events.bind('mousewheel');
  this.events.bind('mouseout');
  this.events.bind('click');
  return this;
};

/**
 * on-click.
 */

Picker.prototype.onclick = function(e){
  e.preventDefault();
  this.abort = 1000 + new Date().getTime();
  this.emit('pick');
};

/**
 * on-mousemove.
 */

Picker.prototype.onmousemove = function(e){
  var abort = this.abort && this.abort > new Date();
  if (abort) return;
  this.abort = null;
  this.move(e.pageY, e.pageX);
};

/**
 * on-mousewheel
 */

Picker.prototype.onmousewheel = function(e){
  e.preventDefault();
  var delta = e.wheelDelta;
  delta += (this.prev || 0);
  if (-500 > delta) return;
  if (500 < delta) return;
  var sat = delta + 500;
  this.color({ sat: sat / 1000 * 100 });
  this.prev = delta;
};

/**
 * on-mouseout
 */

Picker.prototype.onmouseout = function(){
  this.abort = null;
};

/**
 * Refresh.
 * 
 * the method should be called every
 * time the `el` changes height or width.
 * 
 * @return {Picker}
 */

Picker.prototype.refresh = function(){
  this.rect = this.el.getBoundingClientRect();
  return this;
};

/**
 * Pick a color where `y`, `x`.
 * 
 * @param {Number} y
 * @param {Number} x
 * @return {Picker}
 */

Picker.prototype.move = function(y, x){
  y = Math.max(0, y - this.rect.top);
  x = Math.max(0, x - this.rect.left);
  y /= this.rect.height;
  x /= this.rect.width;
  return this.color({
    hue: x * 360,
    lit: y * 100
  });
};

/**
 * Set / get color to `obj`.
 * 
 * @param {Object} obj
 * @return {Object|Picker}
 */

Picker.prototype.color = function(obj){
  if (!obj) return this._color;
  obj = merge(this.color(), obj);
  this.el.style.background = 'hsla('
    + obj.hue + ', '
    + obj.sat + '%, '
    + obj.lit + '%, '
    + 1 + ')';
  return this;
};


});
require.alias("component-emitter/index.js", "colorpicker/deps/emitter/index.js");
require.alias("component-emitter/index.js", "emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-events/index.js", "colorpicker/deps/events/index.js");
require.alias("component-events/index.js", "events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-event-manager/index.js", "component-events/deps/event-manager/index.js");

require.alias("yields-merge/index.js", "colorpicker/deps/merge/index.js");
require.alias("yields-merge/index.js", "merge/index.js");

