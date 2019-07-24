---
title: 'P2P Paint'
permalink: '/fun/p2p-paint/index.xhtml'
canonical: '/fun/p2p-paint/'
scripts:
  - 'https://unpkg.com/peerjs@1.0.0/dist/peerjs.min.js'
  - '/js/fun/p2p-paint/server.js'
  - '/js/fun/p2p-paint/client.js'
  - '/js/fun/p2p-paint/main.js'
---

# {{ page.title }} #
<div class="bordered" style="position: relative;">
	<canvas id="p2p-paint-canvas-0" width="2048" height="1080" style="position: absolute;"></canvas>
	<canvas id="p2p-paint-canvas-1" width="2048" height="1080" style="position: relative;"></canvas>
</div>
<p id="p2p-paint-remote"></p>