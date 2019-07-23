"use strict";

var p2pPaint = p2pPaint || {};

p2pPaint.startClient = function (serverId) {
	var connection = new Peer(null, { debug: 2 }).connect(serverId);

	connection.on("data", function (data) {
		drawLine(data.x0, data.y0, data.x1, data.y1, data.style, data.width);
	});

	var mouseX = NaN;
	var mouseY = NaN;
	var leftDown = false;
	var rightDown = false;

	p2pPaint.canvas.addEventListener("contextmenu", function (event) {
		event.preventDefault();
	});

	p2pPaint.canvas.addEventListener("mousedown", function (event) {
		switch (event.button) {
			case 0:
				leftDown = true;
				if (!rightDown) {
					drawLine(mouseX, mouseY, mouseX, mouseY, "#000", 5);
					send({ x0: mouseX, y0: mouseY, x1: mouseX, y1: mouseY, style: "#000", width: 5 });
				}
				event.preventDefault();
				break;

			case 2:
				rightDown = true;
				if (!leftDown) {
					drawLine(mouseX, mouseY, mouseX, mouseY, "#FFF", 5);
					send({ x0: mouseX, y0: mouseY, x1: mouseX, y1: mouseY, style: "#FFF", width: 5 });
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
		var newMouseX = event.clientX - p2pPaint.canvas.getBoundingClientRect().x;
		var newMouseY = event.clientY - p2pPaint.canvas.getBoundingClientRect().y;

		if (leftDown && !rightDown) {
			drawLine(mouseX, mouseY, newMouseX, newMouseY, "#000", 5);
			send({ x0: mouseX, y0: mouseY, x1: newMouseX, y1: newMouseY, style: "#000", width: 5 });
		} else if (rightDown && !leftDown) {
			drawLine(mouseX, mouseY, newMouseX, newMouseY, "#FFF", 5);
			send({ x0: mouseX, y0: mouseY, x1: newMouseX, y1: newMouseY, style: "#FFF", width: 5 });
		}

		mouseX = newMouseX;
		mouseY = newMouseY;

		if (mouseInCanvas()) {
			event.preventDefault();
		}
	});

	function drawLine(x0, y0, x1, y1, style, width) {
		p2pPaint.context.strokeStyle = style;
		p2pPaint.context.lineWidth = width;
		p2pPaint.context.lineCap = "round";
		p2pPaint.context.beginPath();
		p2pPaint.context.moveTo(x0, y0);
		p2pPaint.context.lineTo(x1, y1);
		p2pPaint.context.stroke();
	}

	function send(data) {
		if (connection.open) {
			connection.send(data);
		}
	}

	function mouseInCanvas() {
		return mouseX >= 0 && mouseX <= p2pPaint.canvas.clientWidth && mouseY >= 0 && mouseY <= p2pPaint.canvas.clientHeight;
	}
};