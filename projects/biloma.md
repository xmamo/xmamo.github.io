---
title: "BiLoMa's theorem"
description: "The objective of BiLoMa's theorem is to provide formulas for projectile motion, but in discrete time."
keywords: 'BiLoMa, theorem, formula, proof, projectile motion, projectile, motion, velocity, position, displacement, discrete time, discrete'
permalink: '/projects/biloma/index.xhtml'
canonical: '/projects/biloma/'
scripts:
  - '/js/projects/biloma.js'
---

# {{ page.title }} #
This is a theorem wich some friends and I worked on. Its objective is to provide formulas for
[projectile motion](https://en.wikipedia.org/wiki/Projectile_motion), but in discrete time. The name of the theorem
originates from our nicknames, [BisUmTo](https://bisumto.it/), Lore, and Mamo (me!).

We initially worked on this theorem because of [Minecraft](https://www.minecraft.net/), to calculate the initial
velocity needed to launch blocks of sand in such a way that they land at an exact point in
space. <span class="js-only">If you own Minecraft and have some knowledge of command blocks, you can fill out the form
below and see how our theorem works in practice.<span>

<form id="biloma" class="js-only">
	<p>
		<label for="biloma-source-pos">Source position</label>
		<input id="biloma-source-pos" name="source-pos" required="required" placeholder="x, y, z" spellcheck="false" />
	</p>
	<p>
		<label for="biloma-destination-pos">Destination position</label>
		<input id="biloma-destination-pos" name="destination-pos" required="required" placeholder="x, y, z" spellcheck="false" />
	</p>
	<p>
		<label for="biloma-air-time">Air time</label>
		<input id="biloma-air-time" name="air-time" required="required" spellcheck="false" />
	</p>
	<p>
		<label for="biloma-acceleration">Gravitational acceleration</label>
		<input id="biloma-acceleration" name="acceleration" required="required" spellcheck="false" value="-0.04" />
	</p>
	<p>
		<label for="biloma-damping">Damping factor</label>
		<input id="biloma-damping" name="damping" required="required" spellcheck="false" value="0.98" />
	</p>
	<p>
		<label for="biloma-result">Required initial velocity:</label>
		<output id="biloma-result" name="result"></output>
	</p>
	<p>
		<label for="biloma-command">Minecraft command:</label>
		<code><output id="biloma-command" name="command"></output></code>
	</p>
</form>

## The theorem ##
Let ![n](/img/projects/biloma/n.svg){:.h1} be the number of time units that have passed since the object was launched
and ![a](/img/projects/biloma/a.svg){:.h1} the (gravitational) acceleration. Assuming that the object was launched with
an initial position of ![0](/img/projects/biloma/0.svg){:.h1} and an initial velocity of
![v0](/img/projects/biloma/v0.svg){:.h1}, we have the following formulas for the velocity
![vn](/img/projects/biloma/vn.svg){:.h1} and the position ![pn](/img/projects/biloma/pn.svg){:.h1}:

![BiLoMa’s theorem](/img/projects/biloma/theorem.svg)

The damping factor ![d](/img/projects/biloma/d.svg){:.h1}, is used in Minecraft to prevent objects from incrementing
their velocity indefinitely. Using these formulas with ![d→1](/img/projects/biloma/d-to-1.svg){:.h1} means having no
damping at all.

### Proof of the formula for ![vn](/img/projects/biloma/vn.svg){:.h1} ###
![Proof of the formula for vn](/img/projects/biloma/vn-proof.svg)

### Proof of the formula for ![pn](/img/projects/biloma/pn.svg){:.h1} ###
![Proof of the formula for pn](/img/projects/biloma/pn-proof.svg)