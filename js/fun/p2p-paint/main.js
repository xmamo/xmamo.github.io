"use strict";

(function () {
	var params = new URLSearchParams(window.location.search);

	if (params.has("remote")) {
		p2pPaint.startClient(params.get("remote"));
	} else {
		p2pPaint.startServer(function (id) {
			params.set("remote", id);
			var url = window.location.pathname + "?" + params + window.location.hash;
			document.getElementById("p2p-paint-remote").innerHTML = "Your friends should connect to: "
				+ '<a href="' + url + '">' + window.location.origin + url + "</a>";
			p2pPaint.startClient(id);
		});
	}
})();