---
title: Game of Life 3D
article: false

scripts:
  - /js/utils.js
  - /js/game-of-life-3d/camera.js
  - /js/game-of-life-3d/world.js
  - /js/game-of-life-3d/renderer.js
  - /js/game-of-life-3d/main.js
---

# {{ page.title }} #

<div class="bordered">
	<canvas id="game-of-life-3d-canvas" tabindex="0"></canvas>
</div>

<div class="columns">
	<div class="left-column">
		<h2>Controls</h2>

		<dl>
			<dt><kbd>W</kbd>, <kbd>A</kbd>, <kbd>S</kbd>, <kbd>D</kbd></dt>
			<dd>Move the camera up, left, down, or right</dd>
			<dt><kbd>Space</kbd></dt>
			<dd>Enable/disable simulation</dd>
			<dt><kbd>F</kbd></dt>
			<dd>Toggle fullscreen mode</dd>
		</dl>
	</div>

	<div class="right-column">
		<h2>Settings</h2>

		<form id="game-of-life-3d">
			<p>
				<label for="game-of-life-3d-ruleset">Ruleset</label>
				<input id="game-of-life-3d-ruleset" name="ruleset" required="required" spellcheck="false" pattern="^\s*(\d+(?:\s*,\s*\d+)*)?\s*\/\s*(\d+(?:\s*,\s*\d+)*)?\s*$" value="4,5/5" />
			</p>
		</form>
	</div>
</div>

For information about the ruleset, please take a look at the following paper:
[A Note About the Discovery of Many New Rules for the Game of Three-Dimensional Life](https://www.complex-systems.com/abstracts/v16_i04_a07/).