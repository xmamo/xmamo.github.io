"use strict";

(function () {
	var fs = require("fs");
	var mathjax = require("mathjax-node");

	var inline = false;

	for (var i = 2, count = process.argv.length; i < count; ++i) {
		if (process.argv[i] === "--inline") {
			inline = true;
			break;
		}
	}

	mathjax.config({ MathJax: { displayAlign: "left" } });
	mathjax.start();

	mathjax.typeset({
		width: 0,
		math: fs.readFileSync(0),
		format: inline ? "inline-TeX" : "TeX",
		svg: true,
		speakText: false
	}, function (result) {
		if (result.errors == null || result.errors.length === 0)
			console.log(result.svg);
	});
})();