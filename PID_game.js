const canvas = document.getElementById("PID_game");
const ctx = canvas.getContext("2d");

const fps = 60; // frames per second
const dt = (1 / fps) * 1000; // milliseconds per frame

function drawGame() {
  setTimeout(drawGame, dt);
  clearScreen();
}

function clearScreen() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

drawGame();
