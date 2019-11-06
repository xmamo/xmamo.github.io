"use strict";

var parse = parse || {};

parse.Context = function (source) {
	var self = this;
	var position = 0;
	var error = null;
	var errorPosition = 0;

	self.source = source;

	Object.defineProperty(self, "position", {
		get: function () {
			return position;
		},
		set: function (newPosition) {
			return position = Math.max(0, Math.min(newPosition, self.source.length));
		}
	});

	Object.defineProperty(self, "isAtEnd", {
		get: function () {
			return self.position == self.source.length;
		}
	});

	Object.defineProperty(self, "error", {
		get: function () {
			return error;
		},
		set: function (newError) {
			var position = self.position;
			if (position >= self.errorPosition) {
				error = newError;
				errorPosition = position;
			}
			return error;
		}
	});

	Object.defineProperty(self, "errorPosition", {
		get: function () {
			return errorPosition;
		}
	});

	self.peek = function (maxOffset) {
		if (maxOffset <= 0) {
			return "";
		}
		var position = self.position;
		return self.source.substring(position, Math.min(position + maxOffset, self.source.length));
	};

	self.advance = function (maxOffset) {
		var peek = self.peek(maxOffset);
		self.position += peek.length;
		return peek;
	};
};