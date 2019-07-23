"use strict";

(function () {
	var form = document.forms["game-of-life"];
	var canvas = document.getElementById("game-of-life-canvas");
	var context = canvas.getContext("2d");

	var world = new gameOfLife.World(80, 45, 2, 3, 3, 3, true);
	var mouseX = NaN;
	var mouseY = NaN;
	var leftDown = false;
	var rightDown = false;
	var brushSize = 1;
	var paused = false;
	var lastUpdate = 0;

	form.addEventListener("submit", function (event) {
		event.preventDefault();
	});

	form.size.addEventListener("input", function () {
		var size = form.size.value.match(/^\s*([+-]?\d+)(?:\s*[x×]\s*|\s+)([+-]?\d+)\s*$/);
		if (size == null) {
			return;
		}

		var newWorld = new gameOfLife.World(parseInt(size[1]), parseInt(size[2]), world.a, world.b, world.c, world.d);
		newWorld.forEach(function (value, x, y) {
			return world.get(x, y);
		});
		world = newWorld;
	});

	form.ruleset.addEventListener("input", function () {
		var ruleset = form.ruleset.value.match(form.ruleset.pattern);
		if (ruleset == null) {
			return;
		}

		world.a = parseInt(ruleset[1]);
		world.b = parseInt(ruleset[2]);
		world.c = parseInt(ruleset[3]);
		world.d = parseInt(ruleset[4]);
	});

	form.wrap.addEventListener("input", function () {
		world.wrap = form.wrap.checked;
	});

	canvas.addEventListener("contextmenu", function (event) {
		event.preventDefault();
	});

	canvas.addEventListener("mousedown", function (event) {
		switch (event.button) {
			case 0:
				leftDown = true;
				event.preventDefault();
				break;

			case 2:
				rightDown = true;
				event.preventDefault();
				break;
		}

		if (leftDown ^ rightDown) {
			setCells(
				Math.round(world.width / canvas.width * mouseX - brushSize / 2),
				Math.round(world.height / canvas.height * mouseY - brushSize / 2)
			);
		}
	});

	document.addEventListener("mouseup", function (event) {
		switch (event.button) {
			case 0:
				leftDown = false;
				if (mouseInCanvas()) {
					event.preventDefault();
				}
				break;

			case 2:
				rightDown = false;
				if (mouseInCanvas()) {
					event.preventDefault();
				}
				break;
		}
	});

	document.addEventListener("mousemove", function (event) {
		var newMouseX = event.clientX - canvas.getBoundingClientRect().x;
		var newMouseY = event.clientY - canvas.getBoundingClientRect().y;

		if (leftDown ^ rightDown) {
			var x0 = Math.round(world.width / canvas.width * mouseX - brushSize / 2);
			var y0 = Math.round(world.height / canvas.height * mouseY - brushSize / 2);
			var x1 = Math.round(world.width / canvas.width * newMouseX - brushSize / 2);
			var y1 = Math.round(world.height / canvas.height * newMouseY - brushSize / 2);
			var dx = x1 - x0;
			var dy = y1 - y0;
			var step = Math.max(Math.abs(dx), Math.abs(dy));

			if (step === 0) {
				setCells(x1, y1);
			} else {
				for (var i = 0; i < step; i++) {
					setCells(Math.floor(x0 + dx / step * i), Math.floor(y0 + dy / step * i));
				}
			}
		}

		mouseX = newMouseX;
		mouseY = newMouseY;

		if (mouseInCanvas()) {
			event.preventDefault();
		}
	});

	document.addEventListener("wheel", function (event) {
		if (mouseInCanvas()) {
			brushSize = Math.max(1, Math.min(brushSize - Math.sign(event.deltaY), Math.min(world.width, world.height)));
			event.preventDefault();
		}
	});

	document.addEventListener("keydown", function (event) {
		switch (event.key) {
			case "f":
			case "F":
				if (mouseInCanvas()) {
					if (!document.fullscreenElement) {
						canvas.requestFullscreen();
					} else {
						document.exitFullscreen();
					}
					event.preventDefault();
				}
				break;

			case " ":
				if (mouseInCanvas()) {
					paused = !paused;
					event.preventDefault();
				}
				break;
		}
	});

	window.requestAnimationFrame(render);

	function render(timeStamp) {
		window.requestAnimationFrame(render);

		if (!paused && timeStamp >= lastUpdate + 1000) {
			world.updateCells();
			lastUpdate = timeStamp;
		}

		canvas.width = canvas.clientWidth;
		canvas.height = document.fullscreenElement ? canvas.clientHeight : canvas.width * 9 / 16;
		context.clearRect(0, 0, canvas.width, canvas.height);

		context.fillStyle = "#000";
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

		if (mouseInCanvas()) {
			context.lineWidth = 2;
			context.strokeStyle = "#777";
			context.strokeRect(
				Math.floor(canvas.width / world.width * Math.round(world.width / canvas.width * mouseX - brushSize / 2)) + 1,
				Math.floor(canvas.height / world.height * Math.round(world.height / canvas.height * mouseY - brushSize / 2)) + 1,
				Math.ceil(canvas.width / world.width * brushSize) - 2,
				Math.ceil(canvas.height / world.height * brushSize) - 2
			);
		}
	}

	function mouseInCanvas() {
		return mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight;
	}

	function setCells(x0, y0) {
		for (var y = y0; y < y0 + brushSize; y++) {
			for (var x = x0; x < x0 + brushSize; x++) {
				world.set(x, y, leftDown);
			}
		}
	}
})();