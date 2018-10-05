import { Vector } from './vector';

class Interval {
    readonly length: number;
    constructor(readonly start: number, readonly end: number) {
        this.length = end - start;
    }

    inside(t: number) {
        return t >= this.start && t <= this.end;
    }
}

export class Color {
    constructor(public r: number, public g: number, public b: number) { }
    toCSSColor(opacity: number = 1.0): string { return `rgb(${this.r},${this.g},${this.b},${opacity})` }
}

export class BezierSpline {

    public penSize: number = 4;
    public penColor: Color = new Color(0, 0, 0);

    private _penVelocity = 0;

    private _points: Vector[] = [];

    private _vt0 = new Vector();
    private _vt1 = new Vector();
    private _vt2 = new Vector();
    private _vt3 = new Vector();

    private _vt4 = new Vector();
    private _vt5 = new Vector();
    private _vt6 = new Vector();
    private _vt7 = new Vector();

    get penSizeFast(): number { return this.penSize * 0.35; }

    constructor() {

    }

    addPoint(p: Vector): void {

        if (this._points.length >= 1 && this._tooClose(p, this._points[this._points.length - 1])) {
            return;
        }

        this._points.push(p);

        if (this._points.length > 4) {
            this._points.shift();
        }
    }

    draw(ctx: CanvasRenderingContext2D) {

        // We draw only if we have enough points(4)
        if (this._points.length < 4)
            return;

        // Init the data required to build the curve
        let directions: Vector[] = [];
        let intervals: Interval[] = [];

        for (let i = 0; i < this._points.length - 1; i++) {
            let p0 = this._points[i];
            let p1 = this._points[i + 1];

            intervals.push(new Interval(0, p0.distance(p1)));
            directions.push(p1.sub(p0).setNormalized());
        }

        let l3 = intervals[1].length / 3;

        // Create the curve
        let p0 = this._vt0.copy(this._points[1]); // first point
        let p3 = this._vt3.copy(this._points[2]); // last point
        // Mid points
        let p1 = this._vt1.copy(directions[1]).setAdd(directions[0]).setNormalized().setScale(l3).setAdd(p0);
        let p2 = this._vt2.copy(directions[1]).setAdd(directions[2]).setNormalized().setScale(-l3).setAdd(p3);
        let v = new Vector();

        let maxPenVelocity = this.penSize * 400;
        let targetVelocity = this._intervalVelocity(intervals, 1);
        let velocityStep = maxPenVelocity / 10;


        let step = this.penSize / 3;

        ctx.fillStyle = "#000";

        for (let t = intervals[1].start; t < intervals[1].length; t += step) {
            let k = (t - intervals[1].start) / intervals[1].length;

            this._evalCubicBezier(k, p0, p1, p2, p3, v);

            this._penVelocity = this._moveTowards(targetVelocity, this._penVelocity, velocityStep);
            let penSize = this._calcPenSize(this._penVelocity, maxPenVelocity);

            ctx.beginPath();
            ctx.arc(v.x, v.y, penSize, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    _moveTowards(target: number, value: number, step: number): number {
        step = Math.abs(step);
        let dir = (target - value) / Math.abs(target - value);

        return dir > 0 ?
            Math.min(value + step, target) :
            Math.max(value - step, target);
    }


    private _intervalVelocity(intervals: Interval[], idx: number): number {
        return intervals[idx].length / ((this._points[idx + 1].time - this._points[idx].time) / 1000);
    }

    private _evalCubicBezier(t: number, p0: Vector, p1: Vector, p2: Vector, p3: Vector, out: Vector): Vector {
        let v = out || new Vector();
        let tt = t * t;
        let ttt = tt * t;
        let _t = (1 - t);
        let _tt = _t * _t;
        let _ttt = _tt * _t;

        let v0 = this._vt4;
        let v1 = this._vt5;
        let v2 = this._vt6;
        let v3 = this._vt7;

        v0.copy(p0).setScale(_ttt);
        v1.copy(p1).setScale(3 * _tt * t);
        v2.copy(p2).setScale(3 * _t * tt);
        v3.copy(p3).setScale(ttt);

        return v.reset().setAdd(v0).setAdd(v1).setAdd(v2).setAdd(v3);
    }

    private _tooClose(p0: Vector, p1: Vector): boolean {
        return p0.squaredDistance(p1) <= this.penSize;
    }

    private _calcPenSize(vel: number, maxVel: number): number {
        vel = Math.min(vel, maxVel);
        let t = vel / maxVel;
        return (1 - t) * this.penSize + t * this.penSizeFast;
    }

}
