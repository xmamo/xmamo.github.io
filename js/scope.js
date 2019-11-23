"use strict";

var scope = scope || {};

(function () {
	var getSize = utils.getSize;

	scope.Scope = function (parent) {
		var self = this;

		self.parent = parent;
		self.data = {};

		Object.defineProperty(self, "root", {
			get: function () {
				var scope = self;
				var parent;
				while ((parent = scope.parent) != null) {
					scope = parent;
				}
				return scope;
			}
		});

		Object.defineProperty(self, "size", {
			get: function () {
				var size = getSize(self.data);
				var scope = self;
				var parent;
				while ((parent = scope.parent) != null) {
					scope = parent;
					size += getSize(scope.data);
				}
				return size;
			}
		});

		self.has = function (key) {
			return self.getScope(key) != null;
		};

		self.getScope = function (key) {
			var scope = self;
			while (scope != null && !(key in scope.data)) {
				scope = scope.parent;
			}
			return scope;
		};

		self.get = function (key) {
			var scope = self.getScope(key);
			return scope != null ? scope.data[key] : null;
		};

		self.set = function (key, value) {
			self.data[key] = value;
		};

		self.update = function (key, value) {
			var scope = self.getScope(key);
			if (scope != null) {
				scope.data[key] = value;
			}
		};

		self.delete = function (key) {
			var scope = self.getScope(key);
			if (scope != null) {
				delete scope.data[key];
			}
		};
	};
})();