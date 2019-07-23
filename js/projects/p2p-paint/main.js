"use strict";

var p2pPaint = p2pPaint || {};

for (var i = 0; i < p2pPaint.canvas.length; i++) {
	p2pPaint.canvas[i].width = p2pPaint.canvas[i].clientWidth;
	p2pPaint.canvas[i].height = p2pPaint.canvas[i].clientHeight;
}

if (window.location.hash) { // Client
	p2pPaint.startClient(window.location.hash.slice(1));
} else { // Server
	p2pPaint.startServer(function (id) {
		document.getElementById("p2p-paint-id").innerHTML = "ID: " + id;
		p2pPaint.startClient(id);
	});
}