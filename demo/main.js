(function (exportObject, exportName) {

    var canvas = null;
    var signCanvas = null;

    var _clear = () => {
        signCanvas.clear();
    }

    var _save = () => {
        
        signCanvas.canvas.toBlob((blob) => {
            var url = URL.createObjectURL(blob);
            window.open(url, "_blank");
        }, "image/jpeg");
    }

    window.addEventListener("load", () => {
        canvas = document.getElementById("sign-canvas");
        signCanvas = new sc.SignCanvas(canvas);
    });

    exportObject[exportName] = {
        clear: _clear,
        save: _save
    }

})(window, "Main");