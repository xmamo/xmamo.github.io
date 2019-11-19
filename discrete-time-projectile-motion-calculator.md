---
title: 'Discrete-time projectile motion calculator'
description: "BiLoMa's theorem provides formulas for projectile motion, but in discrete time. An online tool is provided to calculate the initial velocity given range and gravity."
keywords: 'BiLoMa, theorem, tool, calculator, formula, proof, projectile motion, projectile, motion, initial velocity, velocity, position, displacement, discrete time, discrete'
scripts:
  - '/js/utils.js'
  - '/js/discrete-time-projectile-motion-calculator.js'
---

# {{ page.title }} #
This is a tool wich some friends and I worked on. Its objective is to provide formulas for
[projectile motion](https://en.wikipedia.org/wiki/Projectile_motion), but in discrete time. We like to call the
theory behind the calculator _BiLoMa's theorem_. The name of the theorem originates from our nicknames,
[BisUmTo](https://bisumto.it/), Lore, and Mamo (me!).

We initially worked on this theorem because of [Minecraft](https://www.minecraft.net/), to calculate the initial
velocity needed to launch blocks of sand in such a way that they land at an exact point in
space. If you own Minecraft and have some knowledge of command blocks, you can fill out the form
below and see how our theorem works in practice.

<form id="discrete-time-projectile-motion-calculator">
	<p>
		<label for="discrete-time-projectile-motion-calculator-source-pos">Source position</label>
		<input id="discrete-time-projectile-motion-calculator-source-pos" name="source-pos" required="required" placeholder="x, y, z" spellcheck="false" />
	</p>
	<p>
		<label for="discrete-time-projectile-motion-calculator-destination-pos">Destination position</label>
		<input id="discrete-time-projectile-motion-calculator-destination-pos" name="destination-pos" required="required" placeholder="x, y, z" spellcheck="false" />
	</p>
	<p>
		<label for="discrete-time-projectile-motion-calculator-air-time">Air time</label>
		<input id="discrete-time-projectile-motion-calculator-air-time" name="air-time" required="required" spellcheck="false" />
	</p>
	<p>
		<label for="discrete-time-projectile-motion-calculator-acceleration">Gravitational acceleration</label>
		<input id="discrete-time-projectile-motion-calculator-acceleration" name="acceleration" required="required" spellcheck="false" value="-0.04" />
	</p>
	<p>
		<label for="discrete-time-projectile-motion-calculator-damping">Damping factor</label>
		<input id="discrete-time-projectile-motion-calculator-damping" name="damping" required="required" spellcheck="false" value="0.98" />
	</p>
	<p>
		Required initial velocity: <span id="discrete-time-projectile-motion-calculator-result"></span><br />
		Minecraft command: <span id="discrete-time-projectile-motion-calculator-command"></span>
	</p>
</form>

## BiLoMa's theorem ##
Let <i>n</i> be the number of time units that have passed since the object was launched and <i>a</i> the
(gravitational) acceleration. Assuming that the object was launched with an initial position of 0 and an initial
velocity of <i>v</i><sub>0</sub>, we have the following formulas for the velocity <i>v<sub>n</sub></i> and the position
<i>p<sub>n</sub><i>:

![BiLoMa’s theorem](/img/discrete-time-projectile-motion-calculator/theorem.svg)

The damping factor <i>d</i> is used in Minecraft to prevent objects from incrementing their velocity indefinitely.
Using these formulas with <i>d</i> → 1 means having no damping at all.

### Proof of the formula for <i>v<sub>n</sub></i> ###
![Proof of the formula for vn](/img/discrete-time-projectile-motion-calculator/vn-proof.svg)

### Proof of the formula for <i>p<sub>n</sub></i> ###
![Proof of the formula for pn](/img/discrete-time-projectile-motion-calculator/pn-proof.svg)