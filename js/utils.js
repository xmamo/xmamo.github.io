"use strict";

var utils = utils || {};

utils.getSize = function (object) {
	var size = 0;
	for (var key in object) {
		size++;
	}
	return size;
};

utils.firstStarting = function (string, candidates) {
	for (var i = 0, count = candidates.length; i < count; i++) {
		var candidate = candidates[i];
		if (string.startsWith(candidate)) {
			return candidate;
		}
	}
};

utils.touchToMouse = function (event, type) {
	var mouseEventInit = {
		ctrlKey: event.ctrlKey,
		shiftKey: event.shiftKey,
		altKey: event.altKey,
		metaKey: event.metaKey,
		relatedTarget: event.relatedTarget
	};
	var touches = event.touches;
	if (touches.length > 0) {
		var touch = touches[0];
		mouseEventInit.screenX = touch.screenX;
		mouseEventInit.screenY = touch.screenY;
		mouseEventInit.clientX = touch.clientX;
		mouseEventInit.clientY = touch.clientY;
		mouseEventInit.ctrlKey = event.ctrlKey;
	}
	return new MouseEvent(type, mouseEventInit);
};