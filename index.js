const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

// constants
let fps = 60; // frames per second
const mspf = (1 / fps) * 1000; // milliseconds per frame
var centerX = canvas.width / 2; // finding center of the screen
var centerY = canvas.height / 2;
let mDx = 0; // letting mouse down X and Y to be global
let mDy = 0;
let mUx = 0; // letting mouse down X and Y to be global
let mUy = 0;
let dragX = 0;
let dragY = 0;

let rect = canvas.getBoundingClientRect();
let pause = false;
let drag = false;
let G = 6.67428e-11 // gravitational constant
let AU = 149.6e6 // km
// forces
let gravAngle = 0;
let gravPull = 0;

// sun variables
let sunMass = 1.989*10**30; // kg
let sunRadius = 20;
let sunX = centerX;
let sunY = centerY;

// planet variables
let planet = false; // planet is real boolean
let planetRadius = 7;
let planetMass = 5.97219*10**24; // earth mass, kg
let planetX = 0;
let planetY = 0;
let planet_arrX = [];
let planet_arrY = [];
let planetVX = 0;
let planetVY = 0;
let planetAX = 0;
let planetAY = 0;

// game loop
function drawGame() {
  if (pause || drag) {
    setTimeout(drawGame, mspf);
    clearScreen();
    drawSun();
    if (planet) {
      drawPlanet();
      drawProjLine();
    }
  } else {
    clearScreen();
    drawSun();
    setTimeout(drawGame, mspf);
    if (planet) {
      planetMovement();
    }
    if (planet) {
      drawPlanet();
      drawAccelLine();
    }
  }
}

function clearScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSun() {
  ctx.beginPath();
  ctx.fillStyle = "yellow";
  ctx.arc(sunX, sunY, sunRadius, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.lineWidth = 0;
  ctx.strokeStyle = "#FFF59D";
  ctx.stroke();
}

function planetMovement() {
  dist = ((planetX - sunX) ** 2 + (planetY - sunY) ** 2) ** 0.5;
  // if the distance of the planet to the sun is slightly overlapping, then delete the planet
  if (dist < (sunRadius * 1.9 + planetRadius * 1.9) / 2) {
    planet = false;
  }
  dist = (dist / 300) * AU * 1000; // convert to meters
  gravAngle = Math.atan2(sunY - planetY, sunX - planetX); // when the sun is to the right of the planet is 0 degrees
  gravPull = (G * planetMass * sunMass) / dist ** 2;

  planetAX = (gravPull / planetMass) * Math.cos(gravAngle);
  planetAY = (gravPull / planetMass) * Math.sin(gravAngle);

  planetVX += planetAX * (1 / fps)*24;
  planetVY += planetAY * (1 / fps)*24;

  planet_arrX[planet_arrX.length] = planetX
  planet_arrY[planet_arrY.length] = planetY

  planetX += planetVX * (1 / fps)*24;
  planetY += planetVY * (1 / fps)*24;
}

function drawPlanet() {
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(planetX, planetY, planetRadius, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.lineWidth = 0;
  ctx.strokeStyle = "red";
  ctx.stroke();

  drawPath()

  planet = true;
}

function drawPath(){
  for (let i = 0; i<planet_arrX.length;++i){
    ctx.beginPath();
    ctx.moveTo(planet_arrX[i-1], planet_arrY[i-1]);
    ctx.lineTo(planet_arrX[i], planet_arrY[i]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "red";
    ctx.stroke();
  }
}

function drawAccelLine() {
  accel = (planetAX ** 2 + planetAY ** 2) ** 0.5;
  modifier = .001
  acc_mod = accel/modifier
  if (acc_mod > 45) {
    acc_mod = 45
  }
  aX = ((acc_mod * Math.cos(gravAngle)) + planetX);
  aY = ((acc_mod * Math.sin(gravAngle)) + planetY);
  ctx.beginPath();
  ctx.moveTo(planetX, planetY);
  ctx.lineTo(aX, aY);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "white";
  ctx.stroke();
}

function drawProjLine() {
  ctx.beginPath();
  ctx.moveTo(mDx, mDy);
  ctx.lineTo(dragX, dragY);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "white";
  ctx.stroke();
}

function mouseDown() {
  pause = true;
  drag = true;
  mDx = window.event.clientX - rect.left;
  mDy = window.event.clientY - rect.top;
  dragX = mDx;
  dragY = mUy;
  if (mDx < 0 || mDy < 0) {
    return;
  }
  if (mDx > canvas.width || mDy > canvas.height) {
    return;
  }
  planetX = mDx;
  planetY = mDy;
  planetVX = 0;
  planetVY = 0;
  planetAX = 0;
  planetAY = 0;
  planet_arrX = []
  planet_arrY = []

  drawPlanet();
  return mDx, mDy;
}

function checkMouseDrag() {
  if (drag) {
    mouseDrag();
  }
}

function mouseDrag() {
  dragX = window.event.clientX - rect.left;
  dragY = window.event.clientY - rect.top;
}

function mouseUp() {
  var mUx = window.event.clientX - rect.left;
  var mUy = window.event.clientY - rect.top;

  let releaseDiff = ((mUx - mDx) ** 2 + (mUy - mDy) ** 2) ** 0.5;
  let releaseAngle = Math.atan2(mDy - mUy, mDx - mUx);

  modifier = 50

  planetVX = -releaseDiff/modifier * Math.cos(releaseAngle);
  planetVY = -releaseDiff/modifier * Math.sin(releaseAngle);

  pause = false;
  drag = false;
}

drawGame();
