import { Color, BezierSpline } from "./bezier-spline";
import { handleSingleTouch } from "./single-touch";
import { Vector } from "./vector";
declare var $;

const VIRTUAL_WIDTH = 100;

export class SignCanvas {

    public penSize: number = 0.5;
    public penColor: Color = new Color(0, 0, 0);
    public backgroundColor: Color = new Color(255, 255, 255);

    private _ctx: CanvasRenderingContext2D;
    private _currentSpline: BezierSpline = null;

    get width(): number { return this.canvas.width; }
    get height(): number { return this.canvas.height; }

    set width(w: number) { this.canvas.width = w; }
    set height(h: number) { this.canvas.height = h; }

    constructor(public readonly canvas: HTMLCanvasElement, private readonly _aspectRatio: number = 2) {

        this._ctx = canvas.getContext("2d");

        handleSingleTouch(canvas, {});

        this.canvas.addEventListener("singleTouchStart", (evt: CustomEvent) => {
            this._currentSpline = new BezierSpline();
            this._currentSpline.penSize = this.width / VIRTUAL_WIDTH * this.penSize;
            this._currentSpline.penColor = this.penColor;
            this._currentSpline.addPoint(new Vector(evt.detail.x, evt.detail.y, evt.detail.time));
        });

        this.canvas.addEventListener("singleTouchMove", (evt: CustomEvent) => {
            this._currentSpline.addPoint(new Vector(evt.detail.x, evt.detail.y, evt.detail.time));
        });

        this.canvas.addEventListener("singleTouchEnd", (evt: CustomEvent) => {
            this._currentSpline = null;
            this.canvas.dispatchEvent(new CustomEvent("draw", { detail: { target: this } }));
        });

        window.addEventListener("resize", this._resize.bind(this));


        this._resize();
        this._loop();
    }

    public clear(): void {
        this._ctx.fillStyle = this.backgroundColor.toCSSColor();
        this._ctx.fillRect(0, 0, this.width, this.height);
    }

    private _loop(): void {
        window.requestAnimationFrame(this._loop.bind(this));

        if (this._currentSpline !== null) {
            this._currentSpline.draw(this._ctx);
        }

    }

    private _resize(): void {
        let w = $(this.canvas).width();
        let h = w / this._aspectRatio;

        this.width = w;
        this.height = h;

        this.clear();


    }


}