// Things to add:
// Randomize button for radius and color    -- done
// Show collision mesh button               -- done
// Show velocity vectors (maybe...)         -- done
// Show total kinetic energy                -- done
// Mass changing (maybe...)
// Gravity slider (try it out first.. might have issues with stagnation)
// ...


// Sets variable currentTab globally for all scripts. This checkTab function checks which tab 
// is currently open and only runs games in the selected tab. I felt this would help performance, not sure if it does...
let currentTab = "";
function checkTab(name) {
    currentTab = name
    console.log(`Current Tab: ${currentTab}`)
}

function closure() {
    const canvas = document.getElementById("Ball_game");
    const ctx = canvas.getContext("2d");

    // mouse initializations
    let mouseX = 0;
    let mouseY = 0;
    let isDragging = false;
    let isPlacing = false;
    let clicked = false;

    canvas.addEventListener('mousemove', (e) => {
        mouseX = window.event.pageX - canvas.offsetLeft
        mouseY = window.event.pageY - canvas.offsetTop
    },
    )

    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        clicked = true;
    },
    )

    canvas.addEventListener('mouseup', (e) => {
        isDragging = false;
    },
    )

    // canvas coordinates
    cWidth = canvas.width - 100
    cHeight = canvas.height - 100
    const centerX = cWidth / 2;
    const centerY = cHeight / 2;

    //// sim constants
    const debug = false;
    const fps = 60; // frames per second
    const dt = 1 / fps * 1000; // milliseconds per frame
    const maxHeight = 100;
    const gravity = -9.81 // gravity
    const e = .99; // restitution
    const collisionSections = 12 // choose sqrt of how many boxes -- 9 sections == 3, 81 sections == 9, etc
    let sectionArray = Array(collisionSections ** 2).fill(0).map(x => Array(0).fill(0))

    function pixel2scale(pxl) {
        // convert meters to pixels
        return cHeight - (cHeight / maxHeight) * pxl;
    }

    function scale2pixel(scale) {
        // convert pixels to meters
        return scale / (cHeight / maxHeight);
    }

    var ballArray = [];
    class ball {
        // y: positive=down, negative=up
        //
        constructor(x, y, vx, vy, r, ctx) {
            this.ballHue = hue
            this.x = x;
            this.y = y;
            this.xLast = x;
            this.yLast = y;
            this.vx = vx;
            this.vy = vy;
            this.r = r;
            this.ctx = ctx;
            this.mass = mass; // mass, kg
            this.collided = []; // checks if ball has collided in the current frame, and with which ball
            this.collidedPast = []; // checks if ball has collided in the past and current frame, and with which ball
        }


        drawBall(color, last) {
            // if color is not given, draw with white
            if (color != undefined) {
                this.ctx.fillStyle = color;
            } else {
                ctx.fillStyle = `hsl(${this.ballHue},80%,50%)`
            }

            if (last) {
                var x = this.xLast
                var y = this.yLast
            }
            else if (last == undefined || last == false) {
                var x = this.x
                var y = this.y

            }

            this.ctx.beginPath();
            this.ctx.arc(
                pixel2scale(x),
                pixel2scale(y),
                this.r,
                0,
                2 * Math.PI
            );
            this.ctx.fill();
        }
        checkWallCollision(x, y, r) {
            var ballTop = y + r;
            var ballBot = y - r;
            var ballLeft = x - r;
            var ballRight = x + r;

            if (ballBot < 0) {
                this.vy = Math.abs(this.vy) * e;
                this.y = (-ballBot + r)
            }
            if (ballTop > maxHeight) {
                this.vy = -Math.abs(this.vy) * e;
                this.y = 2 * maxHeight - ballTop - r
            }
            if (ballLeft < 0) {
                this.vx = Math.abs(this.vx) * e;
                this.x = (-ballLeft + r)
            }
            if (ballRight > maxHeight) {
                this.vx = -Math.abs(this.vx) * e;
                this.x = 2 * maxHeight - ballRight - r
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
                col++
            }
        }

        ballMovement() {
            var x = this.x;
            var vx = this.vx;
            var y = this.y;
            var vy = this.vy;
            var r = this.r;
            r = scale2pixel(r);
            if (y - r < 5 || y + r > maxHeight || x - r < 5 || x + r > maxHeight) {
                this.checkWallCollision(x, y, r);
            }
            this.checkSection(x, y, r);

            //giving values to last x and y
            this.xLast = x;
            this.yLast = y;

            //modeling gravity -- Y
            this.vy += gravity * (dt / 1000);
            this.y += vy * (dt / 1000);
            y = this.y;

            //x position
            this.x += vx * (dt / 1000);
            x = this.x;
        }
    }

    var frame = 0
    //// basically a main function. Handles all drawing and all functions involved with this
    function drawGame() {
        if (currentTab == "WIP") {
            frame++
            if (frame >= fps) {
                frame = 1
            }

            startTime = performance.now()
            sectionArray = Array(collisionSections ** 2).fill(0).map(x => Array(0).fill(0))
            setTimeout(drawGame, dt);
            clearScreen();

            // // uncomment for a set amount of balls in the frame 
            // if (ballArray.length < 50) {
            //     xRand = (Math.random() * (maxHeight-10))+5
            //     yRand = (Math.random() * (maxHeight-10))+5
            //     vxRand = (Math.random() * 20) - 10
            //     vyRand = (Math.random() * 20) - 10
            //     rRand = (Math.random() * 5) + 5
            //     ballArray[ballArray.length] = new ball(xRand, yRand, vxRand, vyRand, rRand, ctx);
            // }

            ballArray.forEach(function (item) {
                item.drawBall();
                item.ballMovement();
                item.collided = [];
                if (item.collidedPast.length >= 5) {
                    item.collidedPast = [];
                }

            });

            checkBallCollision(ballArray, sectionArray)

            endTime = performance.now()
            valueBorder()
            if (clicked || isPlacing) {
                placeBall(ballDrawing);
                clicked = false;
            }

        }
        else {
            clearScreen()
            setTimeout(drawGame, dt);
        }
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
                            sectionArray[i][j].drawBall("red", true); //debug - circles to light up red when they are close to collision
                            sectionArray[i][k].drawBall("blue", true); //debug - circles to light up blue when they are close to collision
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
                                if (collision == ballB) {
                                    break loop3;
                                }
                            }

                            //angle of hit
                            angle = Math.atan2((ballA.y - ballB.y), (ballA.x - ballB.x))

                            loop5:
                            if (ballA.collidedPast.length >= 1) {
                                for (var collisionPast of ballA.collidedPast.reverse()) {
                                    if (collisionPast == ballB) {
                                        ballA.collidedPast = []
                                        ballB.collidedPast = []
                                        rA = scale2pixel(ballA.r)
                                        rB = scale2pixel(ballB.r)
                                        ballA.x += Math.abs(rA + rB - dist) * Math.cos(angle)
                                        ballA.y += Math.abs(rA + rB - dist) * Math.sin(angle)
                                        break loop3;
                                    }
                                }
                            }

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
                            ballA.collidedPast[ballA.collidedPast.length] = ballB
                            ballB.collidedPast[ballB.collidedPast.length] = ballA
                        }

                    }

                }
            }
        }
    }


    function placeBall(drawMode) {

        if (drawMode && isDragging) {
            initX = canvas2game(mouseX)
            initY = canvas2game(mouseY)
            if (initX > 0 && initY > 0) {
                isPlacing = true
                if (frame % 5 == 0) ballArray[ballArray.length] = new ball(initX, initY, 0, 0, convertRange(sliderVal[0], 410, 490, 10, 30), ctx)
            }
            return
        }

        if (!isPlacing) {
            initX = canvas2game(mouseX)
            initY = canvas2game(mouseY)
            if (initX > 0 && initY > 0) isPlacing = true
            else return;
        }

        if (isDragging) {
            drawFakeBall(pixel2scale(initX), pixel2scale(initY), convertRange(sliderVal[0], 410, 490, 10, 30))
            initVx = -(initX - canvas2game(mouseX))
            initVy = -(initY - canvas2game(mouseY))
            drawVelocityLine(game2canvas(initX), game2canvas(initY), mouseX, mouseY)
        }

        if (!isDragging) {
            ballArray[ballArray.length] = new ball(initX, initY, initVx, initVy, convertRange(sliderVal[0], 410, 490, 10, 30), ctx)
            isPlacing = false
        }
    }

    function drawVelocityLine(x1, y1, x2, y2) {
        ctx.beginPath()
        ctx.strokeStyle = "white";
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
    }

    function drawFakeBall(x, y, r, color) {
        ctx.beginPath();
        ctx.fillStyle = `hsl(${hue},80%,50%)`
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    }

    // draws the mesh used for detecting which balls are close to collision
    drawMesh = false
    function drawCollisionMesh() {
        drawMesh = drawCheckbox(10, cHeight + 10, 20, 20, "Show Mesh", drawMesh)
        if (!drawMesh) { // if checkbox is not toggled, exit function now without drawing mesh
            return
        }
        //  Uses same code as the ball.checkSection method
        var row = 1;
        var col = 1;
        var sectionsPerRow = (sectionArray.length) ** 0.5
        var sectionSize = maxHeight / sectionsPerRow
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
            col++
            ctx.beginPath();
            ctx.moveTo(pixel2scale(wallRight), pixel2scale(wallTop));
            ctx.lineTo(pixel2scale(wallRight), pixel2scale(wallBot));
            ctx.moveTo(pixel2scale(wallRight), pixel2scale(wallTop));
            ctx.lineTo(pixel2scale(wallLeft), pixel2scale(wallTop));
            ctx.strokeStyle = "white";
            ctx.stroke();
        }
    }

    var drawVV = false
    function drawVelocityVectors(item, draw) {
        if (!draw) {
            drawVV = drawCheckbox(10, cHeight + 40, 20, 20, "Show Velocity", drawVV)
        }

        if (!drawVV || !item) return
        ctx.beginPath()
        ctx.moveTo(game2canvas(item.x), game2canvas(item.y))
        ctx.lineTo(game2canvas(item.x) - item.vx, game2canvas(item.y) - item.vy)
        ctx.strokeStyle = "white"
        ctx.stroke()
        ctx.closePath()
    }

    ballDrawing = false
    function toggleDrawMode() {
        ballDrawing = drawCheckbox(10, cHeight + 70, 20, 20, "Draw Mode", ballDrawing)

        if (!ballDrawing) return

        // placeBall()

    }

    function drawTotalKE(item, sigKE, draw) {
        // Calculate total KE

        if (!draw) {
            ctx.fillStyle = `white`
            ctx.fillText(`\u03A3 Kinetic Energy = ${round(sigKE, 0) / 1000} kJ`, 150, cHeight + 24)
        }
        if (!item) return

        sigKE += 0.5 * item.mass * (item.vx ** 2 + item.vy ** 2)
        return sigKE
    }

    // Draw the outer wall that separates the values and sliders from the game area
    function valueBorder() {
        ctx.beginPath()
        //main border
        ctx.moveTo(cWidth, 0)
        ctx.lineTo(cWidth, cHeight)
        ctx.lineTo(0, cHeight)
        //sub-border (details)
        ctx.moveTo(140, cHeight)
        ctx.lineTo(140, canvas.height)

        ctx.strokeStyle = "white"
        ctx.stroke()
        ctx.closePath()

        //Drawing everything that goes in the border
        fpsCounter(endTime - startTime)
        ballCustomizer()
        clearBalls()
        drawCollisionMesh()
        toggleDrawMode()

        // checks if the items have already been drawn once in the loop so we dont draw it mulitple times
        drawOnce = false
        sigKE = 0   // init sigKE to 0 every frame
        // Below I really didn't want to loop for 2 function by themselves so I made these complicated setups to do that. I am not sure how much fast it is but one loop > two loops
        if (!ballArray.length) {
            drawVelocityVectors(false, drawOnce)
            drawTotalKE(false, sigKE, drawOnce)
        }
        for ([idx, item] of ballArray.entries()) {
            drawVelocityVectors(item, drawOnce)  // loop for this
            sigKE = drawTotalKE(item, sigKE, true) // loop for this
            if (idx == ballArray.length - 1) {
                sigKE = drawTotalKE(item, sigKE, false) // loop for this
            }
            drawOnce = true
            // console.log(sigKE)
        }
    }

    function slider(sliderPosition, squareSize, sliderVal, sliderArray, sliderIndex, horizontal) {
        x1 = sliderPosition[0]
        x2 = sliderPosition[1]
        y1 = sliderPosition[2]
        y2 = sliderPosition[3]


        // Making Slider Line
        ctx.strokeStyle = `white`
        ctx.fillStyle = `white`
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.closePath()
        ctx.stroke()

        if (horizontal) {
            sliderValArray = [sliderVal, (y2 - y1) / 2 - squareSize / 2]
            // Mouse movement and dragging for horizontal slider
            if (isDragging && (mouseX > x1 && mouseX < x2)) {
                if ((((mouseY > y1 - squareSize / 2 && mouseY < y2 + squareSize / 2) && clicked) || sliderArray[sliderIndex])) {
                    sliderArray[sliderIndex] = true
                    sliderVal = mouseX - 5
                }
            }
            else if (!isDragging) {
                sliderArray[sliderIndex] = false
            }

            ctx.fillRect(sliderVal, y1 - squareSize / 2, squareSize, squareSize)
            return sliderArray, sliderVal
        } else {
            sliderValArray = [(x2 - x1) / 2 - squareSize / 2, sliderVal]
            // Mouse movement and dragging for vertical slider
            if (isDragging && (mouseY > y1 && mouseY < y2)) {
                if ((((mouseX > x1 - squareSize / 2 && mouseX < x2 + squareSize / 2) && clicked) || sliderArray[sliderIndex])) {
                    sliderArray[sliderIndex] = true
                    sliderVal = mouseY - 5
                }
            }
            else if (!isDragging) {
                sliderArray[sliderIndex] = false
            }
            ctx.fillRect(x1 - squareSize / 2, sliderVal, squareSize, squareSize)
            return sliderArray, sliderVal
        }
    }


    //// Under here are the functions that will go in the valueBorder area
    var sliderVal = [445, 445, 445, cHeight + 45] // sets default slider values for [radius,color]
    sliderSelect = [false, false, false, false] // sets whether or not slider is selected 
    hue = convertRange(sliderVal[1], 410, 490, 0, 300)
    function ballCustomizer() {

        convertedRadius = round(convertRange(sliderVal[0], 406, 484, 10, 30),0)
        hue = round(convertRange(sliderVal[1], 406, 484, 0, 300),0)
        mass = round(convertRange(sliderVal[2], 406, 484, 5, 55),0)
        
        // drawing a ball over the customization sliders
        drawFakeBall(450, 55, convertedRadius)
        
        // slider creation
        sliderSelect, sliderVal[0] = slider([410, 490, 110, 110], squareSize = 10, sliderVal[0], sliderSelect, sliderIndex = 0, true)
        sliderSelect, sliderVal[1] = slider([410, 490, 140, 140], squareSize = 10, sliderVal[1], sliderSelect, sliderIndex = 1, true)
        sliderSelect, sliderVal[2] = slider([410, 490, 170, 170], squareSize = 10, sliderVal[2], sliderSelect, sliderIndex = 2, true)
        
        // adding text.. could have done this in the function, but I think it is already getting a bit heavy on the parameters + not sure how I would place them in a vertical slider
        ctx.font = "12px monospace"
        ctx.fillText(`Radius: ${convertedRadius}`,450,100)
        ctx.fillText(`Hue: ${hue}`,450,130)
        ctx.fillText(`Mass: ${mass}`,450,160)
        
        
        // sliderSelect, sliderVal[2] = slider(x1 = 350, x2 = 350, y1 = cHeight+10, y2 = cHeight+90, squareSize = 10, sliderVal[2], sliderSelect, sliderIndex = 2, false)
        
        
        // Redrawing color square to make it colorful!
        ctx.fillStyle = `hsl(${hue},80%,50%)`
        ctx.fillRect(sliderVal[1], 135, 10, 10)
    }

    function clearBalls() {

        ctx.fillStyle = `rgba(80,60,60,0.5)`
        if ((mouseX > cWidth && mouseY > cHeight)) {
            ctx.fillStyle = `rgba(200,60,60,0.5)`
            if (clicked) {
                ballArray = []
            }
        }
        ctx.strokeStyle = `grey`
        ctx.beginPath()
        ctx.rect(cWidth, cHeight, 100, 100)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()

        ctx.fillStyle = `white`
        ctx.textAlign = "center"
        ctx.font = "24px monospace"
        ctx.fillText("CLEAR", cWidth + 50, cHeight + 56)
    }

    function fpsCounter(timeDiff) {
        calcFPS = 1000 / (timeDiff + dt)
        if (calcFPS > fps) {
            calcFPS = fps
        }
        ctx.font = "16px monospace";
        ctx.textAlign = "center"
        ctx.fillStyle = "white"
        ctx.fillText(`FPS : ${round(calcFPS, 0)}`, cWidth + 50, 15)
    }

    // Simpler rounding function than the Math.round()
    function round(x, sigfigs) {
        return Math.round(x * 10 ** sigfigs) / 10 ** sigfigs;
    };

    // Assumes play area is a square
    function canvas2game(x) {
        return maxHeight - (x / cWidth) * maxHeight
    }
    function game2canvas(x) {
        return cWidth - (x / maxHeight) * cWidth
    }
    // Converts one range to another ie with the radius slider, 410-490 => 10-30
    function convertRange(oldValue, oldMin, oldMax, newMin, newMax) {
        oldRange = oldMax - oldMin
        newRange = newMax - newMin
        newValue = newMin + (((oldValue - oldMin) * newRange) / oldRange)
        return newValue
    }

    function drawCheckbox(x, y, w, h, text, toggle) {
        ctx.beginPath()
        ctx.fillStyle = "grey"
        ctx.roundRect(x, y, w, h, 5)
        ctx.fill()
        ctx.fillStyle = "white"
        ctx.font = "12px monospace"
        ctx.textAlign = "left"
        ctx.fillText(text, 40, y + 14)
        ctx.closePath()

        //check if clicked
        if (checkClickZone(x, y, w, h) || toggle) {
            ctx.beginPath()
            ctx.fillStyle = "white"
            ctx.roundRect(x, y, w, h, 5)
            ctx.fill()
            ctx.closePath()

            if (toggle) {
                ctx.beginPath()
                ctx.strokeStyle = "blue"
                ctx.moveTo(x + 4, y + 9)
                ctx.lineTo(x + 8, y + 13)
                ctx.lineTo(x + 16, y + 5)
                ctx.lineWidth = "3"
                ctx.stroke()
                ctx.closePath()
                ctx.lineWidth = "1" // revert back or else all lines mess up
            }

            if (clicked && checkClickZone(x, y, w, h)) {
                if (toggle) toggle = false
                else toggle = true
            }
        }
        return toggle
    }

    function checkClickZone(x, y, w, h) {
        return ((mouseX > x && mouseX < x + w) && (mouseY > y && mouseY < y + h))
    }

    drawGame();
}
closure();