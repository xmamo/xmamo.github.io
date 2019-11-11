"use strict";

var firstOrderLogicTool = firstOrderLogicTool || {};

(function () {
	var Scope = scope.Scope;

	firstOrderLogicTool.Info = Info;
	firstOrderLogicTool.AnalysisError = AnalysisError;

	firstOrderLogicTool.analyze = function (formula) {
		var visitor = new FormulaVisitor();
		formula.accept(visitor);
		return visitor.infoMap;
	};

	function Info(type, arity) {
		var self = this;

		self.type = type;
		self.arity = arity;

		self.equals = function (other) {
			return other.type === self.type && other.arity === self.arity;
		};

		self.toString = function () {
			var type = self.type;
			switch (type) {
				case "predicate":
				case "function":
					return type + " of arity " + self.arity;
				case "sentence":
				case "variable":
				case "constant":
					return type;
			}
		};
	}

	function AnalysisError(source, message) {
		var self = this;

		self.name = "AnalysisError";
		self.source = source;
		self.message = message;
	}

	function FormulaVisitor() {
		var self = this;
		var scope = new Scope();
		var expectFormula = true;

		self.infoMap = {};

		self.visitSymbol = function (symbol) {
			var identifier = symbol.identifier;
			setInfo(symbol, identifier, new Info(expectFormula ? "sentence" : scope.has(identifier) ? "variable" : "constant"));
		};

		self.visitUnaryFormula = function (formula) {
			if (!expectFormula) {
				throw new AnalysisError(formula, "¬-formula not permitted here");
			}

			formula.operand.accept(self);
		};

		self.visitBinaryFormula = function (formula) {
			if (!expectFormula) {
				throw new AnalysisError(formula, formula.operator + "-formula not permitted here");
			}

			formula.left.accept(self);
			formula.right.accept(self);
		};

		self.visitQuantifiedFormula = function (formula) {
			if (!expectFormula) {
				throw new AnalysisError(formula, formula.quantifier + "-formula not permitted here");
			}
			var variable = formula.variable;
			if (scope.has(variable)) {
				throw new AnalysisError(formula, "Variable ‘" + variable + "’ already bound");
			}
			setInfo(formula, variable, new Info("variable"));

			var oldScope = scope;
			scope = new Scope(oldScope);
			scope.set(variable);
			formula.formula.accept(this);
			scope = oldScope;
		};

		self.visitCall = function (call) {
			var identifier = call.identifier;
			setInfo(call, identifier, new Info(expectFormula ? "predicate" : "function", call.arity));

			var oldExpectFormula = expectFormula;
			expectFormula = false;
			call.args.forEach(function (arg) {
				arg.accept(self);
			});
			expectFormula = oldExpectFormula;
		};

		function setInfo(source, identifier, newInfo) {
			var infoMap = self.infoMap;
			var oldInfo;
			if (identifier in infoMap && !newInfo.equals(oldInfo = infoMap[identifier])) {
				throw new AnalysisError(source, "‘" + identifier + "’ is used both as a " + oldInfo + " and a " + newInfo);
			}
			infoMap[identifier] = newInfo;
		}
	}
})();