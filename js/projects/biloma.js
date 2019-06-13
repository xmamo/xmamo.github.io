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

	var decimal = "(-?(?:[0-9]+(?:.[0-9]*)?|.[0-9]+))";
	var delimiter = "(?:\\s*,\\s*|\\s+)";
	var singleDecimal = "\\s*" + decimal + "\\s*";
	var threeDecimals = singleDecimal + delimiter + singleDecimal + delimiter + singleDecimal;
	var singleDecimalPattern = "^" + singleDecimal + "$";
	var threeDecimalsPattern = "^" + threeDecimals + "$";

	var form = document.forms["biloma"];

	form["source-pos"].value = randomInt(-32, 32) + ", " + randomInt(64, 128) + ", " + randomInt(-32, 32);
	form["source-pos"].pattern = threeDecimalsPattern;
	form["destination-pos"].value = randomInt(-32, 32) + ", " + randomInt(64, 128) + ", " + randomInt(-32, 32);
	form["destination-pos"].pattern = threeDecimalsPattern;
	form["air-time"].value = randomInt(1, 6) * 20;
	form["air-time"].pattern = singleDecimalPattern;
	form.acceleration.pattern = singleDecimalPattern;
	form.damping.pattern = singleDecimalPattern;

	form.oninput = function () {
		var sourcePos = form["source-pos"].value.match(threeDecimalsPattern);
		var destinationPos = form["destination-pos"].value.match(threeDecimalsPattern);
		var airTime = form["air-time"].value.match(singleDecimalPattern);
		var acceleration = form.acceleration.value.match(singleDecimalPattern);
		var damping = form.damping.value.match(singleDecimalPattern);

		if (sourcePos === null || destinationPos === null || airTime === null || acceleration == null || damping == null) {
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

		var n = parseFloat(airTime[1]);
		var pn = {
			x: destinationPos.x - sourcePos.x,
			y: destinationPos.y - sourcePos.y,
			z: destinationPos.z - sourcePos.z
		};
		var a = parseFloat(acceleration[1]);
		var d = parseFloat(damping[1]);

		var v0;
		if (d == 1) {
			v0 = {
				x: pn.x / n,
				y: (pn.y - n * a) / n,
				z: pn.z / n
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

		form.result.innerHTML = ("<math><mfenced><mn>" + v0.x + "</mn><mn>" + v0.y + "</mn><mn>" + v0.z + "</mn></mfenced></math>").replace("-", "−");
		form.command.value = "/summon minecraft:falling_block " + sourcePos.x + " " + sourcePos.y + " " + sourcePos.z + " {Motion: [" + v0.x + "D, " + v0.y + "D, " + v0.z + "D], Time: 1, DropItem: 0B}";

		if (typeof MathJax.Hub !== "undefined") {
			MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
		}

		return false;
	};

	form.oninput();
})();