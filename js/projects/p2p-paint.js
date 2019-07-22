"use strict";

(function () {
	var canvas = document.getElementById("canvas");
	var context = canvas.getContext("2d");
	var onMouseMove = line;

	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;

	var peer = new Peer(null, { debug: 2 });

	peer.on("open", function (id) {
		document.getElementById("id").innerHTML = "ID: " + id;
	});

	if (window.location.hash) { // Client
		var connection = peer.connect(window.location.hash.slice(1, window.location.hash.length));

		connection.on("data", function (data) {
			line(data.x0, data.y0, data.x1, data.y1);
		});

		onMouseMove = function (x0, y0, x1, y1) {
			line(x0, y0, x1, y1);
			connection.send({ x0: x0, y0: y0, x1: x1, y1: y1 });
		};
	} else { // Server
		var connections = [];

		peer.on("connection", function (connection) {
			connections.push(connection);

			connection.on("data", function (data) {
				line(data.x0, data.y0, data.x1, data.y1);
				for (var i = 0; i < connections.length; i++) {
					if (connections[i] != connection) {
						connections[i].send(data);
					}
				}
			});

			onMouseMove = function (x0, y0, x1, y1) {
				line(x0, y0, x1, y1);
				connection.send({ x0: x0, y0: y0, x1: x1, y1: y1 });
			};
		});
	}

	var mouseX = -1;
	var mouseY = -1;
	var mouseDown = false;

	document.addEventListener("mousemove", function (event) {
		var newMouseX = event.clientX - canvas.getBoundingClientRect().x;
		var newMouseY = event.clientY - canvas.getBoundingClientRect().y;

		if (mouseDown) {
			onMouseMove(mouseX, mouseY, newMouseX, newMouseY);
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

	function line(x0, y0, x1, y1) {
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