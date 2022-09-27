const WIDTH_SYMBOL = Symbol("width");
const HEIGHT_SYMBOL = Symbol("height");
const ARRAYS_SYMBOL = Symbol("arrays");
const ACTIVE_SYMBOL = Symbol("active");
const GET_SYMBOL = Symbol("get");
const SET_SYMBOL = Symbol("set");
const FOR_EACH_SYMBOL = Symbol("forEach");

export class World {
	constructor(width, height, wrap) {
		this.wrap = wrap;

		this[WIDTH_SYMBOL] = width;
		this[HEIGHT_SYMBOL] = height;

		// The state of the game world is represented by a collection of two arrays. Only one of the two arrays is
		// active at any given time. Updates are computed by querying the inactive array. 
		this[ARRAYS_SYMBOL] = [[], []];
		this[ACTIVE_SYMBOL] = 0;

		for (let i = 0; i < width * height; ++i) {
			this[ARRAYS_SYMBOL][0].push(false);
			this[ARRAYS_SYMBOL][1].push(false);
		}
	}

	get width() {
		return this[WIDTH_SYMBOL];
	}

	get height() {
		return this[HEIGHT_SYMBOL];
	}

	get area() {
		return this[ARRAYS_SYMBOL][this[ACTIVE_SYMBOL]].length;
	}

	get(x, y) {
		return this[GET_SYMBOL](this[ACTIVE_SYMBOL], x, y);
	}

	set(x, y, value) {
		this[SET_SYMBOL](this[ACTIVE_SYMBOL], x, y, value);
	}

	forEach(callback) {
		this[FOR_EACH_SYMBOL](this[ACTIVE_SYMBOL], callback);
	}

	updateCells() {
		for (let y0 = 0; y0 < this.height; ++y0) {
			for (let x0 = 0; x0 < this.width; ++x0) {
				let neighbors = 0;

				for (let dy = -1; dy <= 1; ++dy) {
					for (let dx = -1; dx <= 1; ++dx) {
						if (dx !== 0 || dy !== 0) {
							let x;
							let y;

							if (this.wrap) {
								x = modulo(x0 + dx, this.width);
								y = modulo(y0 + dy, this.height);
							} else {
								x = x0 + dx;
								y = y0 + dx;
							}

							if (this[GET_SYMBOL](this[ACTIVE_SYMBOL], x, y))
								++neighbors;
						}
					}
				}

				if (this[GET_SYMBOL](this[ACTIVE_SYMBOL], x0, y0))
					this[SET_SYMBOL](1 - this[ACTIVE_SYMBOL], x0, y0, neighbors >= 2 && neighbors <= 3);
				else
					this[SET_SYMBOL](1 - this[ACTIVE_SYMBOL], x0, y0, neighbors === 3);
			}
		}

		this[ACTIVE_SYMBOL] = 1 - this[ACTIVE_SYMBOL];
	}

	[GET_SYMBOL](active, x, y) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height)
			return this[ARRAYS_SYMBOL][active][x + y * this.width];
		else
			return false;
	}

	[SET_SYMBOL](active, x, y, value) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height)
			this[ARRAYS_SYMBOL][active][x + y * this.width] = value;
	}

	[FOR_EACH_SYMBOL](active, callback) {
		for (let y = 0; y < this.height; ++y) {
			for (let x = 0; x < this.width; ++x) {
				let index = x + y * this.width;
				let value = callback(x, y, this[ARRAYS_SYMBOL][active][index]);

				if (value != null)
					this[ARRAYS_SYMBOL][active][index] = value;
			}
		}
	}
}

function modulo(x, y) {
	return (x % y + y) % y;
}