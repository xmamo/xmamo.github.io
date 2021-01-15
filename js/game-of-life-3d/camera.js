"use strict";

var gameOfLife3d = gameOfLife3d || {};

// This particular camera always looks at (0, 0, 0). "options.x", "options.y" and "options.z" are the offsets with
// respect of the sphere on which the camera is placed, relative to the direction it's looking at.
gameOfLife3d.Camera = function (options) {
	options = options || {};

	var self = this;
	var fov = options.fov || 45 * (Math.PI / 2);
	var aspect = options.aspect || 1;
	var near = options.near || 0.1;
	var far = options.far || 1000;
	var x = options.x || 0;
	var y = options.y || 0;
	var z = options.z || 0;
	var rx = options.rx || 0;
	var ry = options.ry || 0;

	var projectionMatrix = null;
	var viewMatrix = null;

	Object.defineProperty(self, "fov", {
		get: function () {
			return fov;
		},

		set: function (value) {
			if (value !== fov) {
				fov = value;
				projectionMatrix = null;
			}
		}
	});

	Object.defineProperty(self, "aspect", {
		get: function () {
			return aspect;
		},

		set: function (value) {
			if (value !== aspect) {
				aspect = value;
				projectionMatrix = null;
			}
		}
	});

	Object.defineProperty(self, "near", {
		get: function () {
			return near;
		},

		set: function (value) {
			if (value !== near) {
				near = value;
				projectionMatrix = null;
			}
		}
	});

	Object.defineProperty(self, "far", {
		get: function () {
			return far;
		},

		set: function (value) {
			if (value !== far) {
				far = value;
				projectionMatrix = null;
			}
		}
	});

	Object.defineProperty(self, "x", {
		get: function () {
			return x;
		},

		set: function (value) {
			if (value !== x) {
				x = value;
				viewMatrix = null;
			}
		}
	});

	Object.defineProperty(self, "y", {
		get: function () {
			return y;
		},

		set: function (value) {
			if (value !== y) {
				y = value;
				viewMatrix = null;
			}
		}
	});

	Object.defineProperty(self, "z", {
		get: function () {
			return z;
		},

		set: function (value) {
			if (value !== z) {
				z = value;
				viewMatrix = null;
			}
		}
	});

	Object.defineProperty(self, "rx", {
		get: function () {
			return rx;
		},

		set: function (value) {
			if (value !== rx) {
				rx = value;
				viewMatrix = null;
			}
		}
	});

	Object.defineProperty(self, "ry", {
		get: function () {
			return ry;
		},

		set: function (value) {
			if (value !== ry) {
				ry = value;
				viewMatrix = null;
			}
		}
	});

	Object.defineProperty(self, "projectionMatrix", {
		get: function () {
			if (projectionMatrix == null) {
				// The column-major perspective projection matrix.
				// See: https://github.com/gregtatum/mdn-webgl/blob/master/library/matrices.js#L185.
				projectionMatrix = [
					1 / (Math.tan(self.fov / 2) * self.aspect), 0, 0, 0,
					0, 1 / Math.tan(self.fov / 2), 0, 0,
					0, 0, (self.near + self.far) / (self.near - self.far), -1,
					0, 0, 2 * self.near * self.far / (self.near - self.far), 0
				];
			}

			return projectionMatrix;
		}
	});

	Object.defineProperty(self, "viewMatrix", {
		get: function () {
			if (viewMatrix == null) {
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
				viewMatrix = [
					Math.cos(self.ry), Math.sin(self.rx) * Math.sin(self.ry), -(Math.cos(self.rx) * Math.sin(self.ry)), 0,
					0, Math.cos(self.rx), Math.sin(self.rx), 0,
					Math.sin(self.ry), -(Math.sin(self.rx) * Math.cos(self.ry)), Math.cos(self.rx) * Math.cos(self.ry), 0,
					-self.x, -self.y, -self.z, 1
				];
			}

			return viewMatrix;
		}
	});
};