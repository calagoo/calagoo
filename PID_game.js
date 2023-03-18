var PID_mouseDown;
var PID_mouseUp;
var PID_mouseMove;
currentTab = "";
function checkTab(name){
    currentTab = name
    console.log(`Current Tab: ${currentTab}`)
}

function closure() {
  const canvas = document.getElementById("PID_game");
  const ctx = canvas.getContext("2d");
  const lerp = (x, y, a) => x * (1 - a) + y * a; // linear interpolation function

  //other
  var mouseUp_bool = true;
  var mouseDown_bool = false;
  var mousePosX_click_target;
  var mousePosY_click_target;
  var mousePosX_click_cloud;
  var mousePosY_click_cloud;
  var maxCloudAmount = 24;

  //// sim constants
  const fps = 60; // frames per second
  const dt = (1 / fps) * 1000; // milliseconds per frame
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  //// sim variables
  var targetHeight = 100;
  var targetHeight_pxl = 0;
  var ticks = 0;
  var flameColors = [];
  var height = 50;
  var heightLast = 0;
  var xPos = centerX;
  var xPosLast = 0;
  var angle = 0;
  var pitch = 0;
  var density = 1.225; // kg/m^3

  var pidOut_height = [0, 0];
  var pidOut_x = [0, 0];
  var excessLift = 0;
  var accelY = 0;
  var velY = 0;
  var accelX = 0;
  var velX = 0;
  var lift = 0;
  var drag = 0;

  //// Plane Variables (roughly from a Boeing 737).
  // for angles -10 to 10, every 2.5
  // using information from a 737 midspan airfoil at RE == 100k, http://airfoiltools.com/polar/details?polar=xf-b737b-il-100000
  const angle_array = [-10, -7.5, -5, -2.5, 0, 2.5, 5, 7.5, 10];
  const CL = [
    -0.8505, -0.6891, -0.498, -0.2414, 0.1618, 0.4767, 0.69, 0.9266, 1.1118,
  ];
  const CD = [
    0.05068, 0.02624, 0.01535, 0.01561, 0.01541, 0.01499, 0.01987, 0.02868,
    0.04215,
  ];

  const mass = 70535; // kg, mtow
  const vel = 200; // m/s
  const sref = 125; // m^2
  const maxthrust = 64_400; // Newtons

  // clouds
  cloudArray = []; // creating a cloudArray and a cloud class. This will allow me to randomize each cloud. First time using classes in JS; I am sure this isn't ideal.
  class cloud {
    constructor(x, y, dist, size, xOffset, yOffset, lobes, blur) {
      this.x = x;
      this.y = y;
      this.dist = dist;
      this.lobes = lobes;
      this.size = size;
      this.xOffset = xOffset;
      this.yOffset = yOffset;
      this.blur = blur;
      var maxOffset = 60;
      for (i = 0; i < lobes; i++) {
        // Now here we can randomize some of the details such as the size, position, and blur
        size[i] = 2 + Math.random() * 2;
        xOffset[i] = maxOffset / 2 - Math.random() * maxOffset;
        yOffset[i] =
          (maxOffset / 2 - Math.random() * maxOffset) *
          (xOffset[i] / maxOffset) ** 0.2; // the y offset is multiplied by the unit vector for x to the 0.2 power --  because I like the shape it makes
        blur[i] =
          (1 -
            (xOffset[i] ** 2 + yOffset[i] ** 2) ** 0.5 /
              (maxOffset ** 2 + maxOffset ** 2) ** 0.5) *
          0.6; // I find the magnitude unit vector of the position and blur based on the farthest points. This makes the outside of the cloud fuzzier
      }
    }
  }

  // GAME DRAWING MAIN LOOP
  function drawGame() {

    if(currentTab!="Simulations"){
      setTimeout(drawGame,500)
      return
    }
      
      ticks++;
      if (ticks > canvas.width) {
        ticks = 1;
      }
      
      setTimeout(drawGame, dt);
      clearScreen();
      drawTargetLine();
      planeMove_out = planeMovement(height, targetHeight, angle, xPos);
      heightLast = height;
      xPosLast = xPos;
      height = planeMove_out[0];
      angle = planeMove_out[1];
      xPos = planeMove_out[2];
      // drawing clouds
      if (
        (Math.random() > 0.25 && cloudArray.length < maxCloudAmount) ||
        cloudArray.length < 0
        ) {
          // 90% chance per frame that a cloud will spawn, or 99.8% chance one will spawn every second. If unlucky, there is a minimum and max amount of clouds. There will always be at least 5.
          cloudArray[cloudArray.length] = new cloud(
            canvas.width + 30, // x pos
            heightConvert(centerY - Math.random() * 250), // height
            1 + round(Math.random() * 5, 0), // distance from camera
            [], // size
            [], // xOffset
            [], // yOffset
            1 + round(Math.random() * 100, 0), // lobes - the amount of parts the cloud has, with a max of 1+100 here (+1 so it isnt zero, probably could do +15 too)
                []
                ); // blur
              }
              for (i = 0; i < cloudArray.length; i++) {
                // for each cloud...
                cloudArray[i].x -= cloudArray[i].dist / 2; // movement speed is based off distance from camera, causing parallax effect (farther obj move "slower").. divide by two because it looks better... 200m/s is actually pretty fast so the clouds would be flying by
                if (cloudArray[i].x != undefined) {
                  // just so nothing throws an error, although not sure if this even works here
                  drawCloud(cloudArray[i]); // draw the cloud!
                  if (
                    cloudArray[i].dist <= 3 &&
                    Math.abs(cloudArray[i].x - xPos) < 50 &&
                    Math.abs(heightConvertInv(cloudArray[i].y) - height) < 15
                    ) {
                      // drawCloud(cloudArray[i],"red") // uncomment this for clouds around the plane to light up red when the plane should go in front of them
                      drawPlane(heightConvert(height), pitch); // if the cloud is at the correct distance and near the plane, draw plane again so it ends up in FRONT of the rearward clouds
                    }
                  }
    if (cloudArray[i].x < -30) {
      cloudArray.splice(i, 1); // when cloud leaves frame, delete the obj from the array
    }
  }
  
  drawTextData(height, targetHeight, angle);
  drawCloudSlider(maxCloudAmount);
  
  // short clamp to make sure the target height isn't too large or small (this is just a backup, the one in the mouseMove() function shouldnt fail)
  if (targetHeight > 150) {
    targetHeight = 150;
  } else if (targetHeight < 30) {
    targetHeight = 30;
  }
}

function drawCloud(cloudObj, color) {
  for (j = 0; j < cloudObj.lobes; j++) {
    ctx.fillStyle = `rgba(${240 * (cloudObj.dist / 5) ** 0.2},${
      240 * (cloudObj.dist / 5) ** 0.2
    },${240 * (cloudObj.dist / 5) ** 0.2},${cloudObj.blur[j]})`;
    if (color != undefined) {
      // for debug purposes
      ctx.fillStyle = color;
    }
    ctx.fillRect(
      cloudObj.x + cloudObj.xOffset[j],
        cloudObj.y + cloudObj.yOffset[j],
        cloudObj.size[j] + cloudObj.dist,
        cloudObj.size[j] + cloudObj.dist
      );
    }

    // originally clouds were made up of circles using context.arc(), but arcs sometimes have weird effects when close to eachother
  }

  function clearScreen() {
    ctx.fillStyle = "#00ABF0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function heightConvert(ht) {
    // convert meters to pixels
    return canvas.height - (canvas.height / 200) * ht;
  }

  function heightConvertInv(ht) {
    // convert pixels to meters
    return 200 - (ht * 200) / canvas.height;
  }

  function drawTargetLine() {
    targetHeight_pxl = heightConvert(targetHeight);

    // draw dashed part of line
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(0, targetHeight_pxl);
    ctx.lineTo(canvas.width, targetHeight_pxl);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "white";
    ctx.stroke();

    // draw grabbable circle
    ctx.beginPath();
    ctx.fillStyle = "grey";
    ctx.arc(canvas.width - 5, targetHeight_pxl, 20, 0, 2 * Math.PI, false);
    ctx.fill();
  }

  function drawCloudSlider(maxCloudAmount){
    
    ctx.fillStyle = "white"
    ctx.setLineDash([]);
    ctx.beginPath()
    ctx.moveTo(canvas.width/3,canvas.height-35)
    ctx.lineTo(2*canvas.width/3,canvas.height-35)
    ctx.stroke()
    
    diff = 2*canvas.width/3 - canvas.width/3
    
    ctx.beginPath()
    ctx.arc((canvas.width/3)+maxCloudAmount/200*diff,canvas.height-35,10,0,2*Math.PI,false)
    ctx.fill()
    
    ctx.font = "16px monospace";
    ctx.fillText(`Max Clouds = ${maxCloudAmount}`,centerX-65,canvas.height-5)
  }

  function pid(
    kp,
    ki,
    kd,
    setpoint,
    process_variable,
    dt,
    pv_last,
    ierr,
    high,
    low,
    op0
  ) {
    // Calculate the error
    error = setpoint - process_variable;

    // Calculate the proportional term
    p = kp * error;

    // Calculate the integral term
    ierr = ierr + ki * error * (dt / 1000);
    i = ierr;

    // change in process variable
    dpv = (process_variable - pv_last) / (dt / 1000);

    // Calculate the derivative term
    d = -kd * dpv;

    // Return the sum of the three terms
    output = op0 + p + i + d;
    if (output < low || output > high) {
      i = i - ki * error * (dt / 1000);
      output = Math.max(low, Math.min(high, output));
    }
    return [output, ierr, p, i, d];
  }

  function planeMovement(height, targetHeight, angle, xPos) {
    pidOut_x = pid(
      (kp = 20),
      (ki = 0.01),
      (kd = 50),
      centerX,
      xPos,
      dt,
      xPosLast,
      pidOut_x[1],
      (high = maxthrust / 1000),
      (low = 0),
      (op0 = drag / 1000) //bias, this means at 0 thrust == drag
    );

    pidOut_height = pid(
      (kp = 1),
      (ki = 0.001),
      (kd = 0.8),
      targetHeight,
      height,
      dt,
      heightLast,
      pidOut_height[1],
      (high = 10),
      (low = -10),
      (op0 = 0.509249975) //bias, at this angle the lift == mass
    );

    angle = pidOut_height[0];

    var closestAngles = detectClose(angle, angle_array);
    var closestIndex = [
      angle_array.indexOf(closestAngles[0]),
      angle_array.indexOf(closestAngles[1]),
    ];

    // Finding the interpolated value of CL using linear interpolation and the closest values near the angle of attack in order to find the values greater and smaller than CL.
    // for the 3rd element (a) in lerp(x,y,a), we have to specify that when the angles become negative to take the absolute value, if not we will eventually divide by 0 and it will throw an error.
    // the if statement is so that if the angle is negative, we choose the bigger value as 1. Because when we abs, the bigger value is actually the smaller (it is 3:30 am currently... bad explanation)
    if (angle < 0) {
      var CL_interp = lerp(
        CL[closestIndex[0]],
        CL[closestIndex[1]],
        1 -
          (Math.abs(angle) -
            Math.min(Math.abs(closestAngles[0]), Math.abs(closestAngles[1]))) /
            Math.max(Math.abs(closestAngles[0]), Math.abs(closestAngles[1]))
      );

      var CD_interp = lerp(
        CD[closestIndex[0]],
        CD[closestIndex[1]],
        1 -
          (Math.abs(angle) -
            Math.min(Math.abs(closestAngles[0]), Math.abs(closestAngles[1]))) /
            Math.max(Math.abs(closestAngles[0]), Math.abs(closestAngles[1]))
      );
    } else {
      var CL_interp = lerp(
        CL[closestIndex[0]],
        CL[closestIndex[1]],
        (Math.abs(angle) -
          Math.min(Math.abs(closestAngles[0]), Math.abs(closestAngles[1]))) /
          Math.max(Math.abs(closestAngles[0]), Math.abs(closestAngles[1]))
      );

      var CD_interp = lerp(
        CD[closestIndex[0]],
        CD[closestIndex[1]],
        (Math.abs(angle) -
          Math.min(Math.abs(closestAngles[0]), Math.abs(closestAngles[1]))) /
          Math.max(Math.abs(closestAngles[0]), Math.abs(closestAngles[1]))
      );
    }

    lift = ((CL_interp * (density * vel ** 2)) / 2) * sref;
    drag = ((CD_interp * (density * vel ** 2)) / 2) * sref;

    thrust = pidOut_x[0] * 1000;

    excessLift = lift - mass * 9.81;
    accelY = (excessLift + thrust * Math.sin((angle * Math.PI) / 180)) / mass; // add lift and thrust together to get total upwards force
    velY += accelY * (dt / 1000);
    height += velY * (dt / 1000);

    accelX = (thrust - drag) / mass;
    velX += accelX * (dt / 1000);
    xPos += velX * (dt / 1000);

    pitch = Math.atan2(velY, velX + vel); // find pitch using atan2, whichever way the aircraft is accelerating is where itll pitch to

    drawPlane(heightConvert(height), pitch);
    return [height, angle, xPos];
  }

  function drawPlane(height, pitch) {
    var planeLength = 40;
    var planeHeight = 10;

    ctx.fillStyle = "white";

    // Body
    ctx.save();
    ctx.translate(xPos - planeLength / 2, height - planeHeight / 2);
    ctx.rotate(-pitch);
    ctx.fillRect(0, 0, planeLength, planeHeight);
    ctx.fillStyle = "black";

    // Windows
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.moveTo(2, 3);
    ctx.lineTo(planeLength - 2, 3);
    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.stroke();

    // Tail
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(0, -10);
    ctx.closePath();
    ctx.fill();

    // Nose
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.moveTo(planeLength, 0);
    ctx.lineTo(planeLength + 10, planeHeight / 2);
    ctx.lineTo(planeLength, planeHeight);
    ctx.closePath();
    ctx.fill();

    // Wing
    ctx.beginPath();
    ctx.moveTo(planeLength / 2, planeHeight - 2);
    ctx.lineTo(planeLength / 2 - 3, planeHeight + 5);
    ctx.lineTo(planeLength / 2 + 3, planeHeight + 5);
    ctx.lineTo(planeLength / 2 + 6, planeHeight - 2);
    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.fillStyle = "white";
    ctx.fill();

    // Boost!
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(((-thrust) / 30e3)*10, planeHeight / 2); // make flame dependent on thrust
    ctx.lineTo(0, planeHeight);
    ctx.fillStyle = "orange";
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(((-thrust) / 30e3)*5, planeHeight / 2);
    ctx.lineTo(0, planeHeight - 2);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.restore();
  }

  function drawTextData(height, targetHeight, angle) {
    //draw text box
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, 66);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, canvas.height-60, canvas.width, 100);

    ctx.font = "16px monospace";
    ctx.fillStyle = "white";
    ctx.fillText("Plane Data:", 1, 15);
    ctx.fillText(`Height   = ${round(height, 1).toFixed(2)} m`, 1, 30);
    ctx.fillText(
      `Lift     = ${round((excessLift + mass * 9.81) / 1000, 2).toFixed(2)} kN`,
      1,
      45
    );
    ctx.fillText(
      `Velocity = ${round(velX + vel, 2).toFixed(2)}, ${round(velY, 2)} m/s`,
      1,
      60
    );

    ctx.fillText(
      `AoA    = ${round(angle, 2).toFixed(2)} deg`,
      canvas.width - 162,
      30
    );
    ctx.fillText(
      `Pitch  = ${round((pitch * 180) / Math.PI, 2).toFixed(2)} deg`,
      canvas.width - 162,
      45
    );
    ctx.fillText(
      `Thrust = ${round(thrust / 1e3, 2).toFixed(2)} kN`,
      canvas.width - 162,
      60
    );
    ctx.fillText(round(targetHeight, 0) + " m", 1, targetHeight_pxl - 2);

    //PID Text
    ctx.fillText("Height PID:", 1, canvas.height - 2 - 45);
    ctx.fillText(
      "P = " + round(pidOut_height[2], 2).toFixed(2),
      1,
      canvas.height - 2 - 30
    );
    ctx.fillText(
      "I = " + round(pidOut_height[3], 2).toFixed(2),
      1,
      canvas.height - 2 - 15
    );
    ctx.fillText(
      "D = " + round(pidOut_height[4], 2).toFixed(2),
      1,
      canvas.height - 2
    );
    ctx.fillText("xPos PID:", canvas.width - 97, canvas.height - 2 - 45);
    ctx.fillText(
      "P = " + round(pidOut_x[2], 2).toFixed(2),
      canvas.width - 97,
      canvas.height - 2 - 30
    );
    ctx.fillText(
      "I = " + round(pidOut_x[3], 2).toFixed(2),
      canvas.width - 97,
      canvas.height - 2 - 15
    );
    ctx.fillText(
      "D = " + round(pidOut_x[4], 2).toFixed(2),
      canvas.width - 97,
      canvas.height - 2
    );

    ctx.font = "12px serif";
    ctx.save();
    ctx.translate(canvas.width - 3, targetHeight_pxl + 16);
    ctx.rotate((-90 * Math.PI) / 180);
    ctx.fillText("DRAG", 0, 0);
    ctx.restore();
  }

  function moveCloudMax(mousePosX, mousePosY){
    diff = 2*canvas.width/3 - canvas.width/3

    maxCloudAmount = round(((mousePosX-(canvas.width/3))/diff)*200,0)
  }
  function moveTargetHeight(mousePosX, mousePosY) {
    targetHeight = heightConvertInv(mousePosY);
  }


  PID_mouseDown = function mouseDown() {
    diff = 2*canvas.width/3 - canvas.width/3

    mouseUp_bool = false;
    mouseDown_bool = true;
    mousePosX_click_target = window.event.pageX - canvas.offsetLeft;
    mousePosY_click_target =
      targetHeight_pxl - (window.event.pageY - canvas.offsetTop);
    mousePosX_click_cloud = ((canvas.width/3)+maxCloudAmount/200*diff) - (window.event.pageX - canvas.offsetLeft);
    mousePosY_click_cloud = (window.event.pageY - canvas.offsetTop);
  };

  PID_mouseMove = function mouseMove() {
    mousePosX_drag = window.event.pageX - canvas.offsetLeft;
    mousePosY_drag = window.event.pageY - canvas.offsetTop;
    
    if (mouseDown_bool) { // checks if the mouse is currently clicking/holding down
        if (// checks that you clicked originally on the height drag ball
          
        mousePosX_click_target > 475 &&
        mousePosY_click_target < 20 &&
        mousePosY_click_target > -20
      ) {
        if (// doesn't track if you try to change height to too high or too low
            
          heightConvertInv(mousePosY_drag) <= 150 &&
          heightConvertInv(mousePosY_drag) >= 30
        ) {
          moveTargetHeight(mousePosX_drag, mousePosY_drag);
        }
      }
      if (
          mousePosX_click_cloud > -10 &&
          mousePosX_click_cloud < +10 &&
          mousePosY_click_cloud > canvas.height-50 &&
          mousePosY_click_cloud < canvas.height-30
          ) {
            if(mousePosX_drag <= 2*canvas.width/3 && mousePosX_drag >= canvas.width/3){
                moveCloudMax(mousePosX_drag, mousePosY_drag)
            }
      }
    }
  };

  PID_mouseUp = function mouseUp() {
    mouseUp_bool = true;
    mouseDown_bool = false;
  };

  // not my function
  const detectClose = (x, array) => {
    // if array has less or equal 2 elements, no further verification needed
    if (array.length <= 2) {
      return array;
    }
    // function to sort array elements by its absolute distance to 'x'
    const sort = (sortArray) =>
      sortArray.sort((a, b) => {
        return Math.abs(a - x) > Math.abs(b - x) ? 1 : -1;
      });
    // gets the numbers to the right, ordered by distance to x
    const higher = sort(array.filter((i) => i > x));
    // gets numbers to the left, ordered by distance to x
    const lower = sort(array.filter((i) => i < x));

    // no higher number? results will come from the left.
    if (higher.length === 0) {
      return [lower[1], lower[0]];
    }

    // if no lower numbers, results must come from the right
    if (lower.length === 0) {
      return [higher[0], higher[1]];
    }

    // it has numbers left or right, return the closest in each array
    return [lower[0], higher[0]];
  };

  // simpler rounding function than the Math.round()
  const round = (x, sigfigs) => {
    return Math.round(x * 10 ** sigfigs) / 10 ** sigfigs;
  };

  drawGame();
}
closure();

