"use strict";

var firstOrderLogicTool = firstOrderLogicTool || {};

(function () {
	var Scope = scope.Scope;

	firstOrderLogicTool.Info = Info;

	firstOrderLogicTool.analyze = function (formula) {
		var visitor = new FormulaAnalyzeVisitor();
		formula.accept(visitor);
		return visitor.infoMap;
	};

	var AnalysisError = firstOrderLogicTool.AnalysisError = function (message, source) {
		var self = this;

		Error.call(self);
		self.message = message;
		self.source = source;
	};

	AnalysisError.prototype = new Error();
	AnalysisError.prototype.constructor = AnalysisError;
	AnalysisError.prototype.name = AnalysisError.name;

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

	function FormulaAnalyzeVisitor() {
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
				throw new AnalysisError("¬-formula not permitted here", formula);
			}

			formula.operand.accept(self);
		};

		self.visitBinaryFormula = function (formula) {
			if (!expectFormula) {
				throw new AnalysisError(formula.operator + "-formula not permitted here", formula);
			}

			formula.left.accept(self);
			formula.right.accept(self);
		};

		self.visitQuantifiedFormula = function (formula) {
			if (!expectFormula) {
				throw new AnalysisError(formula.quantifier + "-formula not permitted here", formula);
			}
			var variable = formula.variable;
			if (scope.has(variable)) {
				throw new AnalysisError("Variable “" + variable + "” already bound", formula);
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
				throw new AnalysisError("“" + identifier + "” is used both as a " + oldInfo + " and a " + newInfo, source);
			}
			infoMap[identifier] = newInfo;
		}
	}
})();