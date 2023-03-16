var Ball_mouseDown;
var Ball_mouseUp;
var Ball_mouseMove;

function closure() {
    const canvas = document.getElementById("Ball_game");
    const ctx = canvas.getContext("2d");

    //// sim constants
    const debug = true;
    const fps = 30; // frames per second
    const dt = (1 / fps) * 1000; // milliseconds per frame
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxHeight = 50;
    const collisionSections = 5 // choose sqrt of how many boxes -- 9 sections == 3, 81 sections == 9, etc
    let sectionArray = Array(collisionSections ** 2).fill(0).map(x => Array(0).fill(0))

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
            this.collided = []; // checks if ball has collided in the past frame, and with which ball
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


            var ballTop = y + r;
            var ballBot = y - r;
            var ballLeft = x - r;
            var ballRight = x + r;

            var row = 1;
            var col = 1;
            var sectionsPerRow = (sectionArray.length) ** 0.5
            var sectionSize = maxHeight / sectionsPerRow
            var rowBall = 0;
            var colBall = 0;
            for (const section in sectionArray) {
                if (col > sectionsPerRow) {
                    row++
                    col = 1
                }
                if (row > sectionsPerRow) {
                    row = 1
                    col = 1
                }

                var wallRight = maxHeight - sectionSize * (col - 1)
                var wallLeft = maxHeight - sectionSize * col
                var wallTop = maxHeight - sectionSize * (row - 1)
                var wallBot = maxHeight - sectionSize * row

                if ((ballBot <= wallTop && ballTop > wallBot) && (ballLeft <= wallRight && ballRight > wallLeft)) {
                    var posArray = [row - 1, col - 1]
                    var pos = (posArray[0] * sectionsPerRow + (1 + posArray[1])) - 1
                    if (pos >= 0) {
                        sectionArray[pos][sectionArray[pos].length] = this;
                    }
                }
                // console.log(sectionArray)
                // sectionArray[pos] = [...new Set(sectionArray[pos])];

                col++
                if (debug) {
                    // Sections are numbered 1-9 from top left to bottom right
                    // |1|2|3|
                    // |4|5|6|
                    // |7|8|9|
                    // This is only for 9 boxes (duh!)

                    ctx.beginPath();
                    ctx.moveTo(pixel2scale(wallRight), pixel2scale(wallTop));
                    ctx.lineTo(pixel2scale(wallRight), pixel2scale(wallBot));
                    ctx.moveTo(pixel2scale(wallRight), pixel2scale(wallTop));
                    ctx.lineTo(pixel2scale(wallLeft), pixel2scale(wallTop));
                    ctx.strokeStyle = "white";
                    ctx.stroke();
                }
            }
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
        sectionArray = Array(collisionSections ** 2).fill(0).map(x => Array(0).fill(0))
        setTimeout(drawGame, dt);
        clearScreen();

        // we will start with two balls
        if (ballArray.length < 4) {
            ballArray[0] = new ball(10, 40, vx = 10, vy = 10, 30, ctx);
            ballArray[1] = new ball(30, 40, vx = -10, vy = -10, 25, ctx);
            ballArray[2] = new ball(30, 10, vx = -11, vy = 10, 20, ctx);
            ballArray[3] = new ball(40, 10, vx = -11, vy = 10, 20, ctx);
        }

        ballArray.forEach(function (item) {
            item.drawBall();
            item.ballMovement();
            item.collided = [];
        });

        checkBallCollision(ballArray, sectionArray)

    }

    function clearScreen() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function checkBallCollision(ballArray, sectionArray) {
        loop1:
        for (i = 0; i < sectionArray.length; i++) {
            if (sectionArray[i].length >= 2) {
                if (debug) {
                    console.log(`Collision check in ${i}`)
                }
                loop2:
                for (j = 0; j < sectionArray[i].length; j++) {
                    loop3:
                    for (k = 1; k < sectionArray[i].length; k++) {
                        if (j >= k) {
                            continue
                        }
                        if (debug) {
                            sectionArray[i][j].drawBall("red"); //debug - circles to light up red when they are close to collision
                            sectionArray[i][k].drawBall("blue"); //debug - circles to light up blue when they are close to collision
                        }
                        ballA = sectionArray[i][j]
                        ballB = sectionArray[i][k]
                        // pos = [[ballA.x,ballB.x], [ballA.y,ballB.y]] //[[ball1x,ball2x],[ball1y,ball2y]]

                        dist = math.norm([(ballA.x - ballB.x), (ballA.y - ballB.y)])
                        systemMass = ballA.mass + ballB.mass
                        if (dist < scale2pixel(ballA.r) + scale2pixel(ballB.r)) {
                            if (debug) {
                                console.log("Collision!")
                            }
                            
                            loop4:
                            for (var collision of ballA.collided) {
                                console.log(collision, "and", ballB)
                                if (collision == ballB) {
                                    break loop3;
                                }
                            }

                            //angle of hit
                            angle = Math.atan2((ballA.y - ballB.y), (ballA.x - ballB.x))

                            n = [ballB.x - ballA.x, ballB.y - ballA.y]   // normal vector
                            un = math.divide(n, math.norm(n))        // unit normal vector

                            nrmVect = un                            // renaming
                            tanVect = [-un[1], un[0]]

                            // normal and tangent velocities
                            v1n = math.dot(nrmVect, [ballA.vx, ballA.vy])
                            v2n = math.dot(nrmVect, [ballB.vx, ballB.vy])
                            v1t = math.dot(tanVect, [ballA.vx, ballA.vy])
                            v2t = math.dot(tanVect, [ballB.vx, ballB.vy])

                            // after collision, _ denotes new values
                            v1n_ = (v1n * (ballA.mass - ballB.mass) + 2 * ballB.mass * v2n) / (systemMass)
                            v2n_ = (v2n * (ballB.mass - ballA.mass) + 2 * ballA.mass * v1n) / (systemMass)
                            v1t_ = v1t
                            v2t_ = v2t

                            // convert scalars back into vectors
                            v1n_vector = math.multiply(v1n_, nrmVect)
                            v1t_vector = math.multiply(v1t_, tanVect)
                            v2n_vector = math.multiply(v2n_, nrmVect)
                            v2t_vector = math.multiply(v2t_, tanVect)

                            v1 = math.add(v1n_vector, v1t_vector)
                            v2 = math.add(v2n_vector, v2t_vector)

                            ballA.vx = v1[0]
                            ballA.vy = v1[1]

                            ballB.vx = v2[0]
                            ballB.vy = v2[1]

                            ballA.collided[ballA.collided.length] = ballB
                            ballB.collided[ballB.collided.length] = ballA
                        }

                    }

                }
            }
        }
    }


    drawGame();
}
closure();
