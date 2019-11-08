"use strict";

(function () {
	var elements = document.getElementsByClassName("js-only");
	while (elements.length > 0) {
		elements[0].classList.remove("js-only");
	}

	document.querySelectorAll("[data-github-download]").forEach(function (element) {
		var httpRequest = new XMLHttpRequest();
		httpRequest.onreadystatechange = function () {
			if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
				var response = JSON.parse(httpRequest.responseText);
				element.href = response.assets[0].browser_download_url;
			}
		};
		httpRequest.open("GET", "https://api.github.com/repos/" + element.getAttribute("data-github-download") + "/releases/latest");
		httpRequest.send();
	});
})();