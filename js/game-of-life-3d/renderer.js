const BUFFERS_ARRAYS_SYMBOL = Symbol("buffsersArrays");
const ACTIVE_SYMBOL = Symbol("active");
const UPDATED_SYMBOL = Symbol("updated");
const POSITIONS_SYMBOL = Symbol("positions");
const NORMALS_SYMBOL = Symbol("normals");
const INDICES_SYMBOL = Symbol("indices");
const I_SYMBOL = Symbol("i");
const J_SYMBOL = Symbol("j");
const UPLOAD_BUFFERS_SYMBOL = Symbol("uploadBuffers");

export class Renderer {
	constructor(gl, world) {
		this.gl = gl;
		this.world = world;
		this.onUpdateComplete = () => {};

		// The buffers uploaded to the graphics card are stored in a collection of two objects. Only one of the two
		// objects is active at any given time. Updates are done incrementally on the inactive object, keeping track of
		// where we left off using the "updated" variable.
		// 
		// Drawing the whole scene can require multiple draw calls; because of this, each object stores an array of
		// WebGL buffers, together with the count indicating how many are currently being used. Since their amount can
		// fluctuate over time, buffers are created but never destroyed.
		this[BUFFERS_ARRAYS_SYMBOL] = [{ buffersArray: [], count: 0 }, { buffersArray: [], count: 0 }];
		this[ACTIVE_SYMBOL] = 0;
		this[UPDATED_SYMBOL] = 0;

		// The arrays currently used to incrementally construct the buffers which will be sent to the graphics card
		this[POSITIONS_SYMBOL] = [];
		this[NORMALS_SYMBOL] = [];
		this[INDICES_SYMBOL] = [];

		this[I_SYMBOL] = 0;  // The next unused index to be used for the indices buffer
		this[J_SYMBOL] = 0;  // The number of currently used buffers
	}

	updateBuffers(count) {
		let xMax = this.world.xMax;
		let yMax = this.world.yMax;
		let zMax = this.world.zMax;

		for (; count > 0; --count) {
			let x = this[UPDATED_SYMBOL] % xMax;
			let z = Math.floor(this[UPDATED_SYMBOL] / xMax) % zMax;
			let y = Math.floor(this[UPDATED_SYMBOL] / (xMax * zMax)) % yMax;

			if (this.world.get(x, y, z)) {
				// These offsets move the center of the game world to (0, 0, 0).
				let dx = -xMax / 2;
				let dy = -yMax / 2;
				let dz = -zMax / 2;

				if (!this.world.get(x - 1, y, z)) {
					this[POSITIONS_SYMBOL].push(
						x + dx, y + dy, z + dz,
						x + dx, y + dy, z + dz + 1,
						x + dx, y + dy + 1, z + dz + 1,
						x + dx, y + dy + 1, z + dz
					);

					this[NORMALS_SYMBOL].push(
						-1, 0, 0,
						-1, 0, 0,
						-1, 0, 0,
						-1, 0, 0
					);

					this[INDICES_SYMBOL].push(
						this[I_SYMBOL], this[I_SYMBOL] + 1, this[I_SYMBOL] + 2,
						this[I_SYMBOL], this[I_SYMBOL] + 2, this[I_SYMBOL] + 3
					);

					this[I_SYMBOL] += 4;
				}

				if (!this.world.get(x + 1, y, z)) {
					this[POSITIONS_SYMBOL].push(
						x + dx + 1, y + dy, z + dz + 1,
						x + dx + 1, y + dy, z + dz,
						x + dx + 1, y + dy + 1, z + dz,
						x + dx + 1, y + dy + 1, z + dz + 1
					);

					this[NORMALS_SYMBOL].push(
						1, 0, 0,
						1, 0, 0,
						1, 0, 0,
						1, 0, 0
					);

					this[INDICES_SYMBOL].push(
						this[I_SYMBOL], this[I_SYMBOL] + 1, this[I_SYMBOL] + 2,
						this[I_SYMBOL], this[I_SYMBOL] + 2, this[I_SYMBOL] + 3
					);

					this[I_SYMBOL] += 4;
				}

				if (!this.world.get(x, y - 1, z)) {
					this[POSITIONS_SYMBOL].push(
						x + dx, y + dy, z + dz,
						x + dx + 1, y + dy, z + dz,
						x + dx + 1, y + dy, z + dz + 1,
						x + dx, y + dy, z + dz + 1
					);

					this[NORMALS_SYMBOL].push(
						0, -1, 0,
						0, -1, 0,
						0, -1, 0,
						0, -1, 0
					);

					this[INDICES_SYMBOL].push(
						this[I_SYMBOL], this[I_SYMBOL] + 1, this[I_SYMBOL] + 2,
						this[I_SYMBOL], this[I_SYMBOL] + 2, this[I_SYMBOL] + 3
					);

					this[I_SYMBOL] += 4;
				}

				if (!this.world.get(x, y + 1, z)) {
					this[POSITIONS_SYMBOL].push(
						x + dx, y + dy + 1, z + dz + 1,
						x + dx + 1, y + dy + 1, z + dz + 1,
						x + dx + 1, y + dy + 1, z + dz,
						x + dx, y + dy + 1, z + dz
					);

					this[NORMALS_SYMBOL].push(
						0, 1, 0,
						0, 1, 0,
						0, 1, 0,
						0, 1, 0
					);

					this[INDICES_SYMBOL].push(
						this[I_SYMBOL], this[I_SYMBOL] + 1, this[I_SYMBOL] + 2,
						this[I_SYMBOL], this[I_SYMBOL] + 2, this[I_SYMBOL] + 3
					);

					this[I_SYMBOL] += 4;
				}

				if (!this.world.get(x, y, z - 1)) {
					this[POSITIONS_SYMBOL].push(
						x + dx + 1, y + dy, z + dz,
						x + dx, y + dy, z + dz,
						x + dx, y + dy + 1, z + dz,
						x + dx + 1, y + dy + 1, z + dz
					);

					this[NORMALS_SYMBOL].push(
						0, 0, -1,
						0, 0, -1,
						0, 0, -1,
						0, 0, -1
					);

					this[INDICES_SYMBOL].push(
						this[I_SYMBOL], this[I_SYMBOL] + 1, this[I_SYMBOL] + 2,
						this[I_SYMBOL], this[I_SYMBOL] + 2, this[I_SYMBOL] + 3
					);

					this[I_SYMBOL] += 4;
				}

				if (!this.world.get(x, y, z + 1)) {
					this[POSITIONS_SYMBOL].push(
						x + dx, y + dy, z + dz + 1,
						x + dx + 1, y + dy, z + dz + 1,
						x + dx + 1, y + dy + 1, z + dz + 1,
						x + dx, y + dy + 1, z + dz + 1
					);

					this[NORMALS_SYMBOL].push(
						0, 0, 1,
						0, 0, 1,
						0, 0, 1,
						0, 0, 1
					);

					this[INDICES_SYMBOL].push(
						this[I_SYMBOL], this[I_SYMBOL] + 1, this[I_SYMBOL] + 2,
						this[I_SYMBOL], this[I_SYMBOL] + 2, this[I_SYMBOL] + 3
					);

					this[I_SYMBOL] += 4;
				}

				// There are at most 65536 16-bit indices; we have to check that the next iteration of the loop can
				// push up to 24 different indices without exceeding this limit.
				if (this[I_SYMBOL] > 65536 - 24) this[UPLOAD_BUFFERS_SYMBOL]();
			}

			if (++this[UPDATED_SYMBOL] >= this.world.volume) {
				this[UPLOAD_BUFFERS_SYMBOL]();
				this[ACTIVE_SYMBOL] = 1 - this[ACTIVE_SYMBOL];
				this[UPDATED_SYMBOL] = 0;
				this[BUFFERS_ARRAYS_SYMBOL][this[ACTIVE_SYMBOL]].count = this[J_SYMBOL];
				this[J_SYMBOL] = 0;
				this.onUpdateComplete();
				break;
			}
		}
	}

	render(aPositionLocation, aNormalLocation) {
		let gl = this.gl;

		gl.enableVertexAttribArray(aPositionLocation);
		gl.enableVertexAttribArray(aNormalLocation);

		let { buffersArray, count } = this[BUFFERS_ARRAYS_SYMBOL][this[ACTIVE_SYMBOL]];

		for (let i = 0; i < count; ++i) {
			let buffers = buffersArray[i];

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positions);
			gl.vertexAttribPointer(aPositionLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals);
			gl.vertexAttribPointer(aNormalLocation, 3, gl.FLOAT, false, 0, 0);

			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices);
			gl.drawElements(gl.TRIANGLES, buffers.count, gl.UNSIGNED_SHORT, 0);
		}
	}

	[UPLOAD_BUFFERS_SYMBOL]() {
		let gl = this.gl;
		let otherBuffersArray = this[BUFFERS_ARRAYS_SYMBOL][1 - this[ACTIVE_SYMBOL]].buffersArray;

		while (otherBuffersArray.length <= this[J_SYMBOL]) {
			const MAX_QUADS = Math.floor(65536 / 4);

			let positionsBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, positionsBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, 12 * MAX_QUADS * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);

			let normalsBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, 12 * MAX_QUADS * Float32Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);

			let indicesBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 6 * MAX_QUADS * Uint16Array.BYTES_PER_ELEMENT, gl.DYNAMIC_DRAW);

			otherBuffersArray.push({
				positions: positionsBuffer,
				normals: normalsBuffer,
				indices: indicesBuffer,
				count: 0
			});
		}

		let otherBuffers = otherBuffersArray[this[J_SYMBOL]];

		gl.bindBuffer(gl.ARRAY_BUFFER, otherBuffers.positions);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from(this[POSITIONS_SYMBOL]));

		gl.bindBuffer(gl.ARRAY_BUFFER, otherBuffers.normals);
		gl.bufferSubData(gl.ARRAY_BUFFER, 0, Float32Array.from(this[NORMALS_SYMBOL]));

		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, otherBuffers.indices);
		gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, Uint16Array.from(this[INDICES_SYMBOL]));

		otherBuffers.count = this[INDICES_SYMBOL].length;

		this[POSITIONS_SYMBOL] = [];
		this[NORMALS_SYMBOL] = [];
		this[INDICES_SYMBOL] = [];

		this[I_SYMBOL] = 0;
		++this[J_SYMBOL];
	}
}