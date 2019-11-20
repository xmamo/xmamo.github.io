"use strict";

(function () {
	var touchToMouse = utils.touchToMouse;
	var Camera = gameOfLife3d.Camera;
	var World = gameOfLife3d.World;
	var Renderer = gameOfLife3d.Renderer;

	var vertexShaderRequest = new XMLHttpRequest();
	var fragmentShaderRequest = new XMLHttpRequest();

	vertexShaderRequest.onreadystatechange = callback;
	vertexShaderRequest.open("GET", "/js/game-of-life-3d/shader.vert");
	vertexShaderRequest.responseType = "text";
	vertexShaderRequest.send();

	fragmentShaderRequest.onreadystatechange = callback;
	fragmentShaderRequest.open("GET", "/js/game-of-life-3d/shader.frag");
	fragmentShaderRequest.responseType = "text";
	fragmentShaderRequest.send();

	var form = document.forms["game-of-life-3d"];
	var rulesetElement = form.elements.ruleset;
	var canvas = document.getElementById("game-of-life-3d-canvas");
	var gl = canvas.getContext("webgl");
	var camera = new Camera({ z: 64 });
	var update = "cells";
	var mouseX = NaN;
	var mouseY = NaN;
	var mouseDown = false;
	var left = false;
	var right = false;
	var up = false;
	var down = false;
	var paused = false;

	var world = new World(64, 64, 64, 4, 5, 5, 5);
	world.forEach(function () {
		return Math.random() < 0.1;
	});
	world.onUpdateComplete = function () {
		update = "buffers";
	};

	var renderer = new Renderer(gl, world);
	renderer.updateBuffers(world.volume);
	renderer.onUpdateComplete = function () {
		update = "cells";
	};

	form.addEventListener("submit", function (event) {
		event.preventDefault();
	});

	rulesetElement.addEventListener("input", function () {
		var ruleset = rulesetElement.value.match(rulesetElement.pattern);
		if (ruleset == null) {
			return;
		}

		world.a = parseInt(ruleset[1]);
		world.b = parseInt(ruleset[2]);
		world.c = parseInt(ruleset[3]);
		world.d = parseInt(ruleset[4]);
	});

	canvas.addEventListener("contextmenu", function (event) {
		event.preventDefault();
	});

	canvas.addEventListener("mousedown", function (event) {
		mouseX = event.clientX - canvas.getBoundingClientRect().x;
		mouseY = event.clientY - canvas.getBoundingClientRect().y;
		mouseDown = true;
	});

	document.addEventListener("mousemove", function (event) {
		var newMouseX = event.clientX - canvas.getBoundingClientRect().x;
		var newMouseY = event.clientY - canvas.getBoundingClientRect().y;

		if (mouseDown) {
			camera.rx = Math.max(-Math.PI / 2, Math.min(camera.rx - (newMouseY - mouseY) / canvas.clientHeight * Math.PI, Math.PI / 2));
			camera.ry -= (newMouseX - mouseX) / canvas.clientWidth * Math.PI;
		}

		mouseX = newMouseX;
		mouseY = newMouseY;
	});

	document.addEventListener("mouseup", function (event) {
		mouseDown = false;
	});

	canvas.addEventListener("touchstart", function (event) {
		canvas.dispatchEvent(touchToMouse(event, "mousedown"));
		event.preventDefault();
	});

	document.addEventListener("touchmove", function (event) {
		document.dispatchEvent(touchToMouse(event, "mousemove"));
	});

	document.addEventListener("touchend", function (event) {
		document.dispatchEvent(touchToMouse(event, "mouseup"));
	});

	document.addEventListener("keydown", function (event) {
		switch (event.key) {
			case "f":
			case "F":
				if (mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight) {
					if (!document.fullscreenElement) {
						canvas.requestFullscreen();
					} else {
						document.exitFullscreen();
					}
					event.preventDefault();
				}
				break;

			case " ":
				if (mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight) {
					paused = !paused;
					event.preventDefault();
				}
				break;
		}

		switch (event.code) {
			case "KeyA":
				left = true;
				if (mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight) {
					event.preventDefault();
				}
				break;

			case "KeyD":
				right = true;
				if (mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight) {
					event.preventDefault();
				}
				break;

			case "KeyW":
				up = true;
				if (mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight) {
					event.preventDefault();
				}
				break;

			case "KeyS":
				down = true;
				if (mouseX >= 0 && mouseX <= canvas.clientWidth && mouseY >= 0 && mouseY <= canvas.clientHeight) {
					event.preventDefault();
				}
				break;
		}
	});

	document.addEventListener("keyup", function (event) {
		switch (event.code) {
			case "KeyA":
				left = false;
				break;
			case "KeyD":
				right = false;
				break;
			case "KeyW":
				up = false;
				break;
			case "KeyS":
				down = false;
				break;
		}
	});

	function callback() {
		if (vertexShaderRequest.readyState !== XMLHttpRequest.DONE || vertexShaderRequest.status !== 200) {
			return;
		}
		if (fragmentShaderRequest.readyState !== XMLHttpRequest.DONE || fragmentShaderRequest.status !== 200) {
			return;
		}

		var vertexShader = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(vertexShader, vertexShaderRequest.responseText);
		gl.compileShader(vertexShader);
		if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
			throw "Vertex shader: " + gl.getShaderInfoLog(vertexShader);
		}

		var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(fragmentShader, fragmentShaderRequest.responseText);
		gl.compileShader(fragmentShader);
		if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
			throw "Fragment shader: " + gl.getShaderInfoLog(fragmentShader);
		}

		var program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			throw "Program: " + gl.getProgramInfoLog(program);
		}

		var aPositionLocation = gl.getAttribLocation(program, "aPosition");
		var aNormalLocation = gl.getAttribLocation(program, "aNormal");
		var uViewMatrixLocation = gl.getUniformLocation(program, "uViewMatrix");
		var uProjectionMatrixLocation = gl.getUniformLocation(program, "uProjectionMatrix");
		var uLightDirectionLocation = gl.getUniformLocation(program, "uLightDirection");

		window.requestAnimationFrame(function (timeStamp) {
			var now = timeStamp;
			var delta = 0;
			window.requestAnimationFrame(function callback(timeStamp) {
				delta = (delta + (timeStamp - now) / 1000) / 2; // Exponential moving average
				now = timeStamp;
				render(delta);
				window.requestAnimationFrame(callback);
			});
		});

		function render(delta) {
			if (left) {
				camera.ry -= delta;
			}
			if (right) {
				camera.ry += delta;
			}
			if (up) {
				camera.rx = Math.max(-Math.PI / 2, camera.rx - delta);
			}
			if (down) {
				camera.rx = Math.min(camera.rx + delta, Math.PI / 2);
			}

			if (!paused) {
				switch (update) {
					case "cells":
						world.updateCells(world.volume * (delta * 2));
						break;
					case "buffers":
						renderer.updateBuffers(world.volume * (delta * 2));
						break;
				}
			}

			if (!document.fullscreenElement) {
				canvas.style.height = canvas.clientWidth * 9 / 16 + "px";
			}
			canvas.width = canvas.clientWidth;
			canvas.height = canvas.clientHeight;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

			gl.enable(gl.CULL_FACE);
			gl.enable(gl.DEPTH_TEST);

			gl.clearColor(0, 0, 0, 0);
			gl.clearDepth(1);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			gl.useProgram(program);
			gl.uniformMatrix4fv(uViewMatrixLocation, false, camera.viewMatrix);
			gl.uniformMatrix4fv(uProjectionMatrixLocation, false, camera.projectionMatrix);
			gl.uniform3f(uLightDirectionLocation, -1, -2, -3);

			renderer.render(aPositionLocation, aNormalLocation);
		}
	}
})();