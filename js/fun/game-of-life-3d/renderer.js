"use strict";

var gameOfLife3d = gameOfLife3d || {};

gameOfLife3d.Renderer = function (gl, world) {
	var self = this;
	var positions = [];
	var normals = [];
	var indices = [];
	var arrays = [{ positions: positions, normals: normals, indices: indices }];
	var io = 0; // Index offset
	var updated = 0;
	var buffers = [];

	self.world = world;
	self.onUpdateComplete = function () { };

	Object.defineProperty(self, "gl", {
		get: function () {
			return gl;
		}
	});

	self.updateBuffers = function (count) {
		for (; count > 0; count--) {
			var x = updated % self.world.xMax;
			var z = Math.floor(updated / self.world.xMax) % self.world.zMax;
			var y = Math.floor(Math.floor(updated / self.world.xMax) / self.world.zMax);
			var dx = -self.world.xMax / 2;
			var dy = -self.world.yMax / 2;
			var dz = -self.world.zMax / 2;

			if (self.world.get(x, y, z)) {
				if (!self.world.get(x - 1, y, z)) {
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

				if (!self.world.get(x + 1, y, z)) {
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

				if (!self.world.get(x, y - 1, z)) {
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

				if (!self.world.get(x, y + 1, z)) {
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

				if (!self.world.get(x, y, z - 1)) {
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

				if (!self.world.get(x, y, z + 1)) {
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

			if (++updated === self.world.volume) {
				var arrayLength = arrays.length;

				while (buffers.length < arrayLength) {
					buffers.push({
						positionsBuffer: gl.createBuffer(),
						normalsBuffer: gl.createBuffer(),
						indicesBuffer: gl.createBuffer(),
						count: 0
					});
				}

				for (var i = 0; i < arrayLength; i++) {
					var buffer = buffers[i];
					var array = arrays[i];

					gl.bindBuffer(gl.ARRAY_BUFFER, buffer.positionsBuffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array.positions), gl.DYNAMIC_DRAW);

					gl.bindBuffer(gl.ARRAY_BUFFER, buffer.normalsBuffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array.normals), gl.DYNAMIC_DRAW);

					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer.indicesBuffer);
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(array.indices), gl.DYNAMIC_DRAW);

					buffers[i].count = array.indices.length;
				}

				positions = [];
				normals = [];
				indices = [];
				arrays = [{ positions: positions, normals: normals, indices: indices }];
				io = 0;
				updated = 0;

				self.onUpdateComplete();
			}
		}
	};

	this.render = function (aPositionLocation, aNormalLocation) {
		gl.enableVertexAttribArray(aPositionLocation);
		gl.enableVertexAttribArray(aNormalLocation);

		for (var i = 0, buffersArrayLength = buffers.length; i < buffersArrayLength; i++) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].positionsBuffer);
			gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers[i].normalsBuffer);
			gl.vertexAttribPointer(aNormalLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers[i].indicesBuffer);

			gl.drawElements(gl.TRIANGLES, buffers[i].count, gl.UNSIGNED_SHORT, 0);
		}
	};
};