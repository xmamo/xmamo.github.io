import * as syntax from "./syntax.js";

const [IDENTIFIER_START, IDENTIFIER_PART] = (() => {
	try {
		return [new RegExp("[\\p{L}\\p{Pc}]", "u"), new RegExp("\\p{L}\\p{Pc}\\p{Mn}\\p{Mc}\\p{Nd}", "u")];
	} catch (e) {
		return [/[A-Z_a-z]/u, /[0-9A-Z_a-z]/u];
	}
})();

const SOURCE_SYMBOL = Symbol("source");
const POSITION_SYMBOL = Symbol("position");
const ERROR_SYMBOL = Symbol("error");
const ERROR_POSITION_SYMBOL = Symbol("errorPosition");

export class Context {
	constructor(source) {
		this[SOURCE_SYMBOL] = source;
		this[POSITION_SYMBOL] = 0;
	}

	get source() {
		return this[SOURCE_SYMBOL];
	}

	get position() {
		return this[POSITION_SYMBOL];
	}

	set position(position) {
		this[POSITION_SYMBOL] = Math.max(0, Math.min(position, this.source.length));
	}

	get isAtEnd() {
		return this.position === this.source.length;
	}

	get error() {
		return this[ERROR_SYMBOL];
	}

	set error(error) {
		if (this.errorPosition == null || this.position >= this.errorPosition) {
			this[ERROR_SYMBOL] = error;
			this[ERROR_POSITION_SYMBOL] = this.position;
		}
	}

	get errorPosition() {
		return this[ERROR_POSITION_SYMBOL];
	}

	peek(maxOffset) {
		let i = this.position;

		while (i < this.source.length && maxOffset > 0) {
			i += this.source.codePointAt(i) < 0x10000 ? 1 : 2;
			--maxOffset;
		}

		return this.source.substring(this.position, i);
	}

	advance(maxOffset) {
		let peek = this.peek(maxOffset);
		this.position += peek.length;
		return peek;
	}
}

export function parse(context) {
	let position = context.position;
	skipWhitespace(context);
	let formula = parseFormula(context);

	if (formula == null) {
		context.error = "Expected formula";
		context.position = position;
		return;
	}

	skipWhitespace(context);

	if (!context.isAtEnd) {
		context.error = "Expected end of input";
		context.position = position;
		return;
	}

	return formula;
}

function parseFormula(context) {
	let formula = parseImpliesOrEquivalenceFormula(context);

	if (formula == null) {
		context.error = "Expected formula";
		return;
	}

	return formula;
}

function parseImpliesOrEquivalenceFormula(context) {
	let formula = parseAndOrXorOrOrFormula(context);

	if (formula == null) {
		context.error = "Expected ∧-formula, ∨-formula or higher priority formula";
		return;
	}

	let position = context.position;
	skipWhitespace(context);
	let operator = context.advance(1);
	context.position = position;

	if (!["→", "←", "↔"].includes(operator))
		return formula;

	do {
		skipWhitespace(context);

		if (context.peek(1) !== operator)
			break;

		context.advance(1);
		skipWhitespace(context);
		let right = parseAndOrXorOrOrFormula(context);

		if (right == null) {
			context.error = "Expected right operand";
			context.position = position;
			break;
		}

		formula = new syntax.Binary(formula, operator, right, context.source, formula.start, context.position);
	} while (operator === "↔");  // Only ↔ is associative

	return formula;
}

function parseAndOrXorOrOrFormula(context) {
	let formula = parseNotFormula(context);

	if (formula == null) {
		context.error = "Expected ¬-formula, ∀-formula, ∃-formula or higher priority formula";
		return;
	}

	let position = context.position;
	skipWhitespace(context);
	let operator = context.advance(1);
	context.position = position;

	if (!["∧", "∨"].includes(operator))
		return formula;

	do {
		skipWhitespace(context);

		if (context.peek(1) !== operator)
			break;

		context.advance(1);
		skipWhitespace(context);
		let right = parseNotFormula(context);

		if (right == null) {
			context.error = "Expected right operand";
			context.position = position;
			break;
		}

		formula = new syntax.Binary(formula, operator, right, context.source, formula.start, context.position);
	} while (true);  // Both ∧ and ∨ are associative

	return formula;
}

function parseNotFormula(context) {
	let position = context.position;

	if (context.advance(1) !== "¬") {
		context.position = position;
		return parseQuantifiedFormula(context);
	}

	skipWhitespace(context);
	let operand = parseNotFormula(context);

	if (operand == null) {
		context.error = "Expected operand";
		context.position = position;
		return;
	}

	return new syntax.Unary("¬", operand, context.source, position, context.position);
}

function parseQuantifiedFormula(context) {
	let position = context.position;
	let quantifier = context.advance(1);

	if (!["∀", "∃"].includes(quantifier)) {
		context.position = position;
		return parseParenthesizedFormula(context);
	}

	skipWhitespace(context);
	let identifier = parseIdentifier(context);

	if (identifier == null) {
		context.error = "Expected variable";
		context.position = position;
		return;
	}

	skipWhitespace(context);
	let formula = parseNotFormula(context);

	if (formula == null) {
		context.error = "Expected ¬-formula or higher priority formula";
		context.position = position;
		return;
	}

	return new syntax.Quantified(quantifier, identifier, formula, context.source, position, context.position);
}

function parseParenthesizedFormula(context) {
	let position = context.position;

	if (context.advance(1) !== "(") {
		context.position = position;
		return parseCallOrIdentifier(context);
	}

	skipWhitespace(context);
	let formula = parseFormula(context);

	if (formula == null) {
		context.error = "Expected formula";
		context.position = position;
		return parseCallOrIdentifier(context);
	}

	skipWhitespace(context);

	if (context.advance(1) !== ")") {
		context.error = "Expected closing parenthesis";
		context.position = position;
		return parseCallOrIdentifier(context);
	}

	return formula;
}

function parseCallOrIdentifier(context) {
	let initialPosition = context.position;
	let identifier = parseIdentifier(context);

	if (identifier == null) {
		context.error = "Expected constant or variable";
		return;
	}

	let position = context.position;
	skipWhitespace(context);

	if (context.advance(1) !== "(") {
		context.position = position;
		return new syntax.Symbol(identifier, context.source, initialPosition, position);
	}

	skipWhitespace(context);

	let args = [];
	let arg = parseFormula(context);

	if (arg != null) {
		args.push(arg);
		skipWhitespace(context);

		while (context.peek(1) === ",") {
			context.advance(1);
			skipWhitespace(context);
			arg = parseFormula(context);

			if (arg == null) {
				context.error = "Expected formula";
				context.position = position;
				return new syntax.Symbol(identifier, context.source, initialPosition, position);
			}

			args.push(arg);
			skipWhitespace(context);
		}
	}

	if (context.advance(1) !== ")") {
		context.error = "Expected closing parenthesis";
		context.position = position;
		return new syntax.Symbol(identifier, context.source, initialPosition, position);
	}

	return new syntax.Application(identifier, args, context.source, initialPosition, context.position);
}

function parseIdentifier(context) {
	if (!IDENTIFIER_START.test(context.peek(1))) {
		context.error = "Expected identifier";
		return;
	}

	let position = context.position;

	do {
		context.advance(1);
	} while (IDENTIFIER_PART.test(context.peek(1)));

	return context.source.substring(position, context.position);
}

function skipWhitespace(context) {
	while (/\s/u.test(context.peek(1)))
		context.advance(1);
}