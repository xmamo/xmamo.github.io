"use strict";

(function () {
	var world = new gameOfLife.World(48, 27);
	var canvas = document.getElementById("game-of-life-canvas");
	var context = canvas.getContext("2d");
	var mouseX = -1;
	var mouseY = -1;
	var leftDown = false;
	var rightDown = false;
	var paused = false;
	var lastUpdate = 0;

	canvas.addEventListener("contextmenu", function () {
		return false;
	});

	canvas.addEventListener("mousedown", function (event) {
		switch (event.button) {
			case 0:
				leftDown = true;
				break;
			case 2:
				rightDown = true;
				break;
		}

		if (leftDown ^ rightDown) {
			world.set(
				Math.floor(mouseX * world.width / canvas.clientWidth),
				Math.floor(mouseY * world.height / canvas.clientHeight),
				leftDown
			);
		}

		return false;
	});

	document.addEventListener("mouseup", function (event) {
		switch (event.button) {
			case 0:
				leftDown = false;
				break;
			case 2:
				rightDown = false;
				break;
		}
		return event.target !== canvas;
	});

	document.addEventListener("mousemove", function (event) {
		var newMouseX = event.clientX - canvas.getBoundingClientRect().x;
		var newMouseY = event.clientY - canvas.getBoundingClientRect().y;

		if (leftDown ^ rightDown) {
			var x0 = Math.floor(mouseX * world.width / canvas.clientWidth);
			var x1 = Math.floor(newMouseX * world.width / canvas.clientWidth);
			var y0 = Math.floor(mouseY * world.height / canvas.clientHeight);
			var y1 = Math.floor(newMouseY * world.height / canvas.clientHeight);
			var dx = x1 - x0;
			var dy = y1 - y0;
			var step = Math.max(Math.abs(dx), Math.abs(dy));

			if (step === 0) {
				world.set(x1, y1, leftDown);
			} else {
				for (var i = 0; i < step; i++) {
					world.set(Math.floor(x0 + dx / step * i), Math.floor(y0 + dy / step * i), leftDown);
				}
			}
		}

		mouseX = newMouseX;
		mouseY = newMouseY;

		return event.target !== canvas;
	});

	document.addEventListener("keydown", function (event) {
		if (mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight) {
			switch (event.key) {
				case "f":
				case "F":
					if (!document.fullscreenElement) {
						canvas.requestFullscreen();
					} else {
						document.exitFullscreen();
					}
					return false;
					break;

				case " ":
					paused = !paused;
					return false;
					break;
			}
		}

		return event.target !== canvas;
	});

	window.requestAnimationFrame(callback);

	function callback(timeStamp) {
		window.requestAnimationFrame(callback);

		if (!paused && timeStamp >= lastUpdate + 1000) {
			world.updateCells();
			lastUpdate = timeStamp;
		}

		canvas.width = canvas.clientWidth;
		canvas.height = document.fullscreenElement ? canvas.clientHeight : canvas.width * 9 / 16;
		context.clearRect(0, 0, canvas.width, canvas.height);

		world.forEach(function (value, x, y) {
			if (value) {
				context.fillRect(
					Math.floor(canvas.width / world.width * x),
					Math.floor(canvas.height / world.height * y),
					Math.ceil(canvas.width / world.width),
					Math.ceil(canvas.height / world.height)
				);
			}
		});

		if (mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight) {
			context.strokeRect(
				Math.floor(canvas.width / world.width * Math.floor(world.width / canvas.width * mouseX)),
				Math.floor(canvas.height / world.height * Math.floor(world.height / canvas.height * mouseY)),
				Math.ceil(canvas.width / world.width),
				Math.ceil(canvas.height / world.height)
			);
		}
	}
})();