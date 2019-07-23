"use strict";

var p2pPaint = p2pPaint || {};

p2pPaint.canvas.width = p2pPaint.canvas.clientWidth;
p2pPaint.canvas.height = p2pPaint.canvas.clientHeight;

if (window.location.hash) { // Client
	p2pPaint.startClient(window.location.hash.slice(1));
} else { // Server
	p2pPaint.startServer(function (id) {
		document.getElementById("p2p-paint-id").innerHTML = "ID: " + id;
		p2pPaint.startClient(id);
	});
}