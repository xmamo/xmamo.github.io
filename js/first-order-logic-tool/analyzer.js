import * as utils from "./utils.js";

export class Semantic {
	constructor(type, arity) {
		this.type = type;
		this.arity = arity;
	}

	equals(other) {
		return other instanceof Semantic
			&& this.type === other.type
			&& this.arity === other.arity;
	}

	toString() {
		switch (this.type) {
			case "function":
			case "predicate":
				return `${this.type} of arity ${this.arity}`;

			case "constant":
			case "variable":
			case "sentence":
				return this.type;
		}
	}
}

export class AnalysisError extends Error {
	constructor(message, htmlMessage, source) {
		super(message);
		this.htmlMessage = htmlMessage;
		this.source = source;
	}
}

export function analyze(formula) {
	let visitor = new AnalyzeVisitor();
	formula.accept(visitor);
	return visitor.semantics;
}

class Scope {
	constructor(parent) {
		this.parent = parent;
		this._variables = [];
	}

	isDeclared(identifier) {
		return this._variables.includes(identifier) || (this.parent != null && this.parent.isDeclared(identifier));
	}

	declare(identifier) {
		this._variables.push(identifier);
	}
}

class AnalyzeVisitor {
	constructor() {
		this.semantics = new Map();

		this._scope = new Scope();

		// Functions and predicates can only be applied to terms (example: "p(x)"). This means that when the visitor
		// enters a function or predicate, only terms are to be considered valid; if the visitor encounters any other
		// type of formula, it raises an error (example: "p(¬x)").
		//
		// The purpose of this variable is to distinguish what the visitor is currently expecting.
		// If "expectTerm" is false, the visitor accepts any formula; otherwise, the visitor expects to find terms
		// only.
		this._expectTerm = false;
	}

	visitSymbol(symbol) {
		let type = this._expectTerm ? (this._scope.isDeclared(symbol.identifier) ? "variable" : "constant") : "sentence";
		this._setSemantic(symbol, symbol.identifier, new Semantic(type));
	}

	visitUnary(unary) {
		if (this._expectTerm) {
			let message = `${unary.operator}-formula not permitted here`;
			throw new AnalysisError(message, document.createTextNode(message), unary);
		}

		unary.operand.accept(this);
	}

	visitBinary(binary) {
		if (this._expectTerm) {
			let message = `${binary.operator}-formula not permitted here`;
			throw new AnalysisError(message, document.createTextNode(message), binary);
		}

		binary.left.accept(this);
		binary.right.accept(this);
	}

	visitQuantified(quantified) {
		if (this._expectTerm) {
			let message = `${quantified.quantifier}-formula not permitted here`;
			throw new AnalysisError(message, document.createTextNode(message), quantified);
		}

		if (this._scope.isDeclared(quantified.variable)) {
			throw new AnalysisError(
				`Variable "${quantified.variable}" already bound`,

				utils.createElement(
					"span",
					"Variable ",
					utils.createElement("var", quantified.variable),
					" already bound"
				),

				quantified
			);
		}

		this._setSemantic(quantified, quantified.variable, new Semantic("variable"));

		let oldScope = this._scope;
		this._scope = new Scope(oldScope);

		try {
			this._scope.declare(quantified.variable);
			quantified.formula.accept(this);
		} finally {
			this._scope = oldScope;
		}
	}

	visitApplication(application) {
		this._setSemantic(
			application,
			application.identifier,
			new Semantic(this._expectTerm ? "function" : "predicate", application.arity)
		);

		let oldExpectTerm = this._expectTerm;
		this._expectTerm = true;

		try {
			application.args.forEach(arg => arg.accept(this));
		} finally {
			this._expectTerm = oldExpectTerm;
		}
	}

	_setSemantic(source, identifier, semantic) {
		let oldSemantic = this.semantics.get(identifier);

		if (oldSemantic != null && !semantic.equals(oldSemantic)) {
			throw new AnalysisError(
				`"${identifier}" is used both as a ${oldSemantic} and a ${semantic}`,

				utils.createElement(
					"span",
					utils.createElement("var", identifier),
					" is used both as a ",
					oldSemantic,
					" and a ",
					semantic
				),

				source
			);
		}

		this.semantics.set(identifier, semantic);
	}
}