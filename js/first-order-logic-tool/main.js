"use strict";

(function () {
	var createElement = utils.createElement;
	var Context = parse.Context;
	var parseFormula = firstOrderLogicTool.parse;
	var analyze = firstOrderLogicTool.analyze;
	var AnalysisError = firstOrderLogicTool.AnalysisError;
	var normalize = firstOrderLogicTool.normalize;

	var form = document.forms["first-order-logic-tool"];
	var formulaElement = form.elements.formula;
	var errorElement = document.getElementById("first-order-logic-tool-error");
	var resultElement = document.getElementById("first-order-logic-tool-result");
	var parsedElement = document.getElementById("first-order-logic-tool-parsed");
	var interpretationElement = document.getElementById("first-order-logic-tool-interpretation");
	var heightElement = document.getElementById("first-order-logic-tool-height");
	var degreeElement = document.getElementById("first-order-logic-tool-degree");
	var prenexElement = document.getElementById("first-order-logic-tool-prenex");
	var prenexDNFElement = document.getElementById("first-order-logic-tool-prenex-dnf");
	var prenexCNFElement = document.getElementById("first-order-logic-tool-prenex-cnf");
	var truthTableResultElement = document.getElementById("first-order-logic-tool-truth-table-result");
	var truthTableElement = document.getElementById("first-order-logic-truth-table");

	form.addEventListener("submit", function (event) {
		event.preventDefault();
		update();
	});

	formulaElement.addEventListener("input", function () {
		var formula = formulaElement.value;
		var selectionStart = Math.min(formulaElement.selectionStart, formulaElement.selectionEnd);
		var selectionEnd = Math.max(formulaElement.selectionStart, formulaElement.selectionEnd);
		var left = mathify(formula.substring(0, selectionStart));
		var middle = mathify(formula.substring(selectionStart, selectionEnd));
		var right = mathify(formula.substring(selectionEnd, formula.length));
		formulaElement.value = left + middle + right;
		formulaElement.setSelectionRange(left.length, left.length + middle.length);
	});

	formulaElement.addEventListener("change", update);

	function update() {
		var context = new Context(String.prototype.normalize ? formulaElement.value.normalize("NFC") : formulaElement.value);
		var formula = parseFormula(context);

		if (formula == null) {
			resultElement.style.display = "none";
			if (context.errorPosition === formulaElement.value.length) {
				formulaElement.value += " ";
			}
			errorElement.innerText = context.error;
			errorElement.style.removeProperty("display");
			setTimeout(function () {
				formulaElement.focus();
				formulaElement.setSelectionRange(context.errorPosition, formulaElement.value.length);
			}, 0);
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
			formulaElement.setSelectionRange(e.source.start, e.source.end);
			errorElement.innerText = e.message;
			errorElement.style.removeProperty("display");
			return;
		}

		errorElement.style.display = "none";

		interpretationElement.innerHTML = "";
		var interpretationListElement = document.createElement("ul");
		interpretationListElement.style.margin = "0";
		for (var identifier in infoMap) {
			if (Object.prototype.hasOwnProperty.call(infoMap, identifier)) {
				interpretationListElement.appendChild(createElement("li", "“" + identifier + "” is a " + infoMap[identifier]));
			}
		}
		interpretationElement.appendChild(interpretationListElement);

		var height = formula.height;
		var degree = formula.degree;
		var normalized = normalize(formula, infoMap);

		parsedElement.innerHTML = "";
		parsedElement.appendChild(formula.accept(new FormulaToHTMLVisitor(height)));

		heightElement.innerText = height;
		degreeElement.innerText = degree;
		prenexElement.innerText = normalized.prenex;
		prenexDNFElement.innerText = normalized.prenexDNF;
		prenexCNFElement.innerText = normalized.prenexCNF;

		if (degree === 0 || !formula.isPropositional) {
			truthTableResultElement.style.display = "none";
		} else {
			var terms = formula.accept(new PropositionalFormulaCollectTermsVisitor());
			var values = [];

			var table = document.createElement("table");
			var tr = document.createElement("tr");
			terms.forEach(function (term) {
				values.push(false);
				tr.appendChild(createElement("th", term));
			});
			tr.appendChild(createElement("th", formula));
			table.appendChild(tr);

			do {
				var result = formula.accept(new PropositionalFormulaEvaluateVisitor(terms, values));
				tr = document.createElement("tr");
				values.forEach(function (value) {
					tr.appendChild(createElement("td", value ? "𝕋" : "𝔽"));
				});
				tr.appendChild(createElement("td", result ? "𝕋" : "𝔽"));
				table.appendChild(tr);
			} while (nextBinary(values));

			truthTableElement.innerHTML = "";
			truthTableElement.appendChild(table);
			truthTableResultElement.style.removeProperty("display");
		}

		resultElement.style.removeProperty("display");
	}

	function mathify(string) {
		return string
			.replace(/&/g, "∧")
			.replace(/\|/g, "∨")
			.replace(/[!~]/g, "¬")
			.replace(/<->/g, "↔")
			.replace(/->/g, "→")
			.replace(/<-(?:[^>])/g, "←$1")
			.replace(/\\A/gi, "∀")
			.replace(/\\E/gi, "∃");
	}

	function nextBinary(booleanArray) {
		var length = booleanArray.length;
		for (var i = length - 1; i >= 0; i--) {
			if (!booleanArray[i]) {
				booleanArray[i] = true;
				for (var j = i + 1; j < length; j++) {
					booleanArray[j] = false;
				}
				return true;
			}
		}
		return false;
	}

	function FormulaToHTMLVisitor(height) {
		var self = this;

		self.visitSymbol = function (symbol) {
			if (height > 1) {
				return document.createTextNode(symbol.identifier);
			} else {
				var box = createBox(1);
				box.innerText = symbol.identifier;
				return box;
			}
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
			var operator = formula.operator;
			var right = formula.right;
			var priority = formula.priority;
			var height = formula.height;

			var box = createBox(formula.height);

			if (left.operator === operator && left.isAssociative ? left.priority < priority : left.priority <= priority) {
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

		function createText(h, text) {
			var span = createElement("span", text);
			span.style.color = "hsl(" + ((height > 1 ? 360 / (height - 1) * (h - 1) : 0) + 210) + ", 100%, " + 100 / 3 + "%)";
			return span;
		}

		function createBox(h) {
			var box = document.createElement("div");
			box.className = "first-order-logic-tool-box";
			box.style.borderColor = "hsl(" + ((height > 1 ? 360 / (height - 1) * (h - 1) : 0) + 210) + ", 100%, 50%)";
			return box;
		}
	}

	function PropositionalFormulaCollectTermsVisitor() {
		var self = this;
		var terms = [];

		self.visitSymbol = function (symbol) {
			if (terms.indexOf(symbol.identifier) < 0) {
				terms.push(symbol.identifier);
			}
			return terms;
		};

		self.visitUnaryFormula = function (formula) {
			formula.operand.accept(self);
			return terms;
		};

		self.visitBinaryFormula = function (formula) {
			formula.left.accept(self);
			formula.right.accept(self);
			return terms;
		};
	}

	function PropositionalFormulaEvaluateVisitor(terms, values) {
		var self = this;

		self.visitSymbol = function (symbol) {
			return values[terms.indexOf(symbol.identifier)];
		};

		self.visitUnaryFormula = function (formula) {
			return !formula.operand.accept(self);
		};

		self.visitBinaryFormula = function (formula) {
			switch (formula.operator) {
				case "∧":
					return formula.left.accept(self) && formula.right.accept(self);
				case "∨":
					return formula.left.accept(self) || formula.right.accept(self);
				case "→":
					return !formula.left.accept(self) || formula.right.accept(self);
				case "←":
					return formula.left.accept(self) || !formula.right.accept(self);
				case "↔":
					return formula.left.accept(self) === formula.right.accept(self);
			}
		};
	}
})();