const FORM = document.forms["discrete-time-projectile-motion-calculator"];
const SOURCE_POS_ELEMENT = FORM.elements["source-pos"];
const DESTINATION_POS_ELEMENT = FORM.elements["destination-pos"];
const AIR_TIME_ELEMENT = FORM.elements["air-time"];
const ACCELERATION_ELEMENT = FORM.elements.acceleration;
const DAMPING_ELEMENT = FORM.elements.damping;
const RESULT_ELEMENT = document.getElementById("discrete-time-projectile-motion-calculator-result");
const COMMAND_EVENT = document.getElementById("discrete-time-projectile-motion-calculator-command");

const DELIMITER_PATTERN = "(?:\\s*,\\s*|\\s+)";
const DECIMAL_PATTERN = "([+-]?(?:[0-9]+(?:\\.[0-9]*)?|\\.[0-9]+))";
const THREE_DECIMALS_PATTERN = `${DECIMAL_PATTERN}${`${DELIMITER_PATTERN}${DECIMAL_PATTERN}`.repeat(2)}`;

SOURCE_POS_ELEMENT.pattern = `^\\s*${THREE_DECIMALS_PATTERN}\\s*$`;
SOURCE_POS_ELEMENT.value = `${randomInt(-32, 32)}, ${randomInt(64, 128)}, ${randomInt(-32, 32)}`;
DESTINATION_POS_ELEMENT.pattern = `^\\s*${THREE_DECIMALS_PATTERN}\\s*$`;
DESTINATION_POS_ELEMENT.value = `${randomInt(-32, 32)}, ${randomInt(64, 128)}, ${randomInt(-32, 32)}`;
AIR_TIME_ELEMENT.pattern = `^\\s*${DECIMAL_PATTERN}\\s*$`;
AIR_TIME_ELEMENT.value = randomInt(1, 6) * 20;
ACCELERATION_ELEMENT.pattern = `^\\s*${DECIMAL_PATTERN}\\s*$`;
DAMPING_ELEMENT.pattern = `^\\s*${DECIMAL_PATTERN}\\s*$`;
FORM.addEventListener("submit", event => event.preventDefault());
FORM.addEventListener("input", updateForm);
updateForm();

function updateForm() {
	let sourcePos = SOURCE_POS_ELEMENT.value.match(SOURCE_POS_ELEMENT.pattern);
	let destinationPos = DESTINATION_POS_ELEMENT.value.match(DESTINATION_POS_ELEMENT.pattern);
	let airTime = AIR_TIME_ELEMENT.value.match(AIR_TIME_ELEMENT.pattern);
	let acceleration = ACCELERATION_ELEMENT.value.match(ACCELERATION_ELEMENT.pattern);
	let damping = DAMPING_ELEMENT.value.match(DAMPING_ELEMENT.pattern);

	if (sourcePos == null || destinationPos == null || airTime == null || acceleration == null || damping == null)
		return;

	sourcePos = {
		x: Number(sourcePos[1]),
		y: Number(sourcePos[2]),
		z: Number(sourcePos[3])
	};

	destinationPos = {
		x: Number(destinationPos[1]),
		y: Number(destinationPos[2]),
		z: Number(destinationPos[3])
	};

	let pn = {
		x: destinationPos.x - sourcePos.x,
		y: destinationPos.y - sourcePos.y,
		z: destinationPos.z - sourcePos.z
	};

	let n = Number(airTime[1]);
	let a = Number(acceleration[1]);
	let d = Number(damping[1]);

	let v0;

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

	RESULT_ELEMENT.replaceChildren(`${v0.x}, ${v0.y}, ${v0.z}`);

	let nbt = `{Motion: [${v0.x}D, ${v0.y}D, ${v0.z}D], Time: 1, DropItem: 0B}`;
	COMMAND_EVENT.replaceChildren(`/summon minecraft:falling_block ${sourcePos.x} ${sourcePos.y} ${sourcePos.z} ${nbt}`);
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}