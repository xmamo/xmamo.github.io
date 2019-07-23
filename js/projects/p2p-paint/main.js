"use strict";

var p2pPaint = p2pPaint || {};

(function () {
	p2pPaint.context[0].fillStyle = "#FFF";
	p2pPaint.context[0].fillRect(0, 0, p2pPaint.canvas[0].width, p2pPaint.canvas[0].height);

	var params = new URLSearchParams(window.location.search);

	if (params.has("remote")) {
		p2pPaint.startClient(params.get("remote"));
	} else {
		p2pPaint.startServer(function (id) {
			params.set("remote", id);
			var url = window.location.pathname + "?" + params + window.location.hash;
			document.getElementById("p2p-paint-id").innerHTML = 'Your friends should connect to: <a href="' + url + '" target="_blank">' + window.location.origin + url + "</a>";
			p2pPaint.startClient(id);
		});
	}
})();