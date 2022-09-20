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
		this._prefix = prefix;
		this._matrix = matrix;
		this._negated = false;
	}

	get prefix() {
		return this._prefix.slice();
	}

	get negatedPrefix() {
		return this._prefix.map(p => {
			switch (p.quantifier) {
				case "∀":
					return { quantifier: "∃", variable: p.variable };
				case "∃":
					return { quantifier: "∀", variable: p.variable };
			}
		});
	}

	get variables() {
		return this._prefix.map(p => p.variable);
	}

	get matrix() {
		return this._negated ? new syntax.Unary("¬", this._matrix) : this._matrix;
	}

	get formula() {
		let formula = this._matrix;

		for (let i = this._prefix.length - 1; i >= 0; --i) {
			let p = this._prefix[i];
			formula = new syntax.Quantified(p.quantifier, p.variable, formula);
		}

		return formula;
	}

	addToPrefix(quantifier, variable) {
		this._prefix.unshift({ quantifier: quantifier, variable: variable });
	}

	negate() {
		this._prefix = this.negatedPrefix;
		this._negated = !this._negated;
	}

	rename(symbol1, symbol2) {
		this._prefix.forEach(p => { if (p.variable === symbol1) p.variable = symbol2; });
		this._matrix = this._matrix.accept(new RenameSymbolVisitor(symbol1, symbol2));
	}
}

class ToPrenexFormulaVisitor {
	constructor(semantics) {
		this.semantics = semantics;
	}

	visitSymbol(symbol) {
		return new PrenexFormula([], symbol);
	}

	visitUnary(formula) {
		let prenexFormula = formula.operand.accept(this);
		prenexFormula.negate();
		return prenexFormula;
	}

	visitBinary(formula) {
		let left = formula.left;
		let operator = formula.operator;
		let right = formula.right;

		if (operator === "↔") {
			let prenex = new syntax.Binary(
				new syntax.Binary(left, "→", right),
				"∧",
				new syntax.Binary(left, "←", right)
			).accept(this);

			let matrix = prenex.matrix;
			if (!(matrix instanceof syntax.Binary) || matrix.operator !== "∧") return prenex;

			left = matrix.left;
			right = matrix.right;
			if (!(left instanceof syntax.Binary && right instanceof syntax.Binary)) return prenex;

			let leftOp = left.operator;
			let rightOp = right.operator;
			if (!((leftOp === "→" && rightOp === "←") || (leftOp === "←" || rightOp === "→"))) return prenex;
			if (!(right.left.equals(left.left) && right.right.equals(left.right))) return prenex;

			return new PrenexFormula(
				prenex.prefix,
				new syntax.Binary(left.left, "↔", left.right)
			);
		}

		let leftFormula = left.accept(this);
		let rightFormula = right.accept(this);
		let leftVariables = leftFormula.variables;
		let rightVariables = rightFormula.variables;

		// Guard against variable name collisions, renaming variables of the right-hand side formula if needed
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

				rightFormula.rename(variable, newVariable);
				rightVariables[i] = newVariable;
				break;
			}
		}

		let prefix;

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

		return new PrenexFormula(prefix, new syntax.Binary(leftFormula.matrix, operator, rightFormula.matrix));
	}

	visitQuantified(formula) {
		let prenex = formula.formula.accept(this);

		// The formula's quantifier and variable are added only if the variable is bound
		if (formula.formula.accept(new HasIdentifierVisitor(formula.variable)))
			prenex.addToPrefix(formula.quantifier, formula.variable);

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

	visitUnary(formula) {
		let self = this;

		return formula.operand.accept({
			visitSymbol() {
				return [[formula]];
			},

			visitUnary(formula) {
				return formula.operand.accept(self);
			},

			visitBinary(formula) {
				switch (formula.operator) {
					case "∧":
						return new syntax.Binary(
							new syntax.Unary("¬", formula.left),
							"∨",
							new syntax.Unary("¬", formula.right)
						).accept(self);

					case "∨":
						return new syntax.Binary(
							new syntax.Unary("¬", formula.left),
							"∧",
							new syntax.Unary("¬", formula.right)
						).accept(self);

					case "→":
						return new syntax.Binary(
							formula.left,
							"∧",
							new syntax.Unary("¬", formula.right)
						).accept(self);

					case "←":
						return new syntax.Binary(
							new syntax.Unary("¬", formula.left),
							"∧",
							formula.right
						).accept(self);

					case "↔":
						return new syntax.Unary(
							"¬",
							new syntax.Binary(
								new syntax.Binary(formula.left, "→", formula.right),
								"∧",
								new syntax.Binary(formula.left, "←", formula.right)
							)
						).accept(self);
				}
			},

			visitApplication() {
				return [[formula]];
			}
		});
	}

	visitBinary(formula) {
		switch (formula.operator) {
			case "∧":
				switch (this.form) {
					case "DNF":
						return combine(formula.left.accept(this), formula.right.accept(this));
					case "CNF":
						return concat(formula.left.accept(this), formula.right.accept(this));
				}
				break;

			case "∨":
				switch (this.form) {
					case "DNF":
						return concat(formula.left.accept(this), formula.right.accept(this));
					case "CNF":
						return combine(formula.left.accept(this), formula.right.accept(this));
				}
				break;

			case "→":
				return new syntax.Binary(
					new syntax.Unary("¬", formula.left),
					"∨",
					formula.right
				).accept(this);

			case "←":
				return new syntax.Binary(
					formula.left,
					"∨",
					new syntax.Unary("¬", formula.right)
				).accept(this);

			case "↔":
				return new syntax.Binary(
					new syntax.Binary(formula.left, "→", formula.right),
					"∧",
					new syntax.Binary(formula.left, "←", formula.right)
				).accept(this);
		}
	}

	visitQuantified(formula) {
		return [[formula]];
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

	visitUnary(formula) {
		return formula.operand.accept(this);
	}

	visitBinary(formula) {
		return formula.left.accept(this) || formula.right.accept(this);
	}

	visitQuantified(formula) {
		return formula.variable === this.identifier || formula.formula.accept(this);
	}

	visitApplication(application) {
		return application.identifier === this.identifier || application.args.some(arg => arg.accept(this));
	}
}

class RenameSymbolVisitor {
	constructor(symbol1, symbol2) {
		this.symbol = symbol1;
		this.symbol2 = symbol2;
	}

	visitSymbol(symbol) {
		return symbol.identifier === this.symbol1 ? new syntax.Symbol(this.symbol2) : symbol;
	}

	visitUnary(formula) {
		return new syntax.Unary(formula.operator, formula.operand.accept(this));
	}

	visitBinary(formula) {
		return new syntax.Binary(formula.left.accept(this), formula.operator, formula.right.accept(this));
	}

	visitQuantified(formula) {
		return new syntax.Quantified(
			formula.quantifier,
			formula.variable === this.symbol1 ? this.symbol2 : formula.variable,
			formula.formula.accept(this)
		);
	}

	visitApplication(application) {
		return new syntax.Application(application.identifier, application.args.map(arg => arg.accept(this)));
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
		for (let i = clause.length - 1; i >= 0; --i) {
			let literal = clause[i];

			for (let j = i - 1; j >= 0; --j) {
				if (clause[j].equals(literal)) {
					// Remove ith element
					clause.splice(i, 1);
					break;
				}
			}
		}
	}

	// Remove duplicate clauses:

	for (let i = clauses.length - 1; i >= 0; --i) {
		let clause1 = clauses[i];

		for (let j = clauses.length - 1; j >= 0; --j) {
			if (i !== j) {
				let clause2 = clauses[j];

				if (clause2.every(literal1 => clause1.some(literal2 => literal2.equals(literal1)))) {
					// Remove ith element
					clauses.splice(i, 1);
					break;
				}
			}
		}
	}

	return clauses;
}