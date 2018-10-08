# Sign-Canvas
HTML Canvas for handwritten signature input.
Curve aproximation done with a cubic Beziér spline (see implementation for details on how the curve is constructed) and the movement speed affects the brush size trying to mimic a real pen.

## How to use
There's a sample usage under the "demo" folder. You can try it [here](https://erbuka.github.io/sign-canvas/demo/).

## Build
Open the root folder with Visual Studio Code and run task **build**. The process will create normal and minified version under the folder 
"build". If you don't use the visual studio code, run the following commands:
- **normal**: browserify ./src/index.ts -p [ tsify ] > ./build/sign-canvas.js
- **minified**: browserify ./src/index.ts -p [ tsify ] | uglifyjs > ./build/sign-canvas.min.js

Requires **browserify** and **tsify** (and **uglifyjs** for the minified version).

