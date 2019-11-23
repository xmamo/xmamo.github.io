"use strict";

(function () {
	var params = new URLSearchParams(location.search);

	if (params.has("remote")) {
		p2pPaint.startClient(params.get("remote"));
	} else {
		p2pPaint.startServer(function (id) {
			params.set("remote", id);
			var url = location.pathname + "?" + params + location.hash;
			document.getElementById("p2p-paint-remote").innerHTML = 'Other peers should connect to: <a href="' + url + '">' + location.origin + url + "</a>";
			p2pPaint.startClient(id);
		});
	}
})();