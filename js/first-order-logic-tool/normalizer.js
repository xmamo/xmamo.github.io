"use strict";

var firstOrderLogicTool = firstOrderLogicTool || {};

(function () {
	var Symbol = firstOrderLogicTool.Symbol;
	var UnaryFormula = firstOrderLogicTool.UnaryFormula;
	var BinaryFormula = firstOrderLogicTool.BinaryFormula;
	var QuantifiedFormula = firstOrderLogicTool.QuantifiedFormula;
	var Call = firstOrderLogicTool.Call;

	firstOrderLogicTool.normalize = function (formula, semantics) {
		var prenex = formula.accept(new ToPrenexFormulaVisitor(semantics));
		var prefix = prenex.prefix;
		var matrix = prenex.matrix;

		return {
			prenex: prenex.formula,

			prenexDNF: new PrenexFormula(
				prefix,

				matrix.accept(new NormalizeVisitor("DNF")).reduce(function (formula, conjunct) {
					conjunct = conjunct.reduce(function (conjunct, literal) {
						return conjunct != null ? new BinaryFormula(conjunct, "∧", literal) : literal;
					}, null);

					return formula != null ? new BinaryFormula(formula, "∨", conjunct) : conjunct;
				}, null)
			).formula,

			prenexCNF: new PrenexFormula(
				prefix,

				matrix.accept(new NormalizeVisitor("CNF")).reduce(function (formula, disjunct) {
					disjunct = disjunct.reduce(function (disjunct, literal) {
						return disjunct != null ? new BinaryFormula(disjunct, "∨", literal) : literal;
					}, null);

					return formula != null ? new BinaryFormula(formula, "∧", disjunct) : disjunct;
				}, null)
			).formula
		};
	};

	// Represents a formula in prenex form. The prefix is an array of quantifiers and associated variables; the matrix
	// is a formula.
	function PrenexFormula(prefix, matrix) {
		var self = this;
		var negated = false;

		Object.defineProperty(self, "prefix", {
			get: function () {
				return prefix.slice();
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
				return prefix.map(function (p) { return p.variable; });
			}
		});

		Object.defineProperty(self, "matrix", {
			get: function () {
				return negated ? new UnaryFormula("¬", matrix) : matrix;
			}
		});

		Object.defineProperty(self, "formula", {
			get: function () {
				var formula = self.matrix;
				var prefix = self.prefix;

				for (var i = prefix.length - 1; i >= 0; --i) {
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
			prefix.forEach(function (p) { if (p.variable === symbol1) p.variable = symbol2; });
			matrix = matrix.accept(new RenameSymbolVisitor(symbol1, symbol2));
		};
	}

	function ToPrenexFormulaVisitor(semantics) {
		var self = this;

		self.visitSymbol = function (symbol) {
			return new PrenexFormula([], symbol);
		};

		self.visitUnaryFormula = function (formula) {
			var prenexFormula = formula.operand.accept(self);
			prenexFormula.negate();
			return prenexFormula;
		};

		self.visitBinaryFormula = function (formula) {
			var left = formula.left;
			var operator = formula.operator;
			var right = formula.right;

			if (operator === "↔") {
				var prenexFormula = new BinaryFormula(
					new BinaryFormula(left, "→", right),
					"∧",
					new BinaryFormula(left, "←", right)
				).accept(self);

				(function () {
					var matrix = prenexFormula.matrix;
					if (!(matrix instanceof BinaryFormula) || matrix.operator !== "∧") return;

					var left = matrix.left;
					var right = matrix.right;
					if (!(left instanceof BinaryFormula) || !(right instanceof BinaryFormula)) return;

					var leftOp = left.operator;
					var rightOp = right.operator;
					if ((leftOp !== "→" || rightOp !== "←") && (leftOp !== "←" || rightOp !== "→")) return;
					if (!right.left.equals(left.left) || !right.right.equals(left.right)) return;

					prenexFormula = new PrenexFormula(
						prenexFormula.prefix,
						new BinaryFormula(left.left, "↔", left.right)
					);
				})();

				return prenexFormula;
			}

			var leftFormula = left.accept(self);
			var rightFormula = right.accept(self);
			var leftVariables = leftFormula.variables;
			var rightVariables = rightFormula.variables;

			// Guard against variable name collisions, renaming variables of the right-hand side formula if needed
			for (var i = 0, count = rightVariables.length; i < count; ++i) {
				var variable = rightVariables[i];
				if (leftVariables.indexOf(variable) < 0) continue;

				var match = variable.match(/^([^0-9]+)([0-9]+)?$/) || [variable, variable];
				var variablePrefix = match[1];
				var variableSuffix = Number(match[2] || 0);

				while (true) {
					var newVariable = variablePrefix + ++variableSuffix;
					if (newVariable in semantics && semantics[newVariable].type !== "variable") continue;
					if (leftVariables.indexOf(newVariable) >= 0) continue;
					if (rightVariables.indexOf(newVariable) >= 0) continue;

					rightFormula.rename(variable, newVariable);
					rightVariables[i] = newVariable;
					break;
				}
			}

			var prefix;

			switch (operator) {
				case "∧":
				case "∨":
					prefix = leftFormula.prefix.concat(rightFormula.prefix);
					break;

				case "→":
					prefix = leftFormula.negatedPrefix.concat(rightFormula.prefix);
					break;

				case "←":
					prefix = leftFormula.prefix.concat(rightFormula.negatedPrefix);
					break;
			}

			return new PrenexFormula(prefix, new BinaryFormula(leftFormula.matrix, operator, rightFormula.matrix));
		};

		self.visitQuantifiedFormula = function (formula) {
			var prenexFormula = formula.formula.accept(self);

			// The formula's quantifier and variable are added only if the variable is bound
			if (formula.formula.accept(new HasIdentifierVisitor(formula.variable)))
				prenexFormula.addToPrefix(formula.quantifier, formula.variable);

			return prenexFormula;
		};

		self.visitCall = function (call) {
			return new PrenexFormula([], call);
		};
	}

	function NormalizeVisitor(form) {
		var self = this;

		self.visitSymbol = function (symbol) {
			return [[symbol]];
		};

		self.visitUnaryFormula = function (formula) {
			return formula.operand.accept({
				visitSymbol: function () {
					return [[formula]];
				},

				visitUnaryFormula: function (formula) {
					return formula.operand.accept(self);
				},

				visitBinaryFormula: function (formula) {
					var left = formula.left;
					var right = formula.right;

					switch (formula.operator) {
						case "∧":
							return new BinaryFormula(
								new UnaryFormula("¬", left),
								"∨",
								new UnaryFormula("¬", right)
							).accept(self);

						case "∨":
							return new BinaryFormula(
								new UnaryFormula("¬", left),
								"∧",
								new UnaryFormula("¬", right)
							).accept(self);

						case "→":
							return new BinaryFormula(
								left,
								"∧",
								new UnaryFormula("¬", right)
							).accept(self);

						case "←":
							return new BinaryFormula(
								new UnaryFormula("¬", left),
								"∧",
								right
							).accept(self);

						case "↔":
							return new UnaryFormula(
								"¬",
								new BinaryFormula(
									new BinaryFormula(left, "→", right),
									"∧",
									new BinaryFormula(left, "←", right)
								)
							).accept(self);
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
					return new BinaryFormula(
						new UnaryFormula("¬", left),
						"∨", right
					).accept(self);

				case "←":
					return new BinaryFormula(
						left,
						"∨",
						new UnaryFormula("¬", right)
					).accept(self);

				case "↔":
					return new BinaryFormula(
						new BinaryFormula(left, "→", right),
						"∧",
						new BinaryFormula(left, "←", right)
					).accept(self);
			}
		};

		self.visitQuantifiedFormula = function (formula) {
			return [[formula]];
		};

		self.visitCall = function (call) {
			return [[call]];
		};

		function concat(clauses1, clauses2) {
			return fix(clauses1.concat(clauses2));
		}

		function combine(clauses1, clauses2) {
			var clauses = [];

			clauses1.forEach(function (clause1) {
				clauses2.forEach(function (clause2) {
					clauses.push(clause1.concat(clause2));
				});
			});

			return fix(clauses);
		}

		function fix(clauses) {
			// Remove duplicate literals
			clauses.forEach(function (clause) {
				for (var i = clause.length - 1; i >= 0; --i) {
					var literal = clause[i];

					for (var j = i - 1; j >= 0; --j) {
						if (clause[j].equals(literal)) {
							// Remove ith element
							clause.splice(i, 1);
							break;
						}
					}
				}
			});

			// Remove duplicate clauses
			for (var i = clauses.length - 1; i >= 0; --i) {
				var clause1 = clauses[i];

				for (var j = clauses.length - 1; j >= 0; --j) {
					if (i !== j) {
						var clause2 = clauses[j];

						var ok = clause2.every(function (literal1) {
							return clause1.some(function (literal2) {
								return literal2.equals(literal1);
							});
						});

						if (ok) {
							// Remove ith element
							clauses.splice(i, 1);
							break;
						}
					}
				}
			}

			return clauses;
		}
	}

	function HasIdentifierVisitor(identifier) {
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
			return call.identifier === identifier || call.args.some(function (arg) { return arg.accept(self); });
		};
	}

	function RenameSymbolVisitor(symbol1, symbol2) {
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

			return new QuantifiedFormula(
				formula.quantifier,
				variable === symbol1 ? symbol2 : variable,
				formula.formula.accept(self)
			);
		};

		self.visitCall = function (call) {
			return new Call(call.identifier, call.args.map(function (arg) { return arg.accept(self); }));
		};
	}
})();