"use strict";

var gameOfLife3d = gameOfLife3d || {};

gameOfLife3d.World = function (xMax, yMax, zMax, a, b, c, d) {
	var self = this;
	var current = 0;
	var updated = 0;
	var arrays = [[], []];
	for (var i = 0, volume = xMax * yMax * zMax; i < volume; i++) {
		arrays[0].push(false);
		arrays[1].push(false);
	}

	self.a = a;
	self.b = b;
	self.c = c;
	self.d = d;
	self.onUpdateComplete = function () { };

	Object.defineProperty(self, "xMax", {
		get: function () {
			return xMax;
		}
	});

	Object.defineProperty(self, "yMax", {
		get: function () {
			return yMax;
		}
	});

	Object.defineProperty(self, "zMax", {
		get: function () {
			return zMax;
		}
	});

	Object.defineProperty(self, "volume", {
		get: function () {
			return arrays[current].length;
		}
	});

	self.get = function (x, y, z) {
		if (x < 0 || x >= xMax || y < 0 || y >= yMax || z < 0 || z >= zMax) {
			return false;
		}
		return arrays[current][x + z * xMax + y * (xMax * zMax)];
	};

	self.set = function (x, y, z, value) {
		if (x < 0 || x >= xMax || y < 0 || y >= yMax || z < 0 || z >= zMax) {
			return;
		}
		arrays[current][x + z * xMax + y * (xMax * zMax)] = value;
	};

	self.forEach = function (callback) {
		var currentArray = arrays[current];

		for (var y = 0; y < yMax; y++) {
			for (var z = 0; z < zMax; z++) {
				for (var x = 0; x < xMax; x++) {
					var index = x + z * xMax + y * (xMax * zMax);
					var value = callback(currentArray[index], x, y, z);
					if (value !== undefined) {
						currentArray[index] = value;
					}
				}
			}
		}
	};

	self.updateCells = function (count) {
		var currentArray = arrays[current];
		var otherArray = arrays[1 - current];
		var xzArea = xMax * zMax;

		for (; count > 0; count--) {
			var x = updated % xMax;
			var z = Math.floor(updated / xMax) % zMax;
			var y = Math.floor(updated / xzArea) % yMax;

			var neighbours = 0;
			for (var dy = -1; dy <= 1; dy++) {
				for (var dz = -1; dz <= 1; dz++) {
					for (var dx = -1; dx <= 1; dx++) {
						if ((dx !== 0 || dy !== 0 || dz !== 0) && currentArray[(x + dx + xMax) % xMax + ((z + dz + zMax) % zMax) * xMax + ((y + dy + yMax) % yMax) * xzArea]) {
							neighbours++;
						}
					}
				}
			}

			if (currentArray[x + z * xMax + y * xzArea]) {
				otherArray[x + z * xMax + y * xzArea] = neighbours >= self.a && neighbours <= self.b;
			} else {
				otherArray[x + z * xMax + y * xzArea] = neighbours >= self.c && neighbours <= self.d;
			}

			if (++updated >= currentArray.length) {
				current = 1 - current;
				updated = 0;
				self.onUpdateComplete();
				break;
			}
		}
	};
};