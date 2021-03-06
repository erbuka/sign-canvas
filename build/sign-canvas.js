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
        this._penVelocity = 0;
        this._points = [];
        this._vt0 = new vector_1.Vector();
        this._vt1 = new vector_1.Vector();
        this._vt2 = new vector_1.Vector();
        this._vt3 = new vector_1.Vector();
        this._vt4 = new vector_1.Vector();
        this._vt5 = new vector_1.Vector();
        this._vt6 = new vector_1.Vector();
        this._vt7 = new vector_1.Vector();
    }
    Object.defineProperty(BezierSpline.prototype, "penSizeFast", {
        get: function () { return this.penSize * 0.35; },
        enumerable: true,
        configurable: true
    });
    BezierSpline.prototype.addPoint = function (p) {
        if (this._points.length >= 1 && this._tooClose(p, this._points[this._points.length - 1])) {
            return;
        }
        this._points.push(p);
        if (this._points.length > 4) {
            this._points.shift();
        }
    };
    BezierSpline.prototype.draw = function (ctx) {
        // We draw only if we have enough points(4)
        if (this._points.length < 4)
            return;
        // Init the data required to build the curve
        var directions = [];
        var intervals = [];
        for (var i = 0; i < this._points.length - 1; i++) {
            var p0_1 = this._points[i];
            var p1_1 = this._points[i + 1];
            intervals.push(new Interval(0, p0_1.distance(p1_1)));
            directions.push(p1_1.sub(p0_1).setNormalized());
        }
        var l3 = intervals[1].length / 3;
        // Create the curve
        var p0 = this._vt0.copy(this._points[1]); // first point
        var p3 = this._vt3.copy(this._points[2]); // last point
        // Mid points
        var p1 = this._vt1.copy(directions[1]).setAdd(directions[0]).setNormalized().setScale(l3).setAdd(p0);
        var p2 = this._vt2.copy(directions[1]).setAdd(directions[2]).setNormalized().setScale(-l3).setAdd(p3);
        var v = new vector_1.Vector();
        var maxPenVelocity = this.penSize * 400;
        var targetVelocity = this._intervalVelocity(intervals, 1);
        var velocityStep = maxPenVelocity / 10;
        var step = this.penSize / 3;
        ctx.fillStyle = "#000";
        for (var t = intervals[1].start; t < intervals[1].length; t += step) {
            var k = (t - intervals[1].start) / intervals[1].length;
            this._evalCubicBezier(k, p0, p1, p2, p3, v);
            this._penVelocity = this._moveTowards(targetVelocity, this._penVelocity, velocityStep);
            var penSize = this._calcPenSize(this._penVelocity, maxPenVelocity);
            ctx.beginPath();
            ctx.arc(v.x, v.y, penSize, 0, 2 * Math.PI);
            ctx.fill();
        }
    };
    BezierSpline.prototype._moveTowards = function (target, value, step) {
        step = Math.abs(step);
        var dir = (target - value) / Math.abs(target - value);
        return dir > 0 ?
            Math.min(value + step, target) :
            Math.max(value - step, target);
    };
    BezierSpline.prototype._intervalVelocity = function (intervals, idx) {
        return intervals[idx].length / ((this._points[idx + 1].time - this._points[idx].time) / 1000);
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
        return p0.squaredDistance(p1) <= this.penSize;
    };
    BezierSpline.prototype._calcPenSize = function (vel, maxVel) {
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
var sign_canvas_1 = require("./sign-canvas");
window["sc"] = {
    SignCanvas: sign_canvas_1.SignCanvas,
    Color: bezier_spline_1.Color
};

},{"./bezier-spline":1,"./sign-canvas":3}],3:[function(require,module,exports){
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
        var startCurve = function (p) {
            _this._currentSpline = new bezier_spline_1.BezierSpline();
            _this._currentSpline.penSize = _this.width / VIRTUAL_WIDTH * _this.penSize;
            _this._currentSpline.penColor = _this.penColor;
            _this._currentSpline.addPoint(p);
            _this._currentSpline.draw(_this._ctx);
        };
        var addPoint = function (p) {
            _this._currentSpline.addPoint(p);
            _this._currentSpline.draw(_this._ctx);
        };
        var endCurve = function (p) {
            if (_this._currentSpline) {
                _this._currentSpline.addPoint(p);
                _this._currentSpline.draw(_this._ctx);
                _this.canvas.dispatchEvent(new CustomEvent("draw", { detail: { target: _this } }));
                _this._currentSpline = null;
            }
        };
        var mouseDown = false;
        this.canvas.addEventListener("singleTouchStart", function (evt) { startCurve(new vector_1.Vector(evt.detail.x, evt.detail.y, evt.detail.time)); });
        this.canvas.addEventListener("singleTouchMove", function (evt) { addPoint(new vector_1.Vector(evt.detail.x, evt.detail.y, evt.detail.time)); });
        this.canvas.addEventListener("singleTouchEnd", function (evt) { endCurve(new vector_1.Vector(evt.detail.x, evt.detail.y, evt.detail.time)); });
        this.canvas.addEventListener("mouseenter", function (evt) { });
        this.canvas.addEventListener("mouseleave", function (evt) {
            if (mouseDown) {
                mouseDown = false;
                endCurve(new vector_1.Vector(evt.offsetX, evt.offsetY));
            }
        });
        this.canvas.addEventListener("mousedown", function (evt) {
            if (evt.button === 0) {
                startCurve(new vector_1.Vector(evt.offsetX, evt.offsetY));
                mouseDown = true;
            }
        });
        this.canvas.addEventListener("mousemove", function (evt) {
            if (mouseDown) {
                addPoint(new vector_1.Vector(evt.offsetX, evt.offsetY));
            }
        });
        this.canvas.addEventListener("mouseup", function (evt) {
            if (mouseDown) {
                mouseDown = false;
                endCurve(new vector_1.Vector(evt.offsetX, evt.offsetY));
            }
        });
        window.addEventListener("resize", this._resize.bind(this));
        this._resize();
    }
    Object.defineProperty(SignCanvas.prototype, "context", {
        get: function () { return this._ctx; },
        enumerable: true,
        configurable: true
    });
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
