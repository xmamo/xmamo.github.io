---
title: 'Game of Life 3D'
scripts:
  - '/js/utils.js'
  - '/js/game-of-life-3d/camera.js'
  - '/js/game-of-life-3d/world.js'
  - '/js/game-of-life-3d/renderer.js'
  - '/js/game-of-life-3d/main.js'
---

# {{ page.title }} #
<form id="game-of-life-3d">
	<div class="bordered">
		<canvas id="game-of-life-3d-canvas"></canvas>
	</div>
	<div class="columns">
		<div class="column">
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
		<div class="column">
			<h2>Settings</h2>
			<p>
				<label for="game-of-life-3d-ruleset">Ruleset</label>
				<input id="game-of-life-3d-ruleset" name="ruleset" required="required" spellcheck="false" placeholder="a, b, c, d" pattern="^\s*([+-]?\d+)(?:\s*,\s*|\s+)([+-]?\d+)(?:\s*,\s*|\s+)([+-]?\d+)(?:\s*,\s*|\s+)([+-]?\d+)\s*$" value="4, 5, 5, 5" />
			</p>
		</div>
	</div>
</form>