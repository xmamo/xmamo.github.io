---
title: 'First order logic'
permalink: '/fol/index.xhtml'
canonical: '/fol/'
scripts:
  - '/js/util.js'
  - '/js/parse.js'
  - '/js/scope.js'
  - '/js/fol/ast.js'
  - '/js/fol/parser.js'
  - '/js/fol/analyzer.js'
  - '/js/fol/main.js'
---

# {{ page.title }} #

<form id="fol">
	<label for="fol-formula">Formula</label>
	<input id="fol-formula" name="formula" />
	<output name="error" style="display: none;"></output>
	<div id="fol-result" style="display: none;">
		<p>
			<label for="fol-parsed">Parsed formula:</label>
			<output id="fol-parsed" name="parsed" spellcheck="false" style="display: block; line-height: 1; white-space: nowrap; overflow-x: auto;"></output>
		</p>
		<p>
			<label for="fol-interpretation">Interpretation:</label>
			<output id="fol-interpretation" name="interpretation"></output>
		</p>
		<p>
			<label for="fol-height">Height: </label>
			<output id="fol-height" name="height">0</output>
			<br />
			<label for="fol-degree">Degree: </label>
			<output id="fol-degree" name="degree">0</output>
		</p>
	</div>
</form>