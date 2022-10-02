---
title: Game of Life
article: false

modules:
  - /js/game-of-life/main.js
---

# {{ page.title }} #

<canvas id="game-of-life-canvas" tabindex="0" style="touch-action: none;"></canvas>

<div class="columns">
	<div class="left-column">
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

	<div class="right-column">
		<h2>Settings</h2>

		<form id="game-of-life">
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
				<input id="game-of-life-wrap" name="wrap" type="checkbox" checked="checked" />
				<label for="game-of-life-wrap">Wrap</label>
			</p>
		</form>
	</div>
</div>