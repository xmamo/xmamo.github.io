(function () {
	var fs = require("fs");
	var mjAPI = require("mathjax-node");

	mjAPI.config({
		MathJax: {
			displayAlign: "left"
		}
	});
	mjAPI.start();

	var inline = false;
	for (var i = 2; i < process.argv.length; i++) {
		if (process.argv[i] == "--inline") {
			inline = true;
			break;
		}
	}

	mjAPI.typeset({
		math: fs.readFileSync(0),
		format: inline ? "inline-TeX" : "TeX",
		svg: true
	}, function (data) {
		if (!data.errors) {
			console.log(data.svg);
		}
	});
})();