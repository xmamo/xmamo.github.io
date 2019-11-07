"use strict";

(function () {
	var analyzer = fol.analyzer;
	var Context = parse.Context;
	var parseFormula = fol.parser.parse;
	var AnalysisError = analyzer.AnalysisError;
	var analyze = analyzer.analyze;

	var form = document.forms.fol;
	var formulaField = form.formula;
	var errorElement = form.error;
	var resultElement = document.getElementById("fol-result");
	var interpretationElement = form.interpretation;
	var parsedElement = form.parsed;
	var heightElement = form.height;
	var degreeElement = form.degree;

	form.addEventListener("submit", function (event) {
		event.preventDefault();
	});

	formulaField.addEventListener("input", function () {
		var formula = formulaField.value;
		var selectionStart = formulaField.selectionStart;
		var selectionEnd = formulaField.selectionEnd;
		var left = mathify(formula.substring(0, selectionStart));
		var middle = mathify(formula.substring(selectionStart, selectionEnd));
		var right = mathify(formula.substring(selectionEnd, formula.length));
		formulaField.value = formula = left + middle + right;
		formulaField.setSelectionRange(left.length, left.length + middle.length);
	});

	formulaField.addEventListener("change", function () {
		var context = new Context(formulaField.value.normalize("NFC"));
		var formula = parseFormula(context);

		if (formula == null) {
			resultElement.style.display = "none";
			if (context.errorPosition === formulaField.value.length) {
				formulaField.value += " ";
			}
			formulaField.setSelectionRange(context.errorPosition, formulaField.value.length);
			errorElement.value = context.error;
			errorElement.style.removeProperty("display");
			return;
		}

		var infoMap;
		try {
			infoMap = analyze(formula);
		} catch (e) {
			if (!(e instanceof AnalysisError)) {
				throw e;
			}
			resultElement.style.display = "none";
			formulaField.setSelectionRange(e.source.start, e.source.end);
			errorElement.value = e.message;
			errorElement.style.removeProperty("display");
			return;
		}

		errorElement.style.display = "none";

		interpretationElement.innerHTML = "";
		var interpretationListElement = document.createElement("ul");
		interpretationListElement.style.margin = "0";
		for (var identifier in infoMap) {
			var interpretationListItemElement = document.createElement("li");
			interpretationListItemElement.innerText = "‘" + identifier + "’ is a " + infoMap[identifier];
			interpretationListElement.appendChild(interpretationListItemElement);
		}
		interpretationElement.appendChild(interpretationListElement);

		parsedElement.innerHTML = "";
		var formulaElement = formula.accept(new FormulaVisitor(formula.height));
		if (formulaElement.nodeType === Node.TEXT_NODE) {
			var box = document.createElement("span");
			box.style = "display: inline-block; padding: 0.5em; border: 2px solid hsl(210, 100%, 50%); border-radius: 0.5em;";
			box.appendChild(formulaElement);
			formulaElement = box;
		}
		parsedElement.appendChild(formulaElement);

		heightElement.value = formula.height;
		degreeElement.value = formula.degree;

		resultElement.style.removeProperty("display");
	});

	function mathify(string) {
		return string
			.replace(/&/g, "∧")
			.replace(/\|/g, "∨")
			.replace(/\^/g, "⊻")
			.replace(/[!~]/g, "¬")
			.replace(/<->/g, "↔")
			.replace(/->/g, "→")
			.replace(/<-([^>])/g, "←$1")
			.replace(/\\A/gi, "∀")
			.replace(/\\E/gi, "∃")
			.replace(/\\T/gi, "⊤")
			.replace(/\\F/gi, "⊥");
	}

	function FormulaVisitor(height) {
		var self = this;
		self.height = height;

		self.visitSymbol = function (symbol) {
			return document.createTextNode(symbol.identifier);
		};

		self.visitUnaryFormula = function (formula) {
			var operand = formula.operand;
			var height = formula.height;

			var box = createBox(height);
			box.appendChild(createText(height, formula.operator));

			if (operand.priority < formula.priority) {
				box.appendChild(document.createTextNode("("));
				box.appendChild(operand.accept(self));
				box.appendChild(document.createTextNode(")"));
			} else {
				box.appendChild(operand.accept(self));
			}

			return box;
		};

		self.visitBinaryFormula = function (formula) {
			var left = formula.left;
			var right = formula.right;
			var priority = formula.priority;
			var height = formula.height;

			var box = createBox(formula.height);

			if (left.priority < priority) {
				box.appendChild(document.createTextNode("("));
				box.appendChild(left.accept(self));
				box.appendChild(document.createTextNode(")"));
			} else {
				box.appendChild(left.accept(self));
			}

			box.appendChild(document.createTextNode(" "));
			box.appendChild(createText(height, formula.operator));
			box.appendChild(document.createTextNode(" "));

			if (right.priority <= priority) {
				box.appendChild(document.createTextNode("("));
				box.appendChild(right.accept(self));
				box.appendChild(document.createTextNode(")"));
			} else {
				box.appendChild(right.accept(self));
			}

			return box;
		};

		self.visitQuantifiedFormula = function (formula) {
			var height = formula.height;

			var box = createBox(height);
			box.appendChild(createText(height, formula.quantifier + formula.variable));

			if (formula.formula.priority < formula.priority) {
				box.appendChild(document.createTextNode("("));
				box.appendChild(formula.formula.accept(self));
				box.appendChild(document.createTextNode(")"));
			} else {
				box.appendChild(document.createTextNode(" "));
				box.appendChild(formula.formula.accept(self));
			}

			return box;
		};

		self.visitCall = function (call) {
			var args = call.args;
			var height = call.height;

			var box = createBox(height);
			box.appendChild(createText(height, call.identifier));
			box.appendChild(document.createTextNode("("));

			for (var i = 0, count = args.length; i < count; i++) {
				if (i > 0) {
					box.appendChild(document.createTextNode(", "));
				}
				box.appendChild(args[i].accept(self));
			}

			box.appendChild(document.createTextNode(")"));
			return box;
		};

		function createText(height, text) {
			var span = document.createElement("span");
			span.style.color = "hsl(" + (360 / (self.height - 1) * (height - 1) + 210) + ", 100%, " + 100 / 3 + "%)";
			span.innerText = text;
			return span;
		}

		function createBox(height) {
			var box = document.createElement("span");
			var style = box.style;
			style.display = "inline-block";
			style.padding = "0.5em";
			style.border = "2px solid hsl(" + (360 / (self.height - 1) * (height - 1) + 210) + ", 100%, 50%)";
			style.borderRadius = "0.5em";
			return box;
		}
	}
})();