---
title: 'First order logic tool'
permalink: '/first-order-logic-tool/index.xhtml'
canonical: '/first-order-logic-tool/'
styles:
  - '/css/first-order-logic-tool.css'
scripts:
  - '/js/utils.js'
  - '/js/parse.js'
  - '/js/scope.js'
  - '/js/first-order-logic-tool/ast.js'
  - '/js/first-order-logic-tool/parser.js'
  - '/js/first-order-logic-tool/analyzer.js'
  - '/js/first-order-logic-tool/main.js'
---

# {{ page.title }} #
<noscript><p>Error: JavaScript is disabled.</p></noscript>

<form id="first-order-logic-tool" class="js-only">
	<label for="first-order-logic-tool-formula">Formula</label>
	<input id="first-order-logic-tool-formula" name="formula" />
	<output name="error" style="display: none;"></output>
	<div id="first-order-logic-tool-result" style="display: none;">
		<p>
			<label for="first-order-logic-tool-parsed">Parsed formula:</label>
			<output id="first-order-logic-tool-parsed" name="parsed" spellcheck="false" style="display: block; line-height: 1; white-space: nowrap; overflow-x: auto;"></output>
		</p>
		<p>
			<label for="first-order-logic-tool-interpretation">Interpretation:</label>
			<output id="first-order-logic-tool-interpretation" name="interpretation"></output>
		</p>
		<p>
			<label for="first-order-logic-tool-height">Height: </label>
			<output id="first-order-logic-tool-height" name="height">0</output>
			<br />
			<label for="first-order-logic-tool-degree">Degree: </label>
			<output id="first-order-logic-tool-degree" name="degree">0</output>
		</p>
		<p id="first-order-logic-tool-truth-table-result" style="display: none;">
			<label for="first-order-logic-truth-table">Truth table:</label>
			<output id="first-order-logic-truth-table" name="truth-table"></output>
		</p>
	</div>
</form>

## Syntax ##
From a syntactical point of view, first order formulas are strings of symbols connected by logical operators,
quantifiers and punctuation marks. Each symbol can represent a variable, constant, predicate or function. Let's take a
look at an example:

"¬∃person(tallerThan(person, father(Mark)) ∧ tallerThan(person, mother(Mark)))"

In the formula above, "person" would be a variable, "tallerThan" a binary predicate, "father" and "mother" unary
functions, "Mark" a constant. "∧" and "¬" are binary and unary logical operators respectively, "∀" is the universal
quantifier, "(", ")", "," are punctuation marks. The meaning of that formula will be explained later.

### First order language ###
A _first order language_ is a language characterized by:
 * A set of _variable symbols_ (like "x", "y", "z", ...);
 * A set of _constant symbols_ (like "a", "b", "c", ...);
 * A set of _predicate symbols_, each with an associated arity (for example "p" with arity 2, "q" with arity 1, ...);
 * A set of _function symbols_, each with an associated arity (for example "f" with arity 1, "g" with arity 3, ...);
 * The _logic symbols_ "¬", "∧", "∨", "⊻", "→", "←", "↔";
 * The _quantifier symbols_ "∀", "∃";
 * The _punctuation symbols_ "(", ")", ",".

### Terms ###
The _terms_ of first order languages are the basic building blocks needed to write first order formulas. They are
defined recursively as follows:
 * Every variable symbol is a term;
 * Every constant symbol is a term;
 * "f(t<sub>1</sub>, ..., t<sub>n</sub>)" is a term if "t<sub>1</sub>", ..., "t<sub>n</sub>" are terms and "f" is a
   function symbol of arity n.

### Formulas ###
A _first order formula_ can be defined recursively as follows:
 * "p(t<sub>1</sub>, ..., t<sub>n</sub>)" is a formula if "t<sub>1</sub>", ..., "t<sub>n</sub>" are terms and "p" is a
   predicate symbol of arity n. A formula of this kind is called _atomic formula_;
 * "(¬F)" is a formula if "F" is a formula;
 * "(F ∧ G)", "(F ∨ G)", "(F ⊻ G)", "(F → G)", "(F ← G)", "(F ↔ G)" are formulas if both "F" and "G" are formulas;
 * "(∀x F)", "(∃x F)" are formulas if "x" is a variable and "F" is a formula.

In order to increase readability, parentheses can be dropped according to the following informal _convention_:
 * The outermost parentheses are omitted;
 * "¬", "∀", "∃" have precedence on all other operators, making "∀x F ∨ G" equivalent to "(∀x F) ∨ G";
 * "∧", "∨", "⊻" have precedence over "→", "←", "↔", making "F ∧ G → H" equivalent to "(F ∧ G) → H";
 * Parentheses may be omitted in formulas where the same binary operator is used multiple times, if the operator is one
   of "∧", "∨", "⊻", "↔". This makes "F ↔ G ↔ H" equivalent to "(F ↔ G) ↔ H". Parentheses must not be dropped if mixed
   operators are used: for instance, "F ∧ G ∨ H" is _not_ a valid formula.

### Free and bound variables, open and closed formulas ###
Depending on the context, variables can be free or bound. For example, the variable "person" is free in the formula
"livesInItaly(person)" but is bound in the formula "∀person livesInItaly(person)". The role of the symbol "person" is
different in the two cases: the first formula is neither true nor false as "person" is just an empty placeholder, the
second formula is false since it is not true that all people live in Italy.

Formally, if "F" is a formula and "x" is a variable appearing in "F", all occurrences of "x" in "F" are said to be
_bound_ in formulas of the kind "∀x F" or "∃x F". Any variable which is not bound is said to be _free_. Any formula
containing at least one free variable is called an _open formula_. If a formula is not open, it is said to be a
_sentence_ or _closed formula_.

Please note that different occurrences of the same variable can be free in one case and bound in anoher. For example,
in the formula "p(x) ∧ ∃x q(x)" the first occurrence of "x" is free while the second occurrence is bound.

## Semantics ##
While the syntactic definition describes which strings are valid formulas, _semantics_ are needed in order to explain
the meaning of a given formula. Let's again take a look at the previous example:

"¬∃person(tallerThan(person, father(Mark)) ∧ tallerThan(person, mother(Mark)))"

The semantic meaning of the formula above is that in our domain of discourse, there exists no person wich is taller
than both the father and the mother of Mark.