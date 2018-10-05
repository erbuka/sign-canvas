(function (exportObject, exportName) {

    var canvas = null;
    var signCanvas = null;

    var _clear = () => {
        signCanvas.clear();
    }

    window.addEventListener("load", () => {
        canvas = document.getElementById("sign-canvas");
        signCanvas = new sc.SignCanvas(canvas);
    });

    exportObject[exportName] = {
        clear: _clear
    }

})(window, "Main");