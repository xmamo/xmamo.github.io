"use strict";

var gameOfLife3d = gameOfLife3d || {};

gameOfLife3d.World = function (xMax, yMax, zMax, a, b, c, d) {
	var arrays = [[], []];
	for (var i = 0, volume = xMax * yMax * zMax; i < volume; i++) {
		arrays[0].push(false);
		arrays[1].push(false);
	}
	var current = 0;
	var updated = 0;

	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
	this.onUpdateComplete = function () { };

	Object.defineProperty(this, "xMax", {
		get: function () {
			return xMax;
		}
	});

	Object.defineProperty(this, "yMax", {
		get: function () {
			return yMax;
		}
	});

	Object.defineProperty(this, "zMax", {
		get: function () {
			return zMax;
		}
	});

	Object.defineProperty(this, "volume", {
		get: function () {
			return arrays[current].length;
		}
	});

	this.get = function (x, y, z) {
		if (x < 0 || x >= xMax) {
			return false;
		}
		if (y < 0 || y >= yMax) {
			return false;
		}
		if (z < 0 || z >= zMax) {
			return false;
		}

		return arrays[current][x + z * xMax + y * xMax * zMax];
	};

	this.set = function (x, y, z, value) {
		if (x < 0 || x >= xMax) {
			return;
		}
		if (y < 0 || y >= yMax) {
			return;
		}
		if (z < 0 || z >= zMax) {
			return;
		}

		arrays[current][x + z * xMax + y * xMax * zMax] = value;
	};

	this.forEach = function (callback) {
		for (var y = 0; y < yMax; y++) {
			for (var z = 0; z < zMax; z++) {
				for (var x = 0; x < xMax; x++) {
					var value = callback(arrays[current][x + z * xMax + y * xMax * zMax], x, y, z);
					if (value !== undefined) {
						arrays[current][x + z * xMax + y * xMax * zMax] = value;
					}
				}
			}
		}
	};

	this.updateCells = function (count) {
		for (; count > 0; count--) {
			var x = updated % xMax;
			var z = Math.floor(updated / xMax) % zMax;
			var y = Math.floor(Math.floor(updated / xMax) / zMax);

			var neighbours = 0;
			for (var dy = -1; dy <= 1; dy++) {
				for (var dz = -1; dz <= 1; dz++) {
					for (var dx = -1; dx <= 1; dx++) {
						if (dx !== 0 || dy !== 0 || dz !== 0) {
							if (arrays[current][(x + dx + xMax) % xMax + (z + dz + zMax) % zMax * xMax + (y + dy + yMax) % yMax * xMax * zMax]) {
								neighbours++;
							}
						}
					}
				}
			}

			if (arrays[current][x + z * xMax + y * xMax * zMax]) {
				arrays[1 - current][x + z * xMax + y * xMax * zMax] = neighbours >= this.a && neighbours <= this.b;
			} else {
				arrays[1 - current][x + z * xMax + y * xMax * zMax] = neighbours >= this.c && neighbours <= this.d;
			}

			if (++updated == arrays[current].length) {
				current = 1 - current;
				updated = 0;

				this.onUpdateComplete();
			}
		}
	};
};