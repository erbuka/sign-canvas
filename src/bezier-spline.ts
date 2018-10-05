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

    private _directions: Vector[] = [];
    private _intervals: Interval[] = [];
    private _points: Vector[] = [];
    private _length = 0;

    private _vt0 = new Vector();
    private _vt1 = new Vector();
    private _vt2 = new Vector();
    private _vt3 = new Vector();

    private _vt4 = new Vector();
    private _vt5 = new Vector();
    private _vt6 = new Vector();
    private _vt7 = new Vector();

    get length(): number { return this._length; }

    get penSizeFast(): number { return this.penSize * 0.3; }

    constructor() {

    }

    addPoint(p: Vector): void {

        if (this._points.length >= 1 && this._tooClose(p, this._points[this._points.length - 1])) {
            return;
        }

        this._points.push(p);

        if (this._points.length >= 2) {
            let p0 = this._points[this._points.length - 2];
            let p1 = this._points[this._points.length - 1];
            let dist = p0.distance(p1);
            this._intervals.push(new Interval(this._length, this._length + dist));
            this._directions.push(p1.sub(p0).normalized());
            this._length += dist;
        }
    }



    sample(t: number, out: Vector = null): Vector {

        let v = out || new Vector();

        let p0 = this._vt0;
        let p1 = this._vt1;
        let p2 = this._vt2;
        let p3 = this._vt3;

        for (let i = 0; i < this._intervals.length; i++) {
            let interval = this._intervals[i];
            if (interval.inside(t)) {
                let k = (t - interval.start) / interval.length;
                let l3 = interval.length / 3;
                p0.copy(this._points[i])
                p3.copy(this._points[i + 1]);

                if (i === 0) { // first interval
                    p1.copy(this._directions[i]).setScale(l3).setAdd(p0);
                } else {
                    p1.copy(this._directions[i]).setAdd(this._directions[i - 1]).setNormalized().setScale(l3).setAdd(p0);
                }


                if (i === this._intervals.length - 1) { // last interval
                    p2.copy(this._directions[i]).setScale(-l3).setAdd(p3);
                } else {
                    p2.copy(this._directions[i]).setAdd(this._directions[i + 1]).setNormalized().setScale(-l3).setAdd(p3);
                }

                return this._evalCubicBezier(k, p0, p1, p2, p3, v);
            }
        }

        return v;

    }

    draw(ctx: CanvasRenderingContext2D): void {
        let v = new Vector();

        let maxVelocity = this.penSize * 400;

        ctx.fillStyle = this.penColor.toCSSColor();

        for (let i = 0; i < this._intervals.length; i++) {
            let interval = this._intervals[i];
            let step = this.penSizeFast / 4;

            let prevPenSize = i === 0 ? this.penSize : this._penSize(this._intervalVelocity(i - 1), maxVelocity);
            //let endPenSize = i === this._intervals.length - 1 ? this.penSizeFast : this._penSize(this._intervalVelocity(i + 1), maxVelocity);
            let currentPenSize = this._penSize(this._intervalVelocity(i), maxVelocity);


            for (let t = interval.start; t <= interval.end; t += step) {
                let k = interval.length / (interval.end - interval.start);
                //let penSize = (1 - k) * startPenSize + k * endPenSize;
                let penSize = prevPenSize * 0.7 + currentPenSize * 0.3;

                this.sample(t, v);

                ctx.beginPath();
                ctx.arc(v.x, v.y, penSize, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }

    private _intervalVelocity(idx: number): number {
        return this._intervals[idx].length / ((this._points[idx + 1].time - this._points[idx].time) / 1000);
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
        return p0.squaredDistance(p1) <= (this.penSize * 100);
    }

    private _penSize(vel: number, maxVel: number): number {
        vel = Math.min(vel, maxVel);
        let t = vel / maxVel;
        return (1 - t) * this.penSize + t * this.penSizeFast;
    }

}