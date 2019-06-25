"use strict";

(function () {
	var vertexShaderRequest = new XMLHttpRequest();
	var fragmentShaderRequest = new XMLHttpRequest();

	vertexShaderRequest.onreadystatechange = callback;
	vertexShaderRequest.open("GET", "/js/projects/game-of-life-3d/shader.vert");
	vertexShaderRequest.responseType = "text";
	vertexShaderRequest.send();

	fragmentShaderRequest.onreadystatechange = callback;
	fragmentShaderRequest.open("GET", "/js/projects/game-of-life-3d/shader.frag");
	fragmentShaderRequest.responseType = "text";
	fragmentShaderRequest.send();

	var update = "cells";

	var world = new gameOfLife3d.World(64, 64, 64, 4, 5, 5, 5);
	world.forEach(function () {
		return Math.random() < 0.1;
	});
	world.onUpdateComplete = function () {
		update = "buffers";
	};

	var canvas = document.getElementById("game-of-life-3d-canvas");
	var gl = canvas.getContext("webgl");
	var renderer = new gameOfLife3d.Renderer(gl, world);
	renderer.updateBuffers(world.volume);
	renderer.onUpdateComplete = function () {
		update = "cells";
	};

	var camera = new gameOfLife3d.Camera({ z: 64 });

	var modelMatrix = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		-world.xMax / 2, -world.yMax / 2, -world.zMax / 2, 1
	];

	var left = false;
	var right = false;
	var up = false;
	var down = false;
	var paused = false;
	var mouseDown = false;

	window.onkeydown = function (event) {
		switch (event.key) {
			case "f":
			case "F":
				if (!document.fullscreenElement) {
					canvas.requestFullscreen();
				} else {
					document.exitFullscreen();
				}
				break;

			case " ":
				paused = !paused;
				break;
		}

		switch (event.code) {
			case "KeyA":
				left = true;
				break;
			case "KeyD":
				right = true;
				break;
			case "KeyW":
				up = true;
				break;
			case "KeyS":
				down = true;
				break;
		}
	};

	window.onkeyup = function (event) {
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
	};

	window.ontouchstart = window.onmousedown = function () {
		mouseDown = event.target === canvas;
	};

	window.ontouchend = window.onmouseup = function () {
		mouseDown = false;
	};

	window.onmousemove = function (event) {
		if (mouseDown) {
			camera.rx = Math.max(-Math.PI / 2, Math.min(camera.rx - event.movementY / canvas.clientHeight * Math.PI, Math.PI / 2));
			camera.ry -= event.movementX / canvas.clientWidth * Math.PI;
		}
	};

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
		var uModelMatrixLocation = gl.getUniformLocation(program, "uModelMatrix");
		var uViewMatrixLocation = gl.getUniformLocation(program, "uViewMatrix");
		var uProjectionMatrixLocation = gl.getUniformLocation(program, "uProjectionMatrix");
		var uLightDirectionLocation = gl.getUniformLocation(program, "uLightDirection");

		window.requestAnimationFrame(function (timeStamp) {
			var now = timeStamp;
			var delta = 0;
			window.requestAnimationFrame(callback);

			function callback(timeStamp) {
				window.requestAnimationFrame(callback);
				delta = (delta + (timeStamp - now) / 1000) / 2; // Exponential moving average
				now = timeStamp;
				render(delta);
			}
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

			switch (update) {
				case "cells":
					world.updateCells(world.volume * Math.min(delta, 0.1) * 2);
					break;
				case "buffers":
					renderer.updateBuffers(world.volume * Math.min(delta, 0.1) * 2);
					break;
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
			gl.uniformMatrix4fv(uModelMatrixLocation, false, modelMatrix);
			gl.uniformMatrix4fv(uViewMatrixLocation, false, camera.viewMatrix);
			gl.uniformMatrix4fv(uProjectionMatrixLocation, false, camera.projectionMatrix);
			gl.uniform3f(uLightDirectionLocation, -1, -2, -3);

			renderer.render(aPositionLocation, aNormalLocation);
		}
	}
})();