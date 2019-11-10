"use strict";

(function () {
	var analyzer = firstOrderLogicTool.analyzer;
	var Context = parse.Context;
	var parseFormula = firstOrderLogicTool.parser.parse;
	var analyze = analyzer.analyze;
	var AnalysisError = analyzer.AnalysisError;

	var form = document.forms["first-order-logic-tool"];
	var formulaField = form.formula;
	var errorElement = form.error;
	var resultElement = document.getElementById("first-order-logic-tool-result");
	var interpretationElement = form.interpretation;
	var parsedElement = form.parsed;
	var heightElement = form.height;
	var degreeElement = form.degree;
	var truthTableResultElement = document.getElementById("first-order-logic-tool-truth-table-result");
	var truthTableElement = form["truth-table"];

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
			errorElement.style.display = "none";
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

		var height = formula.height;
		var degree = formula.degree;

		interpretationElement.innerHTML = "";
		var interpretationListElement = document.createElement("ul");
		interpretationListElement.style.margin = "0";
		for (var identifier in infoMap) {
			var interpretationListItemElement = document.createElement("li");
			interpretationListItemElement.innerText = "“" + identifier + "” is a " + infoMap[identifier];
			interpretationListElement.appendChild(interpretationListItemElement);
		}
		interpretationElement.appendChild(interpretationListElement);

		parsedElement.innerHTML = "";
		parsedElement.appendChild(formula.accept({
			visitSymbol: function (symbol) {
				if (height > 1) {
					return document.createTextNode(symbol.identifier);
				} else {
					var box = createBox(1);
					box.innerText = symbol.identifier;
					return box;
				}
			},

			visitUnaryFormula: function (formula) {
				var operand = formula.operand;
				var height = formula.height;

				var box = createBox(height);
				box.appendChild(createText(height, formula.operator));

				if (operand.priority < formula.priority) {
					box.appendChild(document.createTextNode("("));
					box.appendChild(operand.accept(this));
					box.appendChild(document.createTextNode(")"));
				} else {
					box.appendChild(operand.accept(this));
				}

				return box;
			},

			visitBinaryFormula: function (formula) {
				var left = formula.left;
				var right = formula.right;
				var priority = formula.priority;
				var height = formula.height;

				var box = createBox(formula.height);

				if (left.isAssociative ? left.priority < priority : left.priority <= priority) {
					box.appendChild(document.createTextNode("("));
					box.appendChild(left.accept(this));
					box.appendChild(document.createTextNode(")"));
				} else {
					box.appendChild(left.accept(this));
				}

				box.appendChild(document.createTextNode(" "));
				box.appendChild(createText(height, formula.operator));
				box.appendChild(document.createTextNode(" "));

				if (right.priority <= priority) {
					box.appendChild(document.createTextNode("("));
					box.appendChild(right.accept(this));
					box.appendChild(document.createTextNode(")"));
				} else {
					box.appendChild(right.accept(this));
				}

				return box;
			},

			visitQuantifiedFormula: function (formula) {
				var height = formula.height;

				var box = createBox(height);
				box.appendChild(createText(height, formula.quantifier + formula.variable));

				if (formula.formula.priority < formula.priority) {
					box.appendChild(document.createTextNode("("));
					box.appendChild(formula.formula.accept(this));
					box.appendChild(document.createTextNode(")"));
				} else {
					box.appendChild(document.createTextNode(" "));
					box.appendChild(formula.formula.accept(this));
				}

				return box;
			},

			visitCall: function (call) {
				var args = call.args;
				var height = call.height;

				var box = createBox(height);
				box.appendChild(createText(height, call.identifier));
				box.appendChild(document.createTextNode("("));

				for (var i = 0, count = args.length; i < count; i++) {
					if (i > 0) {
						box.appendChild(document.createTextNode(", "));
					}
					box.appendChild(args[i].accept(this));
				}

				box.appendChild(document.createTextNode(")"));
				return box;
			}
		}));

		heightElement.value = height;
		degreeElement.value = degree;

		if (degree === 0 || !formula.isPropositional) {
			truthTableResultElement.style.display = "none";
		} else {
			var table = document.createElement("table");

			var terms = [];
			var values = [];

			formula.accept({
				visitSymbol: function (symbol) {
					if (terms.indexOf(symbol.identifier) < 0) {
						terms.push(symbol.identifier);
						values.push(false);
					}
				},

				visitUnaryFormula: function (formula) {
					formula.operand.accept(this);
				},

				visitBinaryFormula: function (formula) {
					formula.left.accept(this);
					formula.right.accept(this);
				}
			});

			var length = terms.length;

			var tr = document.createElement("tr");
			terms.forEach(function (term) {
				tr.appendChild(createTh(term));
			});
			tr.appendChild(createTh(formula));
			table.appendChild(tr);

			do {
				var result = formula.accept({
					visitSymbol: function (symbol) {
						return values[terms.indexOf(symbol.identifier)];
					},

					visitUnaryFormula: function (formula) {
						return !formula.operand.accept(this);
					},

					visitBinaryFormula: function (formula) {
						switch (formula.operator) {
							case "∧":
								return formula.left.accept(this) && formula.right.accept(this);
							case "∨":
								return formula.left.accept(this) || formula.right.accept(this);
							case "⊻":
								return formula.left.accept(this) !== formula.right.accept(this);
							case "→":
								return !formula.left.accept(this) || formula.right.accept(this);
							case "←":
								return formula.left.accept(this) || !formula.right.accept(this);
							case "↔":
								return formula.left.accept(this) === formula.right.accept(this);
						}
					}
				});

				tr = document.createElement("tr");
				values.forEach(function (value) {
					tr.appendChild(createTd(value ? "𝕋" : "𝔽"));
				});
				tr.appendChild(createTd(result ? "𝕋" : "𝔽"));
				table.appendChild(tr);
			} while (next());

			truthTableElement.innerHTML = "";
			truthTableElement.appendChild(table);
			truthTableResultElement.style.removeProperty("display");

			function next() {
				for (var i = length - 1; i >= 0; i--) {
					if (!values[i]) {
						values[i] = true;
						for (var j = i + 1; j < length; j++) {
							values[j] = false;
						}
						return true;
					}
				}
				return false;
			}
		}

		resultElement.style.removeProperty("display");

		function createText(h, text) {
			var span = document.createElement("span");
			span.style.color = "hsl(" + (360 / (height - 1) * (h - 1) + 210) + ", 100%, " + 100 / 3 + "%)";
			span.innerText = text;
			return span;
		}

		function createBox(h) {
			var box = document.createElement("span");
			box.className = "first-order-logic-tool-box";
			box.style.borderColor = "hsl(" + (360 / (height - 1) * (h - 1) + 210) + ", 100%, 50%)";
			return box;
		}
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
			.replace(/\\E/gi, "∃");
	}

	function createTh(text) {
		var th = document.createElement("th");
		th.innerText = text;
		return th;
	}

	function createTd(text) {
		var td = document.createElement("td");
		td.innerText = text;
		return td;
	}
})();