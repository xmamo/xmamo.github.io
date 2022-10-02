import { World } from "./world.js";

const CANVAS = document.getElementById("game-of-life-canvas");
const CONTEXT = CANVAS.getContext("2d", { alpha: false });
const FORM = document.forms["game-of-life"];
const SIZE_ELEMENT = FORM.elements.size;
const WRAP_ELEMENT = FORM.elements.wrap;

let pointerX = NaN;
let pointerY = NaN;
let leftDown = false;
let rightDown = false;
let brushSize = 1;
let paused = false;

let world = new World(80, 45, true);
let lastUpdate = Number.NEGATIVE_INFINITY;  // The timestamp at which the world has last been updated

FORM.addEventListener("submit", event => event.preventDefault());

SIZE_ELEMENT.addEventListener("change", () => {
	let size = SIZE_ELEMENT.value.split(" × ");
	let newWorld = new World(Number(size[0]), Number(size[1]), world.a, world.b, world.c, world.d);
	newWorld.forEach((x, y) => world.get(x, y));
	world = newWorld;
});

WRAP_ELEMENT.addEventListener("change", () => world.wrap = WRAP_ELEMENT.checked);

CANVAS.addEventListener("contextmenu", event => event.preventDefault());

CANVAS.addEventListener("pointerdown", event => {
	event.preventDefault();

	let rect = CANVAS.getBoundingClientRect();
	pointerX = event.clientX - rect.left;
	pointerY = event.clientY - rect.top;

	switch (event.button) {
		case 0:
			leftDown = true;
			break;

		case 2:
			rightDown = true;
			break;
	}

	if (leftDown !== rightDown) {
		setCells(
			Math.round(world.width / CANVAS.width * pointerX - brushSize / 2),
			Math.round(world.height / CANVAS.height * pointerY - brushSize / 2)
		);
	}
});

document.addEventListener("pointermove", event => {
	let rect = CANVAS.getBoundingClientRect();
	let newPointerX = event.clientX - rect.left;
	let newPointerY = event.clientY - rect.top;

	if (leftDown !== rightDown) {
		let cellWidth = world.width / CANVAS.width;
		let cellHeight = world.height / CANVAS.height;

		let x0 = Math.round(cellWidth * pointerX - brushSize / 2);
		let y0 = Math.round(cellHeight * pointerY - brushSize / 2);
		let x1 = Math.round(cellWidth * newPointerX - brushSize / 2);
		let y1 = Math.round(cellHeight * newPointerY - brushSize / 2);

		// The line is drawn using the digital differential analyzer (DDA) graphics algorithm.
		// See: https://en.wikipedia.org/wiki/Digital_differential_analyzer_(graphics_algorithm)#Program.

		let dx = x1 - x0;
		let dy = y1 - y0;
		let step = Math.max(Math.abs(dx), Math.abs(dy));

		if (step === 0) {
			setCells(x1, y1);
		} else {
			dx /= step;
			dy /= step;

			for (let i = 0; i < step; ++i)
				setCells(Math.floor(x0 + dx * i), Math.floor(y0 + dy * i));
		}
	}

	pointerX = newPointerX;
	pointerY = newPointerY;
});

document.addEventListener("pointerup", event => {
	switch (event.button) {
		case 0:
			leftDown = false;
			break;

		case 2:
			rightDown = false;
			break;
	}
});

CANVAS.addEventListener("wheel", event => {
	event.preventDefault();
	brushSize = Math.max(1, Math.min(brushSize + Math.sign(event.deltaY), world.width, world.height));
});

CANVAS.addEventListener("keydown", event => {
	switch (event.code) {
		case "Space":
			event.preventDefault();
			paused = !paused;
			break;
	}
});

requestAnimationFrame(function callback(timeStamp) {
	render(timeStamp);
	requestAnimationFrame(callback);
});

function render(timeStamp) {
	if (!paused && timeStamp >= lastUpdate + 1000) {
		world.updateCells();
		lastUpdate = timeStamp;
	}

	CANVAS.width = CANVAS.clientWidth;
	CANVAS.height = CANVAS.clientWidth * (9 / 16);

	CONTEXT.fillStyle = "#FFF";
	CONTEXT.fillRect(0, 0, CANVAS.width, CANVAS.height);

	CONTEXT.fillStyle = "#000";
	CONTEXT.lineWidth = 2;
	CONTEXT.strokeStyle = "#777";

	let cellWidth = CANVAS.width / world.width;
	let cellHeight = CANVAS.height / world.height;

	world.forEach((x, y, value) => {
		if (value) {
			CONTEXT.fillRect(
				Math.floor(cellWidth * x),
				Math.floor(cellHeight * y),
				Math.ceil(cellWidth),
				Math.ceil(cellHeight)
			);
		}
	});

	CONTEXT.strokeRect(
		Math.floor(cellWidth * Math.round(pointerX / cellWidth - brushSize / 2)) + 1,
		Math.floor(cellHeight * Math.round(pointerY / cellHeight - brushSize / 2)) + 1,
		Math.ceil(cellWidth * brushSize) - 2,
		Math.ceil(cellHeight * brushSize) - 2
	);
}

function setCells(x0, y0) {
	let y1 = y0 + brushSize;
	let x1 = x0 + brushSize;

	for (let y = y0; y < y1; ++y) {
		for (let x = x0; x < x1; ++x) {
			world.set(x, y, leftDown);
		}
	}
}