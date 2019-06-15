"use strict";

(function () {
    var elements = document.getElementsByClassName("js-only");
    while (elements.length > 0) {
        elements[0].classList.remove("js-only");
    }
})();