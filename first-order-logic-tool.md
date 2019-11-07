---
title: 'First order logic tool'
permalink: '/first-order-logic-tool/index.xhtml'
canonical: '/first-order-logic-tool/'
scripts:
  - '/js/util.js'
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
	</div>
</form>