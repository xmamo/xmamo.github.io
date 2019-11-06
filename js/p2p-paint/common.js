"use strict";

var p2pPaint = p2pPaint || {};
p2pPaint.canvas = [document.getElementById("p2p-paint-canvas-0"), document.getElementById("p2p-paint-canvas-1")];
p2pPaint.context = [p2pPaint.canvas[0].getContext("2d"), p2pPaint.canvas[1].getContext("2d")];