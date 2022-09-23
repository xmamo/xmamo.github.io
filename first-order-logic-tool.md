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

modules:
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
<span class="nowrap"><var>A</var> → <var>B</var> ∧ <var>C</var></span> and first order formulas like
<span class="nowrap">∀<var>x</var> ¬∃<var>y</var> (<var>p</var>(<var>x</var>) → <var>q</var>(<var>y</var>))</span>.

Given any formula of these types, the tool is able to calculate the degree and the height of the formula. It is also
able to infer the meaning of each used symbol, which means it understands if the symbol stands for a variable,
constant, function, or predicate. In addition, the tool derives a formula in prenex normal form which is logically
equivalent to the initial formula. Given a propositional formula, it automatically generates the corresponding truth
table.

To use the tool, simply write the formula to be analyzed in the input field above and press enter. The symbols ¬, ∧, ∨,
→, ←, ↔, ∀, ∃ can be inserted by typing !, &, \|, ->, <-, <->, \A, \E respectively.

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

 * <span class="nowrap"><var>f</var>(<var>t</var><sub>1</sub>, ..., <var>t</var><sub><var>n</var></sub>)</span> is a
   term if <var>t</var><sub>1</sub>, ..., <var>t</var><sub><var>n</var></sub> are terms and <var>f</var> is a function
   of arity <var>n</var>.


### Formulas ###

A <dfn>first order formula</dfn> can be defined inductively as follows:

 * <span class="nowrap"><var>p</var>(<var>t</var><sub>1</sub>, ..., <var>t</var><sub><var>n</var></sub>)</span> is a
   formula if <var>t</var><sub>1</sub>, ..., <var>t</var><sub><var>n</var></sub> are terms and <var>p</var> is a
   predicate of arity <var>n</var>. A formula of this kind is called <dfn>atomic</dfn>;

 * (¬<var>F</var>) is a formula if <var>F</var> is a formula;

 * <span class="nowrap">(<var>F</var> ∧ <var>G</var>)</span>,
   <span class="nowrap">(<var>F</var> ∨ <var>G</var>)</span>,
   <span class="nowrap">(<var>F</var> → <var>G</var>)</span>,
   <span class="nowrap">(<var>F</var> ← <var>G</var>)</span>,
   <span class="nowrap">(<var>F</var> ↔ <var>G</var>)</span> are formulas if both <var>F</var> and <var>G</var> are
   formulas;

 * <span class="nowrap">(∀<var>x</var> <var>F</var>)</span>, <span class="nowrap">(∃<var>x</var> <var>F</var>)</span>
   are formulas if <var>x</var> is a variable and <var>F</var> is a formula.