const X_MAX_SYMBOL = Symbol("xMax");
const Y_MAX_SYMBOL = Symbol("yMax");
const Z_MAX_SYMBOL = Symbol("zMax");
const WRAP_SYMBOL = Symbol("wrap");
const NEW_WRAP_SYMBOL = Symbol("newWrap");
const ARRAYS_SYMBOL = Symbol("arrays");
const ACTIVE_SYMBOL = Symbol("active");
const UPDATED_SYMBOL = Symbol("updated");
const GET_SYMBOL = Symbol("get");
const SET_SYMBOL = Symbol("set");
const FOR_EACH_SYMBOL = Symbol("forEach");

export class World {
	constructor(xMax, yMax, zMax, wrap, environment, fertility) {
		this[X_MAX_SYMBOL] = xMax;
		this[Y_MAX_SYMBOL] = yMax;
		this[Z_MAX_SYMBOL] = zMax;
		this[WRAP_SYMBOL] = wrap;

		// Changes on "wrap" are delayed until incremental updates are completed
		this[NEW_WRAP_SYMBOL] = this[WRAP_SYMBOL];

		// The state of the game world is represented by a collection of two arrays. Only one of the two arrays is
		// active at any given time. Updates are done incrementally on the inactive array, keeping track of where we
		// left off using the "updated" variable.
		this[ARRAYS_SYMBOL] = [[], []];
		this[ACTIVE_SYMBOL] = 0;
		this[UPDATED_SYMBOL] = 0;

		for (let i = 0; i < xMax * yMax * zMax; ++i) {
			this[ARRAYS_SYMBOL][0].push(false);
			this[ARRAYS_SYMBOL][1].push(false);
		}

		this.environment = environment;
		this.fertility = fertility;
		this.onUpdateComplete = () => {};
	}

	get xMax() {
		return this[X_MAX_SYMBOL];
	}

	get yMax() {
		return this[Y_MAX_SYMBOL];
	}

	get zMax() {
		return this[Z_MAX_SYMBOL];
	}

	get volume() {
		return this[ARRAYS_SYMBOL][this[ACTIVE_SYMBOL]].length;
	}

	get(x, y, z) {
		return this[GET_SYMBOL](this[ACTIVE_SYMBOL], x, y, z);
	}

	set(x, y, z, value) {
		this[SET_SYMBOL](this[ACTIVE_SYMBOL], x, y, z, value);
	}

	forEach(callback) {
		this[FOR_EACH_SYMBOL](this[ACTIVE_SYMBOL], callback);
	}

	updateCells(count) {
		for (; count > 0; --count) {
			let x0 = this[UPDATED_SYMBOL] % this.xMax;
			let z0 = Math.floor(this[UPDATED_SYMBOL] / this.xMax) % this.zMax;
			let y0 = Math.floor(this[UPDATED_SYMBOL] / (this.xMax * this.zMax)) % this.yMax;

			let neighbors = 0;

			for (let dy = -1; dy <= 1; ++dy) {
				for (let dz = -1; dz <= 1; ++dz) {
					for (let dx = -1; dx <= 1; ++dx) {
						if (dx !== 0 || dy !== 0 || dz !== 0) {
							let x = x0 + dx;
							let y = y0 + dy;
							let z = z0 + dz;

							if (this.wrap) {
								x = modulo(x, this.xMax);
								y = modulo(y, this.yMax);
								z = modulo(z, this.zMax);
							}

							if (this[GET_SYMBOL](this[ACTIVE_SYMBOL], x, y, z))
								++neighbors;
						}
					}
				}
			}

			if (this[GET_SYMBOL](this[ACTIVE_SYMBOL], x0, y0, z0))
				this[SET_SYMBOL](1 - this[ACTIVE_SYMBOL], x0, y0, z0, this.environment.includes(neighbors));
			else
				this[SET_SYMBOL](1 - this[ACTIVE_SYMBOL], x0, y0, z0, this.fertility.includes(neighbors));

			if (++this[UPDATED_SYMBOL] >= this[ARRAYS_SYMBOL][this[ACTIVE_SYMBOL]].length) {
				this[ACTIVE_SYMBOL] = 1 - this[ACTIVE_SYMBOL];
				this[UPDATED_SYMBOL] = 0;
				this[WRAP_SYMBOL] = this[NEW_WRAP_SYMBOL];
				this.onUpdateComplete();
				break;
			}
		}
	}

	[GET_SYMBOL](active, x, y, z) {
		if (x >= 0 && x < this.xMax && y >= 0 && y < this.yMax && z >= 0 && z < this.zMax)
			return this[ARRAYS_SYMBOL][active][x + z * this.xMax + y * (this.xMax * this.zMax)];
		else
			return false;
	}

	[SET_SYMBOL](active, x, y, z, value) {
		if (x >= 0 && x < this.xMax && y >= 0 && y < this.yMax && z >= 0 && z < this.zMax)
			this[ARRAYS_SYMBOL][active][x + z * this.xMax + y * (this.xMax * this.zMax)] = value;
	}

	[FOR_EACH_SYMBOL](active, callback) {
		for (let y = 0; y < this.yMax; ++y) {
			for (let z = 0; z < this.zMax; ++z) {
				for (let x = 0; x < this.xMax; ++x) {
					let index = x + z * this.xMax + y * (this.xMax * this.zMax);
					let value = callback(x, y, z, this[ARRAYS_SYMBOL][active][index]);
					if (value != null) this[ARRAYS_SYMBOL][active][index] = value;
				}
			}
		}
	}
}

function modulo(x, y) {
	return (x % y + y) % y;
}