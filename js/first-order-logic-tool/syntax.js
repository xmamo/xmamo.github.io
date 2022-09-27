export class Formula {
	constructor(source, start, end) {
		this.source = source;
		this.start = start;
		this.end = end;
	}
}

export class Symbol extends Formula {
	constructor(identifier, source, start, end) {
		super(source, start, end);
		this.identifier = identifier;
	}

	get priority() {
		return 4;
	}

	get height() {
		return 1;
	}

	get degree() {
		return 0;
	}

	get isPropositional() {
		return true;
	}

	get hasQuantifiers() {
		return false;
	}

	accept(visitor) {
		return visitor.visitSymbol(this);
	}

	equals(other) {
		return other instanceof Symbol
			&& this.identifier === other.identifier;
	}

	toString() {
		return this.identifier;
	}
}

export class Unary extends Formula {
	constructor(operator, operand, source, start, end) {
		super(source, start, end);
		this.operator = operator;
		this.operand = operand;
	}

	get priority() {
		return 3;
	}

	get height() {
		return this.operand.height + 1;
	}

	get degree() {
		return this.operand.degree + 1;
	}

	get isPropositional() {
		return this.operand.isPropositional;
	}

	get hasQuantifiers() {
		return this.operand.hasQuantifiers;
	}

	accept(visitor) {
		return visitor.visitUnary(this);
	}

	equals(other) {
		return other instanceof Unary
			&& this.operator === other.operator
			&& this.operand.equals(other.operand);
	}

	toString() {
		let p = this.operand.priority < this.priority;
		return `${this.operator} ${p ? `(${this.operand})` : this.operand}`;
	}
}

export class Binary extends Formula {
	constructor(left, operator, right, source, start, end) {
		super(source, start, end);
		this.left = left;
		this.operator = operator;
		this.right = right;
	}

	get priority() {
		switch (this.operator) {
			case "∧":
			case "∨":
				return 2;

			case "→":
			case "←":
			case "↔":
				return 1;
		}
	}

	get height() {
		return Math.max(this.left.height, this.right.height) + 1;
	}

	get degree() {
		return this.left.degree + this.right.degree + 1;
	}

	get isPropositional() {
		return this.left.isPropositional && this.right.isPropositional;
	}

	get hasQuantifiers() {
		return this.left.hasQuantifiers || this.right.hasQuantifiers;
	}

	get isAssociative() {
		switch (this.operator) {
			case "∧":
			case "∨":
			case "↔":
				return true;

			case "→":
			case "←":
				return false;
		}
	}

	accept(visitor) {
		return visitor.visitBinary(this);
	}

	equals(other) {
		return other instanceof Binary
			&& this.left.equals(other.left)
			&& this.operator === other.operator
			&& this.right.equals(other.right);
	}

	toString() {
		let p1 = this.left.priority <= this.priority
			&& !(this.left instanceof Binary && this.left.operator == this.operator && this.left.isAssociative);

		let p2 = this.right.priority <= this.priority;

		return `${p1 ? `(${this.left})` : this.left} ${this.operator} ${p2 ? `(${this.right})` : this.right}`;
	}
}

export class Quantified extends Formula {
	constructor(quantifier, variable, formula, source, start, end) {
		super(source, start, end);
		this.quantifier = quantifier;
		this.variable = variable;
		this.formula = formula;
	}

	get priority() {
		return 3;
	}

	get height() {
		return this.formula.height + 1;
	}

	get degree() {
		return this.formula.degree + 1;
	}

	get isPropositional() {
		return false;
	}

	get hasQuantifiers() {
		return true;
	}

	accept(visitor) {
		return visitor.visitQuantified(this);
	}

	equals(other) {
		return other instanceof Quantified
			&& this.quantifier === other.quantifier
			&& this.variable === other.variable
			&& this.formula.equals(other.formula);
	}

	toString() {
		let p = this.formula.priority < this.priority;
		return `${this.quantifier}${this.variable} ${p ? `(${this.formula})` : `${this.formula}`}`;
	}
}

export class Application extends Formula {
	constructor(identifier, args, source, start, end) {
		super(source, start, end);
		this.identifier = identifier;
		this.args = args;
	}

	get priority() {
		return 4;
	}

	get height() {
		return this.args.reduce((max, formula) => Math.max(max, formula.height), 0) + 1;
	}

	get degree() {
		return 0;
	}

	get isPropositional() {
		return false;
	}

	get hasQuantifiers() {
		return this.args.some(arg => arg.hasQuantifiers);
	}

	get arity() {
		return this.args.length;
	}

	accept(visitor) {
		return visitor.visitApplication(this);
	}

	equals(other) {
		return other instanceof Application
			&& this.identifier === other.identifier
			&& this.args.length === other.args.length
			&& this.args.every((arg, i) => arg.equals(other.args[i]));
	}

	toString() {
		return `${this.identifier}(${this.args.join(", ")})`;
	}
}