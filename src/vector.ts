export class Vector {
    readonly time: number;
    constructor(public x: number = 0, public y: number = 0, time: number = null) {
        this.time = time || new Date().getTime();
    }

    velocityFrom(o: Vector): number {
        let dt = this.time - o.time;
        let dxdt = (this.x - o.x) / dt;
        let dydt = (this.y - o.x) / dt;
        return Math.sqrt(dxdt * dxdt + dydt * dydt);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    squaredLength(): number {
        return this.x * this.x + this.y * this.y;
    }

    sub(o: Vector): Vector {
        return new Vector(this.x - o.x, this.y - o.y);
    }

    squaredDistance(o: Vector): number {
        return this.sub(o).squaredLength();
    }

    distance(o: Vector) {
        return this.sub(o).length();
    }

    normalized(): Vector {
        let l = this.length();
        if (l > 0) {
            return new Vector(this.x / l, this.y / l);
        }
    }
    set(x: number, y: number): Vector {
        this.x = x;
        this.y = y;
        return this;
    }

    copy(o: Vector): Vector {
        this.x = o.x;
        this.y = o.y;
        return this;
    }

    setAdd(o: Vector): Vector {
        this.x += o.x;
        this.y += o.y;
        return this;
    }

    setScale(k: number): Vector {
        this.x *= k;
        this.y *= k;
        return this;
    }

    setNormalized(): Vector {
        let l = this.length();
        if (l > 0) {
            this.x /= l;
            this.y /= l;
        }
        return this;

    }


    reset(): Vector {
        this.x = this.y = 0;
        return this;
    }
}