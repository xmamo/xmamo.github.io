"use strict";

var p2pPaint = p2pPaint || {};

p2pPaint.startClient = function (serverId) {
	var connection = new Peer(null, { debug: 2 }).connect(serverId);

	connection.on("data", function (data) {
		drawLine(0, data.x0, data.y0, data.x1, data.y1, data.style, data.width);
	});

	var mouseX = NaN;
	var mouseY = NaN;
	var leftDown = false;
	var rightDown = false;
	var brushSize = 5;

	p2pPaint.canvas[1].addEventListener("contextmenu", function (event) {
		event.preventDefault();
	});

	p2pPaint.canvas[1].addEventListener("mousedown", function (event) {
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
		var newMouseX = event.clientX - p2pPaint.canvas[0].getBoundingClientRect().x;
		var newMouseY = event.clientY - p2pPaint.canvas[0].getBoundingClientRect().y;

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

	p2pPaint.canvas[1].addEventListener("wheel", function (event) {
		brushSize = Math.max(1, brushSize * Math.exp(-Math.sign(event.deltaY) / 10));
		event.preventDefault();
	});

	window.requestAnimationFrame(render);

	function render() {
		window.requestAnimationFrame(render);

		p2pPaint.context[1].clearRect(0, 0, p2pPaint.canvas[1].width, p2pPaint.canvas[1].height);
		drawLine(1, mouseX, mouseY, mouseX, mouseY, "rgba(0, 0, 0, 0.2)", brushSize);
	}

	function drawLine(which, x0, y0, x1, y1, style, width) {
		p2pPaint.context[which].strokeStyle = style;
		p2pPaint.context[which].lineWidth = width;
		p2pPaint.context[which].lineCap = "round";
		p2pPaint.context[which].beginPath();
		p2pPaint.context[which].moveTo(x0, y0);
		p2pPaint.context[which].lineTo(x1, y1);
		p2pPaint.context[which].stroke();
	}

	function send(data) {
		if (connection.open) {
			connection.send(data);
		}
	}

	function mouseInCanvas() {
		return mouseX >= 0 && mouseX <= p2pPaint.canvas[1].clientWidth && mouseY >= 0 && mouseY <= p2pPaint.canvas[1].clientHeight;
	}
};