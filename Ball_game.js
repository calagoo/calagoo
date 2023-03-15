var Ball_mouseDown;
var Ball_mouseUp;
var Ball_mouseMove;

function closure() {
    const canvas = document.getElementById("Ball_game");
    const ctx = canvas.getContext("2d");

    //// sim constants
    const fps = 60; // frames per second
    const dt = (1 / fps) * 1000; // milliseconds per frame
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxHeight = 50;


    function pixel2scale(pxl) {
        // convert meters to pixels
        return canvas.height - (canvas.height / maxHeight) * pxl;
      }
    
    function scale2pixel(scale) {
    // convert pixels to meters
    return (scale / (canvas.height / maxHeight));
    }

    var ballArray = []
    class ball {
        // forces 
        // y: positive=down, negative=up
        // 
        gravity = 0//-9.81 // gravity
        xy = 0 // magnitude of x and y
        vx = 10 // velocity
        vy = -20
        vel = 0
        mass = .15 // mass, kg
        k = 10000 // spring constant
        p = 0 // momentum
        fy = 0 // force
        fx = 0 // force
        e = 0.99 // restitution

        constructor(x, y, r,ctx) {
            this.x = x;
            this.y = y;
            this.r = r;
            this.ctx = ctx;
            // this.drawBall = this.drawBall.bind(this);
            // this.ballMovement = this.ballMovement.bind(this);
        }
        drawBall(color) {
            if (color != undefined){
                this.ctx.fillStyle = color
            }
            else{
                this.ctx.fillStyle = "white"
            }
            this.ctx.beginPath()
            this.ctx.arc(pixel2scale(this.x), pixel2scale(this.y), this.r, 0, 2 * Math.PI)
            this.ctx.fill()
        }
        checkWallCollision(x,y,r){
            // this.drawBall("red") //uncomment if you want circles to light up red when they are close to collision
            var ballTop = y+r
            var ballBot = y-r
            var ballLeft = x-r
            var ballRight = x+r

            if (ballBot < 0){
                this.vy = Math.abs(this.vy)*this.e
            }
            if (ballTop > maxHeight){
                this.vy = -Math.abs(this.vy)*this.e
            }
            if (ballLeft < 0){
                this.vx = Math.abs(this.vx)*this.e
            }
            if (ballRight > maxHeight){
                this.vx = -Math.abs(this.vx)*this.e
            }
        }

        ballMovement(){
            var x = this.x
            var vx = this.vx
            var y = this.y
            var vy = this.vy
            const gravity = this.gravity
            var vel = this.vel
            var xy = this.xy
            var p = this.p
            var mass = this.mass
            var r = this.r
            r = scale2pixel(r)
            if ((y < 5 || y > maxHeight-5) || (x < 5 || x > maxHeight-5)){
                this.checkWallCollision(x,y,r)
            }

            //modeling gravity -- Y
            this.vy += gravity * (dt/1000)
            this.y += (vy * (dt/1000))
            y = this.y
            
            //x position
            this.x += (vx * (dt/1000))
            x = this.x

            
            //finding speed magnitude
            vel = math.norm([this.vy,this.vx])
            xy = math.norm([this.y,this.x])
            
            //finding momentum
            p = vel




        }
    }

    function drawGame() {
        setTimeout(drawGame, dt);
        clearScreen();

        // we will start with two balls
        if(ballArray.length < 1){
            ballArray[0] = new ball(20, 40, 10, ctx)
            // ballArray[1] = new ball(20, 450, 10, ctx)
        }
        ballArray.forEach(function(item){
             item.drawBall()
             item.ballMovement()
            })




    }

    function clearScreen() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }


    drawGame();
}
closure();