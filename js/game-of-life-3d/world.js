"use strict";

var gameOfLife3d = gameOfLife3d || {};

(function () {
	var modulo = utils.modulo;

	gameOfLife3d.World = function (xMax, yMax, zMax, wrap, environment, fertility) {
		var self = this;

		// The state of the game world is represented by a collection of two arrays. Only one of the two arrays is
		// active at any given time. Updates are done incrementally on the inactive array, keeping track of where we
		// left off using the "updated" variable.
		var arrays = [[], []];
		var active = 0;
		var updated = 0;

		// Changes on "wrap" are delayed until incremental updates are completed
		var newWrap = wrap;

		for (var i = 0, volume = xMax * yMax * zMax; i < volume; ++i) {
			arrays[0].push(false);
			arrays[1].push(false);
		}

		self.environment = environment;
		self.fertility = fertility;

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

		Object.defineProperty(self, "wrap", {
			get: function () {
				return wrap;
			},

			set: function (wrap) {
				newWrap = wrap;
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
				var x0 = updated % xMax;
				var z0 = Math.floor(updated / xMax) % zMax;
				var y0 = Math.floor(updated / (xMax * zMax)) % yMax;

				var neighbors = 0;

				for (var dy = -1; dy <= 1; ++dy) {
					for (var dz = -1; dz <= 1; ++dz) {
						for (var dx = -1; dx <= 1; ++dx) {
							if (dx !== 0 || dy !== 0 || dz !== 0) {
								var x = x0 + dx;
								var y = y0 + dy;
								var z = z0 + dz;

								if (wrap) {
									x = modulo(x, xMax);
									y = modulo(y, yMax);
									z = modulo(z, zMax);
								}

								if (get(active, x, y, z))
									++neighbors;
							}
						}
					}
				}

				if (get(active, x0, y0, z0))
					set(inactive, x0, y0, z0, self.environment.indexOf(neighbors) >= 0);
				else
					set(inactive, x0, y0, z0, self.fertility.indexOf(neighbors) >= 0);

				if (++updated >= arrays[active].length) {
					active = inactive;
					updated = 0;
					wrap = newWrap;
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
})();