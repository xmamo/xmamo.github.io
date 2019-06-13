"use strict";

var MathJax = {
	showMathMenu: false
};

(function () {
	function random(min, max) {
		return Math.random() * (max - min) + min;
	}

	function randomInt(min, max) {
		return Math.floor(random(min, max));
	}

	var a = -0.04;
	var d = 0.98;

	var decimal = "(-?(?:[0-9]+(?:.[0-9]*)?|.[0-9]+))";
	var delimiter = "(?:\\s*,\\s*|\\s+)";
	var singleDecimal = "\\s*" + decimal + "\\s*";
	var threeDecimals = singleDecimal + delimiter + singleDecimal + delimiter + singleDecimal;
	var singleDecimalPattern = "^" + singleDecimal + "$";
	var threeDecimalsPattern = "^" + threeDecimals + "$";

	var form = document.forms["biloma"];

	form["source-pos"].value = randomInt(-64, 64) + ", " + randomInt(64, 128) + ", " + randomInt(-64, 64);
	form["source-pos"].pattern = threeDecimalsPattern;
	form["destination-pos"].value = randomInt(-64, 64) + ", " + randomInt(64, 128) + ", " + randomInt(-64, 64);
	form["destination-pos"].pattern = threeDecimalsPattern;
	form["fly-time"].value = randomInt(1, 6) * 20;
	form["fly-time"].pattern = singleDecimalPattern;

	form.oninput = function () {
		var sourcePos = form["source-pos"].value.match(threeDecimalsPattern);
		var destinationPos = form["destination-pos"].value.match(threeDecimalsPattern);
		var flyTime = form["fly-time"].value.match(singleDecimalPattern);

		if (sourcePos === null || destinationPos === null || flyTime === null) {
			return false;
		}

		sourcePos = {
			x: parseFloat(sourcePos[1]),
			y: parseFloat(sourcePos[2]),
			z: parseFloat(sourcePos[3])
		};
		destinationPos = {
			x: parseFloat(destinationPos[1]),
			y: parseFloat(destinationPos[2]),
			z: parseFloat(destinationPos[3])
		};

		var n = parseFloat(flyTime[1]);
		var pn = {
			x: destinationPos.x - sourcePos.x,
			y: destinationPos.y - sourcePos.y,
			z: destinationPos.z - sourcePos.z
		};

		var v0;
		if (d != 1) {
			v0 = {
				x: pn.x / ((1 - Math.pow(d, n)) / (1 - d)),
				y: (pn.y - (n - (1 - Math.pow(d, n)) / (1 - d) * d) / (1 - d) * a) / ((1 - Math.pow(d, n)) / (1 - d)),
				z: pn.z / ((1 - Math.pow(d, n)) / (1 - d))
			};
		} else {
			v0 = {
				x: pn.x / n,
				y: (pn.y - (n - (1 - Math.pow(d, n)) / (1 - d) * d) / (1 - d) * a) / ((1 - Math.pow(d, n)) / (1 - d)),
				z: pn.z / n
			};
		}

		if (!isFinite(v0.x) || !isFinite(v0.y) || !isFinite(v0.z)) {
			return false;
		}

		form.result.value = "(" + v0.x + ", " + v0.y + ", " + v0.z + ")";
		form.command.value = "/summon minecraft:falling_block " + sourcePos.x + " " + sourcePos.y + " " + sourcePos.z + " {Motion: [" + v0.x + "D, " + v0.y + "D, " + v0.z + "D], Time: 1, DropItem: 0B}";

		return false;
	};

	form.oninput();
})();