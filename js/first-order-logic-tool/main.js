import * as analyzer from "./analyzer.js";
import * as normalizer from "./normalizer.js";
import * as parser from "./parser.js";
import * as utils from "./utils.js";
import * as syntax from "./syntax.js";

const FORM_ELEMENT = document.forms["first-order-logic-tool"];
const FORMULA_ELEMENT = FORM_ELEMENT.elements.formula;
const ERROR_ELEMENT = document.getElementById("first-order-logic-tool-error");
const RESULT_ELEMENT = document.getElementById("first-order-logic-tool-result");
const PARSED_ELEMENT = document.getElementById("first-order-logic-tool-parsed");
const INTERPRETATION_ELEMENT = document.getElementById("first-order-logic-tool-interpretation");
const HEIGHT_ELKEMENT = document.getElementById("first-order-logic-tool-height");
const DEGREE_ELEMENT = document.getElementById("first-order-logic-tool-degree");
const PRENEX_ELEMENT = document.getElementById("first-order-logic-tool-prenex");
const PRENEX_DNF_ELEMENT = document.getElementById("first-order-logic-tool-prenex-dnf");
const PRENEX_CNF_ELEMENT = document.getElementById("first-order-logic-tool-prenex-cnf");
const TRUTH_TABLE_RESULT_ELEMENT = document.getElementById("first-order-logic-tool-truth-table-result");
const TRUTH_TABLE_ELEMENT = document.getElementById("first-order-logic-truth-table");

class HTMLTreeGeneratorVisitor {
	constructor(height) {
		this.height = height;
	}

	visitSymbol(symbol) {
		if (this.height > 1) {
			return utils.createElement("var", symbol.identifier);
		} else {
			let box = this.createBox(1);
			box.append(symbol.identifier);
			box.style.fontStyle = "italic";
			return box;
		}
	}

	visitUnary(unary) {
		let height = unary.height;

		let box = this.createBox(height);
		box.append(this.createText(height, unary.operator));

		if (unary.operand.priority < unary.priority)
			box.append("( ", unary.operand.accept(this), " )");
		else
			box.append(unary.operand.accept(this));

		return box;
	}

	visitBinary(binary) {
		let height = binary.height;

		let p1 = binary.left.priority <= binary.priority
			&& !(binary.left instanceof syntax.Binary && binary.left.operator == binary.operator && binary.left.isAssociative);

		let p2 = binary.right.priority <= binary.priority;

		let box = this.createBox(height);

		if (p1)
			box.append("( ", binary.left.accept(this), " )");
		else
			box.append(binary.left.accept(this));

		box.append(" ", this.createText(height, binary.operator), " ");

		if (p2)
			box.append("( ", binary.right.accept(this), " )");
		else
			box.append(binary.right.accept(this));

		return box;
	}

	visitQuantified(quantified) {
		let height = quantified.height;

		let box = this.createBox(height);

		box.append(
			this.createText(height, quantified.quantifier),
			this.createText(height, quantified.variable, true)
		);

		if (quantified.formula.priority < quantified.priority)
			box.append(" ( ", quantified.formula.accept(this), " )");
		else
			box.append(" ", quantified.formula.accept(this));

		return box;
	}

	visitApplication(application) {
		let height = application.height;

		let box = this.createBox(height);
		box.append(this.createText(height, application.identifier, true), "(");

		for (let i = 0; i < application.args.length; ++i) {
			if (i > 0) box.append(", ");
			box.append(application.args[i].accept(this));
		}

		box.append(")");
		return box;
	}

	createText(h, text, isVariable = false) {
		let height = this.height;
		let element = utils.createElement(isVariable ? "var" : "span", text);
		element.style.color = `hsl(${(height > 1 ? 360 / (height - 1) * (h - 1) : 0) + 210}, 100%, 50%)`;
		return element;
	}

	createBox(h) {
		let height = this.height;
		let box = document.createElement("div");
		box.className = "first-order-logic-tool-box";
		box.style.borderColor = `hsl(${(height > 1 ? 360 / (height - 1) * (h - 1) : 0) + 210}, 100%, 50%)`;
		return box;
	}
}

class HTMLTextGeneratorVisitor {
	visitSymbol(symbol) {
		return utils.createElement("var", symbol.identifier);
	}

	visitUnary(unary) {
		let span = document.createElement("span");
		span.append(unary.operator);

		if (unary.operand.priority < unary.priority)
			span.append("(", unary.operand.accept(this), ")");
		else
			span.append(unary.operand.accept(this));

		return span;
	}

	visitBinary(binary) {
		let p1 = binary.left.priority <= binary.priority
			&& !(binary.left instanceof syntax.Binary && binary.left.operator == binary.operator && binary.left.isAssociative);

		let p2 = binary.right.priority <= binary.priority;

		let span = document.createElement("span");

		if (p1)
			span.append("(", binary.left.accept(this), ")");
		else
			span.append(binary.left.accept(this));

		span.append(" ", binary.operator, " ");

		if (p2)
			span.append("(", binary.right.accept(this), ")");
		else
			span.append(binary.right.accept(this));

		return span;
	}

	visitQuantified(quantified) {
		let span = document.createElement("span");
		span.append(quantified.quantifier, utils.createElement("var", quantified.variable));

		if (quantified.formula.priority < quantified.priority)
			span.append(" (", quantified.formula.accept(this), ")");
		else
			span.append(" ", quantified.formula.accept(this));

		return span;
	}

	visitApplication(application) {
		let span = document.createElement("span");
		span.append(utils.createElement("var", application.identifier), "(");

		for (let i = 0; i < application.args.length; ++i) {
			if (i > 0) span.append(", ");
			span.append(application.args[i].accept(this));
		}

		span.append(document.createTextNode(")"));
		return span;
	}
}

class CollectTermsVisitor {
	constructor() {
		this.terms = [];
	}

	visitSymbol(symbol) {
		if (!this.terms.includes(symbol.identifier))
			this.terms.push(symbol.identifier);

		return this.terms;
	}

	visitUnary(unary) {
		unary.operand.accept(this);
		return this.terms;
	}

	visitBinary(binary) {
		binary.left.accept(this);
		binary.right.accept(this);
		return this.terms;
	}
}

class EvaluateVisitor {
	constructor(terms, values) {
		this.terms = terms;
		this.values = values;
	}

	visitSymbol(symbol) {
		return this.values[this.terms.indexOf(symbol.identifier)];
	}

	visitUnary(unary) {
		return !unary.operand.accept(this);
	}

	visitBinary(binary) {
		switch (binary.operator) {
			case "∧":
				return binary.left.accept(this) && binary.right.accept(this);
			case "∨":
				return binary.left.accept(this) || binary.right.accept(this);
			case "→":
				return !binary.left.accept(this) || binary.right.accept(this);
			case "←":
				return binary.left.accept(this) || !binary.right.accept(this);
			case "↔":
				return binary.left.accept(this) === binary.right.accept(this);
		}
	}
}

function update(submit = false) {
	let source = FORMULA_ELEMENT.value;
	let selectionStart = Math.min(FORMULA_ELEMENT.selectionStart, FORMULA_ELEMENT.selectionEnd);
	let selectionEnd = Math.max(FORMULA_ELEMENT.selectionStart, FORMULA_ELEMENT.selectionEnd);
	let left = mathify(source.substring(0, selectionStart));
	let middle = mathify(source.substring(selectionStart, selectionEnd));
	let right = mathify(source.substring(selectionEnd, source.length));

	FORMULA_ELEMENT.value = `${left}${middle}${right}`;
	FORMULA_ELEMENT.setSelectionRange(left.length, left.length + middle.length);

	if (!submit)
		return;

	let context = new parser.Context(FORMULA_ELEMENT.value);
	let formula = parser.parse(context);

	if (formula == null) {
		RESULT_ELEMENT.style.display = "none";

		if (context.errorPosition === FORMULA_ELEMENT.value.length)
			FORMULA_ELEMENT.value += " ";

		FORMULA_ELEMENT.setSelectionRange(context.errorPosition, FORMULA_ELEMENT.value.length);
		ERROR_ELEMENT.replaceChildren(context.error);
		ERROR_ELEMENT.style.removeProperty("display");
		return;
	}

	let semantics;

	try {
		semantics = analyzer.analyze(formula);
	} catch (e) {
		RESULT_ELEMENT.style.display = "none";
		FORMULA_ELEMENT.setSelectionRange(e.source.start, e.source.end);
		ERROR_ELEMENT.replaceChildren(e.htmlMessage);
		ERROR_ELEMENT.style.removeProperty("display");
		return;
	}

	ERROR_ELEMENT.style.display = "none";

	let ul = document.createElement("ul");

	for (let [identifier, semantic] of semantics)
		ul.append(utils.createElement("li", utils.createElement("var", identifier), " is a ", semantic));

	INTERPRETATION_ELEMENT.replaceChildren(ul);

	let height = formula.height;
	PARSED_ELEMENT.replaceChildren(formula.accept(new HTMLTreeGeneratorVisitor(height)));
	HEIGHT_ELKEMENT.replaceChildren(height);

	let degree = formula.degree;
	DEGREE_ELEMENT.replaceChildren(degree);

	let normalized = normalizer.normalize(formula, semantics);
	PRENEX_ELEMENT.replaceChildren(normalized.prenex.accept(new HTMLTextGeneratorVisitor()));
	PRENEX_DNF_ELEMENT.replaceChildren(normalized.prenexDNF.accept(new HTMLTextGeneratorVisitor()));
	PRENEX_CNF_ELEMENT.replaceChildren(normalized.prenexCNF.accept(new HTMLTextGeneratorVisitor()));

	if (degree === 0 || !formula.isPropositional) {
		TRUTH_TABLE_RESULT_ELEMENT.style.display = "none";
	} else {
		let terms = formula.accept(new CollectTermsVisitor());
		let values = [];
		let tr = document.createElement("tr");

		for (let term of terms) {
			values.push(false);
			tr.append(utils.createElement("th", utils.createElement("var", term)));
		}

		tr.append(utils.createElement("th", formula.accept(new HTMLTextGeneratorVisitor())));

		let thead = utils.createElement("thead", tr);
		let tbody = document.createElement("tbody");

		do {
			let result = formula.accept(new EvaluateVisitor(terms, values));
			tr = document.createElement("tr");
			values.forEach(value => tr.append(utils.createElement("td", value ? "𝕋" : "𝔽")));
			tr.append(utils.createElement("td", result ? "𝕋" : "𝔽"));
			tbody.append(tr);
		} while (nextBinary(values));

		TRUTH_TABLE_ELEMENT.replaceChildren(utils.createElement("table", thead, tbody));
		TRUTH_TABLE_RESULT_ELEMENT.style.removeProperty("display");
	}

	RESULT_ELEMENT.style.removeProperty("display");
}

function mathify(string) {
	return string
		.replace(/[&^]/gu, "∧")
		.replace(/\|/gu, "∨")
		.replace(/[!~]/gu, "¬")
		.replace(/<[-=]>/gu, "↔")
		.replace(/[-=]>/gu, "→")
		.replace(/<[-=](?=[^>])/gu, "←")
		.replace(/\\A/gui, "∀")
		.replace(/\\E/gui, "∃");
}

function nextBinary(booleanArray) {
	for (let i = booleanArray.length - 1; i >= 0; --i) {
		if (!booleanArray[i]) {
			booleanArray[i] = true;

			for (let j = i + 1; j < booleanArray.length; ++j)
				booleanArray[j] = false;

			return true;
		}
	}

	return false;
}

FORMULA_ELEMENT.addEventListener("input", () => update());

FORMULA_ELEMENT.addEventListener("change", () => update());

FORM_ELEMENT.addEventListener("submit", event => {
	event.preventDefault();
	update(true);
});

update(true);