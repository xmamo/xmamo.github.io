"use strict";

(function () {
	var canvas = document.getElementById("canvas");
	/** @type {CanvasRenderingContext2D} */ var context = canvas.getContext("2d");

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	var peer = new Peer();
	var connection = null;

	peer.on("open", function (id) {
		document.getElementById("id").innerHTML = "ID: " + id;
	});

	if (window.location.hash != "") { // Client
		connection = peer.connect(window.location.hash.slice(1, window.location.hash.length));

		connection.on("data", function (data) {
			if ("data" in data) {
				context.putImageData(new ImageData(new Uint8ClampedArray(data.data), data.width, data.height), 0, 0);
			} else {
				line("#00F", data.x0, data.y0, data.x1, data.y1);
			}
		});

		connection.on("open", function () {
			var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			connection.send({ width: imageData.width, height: imageData.height, data: imageData.data });
		});
	} else { // Server
		peer.on("connection", function (c) {
			connection = c;

			connection.on("data", function (data) {
				if ("data" in data) {
					context.putImageData(new ImageData(data.data, data.width, data.height), 0, 0);
				} else {
					line("#F00", data.x0, data.y0, data.x1, data.y1);
				}
			});

			connection.on("open", function () {
				var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
				connection.send({ width: imageData.width, height: imageData.height, data: imageData.data });
			});
		});
	}

	var mouseX = -1;
	var mouseY = -1;
	var mouseDown = false;

	document.addEventListener("mousemove", function (event) {
		var newMouseX = event.clientX - canvas.getBoundingClientRect().x;
		var newMouseY = event.clientY - canvas.getBoundingClientRect().y;

		if (mouseDown) {
			if (window.location.hash != "") { // Client
				line("#F00", mouseX, mouseY, newMouseX, newMouseY);
			} else { // Server
				line("#00F", mouseX, mouseY, newMouseX, newMouseY);
			}
			if (connection != null) {
				connection.send({ x0: mouseX, y0: mouseY, x1: newMouseX, y1: newMouseY });
			}
		}

		mouseX = newMouseX;
		mouseY = newMouseY;

		if (mouseInCanvas()) {
			event.preventDefault();
		}
	});

	canvas.addEventListener("contextmenu", function (event) {
		event.preventDefault();
	});

	canvas.addEventListener("mousedown", function (event) {
		mouseDown = true;
		event.preventDefault();
	});

	document.addEventListener("mouseup", function (event) {
		mouseDown = false;

		if (mouseInCanvas()) {
			event.preventDefault();
		}
	});

	function line(style, x0, y0, x1, y1) {
		context.strokeStyle = style;
		context.lineWidth = 5;
		context.lineCap = "round";
		context.beginPath();
		context.moveTo(x0, y0);
		context.lineTo(x1, y1);
		context.stroke();
	}

	function mouseInCanvas() {
		return mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight;
	}
})();