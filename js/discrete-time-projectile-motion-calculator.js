"use strict";

(function () {
	var randomInt = utils.randomInt;

	var decimal = "([+-]?(?:[0-9]+(?:.[0-9]*)?|.[0-9]+))";
	var delimiter = "(?:\\s*,\\s*|\\s+)";
	var singleDecimal = "\\s*" + decimal + "\\s*";
	var threeDecimals = singleDecimal + delimiter + singleDecimal + delimiter + singleDecimal;
	var singleDecimalPattern = "^" + singleDecimal + "$";
	var threeDecimalsPattern = "^" + threeDecimals + "$";

	var form = document.forms["discrete-time-projectile-motion-calculator"];
	var sourcePosElement = form.elements["source-pos"];
	var destinationPosElement = form.elements["destination-pos"];
	var airTimeElement = form.elements["air-time"];
	var accelerationElement = form.elements.acceleration;
	var dampingElement = accelerationElement;
	var resultElement = document.getElementById("discrete-time-projectile-motion-calculator-result");
	var commandElement = document.getElementById("discrete-time-projectile-motion-calculator-command");

	sourcePosElement.value = randomInt(-32, 32) + ", " + randomInt(64, 128) + ", " + randomInt(-32, 32);
	sourcePosElement.pattern = threeDecimalsPattern;
	destinationPosElement.value = randomInt(-32, 32) + ", " + randomInt(64, 128) + ", " + randomInt(-32, 32);
	destinationPosElement.pattern = threeDecimalsPattern;
	airTimeElement.value = randomInt(1, 6) * 20;
	airTimeElement.pattern = singleDecimalPattern;
	accelerationElement.pattern = singleDecimalPattern;
	dampingElement.pattern = singleDecimalPattern;
	form.addEventListener("submit", function (event) { event.preventDefault(); });
	form.addEventListener("input", updateForm);
	updateForm();

	function updateForm() {
		var sourcePos = sourcePosElement.value.match(threeDecimalsPattern);
		var destinationPos = destinationPosElement.value.match(threeDecimalsPattern);
		var airTime = airTimeElement.value.match(singleDecimalPattern);
		var acceleration = accelerationElement.value.match(singleDecimalPattern);
		var damping = dampingElement.value.match(singleDecimalPattern);

		if (sourcePos == null || destinationPos == null || airTime == null || acceleration == null || damping == null)
			return;

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

		var pn = {
			x: destinationPos.x - sourcePos.x,
			y: destinationPos.y - sourcePos.y,
			z: destinationPos.z - sourcePos.z
		};

		var n = parseFloat(airTime[1]);
		var a = parseFloat(acceleration[1]);
		var d = parseFloat(damping[1]);

		var v0;

		if (d === 1) {
			v0 = {
				x: pn.x / n,
				y: (pn.y - n * a) / n,
				z: pn.z / n
			};
		} else {
			v0 = {
				x: pn.x / ((1 - Math.pow(d, n)) / (1 - d)),
				y: (pn.y - (n - (1 - Math.pow(d, n)) / (1 - d) * d) / (1 - d) * a) / ((1 - Math.pow(d, n)) / (1 - d)),
				z: pn.z / ((1 - Math.pow(d, n)) / (1 - d))
			};
		}

		if (!isFinite(v0.x) || !isFinite(v0.y) || !isFinite(v0.z))
			return;

		resultElement.innerText = v0.x + ", " + v0.y + ", " + v0.z;

		commandElement.innerText = "/summon minecraft:falling_block "
			+ sourcePos.x + " " + sourcePos.y + " " + sourcePos.z
			+ " {Motion: [" + v0.x + "D, " + v0.y + "D, " + v0.z + "D], Time: 1, DropItem: 0B}";
	}
})();