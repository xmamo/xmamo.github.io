import * as syntax from "./syntax.js";

export function normalize(formula, semantics) {
	let prenex = formula.accept(new ToPrenexFormulaVisitor(semantics));
	let prefix = prenex.prefix;
	let matrix = prenex.matrix;

	return {
		prenex: prenex.formula,

		prenexDNF: new PrenexFormula(
			prefix,

			matrix.accept(new NormalizeVisitor("DNF")).reduce((formula, conjunct) => {
				conjunct = conjunct.reduce((conjunct, literal) => {
					return conjunct != null ? new syntax.Binary(conjunct, "∧", literal) : literal;
				}, undefined);

				return formula != null ? new syntax.Binary(formula, "∨", conjunct) : conjunct;
			}, undefined)
		).formula,

		prenexCNF: new PrenexFormula(
			prefix,

			matrix.accept(new NormalizeVisitor("CNF")).reduce((formula, disjunct) => {
				disjunct = disjunct.reduce((disjunct, literal) => {
					return disjunct != null ? new syntax.Binary(disjunct, "∨", literal) : literal;
				}, undefined);

				return formula != null ? new syntax.Binary(formula, "∧", disjunct) : disjunct;
			}, undefined)
		).formula
	};
}

// Represents a formula in prenex form. The prefix is an array of quantifiers and associated variables; the matrix is a
// formula.
class PrenexFormula {
	constructor(prefix, matrix) {
		this.prefix = prefix;
		this.matrix = matrix;
	}

	get negatedPrefix() {
		return this.prefix.map(p => {
			switch (p.quantifier) {
				case "∀":
					return { quantifier: "∃", variable: p.variable };
				case "∃":
					return { quantifier: "∀", variable: p.variable };
			}
		});
	}

	get formula() {
		let formula = this.matrix;

		for (let i = this.prefix.length - 1; i >= 0; --i) {
			let p = this.prefix[i];
			formula = new syntax.Quantified(p.quantifier, p.variable, formula);
		}

		return formula;
	}

	addToPrefix(quantifier, variable) {
		this.prefix.unshift({ quantifier: quantifier, variable: variable });
	}

	negate() {
		this.prefix = this.negatedPrefix;

		this.matrix = this.matrix.accept({
			visitSymbol(symbol) {
				return new syntax.Unary("¬", symbol);
			},

			visitUnary(unary) {
				return unary.operand;
			},

			visitBinary(binary) {
				return new syntax.Unary("¬", binary);
			},

			visitApplication(application) {
				return new syntax.Unary("¬", application);
			}
		});
	}

	rename(symbol1, symbol2) {
		for (let p of this.prefix) {
			if (p.variable === symbol1)
				p.variable = symbol2;
		}

		this.matrix = this.matrix.accept({
			visitSymbol(symbol) {
				return symbol.identifier === symbol1 ? new syntax.Symbol(symbol2) : symbol;
			},

			visitUnary(unary) {
				return new syntax.Unary(unary.operator, unary.operand.accept(this));
			},

			visitBinary(binary) {
				return new syntax.Binary(binary.left.accept(this), binary.operator, binary.right.accept(this));
			},

			visitApplication(application) {
				return new syntax.Application(application.identifier, application.args.map(arg => arg.accept(this)));
			}
		});
	}
}

class ToPrenexFormulaVisitor {
	constructor(semantics) {
		this.semantics = semantics;
	}

	visitSymbol(symbol) {
		return new PrenexFormula([], symbol);
	}

	visitUnary(unary) {
		let prenexFormula = unary.operand.accept(this);
		prenexFormula.negate();
		return prenexFormula;
	}

	visitBinary(binary) {
		let left = binary.left;
		let operator = binary.operator;
		let right = binary.right;

		if (operator === "↔") {
			let prenex = new syntax.Binary(
				new syntax.Binary(left, "→", right),
				"∧",
				new syntax.Binary(left, "←", right)
			).accept(this);

			// Turn prenex matrix into ψ ↔ φ if it is one of the following forms:
			//  * (φ → ψ) ∧ (φ ← ψ);
			//  * (φ ← ψ) ∧ (φ → ψ);
			//  * (φ → ψ) ∧ (ψ → φ);
			//  * (φ ← ψ) ∧ (ψ ← φ).

			return prenex.matrix.accept({
				visitSymbol() {
					return prenex;
				},

				visitUnary() {
					return prenex;
				},

				visitBinary(binary) {
					if (binary.operator !== "∧")
						return prenex;

					return binary.left.accept({
						visitSymbol() {
							return prenex;
						},

						visitUnary() {
							return prenex;
						},

						visitBinary(left) {
							return binary.right.accept({
								visitSymbol() {
									return prenex;
								},

								visitUnary() {
									return prenex;
								},

								visitBinary(right) {
									switch (`${left.operator}${right.operator}`) {
										case "→←":
										case "←→":
											if (left.left.equals(right.left) && left.right.equals(right.right)) {
												return new PrenexFormula(
													prenex.prefix,
													new syntax.Binary(left.left, "↔", left.right)
												);
											}
											break;

										case "→→":
										case "←←":
											if (left.left.equals(right.right) && left.right.equals(right.left)) {
												return new PrenexFormula(
													prenex.prefix,
													new syntax.Binary(left.left, "↔", left.right)
												);
											}
											break;
									}

									return prenex;
								},

								visitApplication() {
									return prenex;
								}
							});
						},

						visitApplication() {
							return prenex;
						}
					});
				},

				visitApplication() {
					return prenex;
				}
			});
		}

		let leftPrenex = left.accept(this);
		let rightPrenex = right.accept(this);
		let leftVariables = leftPrenex.prefix.map(p => p.variable);
		let rightVariables = rightPrenex.prefix.map(p => p.variable);

		// Guard against variable name collisions, renaming variables of the right-hand side formula if needed:

		for (let i = 0; i < rightVariables.length; ++i) {
			let variable = rightVariables[i];
			if (!leftVariables.includes(variable)) continue;

			let match = variable.match(/^([^0-9]+)([0-9]+)?$/u);
			let variablePrefix = match[1];
			let variableSuffix = match[2] != null ? Number(match[2]) : 0;

			while (true) {
				let newVariable = `${variablePrefix}${++variableSuffix}`;
				let semantics = this.semantics.get(newVariable);
				if (semantics != null && semantics.type !== "variable") continue;
				if (leftVariables.includes(newVariable)) continue;
				if (rightVariables.includes(newVariable)) continue;

				rightPrenex.rename(variable, newVariable);
				rightVariables[i] = newVariable;
				break;
			}
		}

		let prefix;

		switch (operator) {
			case "∧":
			case "∨":
				prefix = leftPrenex.prefix.concat(rightPrenex.prefix);
				break;

			case "→":
				prefix = leftPrenex.negatedPrefix.concat(rightPrenex.prefix);
				break;

			case "←":
				prefix = leftPrenex.prefix.concat(rightPrenex.negatedPrefix);
				break;
		}

		return new PrenexFormula(prefix, new syntax.Binary(leftPrenex.matrix, operator, rightPrenex.matrix));
	}

	visitQuantified(quantified) {
		let prenex = quantified.formula.accept(this);

		// The formula's quantifier and variable are added only if the variable is bound
		if (quantified.formula.accept(new HasIdentifierVisitor(quantified.variable)))
			prenex.addToPrefix(quantified.quantifier, quantified.variable);

		return prenex;
	}

	visitApplication(application) {
		return new PrenexFormula([], application);
	}
}

class NormalizeVisitor {
	constructor(form) {
		this.form = form;
	}

	visitSymbol(symbol) {
		return [[symbol]];
	}

	visitUnary(unary) {
		let self = this;

		return unary.operand.accept({
			visitSymbol(symbol) {
				return [[new syntax.Unary("¬", symbol)]];
			},

			visitUnary(unary) {
				return unary.operand.accept(self);
			},

			visitBinary(binary) {
				switch (binary.operator) {
					case "∧":
						return new syntax.Binary(
							new syntax.Unary("¬", binary.left),
							"∨",
							new syntax.Unary("¬", binary.right)
						).accept(self);

					case "∨":
						return new syntax.Binary(
							new syntax.Unary("¬", binary.left),
							"∧",
							new syntax.Unary("¬", binary.right)
						).accept(self);

					case "→":
						return new syntax.Binary(
							binary.left,
							"∧",
							new syntax.Unary("¬", binary.right)
						).accept(self);

					case "←":
						return new syntax.Binary(
							new syntax.Unary("¬", binary.left),
							"∧",
							binary.right
						).accept(self);

					case "↔":
						return new syntax.Unary(
							"¬",
							new syntax.Binary(
								new syntax.Binary(binary.left, "→", binary.right),
								"∧",
								new syntax.Binary(binary.left, "←", binary.right)
							)
						).accept(self);
				}
			},

			visitApplication() {
				return [[unary]];
			}
		});
	}

	visitBinary(binary) {
		switch (binary.operator) {
			case "∧":
				switch (this.form) {
					case "DNF":
						return combine(binary.left.accept(this), binary.right.accept(this));
					case "CNF":
						return concat(binary.left.accept(this), binary.right.accept(this));
				}
				break;

			case "∨":
				switch (this.form) {
					case "DNF":
						return concat(binary.left.accept(this), binary.right.accept(this));
					case "CNF":
						return combine(binary.left.accept(this), binary.right.accept(this));
				}
				break;

			case "→":
				return new syntax.Binary(
					new syntax.Unary("¬", binary.left),
					"∨",
					binary.right
				).accept(this);

			case "←":
				return new syntax.Binary(
					binary.left,
					"∨",
					new syntax.Unary("¬", binary.right)
				).accept(this);

			case "↔":
				return new syntax.Binary(
					new syntax.Binary(binary.left, "→", binary.right),
					"∧",
					new syntax.Binary(binary.left, "←", binary.right)
				).accept(this);
		}
	}

	visitQuantified(quantified) {
		return [[quantified]];
	}

	visitApplication(application) {
		return [[application]];
	}
}

class HasIdentifierVisitor {
	constructor(identifier) {
		this.identifier = identifier;
	}

	visitSymbol(symbol) {
		return symbol.identifier === this.identifier;
	}

	visitUnary(unary) {
		return unary.operand.accept(this);
	}

	visitBinary(binary) {
		return binary.left.accept(this) || binary.right.accept(this);
	}

	visitQuantified(quantified) {
		return quantified.variable === this.identifier || quantified.formula.accept(this);
	}

	visitApplication(application) {
		return application.identifier === this.identifier || application.args.some(arg => arg.accept(this));
	}
}

function concat(clauses1, clauses2) {
	return fix(clauses1.concat(clauses2));
}

function combine(clauses1, clauses2) {
	let clauses = [];

	for (let clause1 of clauses1) {
		for (let clause2 of clauses2) {
			clauses.push(clause1.concat(clause2));
		}
	}

	return fix(clauses);
}

function fix(clauses) {
	// Remove duplicate literals:

	for (let clause of clauses) {
		for (let i1 = clause.length - 1; i1 >= 0; --i1) {
			let literal1 = clause[i1];

			for (let i2 = i1 - 1; i2 >= 0; --i2) {
				let literal2 = clause[i2];

				if (literal2.equals(literal1)) {
					// Remove i1th clause
					clause.splice(i1, 1);
					break;
				}
			}
		}
	}

	// Remove duplicate clauses:

	for (let i1 = clauses.length - 1; i1 >= 0; --i1) {
		let clause1 = clauses[i1];

		for (let i2 = clauses.length - 1; i2 >= 0; --i2) {
			if (i1 !== i2) {
				let clause2 = clauses[i2];

				if (clause2.every(literal2 => clause1.some(literal1 => literal1.equals(literal2)))) {
					// Remove i1th clause
					clauses.splice(i1, 1);
					break;
				}
			}
		}
	}

	// Remove clauses with opposing literals:

	for (let i = clauses.length - 1; i >= 0; --i) {
		let clause = clauses[i];

		outer: for (let j1 = 0; j1 < clause.length; ++j1) {
			let literal1 = clause[j1];

			for (let j2 = j1 + 1; j2 < clause.length; ++j2) {
				let literal2 = clause[j2];

				if (areOpposites(literal1, literal2)) {
					// Remove ith clause
					clauses.splice(i, 1);
					break outer;
				}
			}
		}
	}

	return clauses;
}

function areOpposites(literal1, literal2) {
	return literal1.accept({
		visitSymbol(symbol) {
			return literal2.accept({
				visitSymbol() {
					return false;
				},

				visitUnary(unary) {
					return symbol.identifier === unary.operand.identifier;
				}
			});
		},

		visitUnary(unary) {
			return literal2.accept({
				visitSymbol(symbol) {
					return unary.operand.identifier === symbol.identifier;
				},

				visitUnary() {
					return false;
				}
			});
		}
	});
}