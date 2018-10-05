import { Vector } from './vector';

declare var $;

interface TSTouch {
    identifier: number;
    pageX: number;
    pageY: number;
    timeStamp: number;
}


function _copyTouch(touch: Touch): TSTouch {
    return {
        identifier: touch.identifier,
        pageX: touch.pageX,
        pageY: touch.pageY,
        timeStamp: new Date().getTime()
    };
};


export function handleSingleTouch(element, settings) {

    var defaultSettings = {

    };

    $.extend(defaultSettings, settings);

    var dispatchSingleTouchEvent = function (name: string, x: number, y: number, t: number, evt: TouchEvent) {
        element.dispatchEvent(
            new CustomEvent(
                name,
                {
                    detail: {
                        x: x,
                        y: y,
                        time: t,
                        originalEvent: evt
                    }
                }
            )
        );
    };

    var currentTouch: TSTouch = null;

    var $element = $(element);


    element.addEventListener("touchstart", function (evt: TouchEvent) {
        if (currentTouch == null && evt.changedTouches.length > 0) {
            currentTouch = _copyTouch(evt.changedTouches[0]);

            dispatchSingleTouchEvent(
                "singleTouchStart",
                currentTouch.pageX - $element.offset().left,
                currentTouch.pageY - $element.offset().top,
                currentTouch.timeStamp,
                evt
            );

        };
    });

    element.addEventListener("touchmove", function (evt) {
        if (currentTouch != null) {
            for (var i = 0; i < evt.changedTouches.length; i++) {
                if (evt.changedTouches[i].identifier === currentTouch.identifier) {
                    currentTouch = _copyTouch(evt.changedTouches[i]);
                    dispatchSingleTouchEvent(
                        "singleTouchMove",
                        currentTouch.pageX - $element.offset().left,
                        currentTouch.pageY - $element.offset().top,
                        currentTouch.timeStamp,
                        evt
                    );
                }
            }
        }
    });

    element.addEventListener("touchend", function (evt) {
        if (currentTouch != null) {
            for (var i = 0; i < evt.changedTouches.length; i++) {
                var touch = _copyTouch(evt.changedTouches[i]);
                if (touch.identifier === currentTouch.identifier) {

                    dispatchSingleTouchEvent(
                        "singleTouchEnd",
                        touch.pageX - $element.offset().left,
                        touch.pageY - $element.offset().top,
                        touch.timeStamp,
                        evt
                    );
                }
            }

            currentTouch = null;
        }
    });

};
