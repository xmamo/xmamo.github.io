"use strict";

(function () {
	var world = new gameOfLife.World(48, 27);

	var canvas = document.getElementById("game-of-life-canvas");
	var mouseX = -1;
	var mouseY = -1;
	var leftDown = false;
	var rightDown = false;

	canvas.oncontextmenu = function () {
		return false;
	};

	document.onmousedown = function (event) {
		switch (event.button) {
			case 0:
				leftDown = true;
				break;
			case 2:
				rightDown = true;
				break;
		}
		return event.target !== canvas;
	};

	document.onmouseup = function (event) {
		switch (event.button) {
			case 0:
				leftDown = false;
				break;
			case 2:
				rightDown = false;
				break;
		}
		return event.target !== canvas;
	};

	canvas.onmousemove = function (event) {
		mouseX = event.clientX - canvas.getBoundingClientRect().x;
		mouseY = event.clientY - canvas.getBoundingClientRect().y;

		if (leftDown && !rightDown) {
			world.set(
				Math.floor(world.width / canvas.width * mouseX),
				Math.floor(world.height / canvas.height * mouseY),
				true
			);
		} else if (rightDown && !leftDown) {
			world.set(
				Math.floor(world.width / canvas.width * mouseX),
				Math.floor(world.height / canvas.height * mouseY),
				false
			);
		}

		return false;
	};

	window.onkeydown = function (event) {
		switch (event.key) {
			case "f":
			case "F":
				if (!document.fullscreenElement) {
					canvas.requestFullscreen();
				} else {
					document.exitFullscreen();
				}
				break;
		}
		return event.target !== canvas;
	}

	var context = canvas.getContext("2d");
	var lastUpdate = 0;
	window.requestAnimationFrame(callback);

	function callback(timeStamp) {
		if (timeStamp >= lastUpdate + 1000) {
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

		context.strokeRect(
			Math.floor(canvas.width / world.width * Math.floor(world.width / canvas.width * mouseX)),
			Math.floor(canvas.height / world.height * Math.floor(world.height / canvas.height * mouseY)),
			Math.ceil(canvas.width / world.width),
			Math.ceil(canvas.height / world.height)
		);

		window.requestAnimationFrame(callback);
	}
})();