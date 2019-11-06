"use strict";

var util = util || {};

util.getSize = function (object) {
	var size = 0;
	for (var key in object) {
		size++;
	}
	return size;
};

util.firstStarting = function (string, candidates) {
	for (var i = 0, count = candidates.length; i < count; i++) {
		var candidate = candidates[i];
		if (string.startsWith(candidate)) {
			return candidate;
		}
	}
};