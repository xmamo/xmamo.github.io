"use strict";

var gameOfLife3d = gameOfLife3d || {};

gameOfLife3d.Renderer = function (gl, world) {
	var positions = [];
	var normals = [];
	var indices = [];
	var arrays = [{ positions: positions, normals: normals, indices: indices }];
	var io = 0; // Index offset
	var updated = 0;
	var buffers = [];

	this.world = world;
	this.onUpdateComplete = function () { };

	Object.defineProperty(this, "gl", {
		get: function () {
			return gl;
		}
	});

	this.updateBuffers = function (count) {
		for (; count > 0; count--) {
			var x = updated % this.world.xMax;
			var z = Math.floor(updated / this.world.xMax) % this.world.zMax;
			var y = Math.floor(Math.floor(updated / this.world.xMax) / this.world.zMax);
			var dx = -this.world.xMax / 2;
			var dy = -this.world.yMax / 2;
			var dz = -this.world.zMax / 2;

			if (this.world.get(x, y, z)) {
				if (!this.world.get(x - 1, y, z)) {
					positions.push(
						x + dx, y + dy, z + dz,
						x + dx, y + dy, z + 1 + dz,
						x + dx, y + 1 + dy, z + 1 + dz,
						x + dx, y + 1 + dy, z + dz
					);
					normals.push(
						-1, 0, 0,
						-1, 0, 0,
						-1, 0, 0,
						-1, 0, 0
					);
					indices.push(
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
				}

				if (!this.world.get(x + 1, y, z)) {
					positions.push(
						x + 1 + dx, y + dy, z + dz,
						x + 1 + dx, y + 1 + dy, z + dz,
						x + 1 + dx, y + 1 + dy, z + 1 + dz,
						x + 1 + dx, y + dy, z + 1 + dz
					);
					normals.push(
						1, 0, 0,
						1, 0, 0,
						1, 0, 0,
						1, 0, 0
					);
					indices.push(
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
				}

				if (!this.world.get(x, y - 1, z)) {
					positions.push(
						x + dx, y + dy, z + dz,
						x + 1 + dx, y + dy, z + dz,
						x + 1 + dx, y + dy, z + 1 + dz,
						x + dx, y + dy, z + 1 + dz
					);
					normals.push(
						0, -1, 0,
						0, -1, 0,
						0, -1, 0,
						0, -1, 0
					);
					indices.push(
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
				}

				if (!this.world.get(x, y + 1, z)) {
					positions.push(
						x + dx, y + 1 + dy, z + dz,
						x + dx, y + 1 + dy, z + 1 + dz,
						x + 1 + dx, y + 1 + dy, z + 1 + dz,
						x + 1 + dx, y + 1 + dy, z + dz
					);
					normals.push(
						0, 1, 0,
						0, 1, 0,
						0, 1, 0,
						0, 1, 0
					);
					indices.push(
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
				}

				if (!this.world.get(x, y, z - 1)) {
					positions.push(
						x + dx, y + dy, z + dz,
						x + dx, y + 1 + dy, z + dz,
						x + 1 + dx, y + 1 + dy, z + dz,
						x + 1 + dx, y + dy, z + dz
					);
					normals.push(
						0, 0, -1,
						0, 0, -1,
						0, 0, -1,
						0, 0, -1
					);
					indices.push(
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
				}

				if (!this.world.get(x, y, z + 1)) {
					positions.push(
						x + dx, y + dy, z + 1 + dz,
						x + 1 + dx, y + dy, z + 1 + dz,
						x + 1 + dx, y + 1 + dy, z + 1 + dz,
						x + dx, y + 1 + dy, z + 1 + dz
					);
					normals.push(
						0, 0, 1,
						0, 0, 1,
						0, 0, 1,
						0, 0, 1
					);
					indices.push(
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
				}

				if (io + 36 > 65535) {
					positions = [];
					normals = [];
					indices = [];
					arrays.push({ positions: positions, normals: normals, indices: indices });
					io = 0;
				}
			}

			if (++updated === this.world.volume) {
				var arrayLength = arrays.length;

				while (buffers.length < arrayLength) {
					buffers.push({
						positionsBuffer: gl.createBuffer(),
						normalsBuffer: gl.createBuffer(),
						indicesBuffer: gl.createBuffer(),
						count: 0
					});
				}

				for (var i = 0, buffersLength = buffers.length; i < buffersLength; i++) {
					var buffer = buffers[i];
					var array = arrays[i];

					gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positionsBuffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(i < arrayLength ? array.positions : []), gl.DYNAMIC_DRAW);

					gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normalsBuffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(i < arrayLength ? array.normals : []), gl.DYNAMIC_DRAW);

					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesBuffer);
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(i < arrayLength ? array.indices : []), gl.DYNAMIC_DRAW);

					buffers[i].count = array.indices.length;
				}

				positions = [];
				normals = [];
				indices = [];
				arrays = [{ positions: positions, normals: normals, indices: indices }];
				io = 0;
				updated = 0;

				this.onUpdateComplete();
			}
		}
	};

	this.render = function (aPositionLocation, aNormalLocation) {
		gl.enableVertexAttribArray(aPositionLocation);
		gl.enableVertexAttribArray(aNormalLocation);

		for (var i = 0, buffersLength = buffers.length; i < buffersLength; i++) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].positionsBuffer);
			gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].normalsBuffer);
			gl.vertexAttribPointer(aNormalLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[i].indicesBuffer);

			gl.drawElements(gl.TRIANGLES, buffers[i].count, gl.UNSIGNED_SHORT, 0);
		}
	};
};