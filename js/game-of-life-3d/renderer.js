var gameOfLife3d = gameOfLife3d || {};

gameOfLife3d.Renderer = function (gl, world) {
	var self = this;
	var updated = 0;
	var current = 0;
	var io = 0; // Index offset
	var bo = 0; // Buffers array offset
	var positions = [];
	var normals = [];
	var indices = [];
	var buffersArrayInfos = [{ buffersArray: [], count: 0 }, { buffersArray: [], count: 0 }];

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

		for (; count > 0; count--) {
			var x = updated % xMax;
			var z = Math.floor(updated / xMax) % zMax;
			var y = Math.floor(updated / (xMax * zMax)) % yMax;

			if (world.get(x, y, z)) {
				// Offsets to move the center of the cube to (0, 0, 0)
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
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
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
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
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
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
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
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
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
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
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
						io, io + 1, io + 2,
						io, io + 2, io + 3
					);
					io += 4;
				}

				if (io > 65511) {
					moveArraysToBuffers();
				}
			}

			if (++updated >= world.volume) {
				moveArraysToBuffers();
				current = 1 - current;
				buffersArrayInfos[current].count = bo;
				bo = 0;
				updated = 0;
				self.onUpdateComplete();
				break;
			}
		}
	};

	self.render = function (aPositionLocation, aNormalLocation) {
		gl.enableVertexAttribArray(aPositionLocation);
		gl.enableVertexAttribArray(aNormalLocation);

		var buffersArrayInfo = buffersArrayInfos[current];
		var buffersArray = buffersArrayInfo.buffersArray;

		for (var i = 0, count = buffersArrayInfo.count; i < count; i++) {
			var buffers = buffersArray[i];

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positions);
			gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
			gl.vertexAttribPointer(aNormalLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);

			gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_SHORT, 0);
		}
	};

	function moveArraysToBuffers() {
		var otherBuffersArray = buffersArrayInfos[1 - current].buffersArray;

		bo++;
		while (otherBuffersArray.length < bo) {
			otherBuffersArray.push({ positions: gl.createBuffer(), normals: gl.createBuffer(), indices: gl.createBuffer(), count: 0 });
		}

		var otherBuffers = otherBuffersArray[bo - 1];

		gl.bindBuffer(gl.ARRAY_BUFFER, otherBuffers.positions);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, otherBuffers.normals);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, otherBuffers.indices);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);

		otherBuffers.count = indices.length;

		io = 0;
		positions = [];
		normals = [];
		indices = [];
	}
};