"use strict";

var p2pPaint = p2pPaint || {};

p2pPaint.startServer = function (onOpen) {
	var peer = new Peer(null, { debug: 2 });
	var connections = [];

	peer.on("open", function (id) {
		onOpen(id);
	});

	peer.on("connection", function (connection) {
		connections.push(connection);

		connection.on("open", function() {
			connection.send(p2pPaint.context[0].getImageData(0, 0, p2pPaint.canvas[0].width, p2pPaint.canvas[0].height).data);
		});

		connection.on("data", function (data) {
			for (var i = 0; i < connections.length; i++) {
				if (connections[i] !== connection) {
					// Unpack and repack data in order to avoid forwarding forged data objects
					connections[i].send({
						x0: parseFloat(data.x0),
						y0: parseFloat(data.y0),
						x1: parseFloat(data.x1),
						y1: parseFloat(data.y1),
						style: parseColor(data.style),
						width: parseFloat(data.width)
					});
				}
			}
		});
	});

	function parseColor(color) {
		var element = document.createElement("span");
		element.style.color = color;
		return element.style.color;
	}
};