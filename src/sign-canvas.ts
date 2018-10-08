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

    get context(): CanvasRenderingContext2D { return this._ctx; }

    get width(): number { return this.canvas.width; }
    get height(): number { return this.canvas.height; }

    set width(w: number) { this.canvas.width = w; }
    set height(h: number) { this.canvas.height = h; }

    constructor(public readonly canvas: HTMLCanvasElement, private readonly _aspectRatio: number = 2) {

        this._ctx = canvas.getContext("2d");

        handleSingleTouch(canvas, {});

        let startCurve = (p: Vector) => {
            this._currentSpline = new BezierSpline();
            this._currentSpline.penSize = this.width / VIRTUAL_WIDTH * this.penSize;
            this._currentSpline.penColor = this.penColor;
            this._currentSpline.addPoint(p);
            this._currentSpline.draw(this._ctx);
        }

        let addPoint = (p: Vector) => {
            this._currentSpline.addPoint(p);
            this._currentSpline.draw(this._ctx);
        }

        let endCurve = (p: Vector) => {
            if (this._currentSpline) {
                this._currentSpline.addPoint(p);
                this._currentSpline.draw(this._ctx);
                this.canvas.dispatchEvent(new CustomEvent("draw", { detail: { target: this } }));
                this._currentSpline = null;
            }
        }

        let mouseDown: boolean = false;

        this.canvas.addEventListener("singleTouchStart", (evt: CustomEvent) => { startCurve(new Vector(evt.detail.x, evt.detail.y, evt.detail.time)); });
        this.canvas.addEventListener("singleTouchMove", (evt: CustomEvent) => { addPoint(new Vector(evt.detail.x, evt.detail.y, evt.detail.time)); });
        this.canvas.addEventListener("singleTouchEnd", (evt: CustomEvent) => { endCurve(new Vector(evt.detail.x, evt.detail.y, evt.detail.time)); });

        this.canvas.addEventListener("mouseenter", (evt: MouseEvent) => { });
        this.canvas.addEventListener("mouseleave", (evt: MouseEvent) => {
            if (mouseDown) {
                mouseDown = false;
                endCurve(new Vector(evt.offsetX, evt.offsetY));
            }
        });
        this.canvas.addEventListener("mousedown", (evt: MouseEvent) => {
            if (evt.button === 0) {
                startCurve(new Vector(evt.offsetX, evt.offsetY));
                mouseDown = true;
            }
        });
        this.canvas.addEventListener("mousemove", (evt: MouseEvent) => {
            if (mouseDown) {
                addPoint(new Vector(evt.offsetX, evt.offsetY));
            }
        });
        this.canvas.addEventListener("mouseup", (evt: MouseEvent) => {
            if (mouseDown) {
                mouseDown = false;
                endCurve(new Vector(evt.offsetX, evt.offsetY));
            }
        });

        window.addEventListener("resize", this._resize.bind(this));

        this._resize();
    }

    public clear(): void {
        this._ctx.fillStyle = this.backgroundColor.toCSSColor();
        this._ctx.fillRect(0, 0, this.width, this.height);
    }


    private _resize(): void {
        let w = $(this.canvas).width();
        let h = w / this._aspectRatio;

        this.width = w;
        this.height = h;

        this.clear();


    }


}