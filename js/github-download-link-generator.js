"use strict";

for (let element of document.querySelectorAll("[data-github-repo]")) {
	let httpRequest = new XMLHttpRequest();
	httpRequest.onreadystatechange = function () {
		if (httpRequest.readyState === XMLHttpRequest.DONE && httpRequest.status === 200) {
			let response = JSON.parse(httpRequest.responseText);
			element.href = response.assets[0].browser_download_url;
		}
	};
	httpRequest.open("GET", `https://api.github.com/repos/${element.getAttribute("data-github-repo")}/releases/latest`);
	httpRequest.send();
}