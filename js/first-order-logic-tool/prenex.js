"use strict";

(function () {
	var Symbol = firstOrderLogicTool.Symbol;
	var UnaryFormula = firstOrderLogicTool.UnaryFormula;
	var BinaryFormula = firstOrderLogicTool.BinaryFormula;
	var QuantifiedFormula = firstOrderLogicTool.QuantifiedFormula;
	var Call = firstOrderLogicTool.Call;

	firstOrderLogicTool.toPrenex = function (formula, infoMap) {
		return formula.accept(new FormulaToPrenexVisitor(infoMap)).formula;
	};

	function FormulaToPrenexVisitor(infoMap) {
		var self = this;

		self.visitSymbol = function (symbol) {
			return new PrenexFormula([], symbol);
		};

		self.visitUnaryFormula = function (formula) {
			var prenex = formula.operand.accept(self);
			prenex.negate();
			return prenex;
		};

		self.visitBinaryFormula = function (formula) {
			var left = formula.left.accept(self);
			var operator = formula.operator;
			var right = formula.right.accept(self);

			if (operator === "↔") {
				var leftFormula = left.formula;
				var rightFormula = right.formula;
				return new BinaryFormula(
					new BinaryFormula(leftFormula, "→", rightFormula),
					"∧",
					new BinaryFormula(leftFormula, "←", rightFormula)
				).accept(self);
			}

			var leftVariables = left.variables;
			var rightVariables = right.variables;

			for (var ri = 0, count = rightVariables.length; ri < count; ri++) {
				var variable = rightVariables[ri];
				var li = leftVariables.indexOf(variable);

				if (li >= 0) {
					var match = variable.match(/^([^0-9]+)([0-9]+)?$/) || [variable, variable];
					var variablePrefix = match[1];
					var variableSuffix = Number(match[2] || 0);

					while (true) {
						var v = variablePrefix + ++variableSuffix;

						if ((!(v in infoMap) || infoMap[v].type === "variable") && leftVariables.indexOf(v) < 0 && rightVariables.indexOf(v) < 0) {
							right.rename(variable, v);
							rightVariables[ri] = v;
							break;
						}
					}
				}
			}

			return new PrenexFormula(
				("→←".indexOf(operator) < 0 ? left.prefix : left.negatedPrefix).concat(right.prefix),
				new BinaryFormula(left.matrix, operator, right.matrix)
			);
		};

		self.visitQuantifiedFormula = function (formula) {
			var prenex = formula.formula.accept(self);
			prenex.addToPrefix(formula.quantifier, formula.variable);
			return prenex;
		};

		self.visitCall = function (call) {
			return new PrenexFormula([], call);
		};
	}

	function PrenexFormula(prefix, matrix) {
		var self = this;
		var negated = false;

		Object.defineProperty(self, "prefix", {
			get: function () {
				return prefix.map(function (p) {
					return p;
				});
			}
		});

		Object.defineProperty(self, "negatedPrefix", {
			get: function () {
				return prefix.map(function (p) {
					return { quantifier: p.quantifier === "∀" ? "∃" : "∀", variable: p.variable };
				});
			}
		});

		Object.defineProperty(self, "variables", {
			get: function () {
				return prefix.map(function (p) {
					return p.variable;
				});
			}
		});

		Object.defineProperty(self, "matrix", {
			get: function () {
				var formula = matrix;
				if (negated) {
					formula = new UnaryFormula("¬", formula);
				}
				return formula;
			}
		});

		Object.defineProperty(self, "formula", {
			get: function () {
				var formula = self.matrix;
				var prefix = self.prefix;
				for (var i = prefix.length - 1; i >= 0; i--) {
					var p = prefix[i];
					formula = new QuantifiedFormula(p.quantifier, p.variable, formula);
				}
				return formula;
			}
		});

		self.addToPrefix = function (quantifier, variable) {
			prefix.unshift({ quantifier: quantifier, variable: variable });
		};

		self.negate = function () {
			prefix = self.negatedPrefix;
			negated = !negated
		};

		self.rename = function (symbol1, symbol2) {
			prefix.forEach(function (p) {
				if (p.variable === symbol1) {
					p.variable = symbol2;
				}
			});
			matrix = matrix.accept(new FormulaRenameSymbolVisitor(symbol1, symbol2));
		};
	}

	function FormulaRenameSymbolVisitor(symbol1, symbol2) {
		var self = this;

		self.visitSymbol = function (symbol) {
			return symbol.identifier === symbol1 ? new Symbol(symbol2) : symbol;
		};

		self.visitUnaryFormula = function (formula) {
			return new UnaryFormula(formula.operator, formula.operand.accept(self));
		};

		self.visitBinaryFormula = function (formula) {
			return new BinaryFormula(formula.left.accept(self), formula.operator, formula.right.accept(self));
		};

		self.visitQuantifiedFormula = function (formula) {
			var variable = formula.variable;
			return new QuantifiedFormula(formula.quantifier, variable === symbol1 ? symbol2 : variable, formula.formula.accept(self));
		};

		self.visitCall = function (call) {
			return new Call(call.identifier, call.args.map(function (arg) {
				return arg.accept(self);
			}));
		};
	}
})();