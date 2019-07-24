"use strict";

var p2pPaint = p2pPaint || {};

p2pPaint.startClient = function (serverId) {
	var canvas = [document.getElementById("p2p-paint-canvas-0"), document.getElementById("p2p-paint-canvas-1")];
	var context = [canvas[0].getContext("2d"), canvas[1].getContext("2d")];

	context[0].fillStyle = "#FFF";
	context[0].fillRect(0, 0, canvas[0].width, canvas[0].height);

	var connection = new Peer(null, { debug: 2 }).connect(serverId);

	connection.on("data", function (data) {
		drawLine(0, data.x0, data.y0, data.x1, data.y1, data.style, data.width);
	});

	var mouseX = NaN;
	var mouseY = NaN;
	var leftDown = false;
	var rightDown = false;
	var brushSize = 10;

	canvas[1].addEventListener("contextmenu", function (event) {
		event.preventDefault();
	});

	canvas[1].addEventListener("mousedown", function (event) {
		switch (event.button) {
			case 0:
				leftDown = true;
				if (!rightDown) {
					drawLine(0, mouseX, mouseY, mouseX, mouseY, "#000", brushSize);
					send({ x0: mouseX, y0: mouseY, x1: mouseX, y1: mouseY, style: "#000", width: brushSize });
				}
				event.preventDefault();
				break;

			case 2:
				rightDown = true;
				if (!leftDown) {
					drawLine(0, mouseX, mouseY, mouseX, mouseY, "#FFF", brushSize);
					send({ x0: mouseX, y0: mouseY, x1: mouseX, y1: mouseY, style: "#FFF", width: brushSize });
				}
				event.preventDefault();
				break;
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
		var rect = canvas[0].getBoundingClientRect();
		var newMouseX = (event.clientX - rect.x) * canvas[0].width / rect.width;
		var newMouseY = (event.clientY - rect.y) * canvas[0].height / rect.height;

		if (leftDown && !rightDown) {
			drawLine(0, mouseX, mouseY, newMouseX, newMouseY, "#000", brushSize);
			send({ x0: mouseX, y0: mouseY, x1: newMouseX, y1: newMouseY, style: "#000", width: brushSize });
		} else if (rightDown && !leftDown) {
			drawLine(0, mouseX, mouseY, newMouseX, newMouseY, "#FFF", brushSize);
			send({ x0: mouseX, y0: mouseY, x1: newMouseX, y1: newMouseY, style: "#FFF", width: brushSize });
		}

		mouseX = newMouseX;
		mouseY = newMouseY;

		if (mouseInCanvas()) {
			event.preventDefault();
		}
	});

	canvas[1].addEventListener("wheel", function (event) {
		brushSize = Math.max(1, brushSize * Math.exp(-Math.sign(event.deltaY) / 10));
		event.preventDefault();
	});

	window.requestAnimationFrame(render);

	function render() {
		window.requestAnimationFrame(render);

		context[1].clearRect(0, 0, canvas[1].width, canvas[1].height);
		drawLine(1, mouseX, mouseY, mouseX, mouseY, "rgba(0, 0, 0, 0.2)", brushSize);
	}

	function drawLine(which, x0, y0, x1, y1, style, width) {
		context[which].strokeStyle = style;
		context[which].lineWidth = width;
		context[which].lineCap = "round";
		context[which].beginPath();
		context[which].moveTo(x0, y0);
		context[which].lineTo(x1, y1);
		context[which].stroke();
	}

	function send(data) {
		if (connection.open) {
			connection.send(data);
		}
	}

	function mouseInCanvas() {
		return mouseX >= 0 && mouseX <= canvas[1].clientWidth && mouseY >= 0 && mouseY <= canvas[1].clientHeight;
	}
};