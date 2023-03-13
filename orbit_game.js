var orbit_mouseDown;
var orbit_mouseUp;
var orbit_checkMouseDrag;

function closure() {
  const canvas = document.getElementById("orbit_game");
  const ctx = canvas.getContext("2d");
  const average = (array) => array.reduce((a, b) => a + b) / array.length;

  var starX = []
  var starY = []
  const starCount = Math.random()*100
  for(i=0;i<starCount;i++){
    starX[i] = Math.random()*canvas.width
    starY[i] = Math.random()*canvas.height
  }


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
  let pause_square = [
    canvas.width - 50,
    canvas.height - 50,
    canvas.width,
    canvas.height,
  ];

  let rect = canvas.getBoundingClientRect();
  let pause = false;
  let pause_toggle = false;
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
      drawStars()
      drawSun();
      drawPlayButton();
      if (planet) {
        drawPlanet();
        if (!pause_toggle) {
          drawProjLine();
        }
      }
    } else {
      clearScreen();
      drawStars()
      drawSun();
      drawPauseButton();
      setTimeout(drawGame, dt);
      if (planet) {
        planetMovement();
      }
    }
    drawOrbitText();
  }

  function clearScreen() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  function drawStars(){
    for(i=0;i<starX.length;i++){

      ctx.fillStyle = "white";
      ctx.fillRect(starX[i], starY[i], 1, 1);
    }
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
    dist = dist / scale;

    // in hindsight I shouldve made a custom rounding function, but a lot through this script I use this rounding technique to get n sig figs (in this case n=3)
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
      planet_arrX = planet_arrX.slice(
        Math.max(planet_arrX.length - max_arr, 0)
      );
      planet_arrY = planet_arrY.slice(
        Math.max(planet_arrY.length - max_arr, 0)
      );
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

  //draws line that planet leaves behind using the planet positional array and a for loop
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

  //draws the line of force/acceleration
  function drawAccelLine() {
    accel = (planetAX ** 2 + planetAY ** 2) ** 0.5;
    modifier = 0.01;
    acc_mod = accel ** 0.5 / modifier;
    if (acc_mod > 75) {
      // this if statement limits the length of the force vector
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

  //draws the line projected when clicking and dragging to shoot the planet
  function drawProjLine() {
    ctx.beginPath();
    ctx.moveTo(mDx, mDy);
    ctx.lineTo(dragX, dragY);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.stroke();
  }

  function drawOrbitText() {
    ctx.font = "16px monospace";
    ctx.fillStyle = "white";
    ctx.fillText("Orbital Data:", 1, 15);
    ctx.fillText(
      "Timestep (hr) = " + (timestep / 3600),
      canvas.width - 180,
      30
    );

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
      ecc_arr = ecc_arr.slice(Math.max(ecc_arr.length - 20, 0));
    }

    specific_orbital_energy = (planetVX ** 2 + planetVY ** 2) / 2 - mU / dist;
    semimajor_axis = -mU / (2 * specific_orbital_energy);

    //apoapsis and its average array so that the flucations aren't as severe.
    apoapsis = semimajor_axis * (1 + ecc);
    apoapsis_arr[apoapsis_arr.length] = apoapsis;
    if (apoapsis_arr.length > 250) {
      apoapsis_arr = apoapsis_arr.slice(Math.max(apoapsis_arr.length - 250, 0));
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
      "Distance      = " + (Math.round(roundedDistance / 1e4) / 1e2).toFixed(2) + " (10\u2076 km)",
      1,
      30
    );
    ctx.fillText(
      "Orbital Speed = " + (Math.round(orbitalSpeed / 1e2) / 1e1).toFixed(2) + " (km/s)",
      1,
      45
    );
    ctx.fillText(
      "Eccentricity  = " + (Math.round(average(ecc_arr) * 100) / 100).toFixed(2),
      1,
      60
    );

    ctx.fillText(
      "Apoapsis      = " +
        (Math.round(average(apoapsis_arr) / 1000 / 1e4) / 1e2).toFixed(2) + " (10\u2076 km)",
      1,
      75
    );
    ctx.fillText(
      "Periapsis     = " +
        (Math.round(average(periapsis_arr) / 1000 / 1e4) / 1e2).toFixed(2) + " (10\u2076 km)",
      1,
      90
    );
    ctx.fillText(
      "Period (days) = " + Math.round(average(orbitalPeriod_arr)),
      canvas.width - 180,
      45
    );
  }

  orbit_mouseDown = function mouseDown() {
    pause = true;
    drag = true;
    mDx = window.event.pageX - canvas.offsetLeft;
    mDy = window.event.pageY - canvas.offsetTop;

    if (mDx > pause_square[0] && mDy > pause_square[1]) {
      if (pause_toggle) {
        pause_toggle = false;
      } else {
        pause_toggle = true;
      }
      return;
    }

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
  };

  orbit_checkMouseDrag = function checkMouseDrag() {
    if (drag) {
      mouseDrag();
    }
  };

  function mouseDrag() {
    dragX = window.event.pageX - canvas.offsetLeft;
    dragY = window.event.pageY - canvas.offsetTop;
  }

  orbit_mouseUp = function mouseUp() {
    if (pause_toggle) {
      return;
    }
    var mUx = window.event.pageX - canvas.offsetLeft;
    var mUy = window.event.pageY - canvas.offsetTop;

    if (mUx > pause_square[0] && mUy > pause_square[1]) {
      pause = false;
      drag = false;
      return;
    }

    let releaseDiff = ((mUx - mDx) ** 2 + (mUy - mDy) ** 2) ** 0.5;
    let releaseAngle = Math.atan2(mDy - mUy, mDx - mUx);

    modifier = 300;

    planetVX = -releaseDiff * modifier * Math.cos(releaseAngle);
    planetVY = -releaseDiff * modifier * Math.sin(releaseAngle);

    pause = false;
    drag = false;
  };

  function drawPauseButton() {
    ctx.fillStyle = "#2D3033";
    ctx.fillRect(
      pause_square[0],
      pause_square[1],
      pause_square[2],
      pause_square[3]
    );

    ctx.fillStyle = "white";
    ctx.fillRect(canvas.width - 40, canvas.height - 40, 10, 30);
    ctx.fillRect(canvas.width - 20, canvas.height - 40, 10, 30);
  }
  function drawPlayButton() {
    ctx.fillStyle = "#2D3033";
    ctx.fillRect(
      pause_square[0],
      pause_square[1],
      pause_square[2],
      pause_square[3]
    );

    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(canvas.width - 40, canvas.height - 40);
    ctx.lineTo(canvas.width - 10, canvas.height - 25);
    ctx.lineTo(canvas.width - 40, canvas.height - 10);
    ctx.fill();
  }

  drawGame();
}
closure();