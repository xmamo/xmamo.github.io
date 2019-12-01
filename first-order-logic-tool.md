---
title: 'First order logic tool'
description: 'This tool analyzes first order logic formulas converting them to prenex conjunctive/discjunctive form and generates the truth table for propositional formulas.'
keywords: 'first order logic, FOL, first order, predicative logic, predicative, propositional logic, propositional, logic, first order formula, FOL formula, predicative formula, formula, online tool, tool, software, analyzer, converter, normalizer, generator, normal form, NF, normal, prenex normal form, PNF, prenex, disjunctive normal form, DNF, disjunctive, conjunctive normal form, CNF, conjunctive'
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
Use the input field below to write a first order formula. Confirm your input by pressing enter. To insert ¬, ∧, ∨, →,
←, ↔, ∀, ∃ type !, &, \|, ->, <-, <->, \A, \E respectively.

<form id="first-order-logic-tool">
	<p>
		<label for="first-order-logic-tool-formula">Formula</label>
		<input id="first-order-logic-tool-formula" name="formula" spellcheck="false" />
		<small id="first-order-logic-tool-error"></small>
	</p>
	<div id="first-order-logic-tool-result" style="display: none;">
		<p>
			Parsed formula:<br />
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
			Truth table:<br />
			<output id="first-order-logic-truth-table" for="first-order-logic-tool-formula"></output>
		</p>
	</div>
</form>

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
From a syntactical point of view, first order formulas are strings of symbols connected by logical operators,
quantifiers and punctuation marks. Each symbol can represent a variable, constant, function, or predicate. Let's take a
look at an example:

¬∃<i>x</i> (<i>p</i>(<i>x</i>, <i>f</i>(<i>a</i>)) ∧ <i>p</i>(<i>x</i>, <i>g</i>(<i>a</i>)))

In the formula above, <i>x</i> would be a variable, <i>a</i> a constant, <i>p</i> a binary predicate, <i>f</i> an unary
function. ¬ and ∧ are logic symbols, ∃ is the existential quantifier, (, ), , are punctuation marks.

### First order language ###
A <dfn>first order language</dfn> 𝓛 is a language characterized by:
 * A set of <dfn>constant symbols</dfn> (like <i>a</i>, <i>b</i>, <i>c</i>, ...);
 * A set of infinite  <dfn>variable symbols</dfn> (like <i>x</i>, <i>y</i>, <i>z</i>, ...);
 * A set of <dfn>function symbols</dfn>, each with an associated arity (for example <i>f</i> with arity 1, <i>g</i> with arity
   3, ...);
 * A set of <dfn>predicate symbols</dfn> (also called <dfn>relation symbols</dfn>), each with an associated arity (for example <i>p</i>
   with arity 2, <i>q</i> with arity 1, ...);
 * The <dfn>logic symbols</dfn> ¬, ∧, ∨, →, ←, ↔;
 * The <dfn>quantifier symbols</dfn> ∀, ∃;
 * The <dfn>punctuation symbols</dfn> (, ), ,.

### Terms ###
The <dfn>terms</dfn> of first order languages are the basic building blocks needed to write first order formulas. They are
defined recursively as follows:
 * Every variable is a term;
 * Every constant is a term;
 * <span class="nowrap"><i>f</i>(<i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub>)</span> is a term if
   <i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub> are terms and <i>f</i> is a function of arity <i>n</i>.

In the example above, <i>a</i>, <i>f</i>(<i>a</i>), <i>g</i>(<i>a</i>) and <i>x</i> are terms of the formula.

### Formulas ###
A <dfn>first order formula</dfn> can be defined recursively as follows:
 * <span class="nowrap"><i>p</i>(<i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub>)</span> is a formula if
   <i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub> are terms and <i>p</i> is a predicate of arity <i>n</i>. A
   formula of this kind is called <dfn>atomic</dfn>;
 * (¬<i>F</i>) is a formula if <i>F</i> is a formula;
 * <span class="nowrap">(<i>F</i> ∧ <i>G</i>)</span>, <span class="nowrap">(<i>F</i> ∨ <i>G</i>)</span>,
   <span class="nowrap">(<i>F</i> → <i>G</i>)</span>, <span class="nowrap">(<i>F</i> ← <i>G</i>)</span>,
   <span class="nowrap">(<i>F</i> ↔ <i>G</i>)</span> are formulas if both <i>F<i> and <i>G<i> are formulas;
 * <span class="nowrap">(∀<i>x</i> <i>F</i>)</span>, <span class="nowrap">(∃<i>x</i> <i>F</i>)</span> are formulas if
   <i>x</i> is a variable and <i>F</i> is a formula.

In order to increase readability, parentheses can be dropped according to the following convention:
 * The outermost parentheses are omitted;
 * <i>¬</i>, <i>∀</i>, <i>∃</i> have precedence on all other operators, making
   <span class="nowrap">∀<i>x</i> <i>F</i> ∨ <i>G</i></span> equivalent to
   <span class="nowrap">(∀<i>x</i> <i>F</i>) ∨ <i>G</i></span>;
 * ∧, ∨ have precedence over →, ←, ↔, making <span class="nowrap"><i>F</i> ∧ <i>G</i> → <i>H</i></span> equivalent to
   <span class="nowrap">(<i>F</i> ∧ <i>G</i>) → <i>H</i></span>;
 * Parentheses may be omitted in formulas where the same binary operator is used multiple times, if the operator is one
   of ∧, ∨, ↔. This makes <span class="nowrap"><i>F</i> ↔ <i>G</i> ↔ <i>H</i></span> equivalent to
   <span class="nowrap">(<i>F</i> ↔ <i>G</i>) ↔ <i>H</i></span>. Parentheses must not be dropped if mixed operators are
   used: for instance, <span class="nowrap"><i>F</i> ∧ <i>G</i> ∨ <i>H</i></span> is _not_ a valid formula.

In the example above, <span class="nowrap"><i>p</i>(<i>x</i>, <i>f</i>(<i>a</i>))</span> and
<span class="nowrap"><i>p</i>(<i>x</i>, <i>g</i>(<i>a</i>))</span> are atomic formulas. In addition,
<span class="nowrap"><i>p</i>(<i>x</i>, <i>f</i>(<i>a</i>)) ∧ <i>p</i>(<i>x</i>, <i>g</i>(<i>a</i>)</span> and
<span class="nowrap">∃<i>x</i> (<i>p</i>(<i>x</i>, <i>f</i>(<i>a</i>)) ∧ <i>p</i>(<i>x</i>, <i>g</i>(<i>a</i>)))</span>
are proper substrings of the original formula which are also formulas.

### Free and bound variables, open and closed formulas ###
Depending on the context, variables can be free or bound. For example, the variable <i>person</i> is free in the
formula <i>livesInItaly</i>(<i>person</i>) but is bound in the formula
<span class="nowrap">∀<i>person</i> <i>livesInItaly</i>(<i>person</i>)</span>. The role of the symbol <i>person</i> is
different in the two cases: the first formula is neither true nor false as <i>person</i> is just an empty placeholder,
the second formula is false since it is not true that all people live in Italy.

Formally, if <i>F</i> is a formula and <i>x</i> is a variable appearing in <i>F</i>, all occurrences of <i>x</i> in
<i>F</i> are said to be <dfn>bound</dfn> in formulas of the kind <span class="nowrap">∀<i>x</i> <i>F</i></span> or
<span class="nowrap">∃<i>x</i> <i>F</i></span>. Any occurrence of a variable which is not bound is said to be
<dfn>free</dfn>. Any formula containing at least one free occurrence of a variable is called an
<dfn>open formula</dfn>. If a formula is not open, it is said to be a <dfn>sentence</dfn> or <dfn>closed formula</dfn>.

Please note that different occurrences of the same variable can be free in one case and bound in another. For example,
in the formula <span class="nowrap"><i>p</i>(<i>x</i>) ∧ ∃<i>x</i> <i>q</i>(<i>x</i>)</span> the first occurrence of
<i>x</i> is free while the second one is bound.

## Semantic of first order formulas ##
Whether a sentence is true of not depends on the interpretation of predicate, function and constant symbols. For
instance, we could declare the symbols <i>p</i>, <i>f</i>, <i>g</i>, <i>a</i> of the example above to mean taller than,
father of, mother of, Mark respectively; with this interpretation, assuming that we are only talking about people, the
formula states that there doesn't exist any person which is taller than both the father and the mother of Mark. We
could write a formula which is logically equivalent to the one above, but with self-describing symbols:

¬∃<i>person</i> (<i>taller</i>(<i>person</i>, <i>father</i>(<i>Mark</i>)) ∧ <i>taller</i>(<i>person</i>, <i>mother</i>(<i>Mark</i>)))

In turn, the interpretation of a sentence depends on the domain of discourse. In this case, the domain of discourse
would be the set of people we're talking about. If the domain of discourse consists only of Mark and we assume that
Mark is shorter than his dad, the formula is trivially true; however if the domain of discourse is Mark and all his
friends, then the truthfulness of the sentence also depends on the height of all his friends.

### Interpretation a sentence ###
Let 𝓛 be a first order language. The <dfn>domain of discourse</dfn> <i>D</i> is a non-empty set of elements. For each
constant symbol of 𝓛 there's an element in <i>D</i>.

An <dfn>interpretation</dfn> <i>I</i> of 𝓛 is a function mapping every function and predicate symbol of 𝓛 to its
meaning:
 * For every function symbol <i>f</i> of 𝓛 there's a mapping
   <span class="nowrap"><i>I</i>(<i>f</i>): <i>D</i><sup><i>n</i></sup> → <i>D</i></span>, where <i>n</i> is
   the arity of <i>f</i>.
 * For every predicate symbol <i>p</i> of 𝓛 there's a set <i>I</i>(<i>p</i>) such that
   <span class="nowrap"><i>I</i>(<i>p</i>) ⊆ <i>D</i></span>.

In addition
<span class="nowrap"><i>I</i>(<i>f</i>(<i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub>)) = <i>I</i>(<i>f</i>)(<i>I</i>(<i>t</i><sub>1</sub>), ..., <i>I</i>(<i>t</i><sub><i>n</i></sub>))</span>,
if <i>f</i> is a function of arity <i>n</i> and <i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub> are
terms.

### Truth value of a sentence ###
Given an interpretation <i>I</i> and a sentence <i>F</i> it is possible to determine its <dfn>truth value</dfn>, which
is either true (𝕋) or false (𝔽).
 * <span class="nowrap"><i>p</i>(<i>t</i><sub>1</sub>, ..., <i>t</i><sub><i>n</i></sub>)</span> is true iff
   <span class="nowrap">(<i>I</i>(<i>t</i><sub>1</sub>), ..., <i>I</i>(<i>t</i><sub><i>n</i></sub>)) ∈ <i>I</i>(<i>p</i>)</span>;
 * ¬<i>F</i> is true iff <i>F</i> is false;
 * <span class="nowrap"><i>F</i> ∧ <i>G</i></span> is true iff <i>F</i> and <i>G</i> are both true;
 * <span class="nowrap"><i>F</i> ∨ <i>G</i></span> is true iff <i>F</i> is true or <i>G</i> is true;
 * <span class="nowrap"><i>F</i> → <i>G</i></span> is true iff <i>F</i> is false or <i>G</i> is true;
 * <span class="nowrap"><i>F</i> ← <i>G</i></span> is true iff <i>F</i> is true or <i>G</i> is false;
 * <span class="nowrap"><i>F</i> ↔ <i>G</i></span> is true iff <i>F</i> and <i>G</i> have the same truth value.

### Logical equivalence ###
Two sentences are logically equivalent if they are yield the same truth value independently of the interpretation given
to them.

More formally, two sentences <i>F</i> and <i>G</i> are <dfn>logically equivalent</dfn> if, for every interpretation,
<i>F</i> is true if and only if <i>G</i> is also true.