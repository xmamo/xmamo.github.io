"use strict";

var gameOfLife3d = gameOfLife3d || {};

gameOfLife3d.World = function (xMax, yMax, zMax, a, b, c, d) {
	var self = this;

	// The state of the game world is represented by a collection of two arrays. Only one of the two arrays is active
	// at any given time. Updates are done incrementally on the inactive array, keeping track of where we left off
	// using the "updated" variable.
	var arrays = [[], []];
	var active = 0;
	var updated = 0;

	for (var i = 0, volume = xMax * yMax * zMax; i < volume; ++i) {
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
			return arrays[active].length;
		}
	});

	self.get = function (x, y, z) {
		return get(active, x, y, z);
	};

	self.set = function (x, y, z, value) {
		return set(active, x, y, z, value);
	};

	self.forEach = function (callback) {
		forEach(active, callback);
	};

	self.updateCells = function (count) {
		var inactive = 1 - active;

		for (; count > 0; --count) {
			var x = updated % xMax;
			var z = Math.floor(updated / xMax) % zMax;
			var y = Math.floor(updated / (xMax * zMax)) % yMax;

			var neighbors = 0;

			for (var dy = -1; dy <= 1; ++dy) {
				for (var dz = -1; dz <= 1; ++dz) {
					for (var dx = -1; dx <= 1; ++dx) {
						if ((dx !== 0 || dy !== 0 || dz !== 0) && get(active, x + dx, y + dy, z + dz))
							++neighbors;
					}
				}
			}

			if (get(active, x, y, z))
				set(inactive, x, y, z, neighbors >= self.a && neighbors <= self.b);
			else
				set(inactive, x, y, z, neighbors >= self.c && neighbors <= self.d);

			if (++updated >= arrays[active].length) {
				active = inactive;
				updated = 0;
				self.onUpdateComplete();
				break;
			}
		}
	};

	function get(active, x, y, z) {
		if (x >= 0 && x < xMax && y >= 0 && y < yMax && z >= 0 && z < zMax)
			return arrays[active][x + z * xMax + y * (xMax * zMax)];
		else
			return false;
	}

	function set(active, x, y, z, value) {
		if (x >= 0 && x < xMax && y >= 0 && y < yMax && z >= 0 && z < zMax)
			arrays[active][x + z * xMax + y * (xMax * zMax)] = value;
	}

	function forEach(active, callback) {
		var activeArray = arrays[active];

		for (var y = 0; y < yMax; ++y) {
			for (var z = 0; z < zMax; ++z) {
				for (var x = 0; x < xMax; ++x) {
					var index = x + z * xMax + y * (xMax * zMax);
					var value = callback(x, y, z, activeArray[index]);
					if (value != null) activeArray[index] = value;
				}
			}
		}
	}
};