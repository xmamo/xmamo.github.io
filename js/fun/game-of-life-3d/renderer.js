"use strict";

var gameOfLife3d = gameOfLife3d || {};

gameOfLife3d.Renderer = function (gl, world) {
	var self = this;
	var positions = [];
	var normals = [];
	var indices = [];
	var array = [{ positions: positions, normals: normals, indices: indices }];
	var io = 0; // Index offset
	var updated = 0;
	var buffersArray = [];

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
					array.push({ positions: positions, normals: normals, indices: indices });
					io = 0;
				}
			}

			if (++updated === self.world.volume) {
				var arrayLength = array.length;

				while (buffersArray.length < arrayLength) {
					buffersArray.push({
						positionsBuffer: gl.createBuffer(),
						normalsBuffer: gl.createBuffer(),
						indicesBuffer: gl.createBuffer(),
						count: 0
					});
				}

				for (var i = 0; i < arrayLength; i++) {
					gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[i].positionsBuffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(i < arrayLength ? array[i].positions : []), gl.DYNAMIC_DRAW);

					gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[i].normalsBuffer);
					gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(i < arrayLength ? array[i].normals : []), gl.DYNAMIC_DRAW);

					gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffersArray[i].indicesBuffer);
					gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(i < arrayLength ? array[i].indices : []), gl.DYNAMIC_DRAW);

					buffersArray[i].count = i < arrayLength ? array[i].indices.length : 0;
				}

				positions = [];
				normals = [];
				indices = [];
				array = [{ positions: positions, normals: normals, indices: indices }];
				io = 0;
				updated = 0;

				self.onUpdateComplete();
			}
		}
	};

	this.render = function (aPositionLocation, aNormalLocation) {
		gl.enableVertexAttribArray(aPositionLocation);
		gl.enableVertexAttribArray(aNormalLocation);

		for (var i = 0, buffersArrayLength = buffersArray.length; i < buffersArrayLength; i++) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[i].positionsBuffer);
			gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffersArray[i].normalsBuffer);
			gl.vertexAttribPointer(aNormalLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffersArray[i].indicesBuffer);

			gl.drawElements(gl.TRIANGLES, buffersArray[i].count, gl.UNSIGNED_SHORT, 0);
		}
	};
};