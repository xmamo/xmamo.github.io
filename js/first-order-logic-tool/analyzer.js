"use strict";

var firstOrderLogicTool = firstOrderLogicTool || {};

(function () {
	firstOrderLogicTool.Semantic = Semantic;

	firstOrderLogicTool.analyze = function (formula) {
		var visitor = new AnalyzeVisitor();
		formula.accept(visitor);
		return visitor.semantics;
	};

	var AnalysisError = firstOrderLogicTool.AnalysisError = function (message, htmlMessage, source) {
		Error.call(this, message);
		this.messageHTML = htmlMessage;
		this.source = source;
	};

	AnalysisError.prototype = Object.create(Error.prototype);
	AnalysisError.prototype.constructor = AnalysisError;

	function Semantic(type, arity) {
		var self = this;

		self.type = type;
		self.arity = arity;

		self.equals = function (other) {
			return other.type === self.type && other.arity === self.arity;
		};

		self.toString = function () {
			var type = self.type;

			switch (type) {
				case "function":
				case "predicate":
					return type + " of arity " + self.arity;

				case "constant":
				case "variable":
				case "sentence":
					return type;
			}
		};
	}

	function Scope(parent) {
		var self = this;
		var variables = [];

		self.parent = parent;

		self.isDeclared = function (identifier) {
			return variables.indexOf(identifier) >= 0 || (self.parent != null && self.parent.isDeclared(identifier));
		};

		self.declare = function (identifier) {
			variables.push(identifier);
		};
	}

	function AnalyzeVisitor() {
		var self = this;
		var scope = new Scope();

		// Functions and predicates can only be applied to terms (example: "p(x)"). This means that when the visitor
		// enters a function or predicate, only terms are to be considered valid; if the visitor encounters any other
		// type of formula, it raises an error (example: "p(¬x)").
		//
		// The purpose of this variable is to distinguish what the visitor is currently expecting.
		// If "expectTerm" is false, the visitor accepts any formula; otherwise, the visitor expects to find terms
		// only.
		var expectTerm = false;

		self.semantics = Object.create(null);

		self.visitSymbol = function (symbol) {
			var identifier = symbol.identifier;
			var semantic;

			if (expectTerm)
				semantic = new Semantic(scope.isDeclared(identifier) ? "variable" : "constant");
			else
				semantic = new Semantic("sentence");

			setSemantic(symbol, identifier, semantic);
		};

		self.visitUnaryFormula = function (formula) {
			if (expectTerm) {
				var message = formula.operator + "-formula not permitted here";
				throw new AnalysisError(message, message, formula);
			}

			formula.operand.accept(self);
		};

		self.visitBinaryFormula = function (formula) {
			if (expectTerm) {
				var message = formula.operator + "-formula not permitted here";
				throw new AnalysisError(message, message, formula);
			}

			formula.left.accept(self);
			formula.right.accept(self);
		};

		self.visitQuantifiedFormula = function (formula) {
			if (expectTerm) {
				var message = formula.quantifier + "-formula not permitted here";
				throw new AnalysisError(message, message, formula);
			}

			var variable = formula.variable;

			if (scope.isDeclared(variable)) {
				throw new AnalysisError(
					"Variable \"" + variable + "\" already bound",
					"Variable <i>" + variable + "</i> already bound",
					formula
				);
			}

			var semantic = new Semantic("variable");
			setSemantic(formula, variable, semantic);

			var oldScope = scope;
			scope = new Scope(oldScope);
			scope.declare(variable);
			formula.formula.accept(self);
			scope = oldScope;
		};

		self.visitCall = function (call) {
			var identifier = call.identifier;
			setSemantic(call, identifier, new Semantic(expectTerm ? "function" : "predicate", call.arity));

			var oldExpectFormula = expectTerm;
			expectTerm = true;
			call.args.forEach(function (arg) { arg.accept(self); });
			expectTerm = oldExpectFormula;
		};

		function setSemantic(source, identifier, semantic) {
			var semantics = self.semantics;

			if (identifier in semantics) {
				var oldSemantic = semantics[identifier];

				if (!semantic.equals(oldSemantic)) {
					throw new AnalysisError(
						"\"" + identifier + "\" is used both as a " + oldSemantic + " and a " + semantic,
						"<i>" + identifier + "</i> is used both as a " + oldSemantic + " and a " + semantic,
						source
					);
				}
			}

			semantics[identifier] = semantic;
		}
	}
})();