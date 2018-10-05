(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vector_1 = require("./vector");
var Interval = /** @class */ (function () {
    function Interval(start, end) {
        this.start = start;
        this.end = end;
        this.length = end - start;
    }
    Interval.prototype.inside = function (t) {
        return t >= this.start && t <= this.end;
    };
    return Interval;
}());
var Color = /** @class */ (function () {
    function Color(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }
    Color.prototype.toCSSColor = function (opacity) {
        if (opacity === void 0) { opacity = 1.0; }
        return "rgb(" + this.r + "," + this.g + "," + this.b + "," + opacity + ")";
    };
    return Color;
}());
exports.Color = Color;
var BezierSpline = /** @class */ (function () {
    function BezierSpline() {
        this.penSize = 4;
        this.penColor = new Color(0, 0, 0);
        this._directions = [];
        this._intervals = [];
        this._points = [];
        this._length = 0;
        this._vt0 = new vector_1.Vector();
        this._vt1 = new vector_1.Vector();
        this._vt2 = new vector_1.Vector();
        this._vt3 = new vector_1.Vector();
        this._vt4 = new vector_1.Vector();
        this._vt5 = new vector_1.Vector();
        this._vt6 = new vector_1.Vector();
        this._vt7 = new vector_1.Vector();
    }
    Object.defineProperty(BezierSpline.prototype, "length", {
        get: function () { return this._length; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BezierSpline.prototype, "penSizeFast", {
        get: function () { return this.penSize * 0.3; },
        enumerable: true,
        configurable: true
    });
    BezierSpline.prototype.addPoint = function (p) {
        if (this._points.length >= 1 && this._tooClose(p, this._points[this._points.length - 1])) {
            return;
        }
        this._points.push(p);
        if (this._points.length >= 2) {
            var p0 = this._points[this._points.length - 2];
            var p1 = this._points[this._points.length - 1];
            var dist = p0.distance(p1);
            this._intervals.push(new Interval(this._length, this._length + dist));
            this._directions.push(p1.sub(p0).normalized());
            this._length += dist;
        }
    };
    BezierSpline.prototype.sample = function (t, out) {
        if (out === void 0) { out = null; }
        var v = out || new vector_1.Vector();
        var p0 = this._vt0;
        var p1 = this._vt1;
        var p2 = this._vt2;
        var p3 = this._vt3;
        for (var i = 0; i < this._intervals.length; i++) {
            var interval = this._intervals[i];
            if (interval.inside(t)) {
                var k = (t - interval.start) / interval.length;
                var l3 = interval.length / 3;
                p0.copy(this._points[i]);
                p3.copy(this._points[i + 1]);
                if (i === 0) { // first interval
                    p1.copy(this._directions[i]).setScale(l3).setAdd(p0);
                }
                else {
                    p1.copy(this._directions[i]).setAdd(this._directions[i - 1]).setNormalized().setScale(l3).setAdd(p0);
                }
                if (i === this._intervals.length - 1) { // last interval
                    p2.copy(this._directions[i]).setScale(-l3).setAdd(p3);
                }
                else {
                    p2.copy(this._directions[i]).setAdd(this._directions[i + 1]).setNormalized().setScale(-l3).setAdd(p3);
                }
                return this._evalCubicBezier(k, p0, p1, p2, p3, v);
            }
        }
        return v;
    };
    BezierSpline.prototype.draw = function (ctx) {
        var v = new vector_1.Vector();
        var maxVelocity = this.penSize * 400;
        ctx.fillStyle = this.penColor.toCSSColor();
        for (var i = 0; i < this._intervals.length; i++) {
            var interval = this._intervals[i];
            var step = this.penSizeFast / 4;
            var prevPenSize = i === 0 ? this.penSize : this._penSize(this._intervalVelocity(i - 1), maxVelocity);
            //let endPenSize = i === this._intervals.length - 1 ? this.penSizeFast : this._penSize(this._intervalVelocity(i + 1), maxVelocity);
            var currentPenSize = this._penSize(this._intervalVelocity(i), maxVelocity);
            for (var t = interval.start; t <= interval.end; t += step) {
                var k = interval.length / (interval.end - interval.start);
                //let penSize = (1 - k) * startPenSize + k * endPenSize;
                var penSize = prevPenSize * 0.7 + currentPenSize * 0.3;
                this.sample(t, v);
                ctx.beginPath();
                ctx.arc(v.x, v.y, penSize, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    };
    BezierSpline.prototype._intervalVelocity = function (idx) {
        return this._intervals[idx].length / ((this._points[idx + 1].time - this._points[idx].time) / 1000);
    };
    BezierSpline.prototype._evalCubicBezier = function (t, p0, p1, p2, p3, out) {
        var v = out || new vector_1.Vector();
        var tt = t * t;
        var ttt = tt * t;
        var _t = (1 - t);
        var _tt = _t * _t;
        var _ttt = _tt * _t;
        var v0 = this._vt4;
        var v1 = this._vt5;
        var v2 = this._vt6;
        var v3 = this._vt7;
        v0.copy(p0).setScale(_ttt);
        v1.copy(p1).setScale(3 * _tt * t);
        v2.copy(p2).setScale(3 * _t * tt);
        v3.copy(p3).setScale(ttt);
        return v.reset().setAdd(v0).setAdd(v1).setAdd(v2).setAdd(v3);
    };
    BezierSpline.prototype._tooClose = function (p0, p1) {
        return p0.squaredDistance(p1) <= (this.penSize * 100);
    };
    BezierSpline.prototype._penSize = function (vel, maxVel) {
        vel = Math.min(vel, maxVel);
        var t = vel / maxVel;
        return (1 - t) * this.penSize + t * this.penSizeFast;
    };
    return BezierSpline;
}());
exports.BezierSpline = BezierSpline;

},{"./vector":5}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bezier_spline_1 = require("./bezier-spline");
var vector_1 = require("./vector");
var sign_canvas_1 = require("./sign-canvas");
window["sc"] = {
    BezierSpline: bezier_spline_1.BezierSpline,
    Vector: vector_1.Vector,
    SignCanvas: sign_canvas_1.SignCanvas,
    Color: bezier_spline_1.Color
};

},{"./bezier-spline":1,"./sign-canvas":3,"./vector":5}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bezier_spline_1 = require("./bezier-spline");
var single_touch_1 = require("./single-touch");
var vector_1 = require("./vector");
var VIRTUAL_WIDTH = 100;
var SignCanvas = /** @class */ (function () {
    function SignCanvas(canvas, _aspectRatio) {
        if (_aspectRatio === void 0) { _aspectRatio = 2; }
        var _this = this;
        this.canvas = canvas;
        this._aspectRatio = _aspectRatio;
        this.penSize = 0.5;
        this.penColor = new bezier_spline_1.Color(0, 0, 0);
        this.backgroundColor = new bezier_spline_1.Color(255, 255, 255);
        this._currentSpline = null;
        this._ctx = canvas.getContext("2d");
        single_touch_1.handleSingleTouch(canvas, {});
        this.canvas.addEventListener("singleTouchStart", function (evt) {
            _this._currentSpline = new bezier_spline_1.BezierSpline();
            _this._currentSpline.penSize = _this.width / VIRTUAL_WIDTH * _this.penSize;
            _this._currentSpline.penColor = _this.penColor;
            _this._currentSpline.addPoint(new vector_1.Vector(evt.detail.x, evt.detail.y, evt.detail.time));
        });
        this.canvas.addEventListener("singleTouchMove", function (evt) {
            _this._currentSpline.addPoint(new vector_1.Vector(evt.detail.x, evt.detail.y, evt.detail.time));
        });
        this.canvas.addEventListener("singleTouchEnd", function (evt) {
            _this._currentSpline = null;
            _this.canvas.dispatchEvent(new CustomEvent("draw", { detail: { target: _this } }));
        });
        window.addEventListener("resize", this._resize.bind(this));
        this._resize();
        this._loop();
    }
    Object.defineProperty(SignCanvas.prototype, "width", {
        get: function () { return this.canvas.width; },
        set: function (w) { this.canvas.width = w; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignCanvas.prototype, "height", {
        get: function () { return this.canvas.height; },
        set: function (h) { this.canvas.height = h; },
        enumerable: true,
        configurable: true
    });
    SignCanvas.prototype.clear = function () {
        this._ctx.fillStyle = this.backgroundColor.toCSSColor();
        this._ctx.fillRect(0, 0, this.width, this.height);
    };
    SignCanvas.prototype._loop = function () {
        window.requestAnimationFrame(this._loop.bind(this));
        if (this._currentSpline !== null) {
            this._currentSpline.draw(this._ctx);
        }
    };
    SignCanvas.prototype._resize = function () {
        var w = $(this.canvas).width();
        var h = w / this._aspectRatio;
        this.width = w;
        this.height = h;
        this.clear();
    };
    return SignCanvas;
}());
exports.SignCanvas = SignCanvas;

},{"./bezier-spline":1,"./single-touch":4,"./vector":5}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function _copyTouch(touch) {
    return {
        identifier: touch.identifier,
        pageX: touch.pageX,
        pageY: touch.pageY,
        timeStamp: new Date().getTime()
    };
}
;
function handleSingleTouch(element, settings) {
    var defaultSettings = {};
    $.extend(defaultSettings, settings);
    var dispatchSingleTouchEvent = function (name, x, y, t, evt) {
        element.dispatchEvent(new CustomEvent(name, {
            detail: {
                x: x,
                y: y,
                time: t,
                originalEvent: evt
            }
        }));
    };
    var currentTouch = null;
    var $element = $(element);
    element.addEventListener("touchstart", function (evt) {
        if (currentTouch == null && evt.changedTouches.length > 0) {
            currentTouch = _copyTouch(evt.changedTouches[0]);
            dispatchSingleTouchEvent("singleTouchStart", currentTouch.pageX - $element.offset().left, currentTouch.pageY - $element.offset().top, currentTouch.timeStamp, evt);
        }
        ;
    });
    element.addEventListener("touchmove", function (evt) {
        if (currentTouch != null) {
            for (var i = 0; i < evt.changedTouches.length; i++) {
                if (evt.changedTouches[i].identifier === currentTouch.identifier) {
                    currentTouch = _copyTouch(evt.changedTouches[i]);
                    dispatchSingleTouchEvent("singleTouchMove", currentTouch.pageX - $element.offset().left, currentTouch.pageY - $element.offset().top, currentTouch.timeStamp, evt);
                }
            }
        }
    });
    element.addEventListener("touchend", function (evt) {
        if (currentTouch != null) {
            for (var i = 0; i < evt.changedTouches.length; i++) {
                var touch = _copyTouch(evt.changedTouches[i]);
                if (touch.identifier === currentTouch.identifier) {
                    dispatchSingleTouchEvent("singleTouchEnd", touch.pageX - $element.offset().left, touch.pageY - $element.offset().top, touch.timeStamp, evt);
                }
            }
            currentTouch = null;
        }
    });
}
exports.handleSingleTouch = handleSingleTouch;
;

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Vector = /** @class */ (function () {
    function Vector(x, y, time) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (time === void 0) { time = null; }
        this.x = x;
        this.y = y;
        this.time = time || new Date().getTime();
    }
    Vector.prototype.velocityFrom = function (o) {
        var dt = this.time - o.time;
        var dxdt = (this.x - o.x) / dt;
        var dydt = (this.y - o.x) / dt;
        return Math.sqrt(dxdt * dxdt + dydt * dydt);
    };
    Vector.prototype.length = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    };
    Vector.prototype.squaredLength = function () {
        return this.x * this.x + this.y * this.y;
    };
    Vector.prototype.sub = function (o) {
        return new Vector(this.x - o.x, this.y - o.y);
    };
    Vector.prototype.squaredDistance = function (o) {
        return this.sub(o).squaredLength();
    };
    Vector.prototype.distance = function (o) {
        return this.sub(o).length();
    };
    Vector.prototype.normalized = function () {
        var l = this.length();
        if (l > 0) {
            return new Vector(this.x / l, this.y / l);
        }
    };
    Vector.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
        return this;
    };
    Vector.prototype.copy = function (o) {
        this.x = o.x;
        this.y = o.y;
        return this;
    };
    Vector.prototype.setAdd = function (o) {
        this.x += o.x;
        this.y += o.y;
        return this;
    };
    Vector.prototype.setScale = function (k) {
        this.x *= k;
        this.y *= k;
        return this;
    };
    Vector.prototype.setNormalized = function () {
        var l = this.length();
        if (l > 0) {
            this.x /= l;
            this.y /= l;
        }
        return this;
    };
    Vector.prototype.reset = function () {
        this.x = this.y = 0;
        return this;
    };
    return Vector;
}());
exports.Vector = Vector;

},{}]},{},[2]);
