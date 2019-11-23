"use strict";

var gameOfLife = gameOfLife || {};

gameOfLife.World = function (width, height, a, b, c, d, wrap) {
	var self = this;
	var current = 0;
	var arrays = [[], []];
	for (var i = 0, area = width * height; i < area; i++) {
		arrays[0].push(false);
		arrays[1].push(false);
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
		if (x < 0 || x >= width || y < 0 || y >= height) {
			return false;
		}
		return arrays[current][x + y * width];
	};

	self.set = function (x, y, value) {
		if (x < 0 || x >= width || y < 0 || y >= height) {
			return;
		}
		arrays[current][x + y * width] = value;
	};

	self.forEach = function (callback) {
		var currentArray = arrays[current];

		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var index = x + y * width;
				var value = callback(currentArray[index], x, y);
				if (value !== undefined) {
					currentArray[index] = value;
				}
			}
		}
	};

	self.updateCells = function () {
		var currentArray = arrays[current];
		var otherArray = arrays[1 - current];

		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var neighbours = 0;
				for (var dy = -1; dy <= 1; dy++) {
					for (var dx = -1; dx <= 1; dx++) {
						if (dx !== 0 || dy !== 0) {
							if (wrap) {
								if (currentArray[(x + dx + width) % width + (y + dy + height) % height * width]) {
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

				if (currentArray[x + y * width]) {
					otherArray[x + y * width] = neighbours >= self.a && neighbours <= self.b;
				} else {
					otherArray[x + y * width] = neighbours >= self.c && neighbours <= self.d;
				}
			}
		}

		current = 1 - current;
	};
};