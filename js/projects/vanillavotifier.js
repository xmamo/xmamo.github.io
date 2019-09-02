"use strict";

(function () {
	var elements = document.querySelectorAll("[data-github-repo]");
	for (var i = 0, elementCount = elements.length; i < elementCount; i++) {
		(function (element) {
			var httpRequest = new XMLHttpRequest();
			httpRequest.onreadystatechange = function () {
				if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
					var response = JSON.parse(httpRequest.responseText);
					element.href = response.assets[0].browser_download_url;
				}
			};
			httpRequest.open("GET", "https://api.github.com/repos/" + element.getAttribute("data-github-repo") + "/releases/latest");
			httpRequest.send();
		})(elements[i]);
	}
})();