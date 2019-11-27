"use strict";

(function () {
	var Symbol = firstOrderLogicTool.Symbol;
	var UnaryFormula = firstOrderLogicTool.UnaryFormula;
	var BinaryFormula = firstOrderLogicTool.BinaryFormula;
	var QuantifiedFormula = firstOrderLogicTool.QuantifiedFormula;
	var Call = firstOrderLogicTool.Call;

	firstOrderLogicTool.normalize = function (formula, infoMap) {
		var prenex = formula.accept(new FormulaToPrenexVisitor(infoMap));
		var prefix = prenex.prefix;
		var matrix = prenex.matrix;

		return {
			prenex: prenex.formula,

			prenexDNF: new PrenexFormula(prefix, matrix.accept(new FormulaNormalizeVisitor("DNF")).reduce(function (formula, conjunct) {
				conjunct = conjunct.reduce(function (conjunct, literal) {
					return conjunct != null ? new BinaryFormula(conjunct, "∧", literal) : literal;
				}, null);
				return formula != null ? new BinaryFormula(formula, "∨", conjunct) : conjunct;
			}, null)).formula,

			prenexCNF: new PrenexFormula(prefix, matrix.accept(new FormulaNormalizeVisitor("CNF")).reduce(function (formula, disjunct) {
				disjunct = disjunct.reduce(function (disjunct, literal) {
					return disjunct != null ? new BinaryFormula(disjunct, "∨", literal) : literal;
				}, null);
				return formula != null ? new BinaryFormula(formula, "∧", disjunct) : disjunct;
			}, null)).formula
		};
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
			var left = formula.left;
			var operator = formula.operator;
			var right = formula.right;

			if (operator === "↔") {
				var prenex = new BinaryFormula(new BinaryFormula(left, "→", right), "∧", new BinaryFormula(left, "←", right)).accept(self);
				var matrix = prenex.matrix;
				if (matrix.right.left.equals(matrix.left.left) && matrix.right.right.equals(matrix.left.right)) {
					prenex = new PrenexFormula(prenex.prefix, new BinaryFormula(matrix.left.left, "↔", matrix.left.right));
				}
				return prenex;
			}

			var leftPrenex = left.accept(self);
			var rightPrenex = right.accept(self);
			var leftVariables = leftPrenex.variables;
			var rightVariables = rightPrenex.variables;

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
							rightPrenex.rename(variable, v);
							rightVariables[ri] = v;
							break;
						}
					}
				}
			}

			var prefix;
			switch (operator) {
				case "∧":
				case "∨":
					prefix = leftPrenex.prefix;
					break;
				case "→":
				case "←":
					prefix = leftPrenex.negatedPrefix;
					break;
			}
			return new PrenexFormula(prefix.concat(rightPrenex.prefix), new BinaryFormula(leftPrenex.matrix, operator, rightPrenex.matrix));
		};

		self.visitQuantifiedFormula = function (formula) {
			var prenex = formula.formula.accept(self);
			if (formula.formula.accept(new FormulaUsesIdentifierVisitor(formula.variable))) {
				prenex.addToPrefix(formula.quantifier, formula.variable);
			}
			return prenex;
		};

		self.visitCall = function (call) {
			return new PrenexFormula([], call);
		};
	}

	function FormulaUsesIdentifierVisitor(identifier) {
		var self = this;

		self.visitSymbol = function (symbol) {
			return symbol.identifier === identifier;
		};

		self.visitUnaryFormula = function (formula) {
			return formula.operand.accept(self);
		};

		self.visitBinaryFormula = function (formula) {
			return formula.left.accept(self) || formula.right.accept(self);
		};

		self.visitQuantifiedFormula = function (formula) {
			return formula.variable === identifier || formula.formula.accept(self);
		};

		self.visitCall = function (call) {
			return call.identifier === identifier || call.args.some(function (arg) {
				return arg.accept(self);
			});
		};
	}

	function FormulaNormalizeVisitor(form) {
		var self = this;

		self.visitSymbol = function (symbol) {
			return [[symbol]];
		};

		self.visitUnaryFormula = function (formula) {
			return formula.operand.accept({
				visitSymbol: function () {
					return [[formula]];
				},

				visitUnaryFormula: function (f) {
					return f.operand.accept(self);
				},

				visitBinaryFormula: function (f) {
					var left = f.left;
					var right = f.right;

					switch (f.operator) {
						case "∧":
							return new BinaryFormula(new UnaryFormula("¬", left), "∨", new UnaryFormula("¬", right)).accept(self);
						case "∨":
							return new BinaryFormula(new UnaryFormula("¬", left), "∧", new UnaryFormula("¬", right)).accept(self);
						case "→":
							return new BinaryFormula(left, "∧", new UnaryFormula("¬", right)).accept(self);
						case "←":
							return new BinaryFormula(new UnaryFormula("¬", left), "∧", right).accept(self);
						case "↔":
							return new UnaryFormula("¬", new BinaryFormula(new BinaryFormula(left, "→", right), "∧", new BinaryFormula(left, "←", right))).accept(self);
					}
				},

				visitCall: function () {
					return [[formula]];
				}
			});
		};

		self.visitBinaryFormula = function (formula) {
			var left = formula.left;
			var operator = formula.operator;
			var right = formula.right;

			switch (operator) {
				case "∧":
					switch (form) {
						case "DNF":
							return combine(left.accept(self), right.accept(self));
						case "CNF":
							return concat(left.accept(self), right.accept(self));
					}
					break;

				case "∨":
					switch (form) {
						case "DNF":
							return concat(left.accept(self), right.accept(self));
						case "CNF":
							return combine(left.accept(self), right.accept(self));
					}
					break;

				case "→":
					return new BinaryFormula(new UnaryFormula("¬", left), "∨", right).accept(self);

				case "←":
					return new BinaryFormula(left, "∨", new UnaryFormula("¬", right)).accept(self);

				case "↔":
					return new BinaryFormula(new BinaryFormula(left, "→", right), "∧", new BinaryFormula(left, "←", right)).accept(self);
			}
		};

		self.visitQuantifiedFormula = function (formula) {
			return [[formula]];
		};

		self.visitCall = function (call) {
			return [[call]];
		};

		function concat(junction1, junction2) {
			return fix(junction1.concat(junction2));
		}

		function combine(junction1, junction2) {
			var junction = [];
			junction1.forEach(function (clause1) {
				junction2.forEach(function (clause2) {
					junction.push(clause1.concat(clause2));
				});
			});
			return fix(junction);
		}

		function fix(junction) {
			// Remove duplicate literals
			junction.forEach(function (clause) {
				for (var i = clause.length - 1; i >= 0; i--) {
					var literal = clause[i];

					for (var j = i - 1; j >= 0; j--) {
						if (clause[j].equals(literal)) {
							clause.splice(i, 1);
							break;
						}
					}
				}
			});

			// Remove duplicate clauses
			for (var i = junction.length - 1; i >= 0; i--) {
				var clause1 = junction[i];
				var count1 = clause1.length;

				for (var j = junction.length - 1; j >= 0; j--) {
					if (i === j) {
						continue;
					}

					var clause2 = junction[j];

					if (clause2.length <= count1 && clause2.every(function (literal2) {
						return clause1.some(function (literal1) {
							return literal1.equals(literal2);
						});
					})) {
						junction.splice(i, 1);
						break;
					}
				}
			}

			return junction;
		}
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
					var quantifier;
					switch (p.quantifier) {
						case "∀":
							quantifier = "∃";
							break;
						case "∃":
							quantifier = "∀";
							break;
					}
					return { quantifier: quantifier, variable: p.variable };
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
			negated = !negated;
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