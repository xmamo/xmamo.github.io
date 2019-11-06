---
title: 'P2P Paint'
permalink: '/p2p-paint/index.xhtml'
canonical: '/p2p-paint/'
scripts:
  - 'https://unpkg.com/peerjs@1.0.0/dist/peerjs.min.js'
  - '/js/p2p-paint/common.js'
  - '/js/p2p-paint/server.js'
  - '/js/p2p-paint/client.js'
  - '/js/p2p-paint/main.js'
---

# {{ page.title }} #
<p id="p2p-paint-remote">Please wait…</p>
<div class="bordered" style="position: relative;">
	<canvas id="p2p-paint-canvas-0" width="1920" height="1080" style="position: absolute;"></canvas>
	<canvas id="p2p-paint-canvas-1" width="1920" height="1080" style="position: relative;"></canvas>
</div>