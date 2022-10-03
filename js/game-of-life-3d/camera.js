const FOV_SYMBOL = Symbol("fov");
const ASPECT_SYMBOL = Symbol("aspect");
const NEAR_SYMBOL = Symbol("near");
const FAR_SYMBOL = Symbol("far");
const X_SYMBOL = Symbol("x");
const Y_SYMBOL = Symbol("y");
const Z_SYMBOL = Symbol("z");
const RX_SYMBOL = Symbol("rx");
const RY_SYMBOL = Symbol("ry");
const PROJECTION_MATRIX_SYMBOL = Symbol("projectionMatrix");
const VIEW_MATRIX_SYMBOL = Symbol("viewMatrix");

// This particular camera always looks at (0, 0, 0). "options.x", "options.y" and "options.z" are the offsets with
// respect of the sphere on which the camera is placed, relative to the direction it's looking at.
export class Camera {
	constructor({
		fov = 45 * (Math.PI / 2),
		aspect = 1,
		near = 0.1,
		far = 1000,
		x = 0,
		y = 0,
		z = 0,
		rx = 0,
		ry = 0
	} = {}) {
		this[FOV_SYMBOL] = fov;
		this[ASPECT_SYMBOL] = aspect;
		this[NEAR_SYMBOL] = near;
		this[FAR_SYMBOL] = far;
		this[X_SYMBOL] = x;
		this[Y_SYMBOL] = y;
		this[Z_SYMBOL] = z;
		this[RX_SYMBOL] = rx;
		this[RY_SYMBOL] = ry;
		this[PROJECTION_MATRIX_SYMBOL] = undefined;
		this[VIEW_MATRIX_SYMBOL] = undefined;
	}

	get fov() {
		return this[FOV_SYMBOL];
	}

	set fov(fov) {
		if (fov !== this[FOV_SYMBOL]) {
			this[FOV_SYMBOL] = fov;
			this[PROJECTION_MATRIX_SYMBOL] = undefined;
		}
	}

	get aspect() {
		return this[ASPECT_SYMBOL];
	}

	set aspect(aspect) {
		if (aspect !== this[ASPECT_SYMBOL]) {
			this[ASPECT_SYMBOL] = aspect;
			this[PROJECTION_MATRIX_SYMBOL] = undefined;
		}
	}

	get near() {
		return this[NEAR_SYMBOL];
	}

	set near(near) {
		if (near !== this[NEAR_SYMBOL]) {
			this[NEAR_SYMBOL] = near;
			this[PROJECTION_MATRIX_SYMBOL] = undefined;
		}
	}

	get far() {
		return this[FAR_SYMBOL];
	}

	set far(far) {
		if (far !== this[FAR_SYMBOL]) {
			this[FAR_SYMBOL] = far;
			this[PROJECTION_MATRIX_SYMBOL] = undefined;
		}
	}

	get x() {
		return this[X_SYMBOL];
	}

	set x(x) {
		if (x !== this[X_SYMBOL]) {
			this[X_SYMBOL] = x;
			this[VIEW_MATRIX_SYMBOL] = undefined;
		}
	}

	get y() {
		return this[Y_SYMBOL];
	}

	set y(y) {
		if (y !== this[Y_SYMBOL]) {
			this[Y_SYMBOL] = y;
			this[VIEW_MATRIX_SYMBOL] = undefined;
		}
	}

	get z() {
		return this[Z_SYMBOL];
	}

	set z(z) {
		if (z !== this[Z_SYMBOL]) {
			this[Z_SYMBOL] = z;
			this[VIEW_MATRIX_SYMBOL] = undefined;
		}
	}

	get rx() {
		return this[RX_SYMBOL];
	}

	set rx(rx) {
		if (rx !== this[RX_SYMBOL]) {
			this[RX_SYMBOL] = rx;
			this[VIEW_MATRIX_SYMBOL] = undefined;
		}
	}

	get ry() {
		return this[RY_SYMBOL];
	}

	set ry(ry) {
		if (ry !== this[RY_SYMBOL]) {
			this[RY_SYMBOL] = ry;
			this[VIEW_MATRIX_SYMBOL] = undefined;
		}
	}

	get projectionMatrix() {
		if (this[PROJECTION_MATRIX_SYMBOL] == null) {
			// The column-major perspective projection matrix.
			// See: https://github.com/gregtatum/mdn-webgl/blob/master/library/matrices.js#L185.

			this[PROJECTION_MATRIX_SYMBOL] = [
				1 / (Math.tan(this.fov / 2) * this.aspect), 0, 0, 0,
				0, 1 / Math.tan(this.fov / 2), 0, 0,
				0, 0, (this.near + this.far) / (this.near - this.far), -1,
				0, 0, 2 * this.near * this.far / (this.near - this.far), 0
			];
		}

		return this[PROJECTION_MATRIX_SYMBOL];
	}

	get viewMatrix() {
		if (this[VIEW_MATRIX_SYMBOL] == null) {
			// The column-major camera matrix. It is calculated using the following transformations:
			//
			// * Rotate around the x axis (Rx):
			//   https://github.com/gregtatum/mdn-webgl/blob/master/library/matrices.js#L128;
			//
			// * Rotate around the y axis (Ry):
			//   https://github.com/gregtatum/mdn-webgl/blob/master/library/matrices.js#L141;
			//
			// * Translate by (x, y, z) (T):
			//   https://github.com/gregtatum/mdn-webgl/blob/master/library/matrices.js#L167.
			//
			// Using WolphramAlpha we can easily calculate the result of the following (row-major) matrix
			// multiplication: (Ry * Rx * T)^-1 = T^-1 * Rx^-1 * Ry^-1. The result is available at
			// https://bit.ly/3bFOHcT.

			this[VIEW_MATRIX_SYMBOL] = [
				Math.cos(this.ry), Math.sin(this.rx) * Math.sin(this.ry), -(Math.cos(this.rx) * Math.sin(this.ry)), 0,
				0, Math.cos(this.rx), Math.sin(this.rx), 0,
				Math.sin(this.ry), -(Math.sin(this.rx) * Math.cos(this.ry)), Math.cos(this.rx) * Math.cos(this.ry), 0,
				-this.x, -this.y, -this.z, 1
			];
		}

		return this[VIEW_MATRIX_SYMBOL];
	}
}