function closure() {
    const canvas = document.getElementById("InProg");
    const ctx = canvas.getContext("2d");

    drawGame()
    function drawGame() {
        setTimeout(drawGame, 100);
        clearScreen()
        warningTape()
    }

    function clearScreen() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    function warningTape(){
        ctx.save()
        ctx.fillStyle = "yellow"
        ctx.translate(0, canvas.height)
        ctx.rotate(-45*Math.PI/180)
        ctx.fillRect(0,-10,1000,20)
        ctx.fillStyle = "blue"
        ctx.font = "16px monospace"
        ctx.fillText("WORK IN PROGRESS", 30, 5)
        ctx.fillText("WORK IN PROGRESS", 200, 5)
        ctx.fillText("WORK IN PROGRESS", 370, 5)
        ctx.fillText("WORK IN PROGRESS", 170+370, 5)
        ctx.restore()
    }
}
closure()