"use strict";

var gameOfLife3d = gameOfLife3d || {};

gameOfLife3d.Renderer = function (gl, world) {
	var self = this;

	// The buffers uploaded to the graphics card are stored in a collection of two objects. Only one of the two objects
	// is active at any given time. Updates are done incrementally on the inactive object, keeping track of where we
	// left off using the "updated" variable.
	// 
	// Drawing the whole scene can require multiple draw calls; because of this, each object stores an array of WebGL
	// buffers, together with the count indicating how many are currently being used. Since their amount can fluctuate
	// over time, buffers are created but never destroyed.
	var buffersArrays = [{ buffersArray: [], count: 0 }, { buffersArray: [], count: 0 }];
	var active = 0;
	var updated = 0;

	// The arrays currently used to incrementally construct the buffers which will be sent to the graphics card
	var positions = [];
	var normals = [];
	var indices = [];

	var i = 0;  // The next unused index to be used for the indices buffer
	var j = 0;  // The number of currently used buffers

	self.world = world;
	self.onUpdateComplete = function () { };

	Object.defineProperty(self, "gl", {
		get: function () {
			return gl;
		}
	});

	self.updateBuffers = function (count) {
		var world = self.world;
		var xMax = world.xMax;
		var yMax = world.yMax;
		var zMax = world.zMax;

		for (; count > 0; --count) {
			var x = updated % xMax;
			var z = Math.floor(updated / xMax) % zMax;
			var y = Math.floor(updated / (xMax * zMax)) % yMax;

			if (world.get(x, y, z)) {
				// These offsets move the center of the game world to (0, 0, 0).
				var dx = -xMax / 2;
				var dy = -yMax / 2;
				var dz = -zMax / 2;

				if (!world.get(x - 1, y, z)) {
					positions.push(
						x + dx, y + dy, z + dz,
						x + dx, y + dy, z + dz + 1,
						x + dx, y + dy + 1, z + dz + 1,
						x + dx, y + dy + 1, z + dz
					);

					normals.push(
						-1, 0, 0,
						-1, 0, 0,
						-1, 0, 0,
						-1, 0, 0
					);

					indices.push(
						i, i + 1, i + 2,
						i, i + 2, i + 3
					);

					i += 4;
				}

				if (!world.get(x + 1, y, z)) {
					positions.push(
						x + dx + 1, y + dy, z + dz + 1,
						x + dx + 1, y + dy, z + dz,
						x + dx + 1, y + dy + 1, z + dz,
						x + dx + 1, y + dy + 1, z + dz + 1
					);

					normals.push(
						1, 0, 0,
						1, 0, 0,
						1, 0, 0,
						1, 0, 0
					);

					indices.push(
						i, i + 1, i + 2,
						i, i + 2, i + 3
					);

					i += 4;
				}

				if (!world.get(x, y - 1, z)) {
					positions.push(
						x + dx, y + dy, z + dz,
						x + dx + 1, y + dy, z + dz,
						x + dx + 1, y + dy, z + dz + 1,
						x + dx, y + dy, z + dz + 1
					);

					normals.push(
						0, -1, 0,
						0, -1, 0,
						0, -1, 0,
						0, -1, 0
					);

					indices.push(
						i, i + 1, i + 2,
						i, i + 2, i + 3
					);

					i += 4;
				}

				if (!world.get(x, y + 1, z)) {
					positions.push(
						x + dx, y + dy + 1, z + dz + 1,
						x + dx + 1, y + dy + 1, z + dz + 1,
						x + dx + 1, y + dy + 1, z + dz,
						x + dx, y + dy + 1, z + dz
					);

					normals.push(
						0, 1, 0,
						0, 1, 0,
						0, 1, 0,
						0, 1, 0
					);

					indices.push(
						i, i + 1, i + 2,
						i, i + 2, i + 3
					);

					i += 4;
				}

				if (!world.get(x, y, z - 1)) {
					positions.push(
						x + dx + 1, y + dy, z + dz,
						x + dx, y + dy, z + dz,
						x + dx, y + dy + 1, z + dz,
						x + dx + 1, y + dy + 1, z + dz
					);

					normals.push(
						0, 0, -1,
						0, 0, -1,
						0, 0, -1,
						0, 0, -1
					);

					indices.push(
						i, i + 1, i + 2,
						i, i + 2, i + 3
					);

					i += 4;
				}

				if (!world.get(x, y, z + 1)) {
					positions.push(
						x + dx, y + dy, z + dz + 1,
						x + dx + 1, y + dy, z + dz + 1,
						x + dx + 1, y + dy + 1, z + dz + 1,
						x + dx, y + dy + 1, z + dz + 1
					);

					normals.push(
						0, 0, 1,
						0, 0, 1,
						0, 0, 1,
						0, 0, 1
					);

					indices.push(
						i, i + 1, i + 2,
						i, i + 2, i + 3
					);

					i += 4;
				}

				// There are at most 65536 16-bit indices; we have to check that the next iteration of the loop can
				// push up to 24 different indices without exceeding this limit.
				if (i + 24 > 65536) uploadBuffers();
			}

			if (++updated >= world.volume) {
				uploadBuffers();
				active = 1 - active;
				updated = 0;
				buffersArrays[active].count = j;
				j = 0;
				self.onUpdateComplete();
				break;
			}
		}
	};

	self.render = function (aPositionLocation, aNormalLocation) {
		gl.enableVertexAttribArray(aPositionLocation);
		gl.enableVertexAttribArray(aNormalLocation);

		var buffersArray = buffersArrays[active].buffersArray;

		for (var i = 0, count = buffersArrays[active].count; i < count; ++i) {
			var buffers = buffersArray[i];

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positions);
			gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
			gl.vertexAttribPointer(aNormalLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
			gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_SHORT, 0);
		}
	};

	function uploadBuffers() {
		var otherBuffersArray = buffersArrays[1 - active].buffersArray;

		while (otherBuffersArray.length <= j) {
			var maxQuads = Math.floor(65536 / 4);

			var positionsBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, 12 * maxQuads * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);

			var normalsBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, 12 * maxQuads * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);

			var indicesBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 6 * maxQuads * Uint16Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);

			otherBuffersArray.push({
				positions: positionsBuffer,
				normals: normalsBuffer,
				indices: indicesBuffer,
				count: 0
			});
		}

		var otherBuffers = otherBuffersArray[j];

		gl.bindBuffer(gl.ARRAY_BUFFER, otherBuffers.positions);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from(positions));

		gl.bindBuffer(gl.ARRAY_BUFFER, otherBuffers.normals);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from(normals));

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, otherBuffers.indices);
		gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, Uint16Array.from(indices));

		otherBuffers.count = indices.length;

		positions = [];
		normals = [];
		indices = [];

		i = 0;
		++j;
	}
};