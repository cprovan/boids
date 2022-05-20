# Boids algorithm demonstration

Forked from original codebase written by Ben Eater ([website](https://eater.net/boids))

Modifications made in collaboration with my son E2.

This code is [MIT licensed](http://en.wikipedia.org/wiki/MIT_License).

## What is this?
This is a simple demonstration of the boids algorithm that's featured in this Smarter Every Day video:

[<img src=https://img.youtube.com/vi/4LWmRuB-uNU/maxresdefault.jpg width=360/>](https://www.youtube.com/watch?v=4LWmRuB-uNU)

## How does it work?

Each of the boids (bird-oid objects) obeys three simple rules:

### 1. Coherence

Each boid flies towards the the other boids. But they don't just immediately fly directly at each other. They gradually steer towards each other at a rate that you can adjust with the `centeringFactor` variable. In the demo, you can adjust this from 0 to 0.01 with the "coherence" slider.

### 2. Separation

Each boid also tries to avoid running into the other boids. If it gets too close to another boid it will steer away from it. You can control how quickly it steers with the `avoidFactor` variable. In the demo, you can adjust this from 0 to 0.1 with the "separation" slider.

### 3. Alignment

Finally, each boid tries to match the vector (speed and direction) of the other boids around it. Again, you can control how quickly they try to match vectors using the `centeringFactor` variable. In the demo, you can adjust this from 0 to 0.1 with the "coherence" slider.

## Visual range

There are a ton of ways to extend this simple model to better simulate the behavior of different animals. An example I showed in the video is to limit the "visual range" of each boid. Real animals can't see the entire flock; they can only see the other animals around them. By adjusting the `visualRange` variable, you can adjust how far each boid can "see"—that is which other boids it considers when applying the three rules above.

## How do I run this code?

It ought to run in any web browser. Download (or clone) the files. Then, just double-clicking on `index.html` on most computers will open the simulation in your web browser. You can then edit `boids.js` to tweak and experiment with the algorithm. Simply save your changes and reload the web browser page to see the effect.

## Modifications in this version

There are lots of features you could try adding to the code yourself:

- Added wind
- Added predators that seek out and scatter boids
- Added boid consumption: predators eliminate boids when they are in very close proximity
