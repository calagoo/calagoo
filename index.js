const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


// constants
let fps = 10;                       // frames per second
const mspf = 1/fps*1000;            // milliseconds per frame
var centerX = canvas.width / 2;     // finding center of the screen
var centerY = canvas.height / 2;

// game loop
function drawGame(){
    clearScreen();
    drawSun();
    setTimeout(drawGame,mspf);
}

function clearScreen(){
    ctx.fillStyle = "black";
    ctx.fillRect(0,0,canvas.width,canvas.height);
}

function drawSun(){
    ctx.beginPath()
    ctx.fillStyle = "yellow";
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI, false);
    ctx.fill()
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#003300';
    ctx.stroke();
}

drawGame()