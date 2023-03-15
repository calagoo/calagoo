var Ball_mouseDown;
var Ball_mouseUp;
var Ball_mouseMove;

function closure() {
    const canvas = document.getElementById("Ball_game");
    const ctx = canvas.getContext("2d");

    //// sim constants
    const debug = false;
    const fps = 30; // frames per second
    const dt = (1 / fps) * 1000; // milliseconds per frame
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxHeight = 50;
    let sectionArray = [[], [], [], [], [], [], [], [], []];

    function pixel2scale(pxl) {
        // convert meters to pixels
        return canvas.height - (canvas.height / maxHeight) * pxl;
    }

    function scale2pixel(scale) {
        // convert pixels to meters
        return scale / (canvas.height / maxHeight);
    }

    var ballArray = [];
    class ball {
        // forces
        // y: positive=down, negative=up
        //
        gravity = 0; //-9.81 // gravity
        xy = 0; // magnitude of x and y
        vel = 0;
        e = 0.99; // restitution
        constructor(x, y, vx, vy, r, ctx) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.r = r;
            this.ctx = ctx;
            this.mass = r; // mass, kg
            // this.drawBall = this.drawBall.bind(this);
            // this.ballMovement = this.ballMovement.bind(this);
        }
        drawBall(color) {
            if (color != undefined) {
                this.ctx.fillStyle = color;
            } else {
                this.ctx.fillStyle = "white";
            }
            this.ctx.beginPath();
            this.ctx.arc(
                pixel2scale(this.x),
                pixel2scale(this.y),
                this.r,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
        }
        checkWallCollision(x, y, r) {
            // if (debug) {
            //     this.drawBall("red"); //debug - circles to light up red when they are close to collision
            // }

            var ballTop = y + r;
            var ballBot = y - r;
            var ballLeft = x - r;
            var ballRight = x + r;

            if (ballBot < 0) {
                this.vy = Math.abs(this.vy) * this.e;
            }
            if (ballTop > maxHeight) {
                this.vy = -Math.abs(this.vy) * this.e;
            }
            if (ballLeft < 0) {
                this.vx = Math.abs(this.vx) * this.e;
            }
            if (ballRight > maxHeight) {
                this.vx = -Math.abs(this.vx) * this.e;
            }
        }

        checkSection(x, y, r) {
            if (debug) {
                // Sections are numbered 1-9 from top left to bottom right
                // |1|2|3|
                // |4|5|6|
                // |7|8|9|
                
                ctx.beginPath();
                ctx.moveTo(canvas.width / 3, 0);
                ctx.lineTo(canvas.width / 3, canvas.height);
                ctx.moveTo((2 * canvas.width) / 3, 0);
                ctx.lineTo((2 * canvas.width) / 3, canvas.height);
                ctx.moveTo(0, canvas.height / 3);
                ctx.lineTo(canvas.height, canvas.height / 3);
                ctx.moveTo(0, (2 * canvas.height) / 3);
                ctx.lineTo(canvas.height, (2 * canvas.height) / 3);
                ctx.strokeStyle = "white";
                ctx.stroke();
            }
       
            var ballTop = y + r;
            var ballBot = y - r;
            var ballLeft = x - r;
            var ballRight = x + r;

            var sectionStrings = [ // need to change this section later in order to allow it to scale. Currently it is hard to create more sections.
                "LT",
                "CT",
                "RT",
                "LC",
                "CC",
                "RC",
                "LB",
                "CB",
                "RB",
            ];

            // need to fix here: make it so balls can be in multiple sections at 1 time... good luck

            var sectionVal = "";
            if (maxHeight >= ballLeft && ballRight > (2 * maxHeight) / 3) {
                sectionVal += "L";
            }
            if ((2 * maxHeight) / 3 >= ballLeft && ballRight > maxHeight / 3) {
                sectionVal += "C";
            }
            if (maxHeight / 3 >= ballLeft && ballRight > 0) {
                sectionVal += "R";
            }
            if (maxHeight >= ballTop && ballBot > (2 * maxHeight) / 3) {
                sectionVal += "T";
            }
            if ((2 * maxHeight) / 3 >= ballTop && ballBot > maxHeight / 3) {
                sectionVal += "C";
            }
            if (maxHeight / 3 >= ballTop && ballBot > 0) {
                sectionVal += "B";
            }

            console.log(sectionVal,ballBot,ballTop)
            sectionVal = sectionStrings.findIndex((sV) => sV == sectionVal);
            sectionArray[sectionVal][sectionArray[sectionVal].length] = this;
        }

        ballMovement() {
            var x = this.x;
            var vx = this.vx;
            var y = this.y;
            var vy = this.vy;
            const gravity = this.gravity;
            var r = this.r;
            r = scale2pixel(r);
            if (y < 5 || y > maxHeight - 5 || x < 5 || x > maxHeight - 5) {
                this.checkWallCollision(x, y, r);
            }
            this.checkSection(x, y, r);

            //modeling gravity -- Y
            this.vy += gravity * (dt / 1000);
            this.y += vy * (dt / 1000);
            y = this.y;

            //x position
            this.x += vx * (dt / 1000);
            x = this.x;
        }
    }

    function drawGame() {
        sectionArray = [[], [], [], [], [], [], [], [], []];
        setTimeout(drawGame, dt);
        clearScreen();

        // we will start with two balls
        if (ballArray.length < 2) {
            // ballArray[0] = new ball(10, 40,vx=10 ,vy=10,30, ctx);
            ballArray[0] = new ball(30, 40,vx=-10 ,vy=-10,25, ctx);
            ballArray[1] = new ball(30, 10,vx=-11 ,vy=10,20, ctx);
        }

        ballArray.forEach(function (item) {
            item.drawBall();
            item.ballMovement();
        });

        checkBallCollision(ballArray,sectionArray)

    }

    function clearScreen() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function checkBallCollision(ballArray,sectionArray){
        for(i=0;i<sectionArray.length;i++){
            if(sectionArray[i].length >= 2){
                if(debug){
                    console.log(`Collision check in ${i}`)
                }
                for(j=0;j<sectionArray[i].length;j++){
                    for(k=0;k<sectionArray[i].length;k++){
                        if(j==k || j > k){
                            continue
                        }
                        if (debug) {
                            sectionArray[i][j].drawBall("red"); //debug - circles to light up red when they are close to collision
                        }
                        ballA = sectionArray[i][j]
                        ballB = sectionArray[i][k]
                        // pos = [[ballA.x,ballB.x], [ballA.y,ballB.y]] //[[ball1x,ball2x],[ball1y,ball2y]]
                        
                        dist = math.norm([(ballA.x - ballB.x),(ballA.y - ballB.y)])
                        systemMass = ballA.mass + ballB.mass
                        console.log(scale2pixel(ballA.r))
                        if (dist < scale2pixel(ballA.r)+scale2pixel(ballB.r)){
                            if(debug){
                                console.log("Collision!")
                            }
                            //angle of hit
                            angle = Math.atan2((ballA.y - ballB.y),(ballA.x - ballB.x))
                            
                            //momentum equation soluton -- not working check here https://www.vobarian.com/collisions/2dcollisions2.pdf
                            // ballA.vx = (ballA.vx*(ballA.mass-ballB.mass) + 2*ballB.mass*ballB.vx)/(systemMass)
                            // ballB.vx = (ballB.vx*(ballB.mass-ballA.mass) + 2*ballA.mass*ballA.vx)/(systemMass)
                            
                            // ballA.vy = (ballA.vy*(ballA.mass-ballB.mass) + 2*ballB.mass*ballB.vy)/(systemMass)
                            // ballB.vy = (ballB.vy*(ballB.mass-ballA.mass) + 2*ballA.mass*ballA.vy)/(systemMass)

                            //need to find tangent and normal vectors (using angle)
                            console.log("Pre")
                            console.log([ballA.vx,ballA.vy],[ballB.vx,ballB.vy])
                            // nrmVect = [Math.sin(angle),Math.cos(angle)]
                            // tanVect = [Math.cos(angle),Math.sin(angle)]
                            n = [ballB.x-ballA.x,ballB.y-ballA.y]   // normal vector
                            un = math.divide(n,math.norm(n))        // unit normal vector

                            nrmVect = un                            // renaming
                            tanVect = [-un[1],un[0]]
                            
                            v1n = math.dot(nrmVect,[ballA.vx,ballA.vy])
                            v2n = math.dot(nrmVect,[ballB.vx,ballB.vy])
                            v1t = math.dot(tanVect,[ballA.vx,ballA.vy])
                            v2t = math.dot(tanVect,[ballB.vx,ballB.vy])
                            
                            // after collision, _ denotes new values
                            v1n_ = (v1n*(ballA.mass-ballB.mass) + 2*ballB.mass*v2n)/(systemMass)
                            v2n_ = (v2n*(ballB.mass-ballA.mass) + 2*ballA.mass*v1n)/(systemMass)
                            v1t_ = v1t
                            v2t_ = v2t

                            // convert scalars back into vectors
                            v1n_vector = math.multiply(v1n_,nrmVect)
                            v1t_vector = math.multiply(v1t_,tanVect)
                            v2n_vector = math.multiply(v2n_,nrmVect)
                            v2t_vector = math.multiply(v2t_,tanVect)
                            
                            v1 = math.add(v1n_vector,v1t_vector)
                            v2 = math.add(v2n_vector,v2t_vector)

                            ballA.vx = v1[0]
                            ballB.vx = v2[0]
                            ballA.vy = v1[1]
                            ballB.vy = v2[1]
                            console.log("Post")
                            console.log(v1,v2)

                        }

                    }
                    
                }
            }
        }
    }


    drawGame();
}
closure();
