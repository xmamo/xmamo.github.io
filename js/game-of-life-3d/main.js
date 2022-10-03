import { Camera } from "./camera.js";
import { Renderer } from "./renderer.js";
import { World } from "./world.js";

let vertexShaderRequest = new XMLHttpRequest();
vertexShaderRequest.addEventListener("readystatechange", () => onReadyStateChange());
vertexShaderRequest.open("GET", "/js/game-of-life-3d/shader.vert");
vertexShaderRequest.responseType = "text";
vertexShaderRequest.send();

let fragmentShaderRequest = new XMLHttpRequest();
fragmentShaderRequest.addEventListener("readystatechange", () => onReadyStateChange());
fragmentShaderRequest.open("GET", "/js/game-of-life-3d/shader.frag");
fragmentShaderRequest.responseType = "text";
fragmentShaderRequest.send();

const CANVAS = document.getElementById("game-of-life-3d-canvas");
const GL = CANVAS.getContext("webgl", { alpha: false });
const FORM = document.forms["game-of-life-3d"];
const RULESET_ELEMENT = FORM.elements.ruleset;
const WRAP_ELEMENT = FORM.elements.wrap;

let camera = new Camera({ z: 64 });
let pointerX = NaN;
let pointerY = NaN;
let pointerDown = false;
let left = false;
let right = false;
let up = false;
let down = false;
let paused = false;

// Updates to the game are computationally expensive. Since older browsers do not support asynchronous functions,
// the workload is split up in smaller chunks which are executed synchronously at each frame.
//
// There are two types of updates: cell updates and buffers updates. Cell updates incrementally update the state of
// the world according to the rules of Game of Life; buffers updates incrementally update the buffers uploaded to
// the graphics card. The update variable keeps track of which kind of update we are currently working on.
//
// Internally, double buffering is used for updates; the buffers are swapped only if the entire workload has been
// completed.
let update = "cells";

let world = new World(64, 64, 64, true, [4, 5], [5]);
world.forEach(() => Math.random() < 0.1);
world.onUpdateComplete = () => update = "buffers";

let renderer = new Renderer(GL, world);
renderer.updateBuffers(world.volume);
renderer.onUpdateComplete = () => update = "cells";

FORM.addEventListener("submit", event => event.preventDefault());

RULESET_ELEMENT.addEventListener("change", () => {
	let ruleset = RULESET_ELEMENT.value.match(RULESET_ELEMENT.pattern);

	if (ruleset != null) {
		world.environment = (ruleset[1] != null ? ruleset[1] : "").split(/\s*,\s*/u).map(s => parseInt(s, 10));
		world.fertility = (ruleset[2] != null ? ruleset[2] : "").split(/\s*,\s*/u).map(s => parseInt(s, 10));
	}
});

WRAP_ELEMENT.addEventListener("change", () => world.wrap = WRAP_ELEMENT.checked);

CANVAS.addEventListener("contextmenu", event => event.preventDefault());

CANVAS.addEventListener("pointerdown", event => {
	let boundingClientRect = CANVAS.getBoundingClientRect();
	pointerX = event.clientX - boundingClientRect.x;
	pointerY = event.clientY - boundingClientRect.y;
	pointerDown = true;
});

document.addEventListener("pointermove", event => {
	let rect = CANVAS.getBoundingClientRect();
	let newMouseX = event.clientX - rect.x;
	let newMouseY = event.clientY - rect.y;

	if (pointerDown) {
		let rx = camera.rx + (newMouseY - pointerY) / CANVAS.clientHeight * Math.PI;
		camera.rx = Math.max(-(Math.PI / 2), Math.min(rx, Math.PI / 2));
		camera.ry += (newMouseX - pointerX) / CANVAS.clientWidth * Math.PI;
	}

	pointerX = newMouseX;
	pointerY = newMouseY;
});

document.addEventListener("pointerup", () => pointerDown = false);

CANVAS.addEventListener("keydown", event => {
	switch (event.key) {
		case "f":
		case "F":
			event.preventDefault();
			if (!document.fullscreenElement)
				CANVAS.requestFullscreen();
			else
				document.exitFullscreen();
			break;
	}

	switch (event.code) {
		case "KeyA":
		case "ArrowLeft":
			event.preventDefault();
			left = true;
			break;

		case "KeyD":
		case "ArrowRight":
			event.preventDefault();
			right = true;
			break;

		case "KeyW":
		case "ArrowUp":
			event.preventDefault();
			up = true;
			break;

		case "KeyS":
		case "ArrowDown":
			event.preventDefault();
			down = true;
			break;

		case "Space":
			event.preventDefault();
			paused = !paused;
			break;
	}
});

document.addEventListener("keyup", event => {
	switch (event.code) {
		case "KeyA":
		case "ArrowLeft":
			left = false;
			break;

		case "KeyD":
		case "ArrowRight":
			right = false;
			break;

		case "KeyW":
		case "ArrowUp":
			up = false;
			break;

		case "KeyS":
		case "ArrowDown":
			down = false;
			break;
	}
});

function onReadyStateChange() {
	if (vertexShaderRequest.readyState !== XMLHttpRequest.DONE || vertexShaderRequest.status !== 200) return;
	if (fragmentShaderRequest.readyState !== XMLHttpRequest.DONE || fragmentShaderRequest.status !== 200) return;

	let vertexShader = GL.createShader(GL.VERTEX_SHADER);
	GL.shaderSource(vertexShader, vertexShaderRequest.responseText);
	GL.compileShader(vertexShader);

	if (!GL.getShaderParameter(vertexShader, GL.COMPILE_STATUS))
		throw new Error(`Vertex shader: ${GL.getShaderInfoLog(vertexShader)}`);

	let fragmentShader = GL.createShader(GL.FRAGMENT_SHADER);
	GL.shaderSource(fragmentShader, fragmentShaderRequest.responseText);
	GL.compileShader(fragmentShader);

	if (!GL.getShaderParameter(fragmentShader, GL.COMPILE_STATUS))
		throw new Error(`Fragment shader: ${GL.getShaderInfoLog(fragmentShader)}`);

	let program = GL.createProgram();
	GL.attachShader(program, vertexShader);
	GL.attachShader(program, fragmentShader);
	GL.linkProgram(program);

	if (!GL.getProgramParameter(program, GL.LINK_STATUS))
		throw new Error(`Program: ${GL.getProgramInfoLog(program)}`);

	let aPositionLocation = GL.getAttribLocation(program, "aPosition");
	let aNormalLocation = GL.getAttribLocation(program, "aNormal");
	let uViewMatrixLocation = GL.getUniformLocation(program, "uViewMatrix");
	let uProjectionMatrixLocation = GL.getUniformLocation(program, "uProjectionMatrix");
	let uLightDirectionLocation = GL.getUniformLocation(program, "uLightDirection");

	requestAnimationFrame(timeStamp0 => {
		requestAnimationFrame(timeStamp1 => {
			let delta = (timeStamp1 - timeStamp0) / 1000;
			render(delta);

			requestAnimationFrame(function callback(timeStamp2) {
				delta = (delta + (timeStamp2 - timeStamp1) / 1000) / 2;  // Exponential moving average
				timeStamp1 = timeStamp2;
				render(delta);
				requestAnimationFrame(callback);
			});
		});
	});

	function render(delta) {
		if (left) camera.ry += delta;
		if (right) camera.ry -= delta;
		if (up) camera.rx = Math.min(camera.rx + delta, Math.PI / 2);
		if (down) camera.rx = Math.max(-(Math.PI / 2), camera.rx - delta);

		if (!paused) {
			switch (update) {
				case "cells":
					world.updateCells(Math.ceil(2 * delta * world.volume));
					break;

				case "buffers":
					renderer.updateBuffers(Math.ceil(2 * delta * world.volume));
					break;
			}
		}

		CANVAS.width = CANVAS.clientWidth;
		CANVAS.height = document.fullscreenElement != null ? CANVAS.clientHeight : CANVAS.clientWidth * (9 / 16);
		camera.aspect = CANVAS.width / CANVAS.height;

		GL.viewport(0, 0, GL.drawingBufferWidth, GL.drawingBufferHeight);

		GL.enable(GL.CULL_FACE);
		GL.enable(GL.DEPTH_TEST);

		GL.clearColor(1, 1, 1, 1);
		GL.clearDepth(1);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

		GL.useProgram(program);
		GL.uniformMatrix4fv(uViewMatrixLocation, false, camera.viewMatrix);
		GL.uniformMatrix4fv(uProjectionMatrixLocation, false, camera.projectionMatrix);
		GL.uniform3f(uLightDirectionLocation, -1, -2, -3);

		renderer.render(aPositionLocation, aNormalLocation);
	}
}