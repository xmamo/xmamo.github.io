"use strict";

var gameOfLife = gameOfLife || {};

gameOfLife.World = function (width, height, a, b, c, d, wrap) {
	var self = this;
	var arrays = [[], []];
	var current = 0;
	for (var i = 0, area = width * height; i < area; i++) {
		arrays[current].push(false);
		arrays[1 - current].push(false);
	}

	self.a = a;
	self.b = b;
	self.c = c;
	self.d = d;
	self.wrap = wrap;

	Object.defineProperty(self, "width", {
		get: function () {
			return width;
		}
	});

	Object.defineProperty(self, "height", {
		get: function () {
			return height;
		}
	});

	Object.defineProperty(self, "area", {
		get: function () {
			return arrays[current].length;
		}
	});

	self.get = function (x, y) {
		if (x < 0 || x >= width) {
			return false;
		}
		if (y < 0 || y >= height) {
			return false;
		}

		return arrays[current][x + y * width];
	};

	self.set = function (x, y, value) {
		if (x < 0 || x >= width) {
			return;
		}
		if (y < 0 || y >= height) {
			return;
		}

		arrays[current][x + y * width] = value;
	};

	self.forEach = function (callback) {
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var value = callback(arrays[current][x + y * width], x, y);
				if (value !== undefined) {
					arrays[current][x + y * width] = value;
				}
			}
		}
	};

	self.updateCells = function () {
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var neighbours = 0;
				for (var dy = -1; dy <= 1; dy++) {
					for (var dx = -1; dx <= 1; dx++) {
						if (dx != 0 || dy != 0) {
							if (wrap) {
								if (arrays[current][(x + dx + width) % width + (y + dy + height) % height * width]) {
									neighbours++;
								}
							} else {
								if (self.get(x + dx, y + dy)) {
									neighbours++;
								}
							}
						}
					}
				}

				if (arrays[current][x + y * width]) {
					arrays[1 - current][x + y * width] = neighbours >= self.a && neighbours <= self.b;
				} else {
					arrays[1 - current][x + y * width] = neighbours >= self.c && neighbours <= self.d;
				}
			}
		}

		current = 1 - current;
	};
};