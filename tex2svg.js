"use strict";

(function () {
	var fs = require("fs");
	var mjAPI = require("mathjax-node");

	var inline = false;
	for (var i = 2, count = process.argv.length; i < count; i++) {
		if (process.argv[i] === "--inline") {
			inline = true;
			break;
		}
	}

	mjAPI.config({ MathJax: { displayAlign: "left" } });
	mjAPI.start();

	mjAPI.typeset({
		width: 0,
		math: fs.readFileSync(0),
		format: inline ? "inline-TeX" : "TeX",
		svg: true,
		speakText: false
	}, function (result) {
		if (result.errors == null || result.errors.length === 0) {
			console.log(result.svg);
		}
	});
})();