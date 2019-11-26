"use strict";

var firstOrderLogicTool = firstOrderLogicTool || {};

firstOrderLogicTool.Symbol = function (identifier, source, start, end) {
	var self = this;

	self.identifier = identifier;
	self.source = source;
	self.start = start;
	self.end = end;

	Object.defineProperty(self, "priority", {
		get: function () {
			return 4;
		}
	});

	Object.defineProperty(self, "height", {
		get: function () {
			return 1;
		}
	});

	Object.defineProperty(self, "degree", {
		get: function () {
			return 0;
		}
	});

	Object.defineProperty(self, "isPropositional", {
		get: function () {
			return true;
		}
	});

	Object.defineProperty(self, "hasQuantifiers", {
		get: function () {
			return false;
		}
	});

	self.accept = function (visitor) {
		return visitor.visitSymbol(self);
	};

	self.equals = function (other) {
		return self.identifier === other.identifier;
	};

	self.toString = function () {
		return self.identifier;
	};
};

firstOrderLogicTool.UnaryFormula = function (operator, operand, source, start, end) {
	var self = this;

	self.operator = operator;
	self.operand = operand;
	self.source = source;
	self.start = start;
	self.end = end;

	Object.defineProperty(self, "priority", {
		get: function () {
			return 3;
		}
	});

	Object.defineProperty(self, "height", {
		get: function () {
			return self.operand.height + 1;
		}
	});

	Object.defineProperty(self, "degree", {
		get: function () {
			return self.operand.degree + 1;
		}
	});

	Object.defineProperty(self, "isPropositional", {
		get: function () {
			return self.operand.isPropositional;
		}
	});

	Object.defineProperty(self, "hasQuantifiers", {
		get: function () {
			return self.operand.hasQuantifiers;
		}
	});

	self.accept = function (visitor) {
		return visitor.visitUnaryFormula(self);
	};

	self.equals = function (other) {
		return self.operator === other.operator && other.operand.equals(self.operand);
	};

	self.toString = function () {
		return self.operator + (self.operand.priority < self.priority ? "(" + self.operand + ")" : self.operand);
	};
};

firstOrderLogicTool.BinaryFormula = function (left, operator, right, source, start, end) {
	var self = this;

	self.left = left;
	self.operator = operator;
	self.right = right;
	self.source = source;
	self.start = start;
	self.end = end;

	Object.defineProperty(self, "priority", {
		get: function () {
			switch (self.operator) {
				case "∧":
				case "∨":
					return 2;
				case "→":
				case "←":
				case "↔":
					return 1;
			}
		}
	});

	Object.defineProperty(self, "height", {
		get: function () {
			return Math.max(self.left.height, self.right.height) + 1;
		}
	});

	Object.defineProperty(self, "degree", {
		get: function () {
			return self.left.degree + self.right.degree + 1;
		}
	});

	Object.defineProperty(self, "isPropositional", {
		get: function () {
			return self.left.isPropositional && self.right.isPropositional;
		}
	});

	Object.defineProperty(self, "hasQuantifiers", {
		get: function () {
			return self.left.hasQuantifiers || self.right.hasQuantifiers;
		}
	});

	Object.defineProperty(self, "isAssociative", {
		get: function () {
			switch (self.operator) {
				case "∧":
				case "∨":
				case "↔":
					return true;
				case "→":
				case "←":
					return false;
			}
		}
	});

	self.accept = function (visitor) {
		return visitor.visitBinaryFormula(self);
	};

	self.equals = function (other) {
		return other.left.equals(self.left) && other.operator === self.operator && other.right.equals(self.right);
	};

	self.toString = function () {
		var left = self.left;
		var operator = self.operator;
		var right = self.right;
		var priority = self.priority;
		return ((left.operator === operator && left.isAssociative ? left.priority < priority : left.priority <= priority) ? "(" + left + ")" : left) + " " + operator + " " + (right.priority <= priority ? "(" + right + ")" : right);
	};
};

firstOrderLogicTool.QuantifiedFormula = function (quantifier, variable, formula, source, start, end) {
	var self = this;

	self.quantifier = quantifier;
	self.variable = variable;
	self.formula = formula;
	self.source = source;
	self.start = start;
	self.end = end;

	Object.defineProperty(self, "priority", {
		get: function () {
			return 3;
		}
	});

	Object.defineProperty(self, "height", {
		get: function () {
			return self.formula.height + 1;
		}
	});

	Object.defineProperty(self, "degree", {
		get: function () {
			return self.formula.degree + 1;
		}
	});

	Object.defineProperty(self, "isPropositional", {
		get: function () {
			return false;
		}
	});

	Object.defineProperty(self, "hasQuantifiers", {
		get: function () {
			return true;
		}
	});

	self.accept = function (visitor) {
		return visitor.visitQuantifiedFormula(self);
	};

	self.equals = function (other) {
		return other.quantifier === self.quantifier && other.variable === self.variable && other.formula.equals(self.formula);
	};

	self.toString = function () {
		var formula = self.formula;
		return self.quantifier + self.variable + (formula.priority < self.priority ? "(" + formula + ")" : " " + formula);
	};
};

firstOrderLogicTool.Call = function (identifier, args, source, start, end) {
	var self = this;

	self.identifier = identifier;
	self.args = args;
	self.source = source;
	self.start = start;
	self.end = end;

	Object.defineProperty(self, "priority", {
		get: function () {
			return 4;
		}
	});

	Object.defineProperty(self, "height", {
		get: function () {
			return Math.max(0, Math.max.apply(null, self.args.map(function (arg) { return arg.height; }))) + 1;
		}
	});

	Object.defineProperty(self, "degree", {
		get: function () {
			return 0;
		}
	});

	Object.defineProperty(self, "isPropositional", {
		get: function () {
			return false;
		}
	});

	Object.defineProperty(self, "hasQuantifiers", {
		get: function () {
			return self.args.some(function (arg) {
				return arg.hasQuantifiers;
			});
		}
	});

	Object.defineProperty(self, "arity", {
		get: function () {
			return self.args.length;
		}
	});

	self.accept = function (visitor) {
		return visitor.visitCall(self);
	};

	self.equals = function (other) {
		var args = self.args;
		var otherArgs = other.args;
		return otherArgs.length === args.length && otherArgs.every(function (arg, i) {
			return arg.equals(args[i]);
		});
	};

	self.toString = function () {
		return self.identifier + "(" + self.args.join(", ") + ")";
	};
};