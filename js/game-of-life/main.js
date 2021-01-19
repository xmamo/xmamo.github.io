"use strict";

(function () {
	var sign = utils.sign;
	var clamp = utils.clamp;
	var touchToMouse = utils.touchToMouse;

	var World = gameOfLife.World;

	var canvas = document.getElementById("game-of-life-canvas");
	var context = canvas.getContext("2d");
	canvas.focus();

	var form = document.forms["game-of-life"];
	var sizeElement = form.elements.size;
	var rulesetElement = form.elements.ruleset;
	var wrapElement = form.elements.wrap;

	var mouseX = NaN;
	var mouseY = NaN;
	var leftDown = false;
	var rightDown = false;
	var brushSize = 1;
	var paused = false;

	var world = new World(80, 45, 2, 3, 3, 3, true);
	var lastUpdate = 0;  // The timestamp at which the world has last been updated

	form.addEventListener("submit", function (event) {
		event.preventDefault();
	});

	sizeElement.addEventListener("change", function () {
		var size = sizeElement.value.match(/^\s*(\d+)(?:\s*[x×]\s*|\s+)(\d+)\s*$/);
		if (size == null) return;

		var newWorld = new World(Number(size[1]), Number(size[2]), world.a, world.b, world.c, world.d);
		newWorld.forEach(function (x, y) { return world.get(x, y); });
		world = newWorld;
	});

	rulesetElement.addEventListener("input", function () {
		var ruleset = rulesetElement.value.match(rulesetElement.pattern);
		if (ruleset == null) return;

		world.a = Number(ruleset[1]);
		world.b = Number(ruleset[2]);
		world.c = Number(ruleset[3]);
		world.d = Number(ruleset[4]);
	});

	wrapElement.addEventListener("change", function () {
		world.wrap = wrapElement.checked;
	});

	canvas.addEventListener("contextmenu", function (event) {
		event.preventDefault();
	});

	canvas.addEventListener("mousedown", function (event) {
		var boundingClientRect = canvas.getBoundingClientRect();
		mouseX = event.clientX - boundingClientRect.x;
		mouseY = event.clientY - boundingClientRect.y;

		switch (event.button) {
			case 0:
				leftDown = true;
				break;

			case 2:
				rightDown = true;
				break;
		}

		if (leftDown !== rightDown) {
			setCells(
				Math.round(world.width / canvas.width * mouseX - brushSize / 2),
				Math.round(world.height / canvas.height * mouseY - brushSize / 2)
			);
		}
	});

	document.addEventListener("mousemove", function (event) {
		var boundingClientRect = canvas.getBoundingClientRect();
		var newMouseX = event.clientX - boundingClientRect.x;
		var newMouseY = event.clientY - boundingClientRect.y;

		if (leftDown !== rightDown) {
			var cellWidth = world.width / canvas.width;
			var cellHeight = world.height / canvas.height;

			var x0 = Math.round(cellWidth * mouseX - brushSize / 2);
			var y0 = Math.round(cellHeight * mouseY - brushSize / 2);
			var x1 = Math.round(cellWidth * newMouseX - brushSize / 2);
			var y1 = Math.round(cellHeight * newMouseY - brushSize / 2);

			// The line is drawn using the digital differential analyzer (DDA) graphics algorithm.
			// See: https://en.wikipedia.org/wiki/Digital_differential_analyzer_(graphics_algorithm)#Program.

			var dx = x1 - x0;
			var dy = y1 - y0;
			var step = Math.max(Math.abs(dx), Math.abs(dy));

			if (step === 0) {
				setCells(x1, y1);
			} else {
				dx /= step;
				dy /= step;

				for (var i = 0; i < step; ++i)
					setCells(Math.floor(x0 + dx * i), Math.floor(y0 + dy * i));
			}
		}

		mouseX = newMouseX;
		mouseY = newMouseY;
	});

	document.addEventListener("mouseup", function (event) {
		mouseX = NaN;
		mouseY = NaN;

		switch (event.button) {
			case 0:
				leftDown = false;
				break;

			case 2:
				rightDown = false;
				break;
		}
	});

	canvas.addEventListener("wheel", function (event) {
		brushSize = clamp(brushSize + sign(event.deltaY), 1, Math.min(world.width, world.height));
		event.preventDefault();
	});

	canvas.addEventListener("touchstart", function (event) {
		canvas.dispatchEvent(touchToMouse(event, "mousedown"));
		event.preventDefault();
	});

	document.addEventListener("touchmove", function (event) {
		document.dispatchEvent(touchToMouse(event, "mousemove"));
	});

	document.addEventListener("touchend", function (event) {
		document.dispatchEvent(touchToMouse(event, "mouseup"));
	});

	canvas.addEventListener("keydown", function (event) {
		switch (event.code || event.keyCode) {
			case "Space":
			case 0x20:
				paused = !paused;
				event.preventDefault();
				break;
		}
	});

	requestAnimationFrame(function render(timeStamp) {
		if (!paused && timeStamp >= lastUpdate + 1000) {
			world.updateCells();
			lastUpdate = timeStamp;
		}

		canvas.width = canvas.clientWidth;
		canvas.height = document.fullscreenElement ? canvas.clientHeight : canvas.width * (9 / 16);
		context.fillStyle = "#000";
		context.lineWidth = 2;
		context.strokeStyle = "#777";

		var cellWidth = canvas.width / world.width;
		var cellHeight = canvas.height / world.height;

		world.forEach(function (x, y, value) {
			if (value) {
				context.fillRect(
					Math.floor(cellWidth * x),
					Math.floor(cellHeight * y),
					Math.ceil(cellWidth),
					Math.ceil(cellHeight)
				);
			}
		});

		context.strokeRect(
			Math.floor(cellWidth * Math.round(mouseX / cellWidth - brushSize / 2)) + 1,
			Math.floor(cellHeight * Math.round(mouseY / cellHeight - brushSize / 2)) + 1,
			Math.ceil(cellWidth * brushSize) - 2,
			Math.ceil(cellHeight * brushSize) - 2
		);

		requestAnimationFrame(render);
	});

	function setCells(x0, y0) {
		var y1 = y0 + brushSize;
		var x1 = x0 + brushSize;

		for (var y = y0; y < y1; ++y)
			for (var x = x0; x < x1; ++x)
				world.set(x, y, leftDown);
	}
})();