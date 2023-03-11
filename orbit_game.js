const canvas = document.getElementById("orbit_game");
const ctx = canvas.getContext("2d");
const average = (array) => array.reduce((a, b) => a + b) / array.length;

// issues to work out:
// orbit precedes over time?? not sure why. To watch, increase x/y array size
// First javascript code, so if there is anything glaring wrong (other than the immense use of global vars -- ignore that) then please let me know.

// constants
let fps = 60; // frames per second
const dt = (1 / fps) * 1000; // milliseconds per frame
const timestep = 6 * 3600; // 6 hours in seconds
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
let G = 6.67428e-11; // gravitational constant // (N*m**2 / kg**2)
let AU = 149.6e6 * 1000; // m
let dist = 0;
const scale = 220 / AU;

// forces
let gravAngle = 0;
let gravForce = 0;

// sun variables
let sunMass = 1.989e30; // kg
let sunRadius = 20;
let sunX = centerX;
let sunY = centerY;
let mU = sunMass * G;

// planet variables
let planet = false; // planet is real boolean
let planetRadius = 7;
let planetMass = 5.97219e24; // earth mass, kg
let planetX = 0;
let planetY = 0;
let planet_arrX = [];
let planet_arrY = [];
let planetVX = 0;
let planetVY = 0;
let planetAX = 0;
let planetAY = 0;

// orbit data
var ecc_arr = [];
var apoapsis_arr = [];
var periapsis_arr = [];
var orbitalPeriod_arr = [];

// game loop
function drawGame() {
  if (pause || drag) {
    setTimeout(drawGame, dt);
    clearScreen();
    drawSun();
    if (planet) {
      drawPlanet();
      drawProjLine();
    }
  } else {
    clearScreen();
    drawSun();
    setTimeout(drawGame, dt);
    if (planet) {
      planetMovement();
    }
    // if (planet) {
    // }
  }
  drawOrbitText();
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
  dist = dist / scale; // distance is divided by 300 pixels then converted to meters

  var dist_x = Math.round((sunX - planetX) * 1000) / 1000;
  var dist_y = Math.round((sunY - planetY) * 1000) / 1000;

  gravAngle = Math.atan2(dist_y, dist_x); // when the sun is to the right of the planet is 0 degrees
  gravForce = (mU * planetMass) / dist ** 2;

  if (planet) {
    // if planet is true (if it is created and not within the sun), draw it and show the acceleration line
    drawPlanet();
    drawAccelLine();
  }

  planetAX = (gravForce / planetMass) * Math.cos(gravAngle);
  planetAY = (gravForce / planetMass) * Math.sin(gravAngle);

  planetVX += planetAX * timestep;
  planetVY += planetAY * timestep;

  planetX += planetVX * scale * timestep;
  planetY += planetVY * scale * timestep;

  let max_arr = 1000; // max array length
  if (planet_arrX.length > max_arr) {
    planet_arrX = planet_arrX.slice(Math.max(planet_arrX.length - max_arr, 0));
    planet_arrY = planet_arrY.slice(Math.max(planet_arrY.length - max_arr, 0));
  }
  planet_arrX[planet_arrX.length] = planetX;
  planet_arrY[planet_arrY.length] = planetY;
}

function drawPlanet() {
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(planetX, planetY, planetRadius, 0, 2 * Math.PI, false);
  ctx.fill();
  ctx.lineWidth = 0;
  ctx.strokeStyle = "red";
  ctx.stroke();

  drawPath();

  planet = true;
}

function drawPath() {
  for (let i = 0; i < planet_arrX.length; ++i) {
    ctx.beginPath();
    ctx.moveTo(planet_arrX[i - 1], planet_arrY[i - 1]);
    ctx.lineTo(planet_arrX[i], planet_arrY[i]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "red";
    ctx.stroke();
  }
}

function drawAccelLine() {
  accel = (planetAX ** 2 + planetAY ** 2) ** 0.5;
  modifier = 0.01;
  acc_mod = accel ** 0.5 / modifier;
  if (acc_mod > 75) {
    acc_mod = 75;
  }

  aX = acc_mod * Math.cos(gravAngle) + planetX;
  aY = acc_mod * Math.sin(gravAngle) + planetY;
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

function drawOrbitText() {
  ctx.font = "16px serif";
  ctx.fillStyle = "white";
  ctx.fillText("Orbital Data:", 1, 15);
  ctx.fillText("Timestep (hours): " + timestep / 3600, canvas.width - 150, 15);

  // Math for the orbital dynamics is done here
  roundedDistance = dist / 1000;
  velocty = Math.sqrt(planetX ** 2 + planetY ** 2);

  // converting position vector into proper units and with respect to the sun -- also adding a Z component
  const r_vect = [(sunX - planetX) / scale, (sunY - planetY) / scale, 0];
  const v_vect = [planetVX, planetVY, 0];

  sam_vect = math.cross(r_vect, v_vect); //specific angular momentum

  // eccentricity vector equation using specific angular momentum
  ecc_vect = math.subtract(
    math.divide(math.cross(v_vect, sam_vect), mU),
    math.divide(r_vect, math.norm(r_vect))
  );
  // convert to normal eccentricity by taking magnitude
  ecc = math.norm(ecc_vect);
  ecc_arr[ecc_arr.length] = ecc;
  if (ecc_arr.length > 20) {
    ecc_arr = ecc_arr.slice(
      Math.max(ecc_arr.length - 20, 0)
    );
  }

  specific_orbital_energy = (planetVX ** 2 + planetVY ** 2) / 2 - mU / dist;
  semimajor_axis = -mU / (2 * specific_orbital_energy);

  //apoapsis and its average array so that the flucations aren't as severe.
  apoapsis = semimajor_axis * (1 + ecc);
  apoapsis_arr[apoapsis_arr.length] = apoapsis;
  if (apoapsis_arr.length > 250) {
    apoapsis_arr = apoapsis_arr.slice(
      Math.max(apoapsis_arr.length - 250, 0)
    );
  }

  periapsis = semimajor_axis * (1 - ecc);
  periapsis_arr[periapsis_arr.length] = periapsis;
  if (periapsis_arr.length > 250) {
    periapsis_arr = periapsis_arr.slice(
      Math.max(periapsis_arr.length - 250, 0)
    );
  }

  orbitalSpeed = Math.sqrt(mU * (2 / dist - 1 / semimajor_axis));

  orbitalPeriod =
    (2 * Math.PI * Math.sqrt(semimajor_axis ** 3 / mU)) / (3600 * 24);

  orbitalPeriod_arr[orbitalPeriod_arr.length] = orbitalPeriod;
  if (orbitalPeriod_arr.length > 100) {
    orbitalPeriod_arr = orbitalPeriod_arr.slice(
      Math.max(orbitalPeriod_arr.length - 100, 0)
    );
  }

  ctx.fillText(
    "Distance (10\u2076 km): " + Math.round(roundedDistance / 1e4) / 1e2,
    1,
    30
  );
  ctx.fillText(
    "Orbital Speed (km/s): " + Math.round(orbitalSpeed / 1e2) / 1e1,
    1,
    45
  );
  ctx.fillText("Eccentricity: " + Math.round(average(ecc_arr) * 100) / 100, 1, 60);

  ctx.fillText(
    "Apoapsis (10\u2076 km): " + Math.round(average(apoapsis_arr) / 1000 / 1e4) / 1e2,
    1,
    75
  );
  ctx.fillText(
    "Periapsis (10\u2076 km): " + Math.round(average(periapsis_arr) / 1000 / 1e4) / 1e2,
    1,
    90
  );
  ctx.fillText(
    "Period (days): " + Math.round(average(orbitalPeriod_arr)),
    canvas.width - 150,
    30
  );
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

  // Clear Variables
  planetX = mDx;
  planetY = mDy;
  planetVX = 0;
  planetVY = 0;
  planetAX = 0;
  planetAY = 0;
  planet_arrX = [];
  planet_arrY = [];
  
  // orbit data
  ecc_arr = [];
  apoapsis_arr = [];
  periapsis_arr = [];
  orbitalPeriod_arr = [];
  
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

  modifier = 300;

  planetVX = -releaseDiff * modifier * Math.cos(releaseAngle);
  planetVY = -releaseDiff * modifier * Math.sin(releaseAngle);

  pause = false;
  drag = false;
}

drawGame();
