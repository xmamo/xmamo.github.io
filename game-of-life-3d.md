---
title: 'Game of Life 3D'
permalink: '/game-of-life-3d/index.xhtml'
canonical: '/game-of-life-3d/'
scripts:
  - '/js/game-of-life-3d/camera.js'
  - '/js/game-of-life-3d/world.js'
  - '/js/game-of-life-3d/renderer.js'
  - '/js/game-of-life-3d/main.js'
---

# {{ page.title }} #
<noscript><p>Error: JavaScript is disabled.</p></noscript>

<form id="game-of-life-3d" class="js-only">
	<output class="bordered" style="display: block;">
		<canvas id="game-of-life-3d-canvas" style="background: #FFF;"></canvas>
	</output>
	<h2>Controls</h2>
	<dl>
		<dt><kbd>W</kbd>, <kbd>A</kbd>, <kbd>S</kbd>, <kbd>D</kbd></dt>
		<dd>Move the camera up, left, down, or right</dd>
		<dt><kbd>Space</kbd></dt>
		<dd>Enable/disable simulation</dd>
		<dt><kbd>F</kbd></dt>
		<dd>Toggle fullscreen mode</dd>
	</dl>
</form>