"use strict";

var p2pPaint = p2pPaint || {};

p2pPaint.startClient = function (serverId) {
	p2pPaint.context[0].fillStyle = "#FFF";
	p2pPaint.context[0].fillRect(0, 0, p2pPaint.canvas[0].width, p2pPaint.canvas[0].height);

	var connection = new Peer(null, { debug: 2 }).connect(serverId);
	var canDraw = false;

	connection.on("data", function (data) {
		if (data instanceof ArrayBuffer) {
			p2pPaint.context[0].putImageData(new ImageData(
				new Uint8ClampedArray(data),
				p2pPaint.canvas[0].width,
				p2pPaint.canvas[0].height
			), 0, 0);
			canDraw = true;
		} else {
			drawLine(0, data.x0, data.y0, data.x1, data.y1, data.style, data.width);
		}
	});

	var mouseX = NaN;
	var mouseY = NaN;
	var leftDown = false;
	var rightDown = false;
	var brushSize = 10;

	p2pPaint.canvas[1].addEventListener("contextmenu", function (event) {
		event.preventDefault();
	});

	p2pPaint.canvas[1].addEventListener("mousedown", function (event) {
		switch (event.button) {
			case 0:
				leftDown = true;
				if (canDraw && !rightDown) {
					drawLine(0, mouseX, mouseY, mouseX, mouseY, "#000", brushSize);
					send({ x0: mouseX, y0: mouseY, x1: mouseX, y1: mouseY, style: "#000", width: brushSize });
				}
				event.preventDefault();
				break;

			case 2:
				rightDown = true;
				if (canDraw && !leftDown) {
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
		var newMouseX = (event.clientX - p2pPaint.canvas[0].getBoundingClientRect().x) * p2pPaint.canvas[0].width / p2pPaint.canvas[0].getBoundingClientRect().width;
		var newMouseY = (event.clientY - p2pPaint.canvas[0].getBoundingClientRect().y) * p2pPaint.canvas[0].height / p2pPaint.canvas[0].getBoundingClientRect().height;

		if (canDraw) {
			if (leftDown && !rightDown) {
				drawLine(0, mouseX, mouseY, newMouseX, newMouseY, "#000", brushSize);
				send({ x0: mouseX, y0: mouseY, x1: newMouseX, y1: newMouseY, style: "#000", width: brushSize });
			} else if (rightDown && !leftDown) {
				drawLine(0, mouseX, mouseY, newMouseX, newMouseY, "#FFF", brushSize);
				send({ x0: mouseX, y0: mouseY, x1: newMouseX, y1: newMouseY, style: "#FFF", width: brushSize });
			}
		}

		mouseX = newMouseX;
		mouseY = newMouseY;

		if (mouseInCanvas()) {
			event.preventDefault();
		}
	});

	p2pPaint.canvas[1].addEventListener("wheel", function (event) {
		brushSize = Math.max(1, brushSize * Math.exp(Math.sign(event.deltaY) / 10));
		event.preventDefault();
	});

	requestAnimationFrame(function render() {
		p2pPaint.context[1].clearRect(0, 0, p2pPaint.canvas[1].width, p2pPaint.canvas[1].height);
		if (canDraw) {
			drawLine(1, mouseX, mouseY, mouseX, mouseY, "rgba(0, 0, 0, 0.2)", brushSize);
		}

		requestAnimationFrame(render);
	});

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
		return mouseX >= 0 && mouseX <= p2pPaint.canvas[1].clientWidth
			&& mouseY >= 0 && mouseY <= p2pPaint.canvas[1].clientHeight;
	}
};