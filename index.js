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
let G = 1; //6.67 * 10**-11

// sun variables
let sunMass = 333;
let sunRadius = 20;
let sunX = centerX;
let sunY = centerY;

// planet variables
let planet = false; // planet is real boolean
let planetRadius = 10;
let planetMass = 1;
let planetX = 0;
let planetY = 0;
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
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#FFF59D";
  ctx.stroke();
}

function planetMovement() {
  dist = ((planetX - sunX) ** 2 + (planetY - sunY) ** 2) ** 0.5;
  if (dist < (sunRadius + planetRadius) / 2) {
    planet = false;
  }
  // dist = dist/100
  gravAngle = Math.atan2(sunY - planetY, sunX - planetX); // when the sun is to the right of the planet is 0 degrees
  gravPull = (G * planetMass * sunMass) / dist ** 2;

  planetAX += (gravPull / planetMass) * Math.cos(gravAngle);
  planetAY += (gravPull / planetMass) * Math.sin(gravAngle);

  planetVX += (planetAX * 1) / fps;
  planetVY += (planetAY * 1) / fps;
  console.log("accx: " + planetAX, "accy: " + planetAY);
  planetX += (planetVX * 1) / fps;
  planetY += (planetVY * 1) / fps;
}

function drawPlanet() {
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(planetX, planetY, planetRadius, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = "red";
  ctx.stroke();
  planet = true;
}

function drawAccelLine(){

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

  drawPlanet();
  console.log("Mouse Down   -- Coordinate x: " + mDx, "Coordinate y: " + mDy);
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

  planetVX = -releaseDiff * Math.cos(releaseAngle);
  planetVY = -releaseDiff * Math.sin(releaseAngle);

  console.log("Mouse Up     -- Coordinate x: " + mUx, "Coordinate y: " + mUy);
  console.log("Difference: " + releaseDiff, "Angle: " + releaseAngle);
  pause = false;
  drag = false;
}

drawGame();
