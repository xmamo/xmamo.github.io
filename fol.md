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
	<label for="formula">Formula</label>
	<input name="formula" />
	<output name="error" style="display: none;"></output>
	<div id="fol-result" style="display: none;">
		<p>
			<label for="parsed">Parsed formula:</label>
			<output name="parsed" spellcheck="false" style="display: block; line-height: 1; white-space: nowrap; overflow-x: auto;"></output>
		</p>
		<p>
			<label for="interpretation">Interpretation:</label>
			<output name="interpretation"></output>
		</p>
		<p>
			<label for="height">Height: </label>
			<output name="height">0</output>
			<br />
			<label for="degree">Degree: </label>
			<output name="degree">0</output>
		</p>
	</div>
</form>