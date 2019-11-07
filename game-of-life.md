---
title: 'Game of Life'
permalink: '/game-of-life/index.xhtml'
canonical: '/game-of-life/'
scripts:
  - '/js/util.js'
  - '/js/game-of-life/world.js'
  - '/js/game-of-life/main.js'
---

# {{ page.title }} #

<noscript><p>Error: JavaScript is disabled.</p></noscript>

<form id="game-of-life" class="js-only">
	<output class="bordered" style="display: block;">
		<canvas id="game-of-life-canvas" style="background: #FFF;"></canvas>
	</output>
	<div class="columns">
		<div class="column">
			<h2>Controls</h2>
			<dl>
				<dt><kbd>Left-click</kbd></dt>
				<dd>Place an alive cell at the cursor’s position</dd>
				<dt><kbd>Right-click</kbd></dt>
				<dd>Place a dead cell at the cursor’s position</dd>
				<dt><kbd>Mouse wheel</kbd></dt>
				<dd>Increase/decrease brush size</dd>
				<dt><kbd>Space</kbd></dt>
				<dd>Enable/disable simulation</dd>
			</dl>
		</div>
		<div class="column">
			<h2>Settings</h2>
			<p>
				<label for="game-of-life-size">World size</label>
				<select id="game-of-life-size" name="size">
					<option selected="selected">80 × 45</option>
					<option>96 × 54</option>
					<option>112 × 63</option>
					<option>128 × 72</option>
					<option>144 × 81</option>
					<option>160 × 90</option>
					<option>176 × 99</option>
					<option>192 × 108</option>
					<option>208 × 117</option>
					<option>224 × 126</option>
					<option>240 × 135</option>
				</select>
			</p>
			<p>
				<label for="game-of-life-ruleset">Ruleset</label>
				<input id="game-of-life-ruleset" name="ruleset" required="required" spellcheck="false" placeholder="a, b, c, d" pattern="^\s*([+-]?\d+)(?:\s*,\s*|\s+)([+-]?\d+)(?:\s*,\s*|\s+)([+-]?\d+)(?:\s*,\s*|\s+)([+-]?\d+)\s*$" value="2, 3, 3, 3" />
			</p>
			<p>
				<input id="game-of-life-wrap" name="wrap" type="checkbox" checked="checked" />
				<label for="game-of-life-wrap">Wrap</label>
			</p>
		</div>
	</div>
</form>