---
title: 'First order logic tool'
styles:
  - '/css/first-order-logic-tool.css'
scripts:
  - '/js/utils.js'
  - '/js/parse.js'
  - '/js/scope.js'
  - '/js/first-order-logic-tool/ast.js'
  - '/js/first-order-logic-tool/parser.js'
  - '/js/first-order-logic-tool/analyzer.js'
  - '/js/first-order-logic-tool/normal.js'
  - '/js/first-order-logic-tool/main.js'
---

# {{ page.title }} #
Use the input field below to write a first order formula. Confirm your input by pressing enter. To insert "¬", "∧",
"∨", "→", "←", "↔", "∀", "∃" type "!", "&", "\|", "->", "<-", "<->", "\A", "\E" respectively.

<form id="first-order-logic-tool">
	<label for="first-order-logic-tool-formula">Formula</label>
	<input id="first-order-logic-tool-formula" name="formula" spellcheck="false" />
	<span id="first-order-logic-tool-error"></span>
	<div id="first-order-logic-tool-result" style="display: none;">
		<p>
			Parsed formula:
			<div id="first-order-logic-tool-parsed" style="line-height: 1; white-space: nowrap; overflow-x: auto;"></div>
		</p>
		<p>
			Interpretation:
			<div id="first-order-logic-tool-interpretation"></div>
		</p>
		<p>
			Height: <span id="first-order-logic-tool-height"></span><br />
			Degree: <span id="first-order-logic-tool-degree"></span>
		</p>
		<p>
			Prenex normal form:<br />
			<span id="first-order-logic-tool-prenex"></span>
		</p>
		<p>
			Prenex disjunctive normal form:<br />
			<span id="first-order-logic-tool-prenex-dnf"></span>
		</p>
		<p>
			Prenex conjunctive normal form:<br />
			<span id="first-order-logic-tool-prenex-cnf" name="prenex-cnf"></span>
		</p>
		<p id="first-order-logic-tool-truth-table-result">
			Truth table:
			<div id="first-order-logic-truth-table" name="truth-table"></div>
		</p>
	</div>
</form>

## Purpose and usage of the tool ##
The purpose of this tool is to analyze propositional formulas like "A → B ∧ C" and first order formulas like
"∀x ¬∃y(p(x) → q(y))".

Given any formula of these types, the tool is able to calculate the degree and the height of the formula. It is also able to infer the meaning of each used symbol, which means it understands if the symbol stands for a variable, constant, predicate, or function. In addition, the tool derives a formula in prenex normal form which is logically equivalent to the initial formula. Given a propositional formula, it automatically generates the corresponding truth table.

To use the tool, simply write the formula to be analyzed in the input field above and press enter. The symbols "¬",
"∧", "∨", "→", "←", "↔", "∀", "∃" can be inserted by typing "!", "&", "\|" "->", "<-", "<->", "\A" (or "\a"), "\E" (or
"\e") respectively.

## Syntax and semantics of first order formulas ##
From a syntactical point of view, first order formulas are strings of symbols connected by logical operators,
quantifiers and punctuation marks. Each symbol can represent a variable, constant, predicate, or function. Let's take a
look at an example:

¬∃person(tallerThan(person, father(Mark)) ∧ tallerThan(person, mother(Mark)))

The formula above states that in our domain of discourse there exists no person which is taller than both the father
and the mother of Mark. In this case, "person" is a variable, "tallerThan" a binary predicate, "father" and "mother"
unary functions, "Mark" a constant. "∧" and "¬" are logical operators, "∀" is the universal quantifier, "(", ")", ","
are punctuation marks.

### First order language ###
A _first order language_ is a language characterized by:
 * A set of _variable symbols_ (like "x", "y", "z", ...);
 * A set of _constant symbols_ (like "a", "b", "c", ...);
 * A set of _predicate symbols_, each with an associated arity (for example "p" with arity 2, "q" with arity 1, ...);
 * A set of _function symbols_, each with an associated arity (for example "f" with arity 1, "g" with arity 3, ...);
 * The _logic symbols_ "¬", "∧", "∨", "→", "←", "↔";
 * The _quantifier symbols_ "∀", "∃";
 * The _punctuation symbols_ "(", ")", ",".

### Terms ###
The _terms_ of first order languages are the basic building blocks needed to write first order formulas. They are
defined recursively as follows:
 * Every variable is a term;
 * Every constant is a term;
 * "f(t<sub>1</sub>, ..., t<sub>n</sub>)" is a term if "t<sub>1</sub>", ..., "t<sub>n</sub>" are terms and "f" is a
   function of arity n.

In the example above, "Mark", "father(Mark)", "mother(Mark)" and "person" are all terms of the formula.

### Formulas ###
A _first order formula_ can be defined recursively as follows:
 * "p(t<sub>1</sub>, ..., t<sub>n</sub>)" is a formula if "t<sub>1</sub>", ..., "t<sub>n</sub>" are terms and "p" is a
   predicate of arity n. A formula of this kind is called _atomic_;
 * "(¬F)" is a formula if "F" is a formula;
 * "(F ∧ G)", "(F ∨ G)", "(F → G)", "(F ← G)", "(F ↔ G)" are formulas if both "F" and "G" are formulas;
 * "(∀x F)", "(∃x F)" are formulas if "x" is a variable and "F" is a formula.

In order to increase readability, parentheses can be dropped according to the following convention:
 * The outermost parentheses are omitted;
 * "¬", "∀", "∃" have precedence on all other operators, making "∀x F ∨ G" equivalent to "(∀x F) ∨ G";
 * "∧", "∨" have precedence over "→", "←", "↔", making "F ∧ G → H" equivalent to "(F ∧ G) → H";
 * Parentheses may be omitted in formulas where the same binary operator is used multiple times, if the operator is one
   of "∧", "∨", "↔". This makes "F ↔ G ↔ H" equivalent to "(F ↔ G) ↔ H". Parentheses must not be dropped if mixed
   operators are used: for instance, "F ∧ G ∨ H" is _not_ a valid formula.

In the example above, "tallerThan(person, father(Mark))" and "tallerThan(person, mother(Mark))" are atomic formulas. In addition, "tallerThan(person, father(Mark)) ∧ tallerThan(person, mother(Mark)" and "∃person(tallerThan(person, father(Mark)) ∧ tallerThan(person, mother(Mark))" are proper substrings of the original formula which are also formulas.

### Free and bound variables, open and closed formulas ###
Depending on the context, variables can be free or bound. For example, the variable "person" is free in the formula
"livesInItaly(person)" but is bound in the formula "∀person livesInItaly(person)". The role of the symbol "person" is
different in the two cases: the first formula is neither true nor false as "person" is just an empty placeholder, the
second formula is false since it is not true that all people live in Italy.

Formally, if "F" is a formula and "x" is a variable appearing in "F", all occurrences of "x" in "F" are said to be
_bound_ in formulas of the kind "∀x F" or "∃x F". Any occurrence of a variable which is not bound is said to be _free_.
Any formula containing at least one free occurrence of a variable is called an _open formula_. If a formula is not
open, it is said to be a _sentence_ or _closed formula_.

Please note that different occurrences of the same variable can be free in one case and bound in anoher. For example,
in the formula "p(x) ∧ ∃x q(x)" the first occurrence of "x" is free while the second one is bound.