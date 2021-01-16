"use strict";

var gameOfLife = gameOfLife || {};

(function () {
	var modulo = utils.modulo;

	gameOfLife.World = function (width, height, a, b, c, d, wrap) {
		var self = this;

		// The state of the game world is represented by a collection of two arrays. Only one of the two arrays is
		// active at any given time. Updates are computed by querying the inactive array. 
		var arrays = [[], []];
		var active = 0;

		for (var i = 0, area = width * height; i < area; ++i) {
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
				return arrays[active].length;
			}
		});

		self.get = function (x, y) {
			return get(active, x, y);
		};

		self.set = function (x, y, value) {
			set(active, x, y, value);
		};

		self.forEach = function (callback) {
			forEach(active, callback);
		};

		self.updateCells = function () {
			var inactive = 1 - active;

			for (var y = 0; y < height; ++y) {
				for (var x = 0; x < width; ++x) {
					var neighbors = 0;

					for (var dy = -1; dy <= 1; ++dy) {
						for (var dx = -1; dx <= 1; ++dx) {
							if (dx !== 0 || dy !== 0) {
								if (wrap) {
									if (get(active, modulo(x + dx, width), modulo(y + dy, height))) ++neighbors;
								} else {
									if (get(active, x + dx, y + dy)) ++neighbors;
								}
							}
						}
					}

					if (get(active, x, y))
						set(inactive, x, y, neighbors >= self.a && neighbors <= self.b);
					else
						set(inactive, x, y, neighbors >= self.c && neighbors <= self.d);
				}
			}

			active = inactive;
		};

		function get(active, x, y) {
			if (x >= 0 && x < width && y >= 0 && y < height)
				return arrays[active][x + y * width];
			else
				return false;
		}

		function set(active, x, y, value) {
			if (x >= 0 && x < width && y >= 0 && y < height)
				arrays[active][x + y * width] = value;
		}

		function forEach(active, callback) {
			var activeArray = arrays[active];

			for (var y = 0; y < height; ++y) {
				for (var x = 0; x < width; ++x) {
					var index = x + y * width;
					var value = callback(x, y, activeArray[index]);
					if (value != null) activeArray[index] = value;
				}
			}
		}
	};
})();