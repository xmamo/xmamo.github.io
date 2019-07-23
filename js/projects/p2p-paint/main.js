"use strict";

var p2pPaint = p2pPaint || {};

(function () {
	for (var i = 0; i < p2pPaint.canvas.length; i++) {
		p2pPaint.canvas[i].width = p2pPaint.canvas[i].clientWidth;
		p2pPaint.canvas[i].height = p2pPaint.canvas[i].clientHeight;
	}

	p2pPaint.context[0].fillStyle = "#FFF";
	p2pPaint.context[0].fillRect(0, 0, p2pPaint.canvas[0].width, p2pPaint.canvas[0].height);

	var params = new URLSearchParams(window.location.search);

	if (params.has("remote")) {
		p2pPaint.startClient(params.get("remote"));
	} else {
		p2pPaint.startServer(function (id) {
			params.set("remote", id);
			var link = "/projects/p2p-paint/?" + params;
			document.getElementById("p2p-paint-id").innerHTML = 'Your friends should connect to: <a href="' + link + '">' + window.location.origin + link + '</a>';
			p2pPaint.startClient(id);
		});
	}
})();