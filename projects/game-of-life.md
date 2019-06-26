---
title: 'Game of Life'
permalink: '/projects/game-of-life/index.xhtml'
scripts:
  - '/js/projects/game-of-life/world.js'
  - '/js/projects/game-of-life/main.js'
---

# {{ page.title }} #
<form id="game-of-life">
	<output class="bordered" style="display: block;">
		<canvas id="game-of-life-canvas"></canvas>
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
				<dt><kbd>F</kbd></dt>
				<dd>Toggle fullscreen mode</dd>
			</dl>
		</div>

		<div class="column">
			<h2>Settings</h2>
			<p>
				<label for="game-of-life-size">World size</label>
				<select id="game-of-life-size" name="size">
					<option value="80x45" selected="selected">80 × 45</option>
					<option value="96x54">96 × 54</option>
					<option value="112x63">112 × 63</option>
					<option value="128x72">128 × 72</option>
					<option value="144x81">144 × 81</option>
					<option value="160x90">160 × 90</option>
					<option value="176x99">176 × 99</option>
					<option value="192x108">192 × 108</option>
					<option value="208x117">208 × 117</option>
					<option value="224x126">224 × 126</option>
					<option value="240x135">240 × 135</option>
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