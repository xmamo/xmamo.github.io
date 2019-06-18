---
title: 'Game of life'
permalink: '/projects/game-of-life/index.xhtml'
scripts:
  - '/js/projects/game-of-life.js'
---

# {{ page.title }} #

<form id="gol">
	<p>
		<output style="display: inline-block; border: solid;">
			<canvas id="canvas" width="960" height="540" style="display: block;"></canvas>
		</output>
	</p>
	<p>
		<label for="gol-speed">Speed</label>
		<input id="gol-speed" name="speed" type="number" min="1" value="1" />
	</p>
</form>