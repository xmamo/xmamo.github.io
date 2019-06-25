var gameOfLife = gameOfLife || {};

gameOfLife.World = function (width, height) {
	var arrays = [[], []];
	for (var i = 0; i < width * height; i++) {
		arrays[0][i] = false;
		arrays[1][i] = false;
	}

	var current = 0;

	Object.defineProperty(this, "width", {
		get: function () {
			return width;
		}
	});

	Object.defineProperty(this, "height", {
		get: function () {
			return height;
		}
	});

	Object.defineProperty(this, "area", {
		get: function () {
			return arrays[current].length;
		}
	});

	this.get = function (x, y) {
		if (x < 0 || x >= width) {
			return false;
		}
		if (y < 0 || y >= height) {
			return false;
		}

		return arrays[current][x + y * width];
	};

	this.set = function (x, y, value) {
		if (x < 0 || x >= width) {
			return;
		}
		if (y < 0 || y >= height) {
			return;
		}

		arrays[current][x + y * width] = value;
	};

	this.forEach = function (callback) {
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var value = callback(arrays[current][x + + y * width], x, y);
				if (value !== undefined) {
					arrays[current][x + + y * width] = value;
				}
			}
		}
	}

	this.updateCells = function () {
		for (var y = 0; y < height; y++) {
			for (var x = 0; x < width; x++) {
				var neighbours = 0;
				for (var dy = -1; dy <= 1; dy++) {
					for (var dx = -1; dx <= 1; dx++) {
						if (dx != 0 || dy != 0) {
							if (arrays[current][(x + dx + width) % width + (y + dy + height) % height * width]) {
								neighbours++;
							}
						}
					}
				}

				if (arrays[current][x + y * width]) {
					arrays[1 - current][x + y * width] = neighbours === 2 || neighbours === 3;
				} else {
					arrays[1 - current][x + y * width] = neighbours === 3;
				}
			}
		}

		current = 1 - current;
	};
}