---
title: First order logic tool

description: >-
  This tool analyzes first order logic formulas converting them to prenex conjunctive/disjunctive form and generates
  the truth table for propositional formulas.

keywords: >-
  first order logic, FOL, first order, predicative logic, predicative, propositional logic, propositional, logic, first
  order formula, FOL formula, predicative formula, formula, online tool, tool, software, analyzer, converter,
  normalizer, generator, normal form, NF, normal, prenex normal form, PNF, prenex, disjunctive normal form, DNF,
  disjunctive, conjunctive normal form, CNF, conjunctive

styles:
  - /css/first-order-logic-tool.css

scripts:
  - /js/utils.js
  - /js/first-order-logic-tool/syntax.js
  - /js/first-order-logic-tool/parser.js
  - /js/first-order-logic-tool/analyzer.js
  - /js/first-order-logic-tool/normalizer.js
  - /js/first-order-logic-tool/main.js
---

# {{ page.title }} #

Use the input field below to write a first order formula. Confirm your input by pressing enter. To insert ¬, ∧, ∨, →,
←, ↔, ∀, ∃ type !, &, \|, ->, <-, <->, \A, \E respectively.

<form id="first-order-logic-tool">
	<p>
		<label for="first-order-logic-tool-formula">Formula</label>
		<input id="first-order-logic-tool-formula" name="formula" value="A → B ∧ C" spellcheck="false" />
		<small id="first-order-logic-tool-error"></small>
	</p>
</form>

<div id="first-order-logic-tool-result" style="display: none;">
	<p>
		Parsed formula:
		<output id="first-order-logic-tool-parsed" for="first-order-logic-tool-formula"></output>
	</p>

	<p>
		Interpretation:
		<output id="first-order-logic-tool-interpretation" for="first-order-logic-tool-formula"></output>
	</p>

	<p>
		Height: <output id="first-order-logic-tool-height" for="first-order-logic-tool-formula"></output><br />
		Degree: <output id="first-order-logic-tool-degree" for="first-order-logic-tool-formula"></output>
	</p>

	<p>
		Prenex normal form:<br />
		<output id="first-order-logic-tool-prenex" for="first-order-logic-tool-formula"></output>
	</p>

	<p>
		Prenex disjunctive normal form:<br />
		<output id="first-order-logic-tool-prenex-dnf" for="first-order-logic-tool-formula"></output>
	</p>

	<p>
		Prenex conjunctive normal form:<br />
		<output id="first-order-logic-tool-prenex-cnf" for="first-order-logic-tool-formula"></output>
	</p>

	<p id="first-order-logic-tool-truth-table-result">
		Truth table:
		<output id="first-order-logic-truth-table" for="first-order-logic-tool-formula"></output>
	</p>
</div>


## Purpose and usage of the tool ##

The purpose of this tool is to analyze propositional formulas like
<span class="nowrap"><i>A</i> → <i>B</i> ∧ <i>C</i></span> and first order formulas like
<span class="nowrap">∀<i>x</i> ¬∃<i>y</i> (<i>p</i>(<i>x</i>) → <i>q</i>(<i>y</i>))</span>.

Given any formula of these types, the tool is able to calculate the degree and the height of the formula. It is also
able to infer the meaning of each used symbol, which means it understands if the symbol stands for a variable,
constant, function, or predicate. In addition, the tool derives a formula in prenex normal form which is logically
equivalent to the initial formula. Given a propositional formula, it automatically generates the corresponding truth
table.

To use the tool, simply write the formula to be analyzed in the input field above and press enter. The symbols ¬, ∧, ∨,
→, ←, ↔, ∀, ∃ can be inserted by typing !, &, \|, ->, <-, <->, \A (or \a), \E (or \e) respectively.

## Syntax of first order formulas ##

### First order languages ###

A <dfn>first order language</dfn> is a language characterized by:

 * A set of <dfn>constant symbols</dfn>;

 * A set of <dfn>variable symbols</dfn>;

 * A set of <dfn>function symbols</dfn>, each with an associated arity;

 * A set of <dfn>predicate symbols</dfn>, each with an associated arity;

 * The <dfn>logic symbols</dfn> ¬, ∧, ∨, →, ←, ↔;

 * The <dfn>quantifier symbols</dfn> ∀, ∃;

 * The <dfn>punctuation symbols</dfn> (, ), ,.


### Terms ###

<dfn>Terms</dfn> are the basic building blocks needed to write first order formulas. They are defined inductively as
follows:

 * Every variable is a term;

 * Every constant is a term;

 * <span class="nowrap"><i>f</i>(<i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub>)</span> is a term if
   <i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub> are terms and <i>f</i> is a function of arity <i>n</i>.


### Formulas ###

A <dfn>first order formula</dfn> can be defined inductively as follows:

 * <span class="nowrap"><i>p</i>(<i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub>)</span> is a formula if
   <i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub> are terms and <i>p</i> is a predicate of arity <i>n</i>. A
   formula of this kind is called <dfn>atomic</dfn>;

 * (¬<i>F</i>) is a formula if <i>F</i> is a formula;

 * <span class="nowrap">(<i>F</i> ∧ <i>G</i>)</span>, <span class="nowrap">(<i>F</i> ∨ <i>G</i>)</span>,
   <span class="nowrap">(<i>F</i> → <i>G</i>)</span>, <span class="nowrap">(<i>F</i> ← <i>G</i>)</span>,
   <span class="nowrap">(<i>F</i> ↔ <i>G</i>)</span> are formulas if both <i>F</i> and <i>G</i> are formulas;

 * <span class="nowrap">(∀<i>x</i> <i>F</i>)</span>, <span class="nowrap">(∃<i>x</i> <i>F</i>)</span> are formulas if
   <i>x</i> is a variable and <i>F</i> is a formula.


## Semantics ##

### Interpretation ###

Let <i>D</i> be a set representing the domain of discourse. An <dfn>interpretation</dfn> <i>I</i> maps every symbol to
its meaning:

 * For each function symbol of arity <i>n</i>, there's a function
   <span class="nowrap"><i>f</i>: <i>D</i><sup><i>n</i></sup> → <i>D</i></span>;

 * For each predicate symbol of arity <i>n</i>, there's a set <span class="nowrap"><i>P</i> ⊆ <i>D</i></span>;


### Evaluation ###

Given an interpretation, a formula evaluates to a value which can be either true (𝕋) or false (𝔽).

 * <span class="nowrap"><i>p(<i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub>)</i></span> is true iff
   <span class="nowrap">(<i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub>) ∈ <i>I</i>(<i>p</i>)</span>;

 * <span class="nowrap">(¬<i>F</i>)</span> is true iff <i>F</i> is false;

 * <span class="nowrap">(<i>F</i> ∧ <i>G</i>)</span> is true iff <i>F</i> and <i>G</i> are both true;

 * <span class="nowrap">(<i>F</i> ∨ <i>G</i>)</span> is true iff <i>F</i> is true or <i>G</i> is true;

 * <span class="nowrap">(<i>F</i> → <i>G</i>)</span> is true iff <i>F</i> is false or <i>G</i> is true;

 * <span class="nowrap">(<i>F</i> ← <i>G</i>)</span> is true iff <i>F</i> is true or <i>G</i> is false;

 * <span class="nowrap">(<i>F</i> ↔ <i>G</i>)</span> is true iff <i>F</i> and <i>G</i> have the same truth value.