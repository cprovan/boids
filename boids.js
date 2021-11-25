// Size of canvas. These get updated to fill the whole browser.
let width = 150;
let height = 150;

const numBoids = 10;
const visualRange = 75;
const escapeVisualRange = 25;

const numPreds = 5;
//const predVisualRange = 25;
const chompRange = 5;

var boids = [];
var preds = [];

// initial boids with random location and velocity &
// preds in corner with random velocity
function initBoids() {
  for (var i = 0; i < numBoids; i += 1) {
    boids[boids.length] = {
      x: Math.random() * width,
      y: Math.random() * height,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      history: [],
    };
  }

  for (i = 0; i < numPreds; i += 1) {
    preds[preds.length] = {
      x: Math.random() * width/30,
      y: Math.random() * height/30,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      history: [],
    };
  }
}

// compute distance between two boids
function distance(boid1, boid2) {
  return Math.sqrt(
    (boid1.x - boid2.x) * (boid1.x - boid2.x) +
      (boid1.y - boid2.y) * (boid1.y - boid2.y),
  );
}

// find n closest boids to a given boid
// TODO: This is naive and inefficient.
function nClosestBoids(boid, n) {
  // Make a copy
  const sorted = boids.slice();
  // Sort the copy by distance from `boid`
  sorted.sort((a, b) => distance(boid, a) - distance(boid, b));
  // Return the `n` closest
  return sorted.slice(1, n + 1);
}

// Called initially and whenever the window resizes to update the canvas
// size and width/height variables.
function sizeCanvas() {
  const canvas = document.getElementById("boids");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

// Constrain a boid to within the window. If it gets too close to an edge,
// nudge it back in and reverse its direction.
function keepWithinBounds(boid) {
  const margin = 200;
  const turnFactor = 1;

  if (boid.x < margin) {
    boid.dx += turnFactor;
  }
  if (boid.x > width - margin) {
    boid.dx -= turnFactor
  }
  if (boid.y < margin) {
    boid.dy += turnFactor;
  }
  if (boid.y > height - margin) {
    boid.dy -= turnFactor;
  }
}

// Find the center of mass of the other boids and adjust velocity slightly to
// point towards the center of mass.
function flyTowardsCenter(boid) {
  const centeringFactor = 0.005; // adjust velocity by this %

  let centerX = 0;
  let centerY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    if (distance(boid, otherBoid) < visualRange) {
      centerX += otherBoid.x;
      centerY += otherBoid.y;
      numNeighbors += 1;
    }
  }

  if (numNeighbors) {
    centerX = centerX / numNeighbors;
    centerY = centerY / numNeighbors;

    boid.dx += (centerX - boid.x) * centeringFactor;
    boid.dy += (centerY - boid.y) * centeringFactor;
  }
}

// Find the closest boid and adjust velocity toward boid
function chaseBoid(pred) {
  const chaseFactor = 0.05; // adjust velocity by this %

  let minDistance = width * width + height * height;
  let preyX = width * 0.5;
  let preyY = height * 0.5;

  for (let boid of boids) {
    if (distance(pred, boid) < minDistance) {
      preyX = boid.x;
      preyY = boid.y;
      minDistance = distance(pred, boid);
    }
  }

  pred.dx += (preyX - pred.x) * chaseFactor;
  pred.dy += (preyY - pred.y) * chaseFactor;
}

// Find the any boids within chomp distance and remove
function devourBoids(pred) {

  for (let boid of boids) {
    if (distance(pred, boid) < chompRange) {
      boids.splice(boids.indexOf(boid),1);
    }
  }

}

// Find the closest predator and adjust velocity away from 
// predator if within visual distance
function runForYourLife(boid) {
  const escapeFactor = 0.5; // adjust velocity by this %

  let minDistance = escapeVisualRange;
  let predX = 0;
  let predY = 0;

  for (let pred of preds) {
    if (distance(boid, pred) < minDistance) {
      predX = pred.x;
      predY = pred.y;
      minDistance = distance(boid, pred);
    }
  }

  if (minDistance < escapeVisualRange) {
    boid.dx += (boid.x - predX) * escapeFactor;
    boid.dy += (boid.y - predY) * escapeFactor;
  }
}

// Move away from other boids that are too close to avoid colliding
function avoidOthers(boid, species = "boid") {
  let minDistance = 20; // The distance to stay away from other boids
  let avoidArray = boids
  if (species == "pred") {
    minDistance = 20;
    avoidArray = preds;
  }

  const avoidFactor = 0.05; // Adjust velocity by this %
  let moveX = 0;
  let moveY = 0;
  for (let otherBoid of avoidArray) {
    if (otherBoid !== boid) {
      if (distance(boid, otherBoid) < minDistance) {
        moveX += boid.x - otherBoid.x;
        moveY += boid.y - otherBoid.y;
      }
    }
  }

  boid.dx += moveX * avoidFactor;
  boid.dy += moveY * avoidFactor;
}

// Find the average velocity (speed and direction) of the other boids and
// adjust velocity slightly to match.
function matchVelocity(boid) {
  const matchingFactor = 0.05; // Adjust by this % of average velocity

  let avgDX = 0;
  let avgDY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    if (distance(boid, otherBoid) < visualRange) {
      avgDX += otherBoid.dx;
      avgDY += otherBoid.dy;
      numNeighbors += 1;
    }
  }

  if (numNeighbors) {
    avgDX = avgDX / numNeighbors;
    avgDY = avgDY / numNeighbors;

    boid.dx += (avgDX - boid.dx) * matchingFactor;
    boid.dy += (avgDY - boid.dy) * matchingFactor;
  }
}

// Speed will naturally vary in flocking behavior, but real animals can't go
// arbitrarily fast.
function limitSpeed(boid, species = "boid") {
  let speedLimit = 100;

  if (species == "boid") {
    speedLimit = 15;
  } else {
    speedLimit = 20;
  }

  const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
  if (speed > speedLimit) {
    boid.dx = (boid.dx / speed) * speedLimit;
    boid.dy = (boid.dy / speed) * speedLimit;
  }
}

const DRAW_TRAIL = true;

function drawBoid(ctx, boid, species = "boid") {
  const angle = Math.atan2(boid.dy, boid.dx);
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);
  ctx.translate(-boid.x, -boid.y);
  if (species == "boid") {
    ctx.fillStyle = "#558cf4";
  } else {
    ctx.fillStyle = "#ff5733";
  }
  ctx.beginPath();
  ctx.moveTo(boid.x, boid.y);
  ctx.lineTo(boid.x - 15, boid.y + 5);
  ctx.lineTo(boid.x - 15, boid.y - 5);
  ctx.lineTo(boid.x, boid.y);
  ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (DRAW_TRAIL) {
    if (species == "boid") {
      ctx.strokeStyle = "#558cf466";
    } else {
      ctx.strokeStyle = "#ff573366";
    }
    ctx.beginPath();
    ctx.moveTo(boid.history[0][0], boid.history[0][1]);
    for (const point of boid.history) {
      ctx.lineTo(point[0], point[1]);
    }
    ctx.stroke();
  }
}

// Main animation loop
function animationLoop() {
  // Update each boid

  // wind factor
  const windSpeedX = 7;
  const windSpeedY = 7;

  for (let boid of boids) {
    // Update the velocities according to each rule
    flyTowardsCenter(boid);
    avoidOthers(boid);
    matchVelocity(boid);
    runForYourLife(boid);
    limitSpeed(boid);
    keepWithinBounds(boid);

    // Update the position based on the current velocity
    boid.x += boid.dx + windSpeedX;
    boid.y += boid.dy + windSpeedY;
    boid.history.push([boid.x, boid.y]);
    boid.history = boid.history.slice(-50);
  }

  for (let pred of preds) {
    // Update the velocities according to each rule
    chaseBoid(pred);
    avoidOthers(pred,"pred");
    limitSpeed(pred, "pred");
    // keepWithinBounds(pred);

    // Update the position based on the current velocity
    pred.x += pred.dx + windSpeedX;
    pred.y += pred.dy + windSpeedY;
    pred.history.push([pred.x, pred.y]);
    pred.history = pred.history.slice(-50);

    devourBoids(pred);
  }

  // Clear the canvas and redraw all the boids in their current positions
  const ctx = document.getElementById("boids").getContext("2d");
  ctx.clearRect(0, 0, width, height);
  for (let boid of boids) {
    drawBoid(ctx, boid);
  }
  for (let pred of preds) {
    drawBoid(ctx, pred, "pred");
  }

  // Schedule the next frame
  window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
  // Make sure the canvas always fills the whole window
  window.addEventListener("resize", sizeCanvas, false);
  sizeCanvas();

  // Randomly distribute the boids to start
  initBoids();

  // Schedule the main animation loop
  window.requestAnimationFrame(animationLoop);
};
