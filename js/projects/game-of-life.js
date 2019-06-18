(function () {
	Number.prototype.mod = function (number) {
		return (this % number + number) % number;
	};

	function Field(width, height) {
		var array = new Array(width * height);
		for (var i = 0; i < array.length; i++) {
			array[i] = [false, false];
		}

		var i = 0;

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

		this.get = function (x, y) {
			return array[width * y + x][i];
		};

		this.set = function (x, y) {
			array[width * y + x][i] = true;
		};

		this.reset = function (x, y) {
			array[width * y + x][i] = false;
		}

		this.update = function () {
			for (var y = 0; y < height; y++) {
				for (var x = 0; x < width; x++) {
					var cell = array[width * y + x];

					var neighbours = 0;
					for (var dy = -1; dy <= 1; dy++) {
						for (var dx = -1; dx <= 1; dx++) {
							if (dx != 0 || dy != 0) {
								if (array[width * (y + dy).mod(height) + (x + dx).mod(width)][i]) {
									neighbours++;
								}
							}
						}
					}

					if (cell[i]) {
						cell[1 - i] = neighbours === 2 || neighbours === 3;
					} else {
						cell[1 - i] = neighbours === 3;
					}
				}
			}

			i = 1 - i;
		};
	}

	var canvas = document.getElementById("canvas");
	var mouse = { x: -1, y: -1, leftDown: false, rightDown: false };

	canvas.onmousemove = function (event) {
		mouse.x = canvas.width / canvas.getBoundingClientRect().width * (event.x - canvas.getBoundingClientRect().x);
		mouse.y = canvas.height / canvas.getBoundingClientRect().height * (event.y - canvas.getBoundingClientRect().y);

		if (mouse.leftDown && !mouse.rightDown) {
			field.set(
				Math.floor(field.width / canvas.width * mouse.x),
				Math.floor(field.height / canvas.height * mouse.y)
			);
		} else if (mouse.rightDown && !mouse.leftDown) {
			field.reset(
				Math.floor(field.width / canvas.width * mouse.x),
				Math.floor(field.height / canvas.height * mouse.y)
			);
		}
	};

	canvas.oncontextmenu = function (event) {
		return false;
	}

	document.onmousedown = function (event) {
		switch (event.button) {
			case 0:
				mouse.leftDown = true;
				break;
			case 2:
				mouse.rightDown = true;
				break;
		}
	};

	document.onmouseup = function (event) {
		switch (event.button) {
			case 0:
				mouse.leftDown = false;
				break;
			case 2:
				mouse.rightDown = false;
				break;
		}
	};

	var form = document.forms["gol"];
	var context = canvas.getContext("2d");
	var field = new Field(48, 27);
	var lastUpdate = 0;

	var frameRequestCallback = function (timeStamp) {
		var time = timeStamp / 1000;

		if (time >= lastUpdate + 1 / form.speed.value) {
			field.update();
			lastUpdate = time;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);

		// context.fillStyle = "#000";
		for (var y = 0; y < field.height; y++) {
			for (var x = 0; x < field.width; x++) {
				if (field.get(x, y)) {
					context.fillRect(
						canvas.width / field.width * x,
						canvas.height / field.height * y,
						canvas.width / field.width,
						canvas.height / field.height
					);
				}
			}
		}

		// context.fillStyle = "rgba(0, 0, 0, 0.5)";
		context.strokeRect(
			canvas.width / field.width * Math.floor(field.width / canvas.width * mouse.x),
			canvas.height / field.height * Math.floor(field.height / canvas.height * mouse.y),
			canvas.width / field.width,
			canvas.height / field.height
		);

		window.requestAnimationFrame(frameRequestCallback);
	};
	window.requestAnimationFrame(frameRequestCallback);
})();