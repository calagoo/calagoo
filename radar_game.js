currentTab = "";
function checkTab(name){
    currentTab = name
    console.log(`Current Tab: ${currentTab}`)
}

function closure() {
    const canvas = document.getElementById("radar_game");
    const ctx = canvas.getContext("2d");

    // https://www.youtube.com/watch?v=TOEi6T2mtHo&t=654s
    // https://www.radartutorial.eu/01.basics/Radar%20Cross%20Section.en.html

    class Boundary {
        constructor(x1, y1, x2, y2,type = "int") {
            this.a = { x: x1, y: y1 };
            this.b = { x: x2, y: y2 };
            this.type = type
            this.offsetX = 0
            this.offsetY = 0
        }

        show() {
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.moveTo(this.a.x, this.a.y);
            ctx.lineTo(this.b.x, this.b.y);
            ctx.stroke();
            ctx.closePath();
        }

        update() {
            if (this.type == "ext") {
                return;
            }
            this.a.x += this.offsetX
            this.b.x += this.offsetX
            this.a.y += this.offsetY
            this.b.y += this.offsetY

        }
    }

    class Dish {
        constructor(x, y) {
            this.pos = { x: x, y: y }
            this.rays = []
            this.centerX = canvas.width / 2;
            this.centerY = canvas.height / 2;
            this.calculateRectangle();
            this.raynum = 9;
            this.avgSpeed = [];
            for (let i = 0; i <= this.raynum; i += 1) {
                this.rays.push(new Ray({ x:0, y:0 },0,i))
            }
        }
        
        show() {
                    
            ctx.save(); // Save the current context state
        
            // Draw the rotating rectangle
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 5; // Set the stroke width
            ctx.moveTo(this.rect.x1, this.rect.y1);
            ctx.lineTo(this.rect.x2, this.rect.y2);
            ctx.stroke();
            ctx.closePath();
        
            // Draw the arc
            ctx.beginPath();
            ctx.fillStyle = "white";
            ctx.arc(this.pos.x, this.pos.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        
            ctx.restore(); // Restore the context to its original state
        }

        updateRays() {
            this.rays = [];
            for (let i = 0; i <= this.raynum; i += 1) {
                this.rays.push(new Ray({ x:0, y:0 },0,i))
            }
        }

        look(boundaries,radarView,bounce) {
            for (let ray of this.rays) {
                let closest = null;
                let record = Infinity;
                let closestBoundary = null; // Store the closest boundary
        
                for (let boundary of boundaries) {
                    const pt = ray.cast(boundary);
                    if (pt) {
                        let dist = Math.sqrt(Math.pow((pt.x - ray.pos.x), 2) + Math.pow((pt.y - ray.pos.y), 2));
                        if (dist < record) {
                            record = dist;
                            closest = pt;
                            closestBoundary = boundary;
                        }
                    }
                }

                if (closest && isMouseOnCanvas && !radarView) {
                    // Draw the initial ray
                    if(bounce == 0){
                        ctx.beginPath();
                        ctx.strokeStyle = "white";
                        ctx.moveTo(ray.pos.x, ray.pos.y);
                        ctx.lineTo(closest.x, closest.y);
                        ctx.stroke();
                        ctx.closePath();
                    }
                }
            }
            for (let ray of this.rays) {
                let closest = null;
                let record = Infinity;
                let closestBoundary = null; // Store the closest boundary
                let ext = false;
                for (let boundary of boundaries) {
                    const pt = ray.cast(boundary);
                    if (pt) {
                        let dist = Math.sqrt(Math.pow((pt.x - ray.pos.x), 2) + Math.pow((pt.y - ray.pos.y), 2));
                        if (dist < record) {
                            record = dist;
                            closest = pt;
                            closestBoundary = boundary;
                            if (boundary.type == "ext"){
                                ext = true
                            }
                        }
                    }
                }
                
                if (closest && isMouseOnCanvas) {
                    if (ext){
                        continue
                    }
                    // Check for bounce
                    if (ray.bounce(closestBoundary, closest) && closestBoundary.type != "ext") {
                        let bouncedRecord = Infinity;
                        let bouncedClosest = null;
                        let bouncedClosestBoundary = null;
                        const dishxy = { a: { x: this.rect.x1, y: this.rect.y1 }, b: { x: this.rect.x2, y: this.rect.y2 }};
                        
                        // Check for intersection with each boundary
                        for (let boundary of boundaries) {
                            const pt = ray.cast(boundary);
                            const pt2 = ray.cast(dishxy)
                            if (pt && !pt2 && !radarView) {
                                let dist = Math.sqrt(Math.pow((pt.x - closest.x), 2) + Math.pow((pt.y - closest.y), 2));
                                if (dist < bouncedRecord) {
                                    bouncedRecord = dist;
                                    bouncedClosest = pt;
                                    bouncedClosestBoundary = boundary;
                                    if (bouncedClosest) {
                                        ctx.save();
                                        ctx.beginPath();
                                        ctx.strokeStyle = "green";
                                        ctx.moveTo(closest.x, closest.y);
                                        ctx.lineTo(bouncedClosest.x, bouncedClosest.y);
                                        ctx.stroke();
                                        ctx.restore();
                                    }
                                }
                            }
                        }
        
                        const dishxyPoint = ray.cast(dishxy);
                        if (dishxyPoint) {
                            let dishxyDist = Math.sqrt(Math.pow((dishxyPoint.x - closest.x), 2) + Math.pow((dishxyPoint.y - closest.y), 2));
                            if (dishxyDist < bouncedRecord) {
                                // Draw to axy if it's closer
                                bouncedClosest = dishxyPoint;
                                bouncedClosestBoundary = dishxy;
                                // Draw the bounced ray
                                if (bouncedClosest) {
                                    let dist = Math.sqrt(Math.pow((dishxyPoint.x - closest.x), 2) + Math.pow((dishxyPoint.y - closest.y), 2));
                                    let distEstimate = ((record + dist))
                                    ray.dist.push(distEstimate)
                                    if (ray.dist.length >= 2){
                                        this.avgSpeed.push((ray.dist[1] - ray.dist[0])/0.016666666);
                                        if(this.avgSpeed.length >2){
                                            this.avgSpeed.shift()
                                        }
                                        ray.dist.shift();
                                    }
                                    ctx.save();
                                    ctx.beginPath();
                                    ctx.strokeStyle = "red";
                                    ctx.lineWidth = 2; // Set the stroke width
                                    ctx.moveTo(closest.x, closest.y);
                                    ctx.lineTo(bouncedClosest.x, bouncedClosest.y);
                                    ctx.stroke();
                                    ctx.restore();
                                }
                            }
                        }
        
                    }
                }
            }
        }
        
        calculateRectangle() {
            this.angle = Math.atan2((this.pos.y - this.centerY), this.pos.x - this.centerX);
            this.dist = Math.sqrt(Math.pow((this.centerX - this.pos.x), 2) + Math.pow((this.centerY - this.pos.y), 2));
            this.dist -= 20; // Adjust the distance if necessary
            this.rectW = 50;

            this.rect = {
                x1: (this.dist * Math.cos(this.angle)) + this.centerX  + (this.rectW * Math.cos(this.angle + Math.PI/2)),
                y1: (this.dist * Math.sin(this.angle)) + this.centerY  + (this.rectW * Math.sin(this.angle + Math.PI/2)),
                x2: (this.dist * Math.cos(this.angle)) + this.centerX  + (this.rectW * Math.cos(this.angle - Math.PI/2)),
                y2: (this.dist * Math.sin(this.angle)) + this.centerY  + (this.rectW * Math.sin(this.angle - Math.PI/2))
            };
        }

        update(x,y) {
            // Check if the mouse is inside the canvas
            if (isMouseOnCanvas) {
                this.pos.x = x;
                this.pos.y = y;
                this.calculateRectangle();
                for (let ray of this.rays) {
                    ray.pos.x = (this.rect.x1 + ray.index/this.raynum * (this.rect.x2 - this.rect.x1))
                    ray.pos.y = (this.rect.y1 + ray.index/this.raynum * (this.rect.y2 - this.rect.y1))
                    ray.dir.x = -Math.cos(this.angle);
                    ray.dir.y = -Math.sin(this.angle);
                    ray.bounces = 0;
                }
            }
        }
    }

    class Ray {
        constructor(pos, angle, index=0) {
            this.pos = pos;
            this.dir = { x: Math.cos(angle), y: Math.sin(angle) };
            this.mag = 100 // for drawing only
            this.index = index
            this.bounces = 0 // amount of bounces
            this.dist = [];
        }

        lookAt(x, y) {
            this.dir.x = (x - this.pos.x)
            this.dir.y = (y - this.pos.y)
            let length = Math.sqrt(this.dir.x * this.dir.x + this.dir.y * this.dir.y);
            if (length != 0) {
                this.dir.x /= length
                this.dir.y /= length
            }
        }

        show() {
            ctx.save()
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.translate(this.pos.x, this.pos.y)
            ctx.moveTo(0, 0);
            ctx.lineTo(this.dir.x * this.mag, this.dir.y * this.mag);
            ctx.stroke();
            ctx.restore()
        }

        cast(boundary) {
            // Using: https://en.wikipedia.org/wiki/Line%E2%80%93line_intersection

            // Line segment 1
            const x1 = boundary.a.x;
            const y1 = boundary.a.y;
            const x2 = boundary.b.x;
            const y2 = boundary.b.y;
            
            // Line segment 2
            const x3 = this.pos.x;
            const y3 = this.pos.y;
            const x4 = this.pos.x + this.dir.x;
            const y4 = this.pos.y + this.dir.y;

            // So wiki formula matches

            // Denominator
            const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
            if (den == 0) {
                return;
            }

            const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
            const u = -((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / den;

            if (t > 0 && t < 1 && u < 0) {
                const pt = { x: null, y: null };
                pt.x = x1 + t * (x2 - x1)
                pt.y = y1 + t * (y2 - y1)
                return pt;
            } else {
                return;
            }
        }

        bounce(boundary,pt) {
            // Calculate normal to the boundary
            let boundaryDir = { x: boundary.b.x - boundary.a.x, y: boundary.b.y - boundary.a.y };
            let normal = { x: -boundaryDir.y, y: boundaryDir.x };
        
            // Normalize the normal vector
            let length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
            normal.x /= length;
            normal.y /= length;
        
            // Reflect the ray's direction across the normal
            let dot = 2 * (this.dir.x * normal.x + this.dir.y * normal.y);
            this.dir.x -= dot * normal.x;
            this.dir.y -= dot * normal.y;

            // Set the ray's position to the point of reflection
            this.pos.x = pt.x;
            this.pos.y = pt.y;
        
            // Move the ray's position by 1 unit in its facing direction, this stops it from hitting the same wall after bouncing
            this.pos.x += this.dir.x;
            this.pos.y += this.dir.y;

            // Mark the ray as bounced
            this.bounces += 1;
            return true
        }
    }

    class Slider {
        constructor(x, y, w, h) {
            this.x = x;
            this.y = y;
            this.width = w === 0 ? 2 : w; // Ensure a minimum width for vertical sliders
            this.height = h === 0 ? 2 : h; // Ensure a minimum height for horizontal sliders
            this.isVertical = w === 0;
            this.value = 0; // Initial value
            this.isDragging = false; // Flag to track if the handle is being dragged
        }
    
        update(mouseX, mouseY, mousePressed) {
            if (mousePressed && this.isMouseOver(mouseX, mouseY)) {
                this.isDragging = true;
            } else if (!mousePressed) {
                this.isDragging = false;
            }
    
            if (this.isDragging) {
                if (this.isVertical) {
                    // Calculate the value for a vertical slider
                    this.value = (mouseY - this.y) / this.height;
                } else {
                    // Calculate the value for a horizontal slider
                    this.value = (mouseX - this.x) / this.width;
                }
    
                // Clamp the value between 0 and 1
                this.value = Math.max(0, Math.min(1, this.value));
            }
        }
    
        isMouseOver(mouseX, mouseY) {
            // Calculate handle position
            let handleX = this.isVertical ? this.x - this.width * 2.5 : this.x + this.value * this.width;
            let handleY = this.isVertical ? this.y + this.value * this.height : this.y - this.height * 5;
            let handleWidth = this.isVertical ? this.width * 5 : this.width / 10;
            let handleHeight = this.isVertical ? this.height / 10 : this.height * 10;
    
            // Check if the mouse is over the handle
            return mouseX >= handleX && mouseX <= handleX + handleWidth &&
                   mouseY >= handleY && mouseY <= handleY + handleHeight;
        }
    
        draw(ctx) {
            // Draw the slider
            ctx.save();
            ctx.fillStyle = 'lightgray';
            ctx.fillRect(this.x, this.y, this.width, this.height);
    
            // Draw the slider handle
            let handlePos;
            if (this.isVertical) {
                handlePos = this.y + this.value * this.height;
                ctx.fillRect(this.x - this.width * 2.5, handlePos, this.width * 5, this.height / 10); // Handle for vertical slider
            } else {
                handlePos = this.x + this.value * this.width;
                ctx.fillRect(handlePos, this.y - this.height * 5, this.width / 10, this.height * 10); // Handle for horizontal slider
            }
    
            ctx.restore();
        }
    
        getValue() {
            return this.value;
        }
    }

    let mouseX = -1;
    let mouseY = -1;
    canvas.addEventListener('mousemove', function (event) {
        var rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });

    isMouseOnCanvas = false;
    // Event listener for mouseenter
    canvas.addEventListener('mouseenter', function () {
        isMouseOnCanvas = true;
    });

    // Event listener for mouseleave
    canvas.addEventListener('mouseleave', function () {
        isMouseOnCanvas = false;
        mousePressed = false;
    });

    let mousePressed = false;

    canvas.addEventListener('mousedown', function () {
        mousePressed = true;
        
        // Checking if shape box is changed
        // left triangle
        if (mouseX > 320 && mouseX < 335 && mouseY > 420 && mouseY < 450) {
            wallIndex -= 1;
            if (wallIndex < 0) {
                wallIndex += wallKeys.length; // Wrap around to the end of the array
            }
        } 
        // right triangle
        if (mouseX > 465 && mouseX < 480 && mouseY > 420 && mouseY < 450) {
            wallIndex += 1;
        }
        wallIndex = wallIndex % wallKeys.length; // Ensure the index stays within bounds
        
        // Checking if radarView is checked        roundRectangle(320,460,20,20,7)
        if (mouseX > 320 && mouseX < 340 && mouseY > 460 && mouseY < 480) {
            if (radarView){
                radarView = false
            }else{
                radarView = true
            }
        }

    });
    
    canvas.addEventListener('mouseup', function () {
        mousePressed = false;
    });

    let wallSet = {airliner:[],fighter:[], circle:[],triangle:[],invTriangle:[],moving:[]}
    let wallIndex = 0;
    let wallKeys = Object.keys(wallSet);
    let dish;
    let sliderRays;
    let sliderBounces;
    let radarView = false;

    let centerX = canvas.width/2
    let centerY = canvas.height/2

    function setup() {

        // airline jet
        // fuselage
        wallSet.airliner.push(new Boundary(centerX+50,centerY+5,centerX+40,centerY+7))
        wallSet.airliner.push(new Boundary(centerX+50,centerY,centerX+50,centerY+5))
        wallSet.airliner.push(new Boundary(centerX+50,centerY,centerX+45,centerY-10))
        wallSet.airliner.push(new Boundary(centerX+45,centerY-10,centerX+35,centerY-15))
        wallSet.airliner.push(new Boundary(centerX+35,centerY-15,centerX+25,centerY-15))
        wallSet.airliner.push(new Boundary(centerX+25,centerY-15,centerX+15,centerY-20))
        wallSet.airliner.push(new Boundary(centerX+15,centerY-20,centerX+10,centerY-22))
        wallSet.airliner.push(new Boundary(centerX+10,centerY-22,centerX-100,centerY-22))
        wallSet.airliner.push(new Boundary(centerX-100,centerY-22,centerX-110,centerY-25))
        wallSet.airliner.push(new Boundary(centerX-110,centerY-24,centerX-130,centerY-50))
        wallSet.airliner.push(new Boundary(centerX-130,centerY-50,centerX-140,centerY-50))
        wallSet.airliner.push(new Boundary(centerX-140,centerY-50,centerX-130,centerY-10))
        wallSet.airliner.push(new Boundary(centerX-130,centerY-10,centerX-100,centerY))
        wallSet.airliner.push(new Boundary(centerX-100,centerY,centerX-60,centerY+7))
        wallSet.airliner.push(new Boundary(centerX-60,centerY+7,centerX-42,centerY+7))
        wallSet.airliner.push(new Boundary(centerX-42,centerY+7,centerX+40,centerY+7))
        // wing/engine
        wallSet.airliner.push(new Boundary(centerX-50,centerY-12,centerX-10,centerY-12))
        wallSet.airliner.push(new Boundary(centerX-55,centerY-12-5,centerX-15,centerY-12-5))
        wallSet.airliner.push(new Boundary(centerX-55,centerY-12-5,centerX-50,centerY-12))
        wallSet.airliner.push(new Boundary(centerX-15,centerY-12-5,centerX-10,centerY-12))
        wallSet.airliner.push(new Boundary(centerX-22,centerY-12,centerX-42,centerY-12))
        wallSet.airliner.push(new Boundary(centerX-22,centerY-12+12,centerX-42,centerY-12+12))
        wallSet.airliner.push(new Boundary(centerX-22,centerY-12,centerX-22,centerY-12+12))
        wallSet.airliner.push(new Boundary(centerX-42,centerY-12,centerX-42,centerY-12+12))
        
        // fighter jet
        wallSet.fighter.push(new Boundary(centerX+50,centerY,centerX+20,centerY-10))
        wallSet.fighter.push(new Boundary(centerX+20,centerY-10,centerX-10,centerY-8))
        wallSet.fighter.push(new Boundary(centerX-10,centerY-8,centerX-50,centerY-8))
        wallSet.fighter.push(new Boundary(centerX-50,centerY-8,centerX-80,centerY-30))
        wallSet.fighter.push(new Boundary(centerX-80,centerY-30,centerX-80,centerY))
        wallSet.fighter.push(new Boundary(centerX-80,centerY,centerX-50,centerY+5))
        wallSet.fighter.push(new Boundary(centerX-50,centerY+5,centerX-20,centerY+5))
        wallSet.fighter.push(new Boundary(centerX-20,centerY+5,centerX+40,centerY+5))
        wallSet.fighter.push(new Boundary(centerX+40,centerY+5,centerX+50,centerY))

        // circle
        const numSegments = 25
        const radius = 25
        let angleStep = Math.PI * 2 / numSegments;

        for (let i = 0; i < numSegments; i++) {
            // Calculate start point
            let x1 = centerX + radius * Math.cos(angleStep * i);
            let y1 = centerY + radius * Math.sin(angleStep * i);
    
            // Calculate end point
            let x2 = centerX + radius * Math.cos(angleStep * (i + 1));
            let y2 = centerY + radius * Math.sin(angleStep * (i + 1));
    
            // Create a boundary for this segment
            wallSet.circle.push(new Boundary(x1, y1, x2, y2));
        }

        // Triangle
        wallSet.triangle.push(new Boundary(centerX + 50,centerY+20,centerX - 50,centerY+20))
        wallSet.triangle.push(new Boundary(centerX + 50,centerY+20,centerX-1,centerY-50))
        wallSet.triangle.push(new Boundary(centerX-1,centerY - 50 ,centerX - 50,centerY+20))
        // Inverse 
        wallSet.invTriangle.push(new Boundary(centerX + 50,centerY+20,centerX - 50,centerY+20))
        wallSet.invTriangle.push(new Boundary(centerX + 50,centerY+20,centerX-1,centerY-50))

        // Moving rect
        // Create a boundary for this segment
        wallSet.moving.push(new Boundary(centerX-25,centerY-25,centerX+25,centerY-25));
        wallSet.moving.push(new Boundary(centerX+25,centerY-25,centerX+25,centerY+25));
        wallSet.moving.push(new Boundary(centerX-25,centerY+25,centerX+25,centerY+25));
        wallSet.moving.push(new Boundary(centerX-25,centerY+25,centerX-25,centerY-25));
        
        
        // Exterior walls
        for (let shape in wallSet){
            wallSet[shape].push(new Boundary(0,0,canvas.width,0,"ext")) // top
            wallSet[shape].push(new Boundary(canvas.width,0,canvas.width,canvas.height,"ext")) // right
            wallSet[shape].push(new Boundary(0,canvas.height,canvas.width,canvas.height,"ext")) // bottom
            wallSet[shape].push(new Boundary(0,0,0,canvas.height,"ext")) // left
        }

        // ray = new Ray(100, 200);
        dish = new Dish(100,200);
        sliderRays = new Slider(25,425,100,0)
        sliderBounces = new Slider(25,475,100,0)
    }
    
    let wallMoveIndex = 0;
    let i = 0;

    let last_mouseX;
    let last_mouseY;
    let ticks = 0;
    let relSpeed = 0;
    let bounces = 0;
    function drawGame() {
        setTimeout(drawGame, 16.666); // Approximately 60 frames per second
        clearScreen();
        i += Math.PI/100;
        i = i%(Math.PI*2);
        for (let wall of wallSet[wallKeys[wallIndex]]) {
            if(!radarView){
                wall.show();
            }
            if (wallKeys[wallIndex] == "moving") {
                wall.offsetX = 4*(Math.sin(i))**3;
                wall.offsetY = 0;
                wall.update();
            } else {
                wall.offsetX = 0;
                wall.offsetY = 0;
            }
        }    
        wallMoveIndex += 1;
        dish.show();
        for (let b = 0; b<bounces; b++){
            dish.look(wallSet[wallKeys[wallIndex]],radarView,b);
        }
        dish.raynum = Math.round(sliderRays.value*40 + 10);
        bounces = Math.round(sliderBounces.value*5+1);
        if (ticks%2){
            dish.updateRays(mouseX,mouseY,last_mouseX,last_mouseY);
        }
        dish.update(mouseX,mouseY);
        last_mouseX = mouseX;
        last_mouseY = mouseY;
        bottomBar();

        relSpeed = Math.round(sum(dish.avgSpeed)/dish.avgSpeed.length);
        if (isNaN(relSpeed)){
            relSpeed = 0;
        }

        radarView = radarViewCheckbox(radarView)
        sliderRays.update(mouseX,mouseY,mousePressed)
        sliderRays.draw(ctx)
        sliderBounces.update(mouseX,mouseY,mousePressed)
        sliderBounces.draw(ctx)
        
        wallIndex = shapeBox(Object.keys(wallSet),wallIndex)
        
        ctx.font = '20px Arial'; // Font size and type
        ctx.fillStyle = 'white'; // Text color
        ctx.textAlign = 'left'; // Alignment of text
        ctx.fillText("Relative Speed: " + relSpeed, 295, 30);
        ctx.fillText("Radar Sim", 10, 30);
        ctx.textAlign = 'center'; // Alignment of text
        ctx.fillText("Beams", 200, 432);
        ctx.fillText(dish.raynum, 155, 432);
        ctx.fillText("Bounces", 208, 482);
        ctx.fillText(bounces, 155, 482);
        ticks ++
        ticks %= 60
    }

    function clearScreen() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    function shapeBox(keys,index) {
        // Draw left arrow
        ctx.fillStyle = "white"
        ctx.beginPath();
        ctx.moveTo(335, 450);
        ctx.lineTo(320, 435);
        ctx.lineTo(335, 420);
        ctx.fill();
        
        // Draw right arrow
        ctx.beginPath();
        ctx.moveTo(465, 450);
        ctx.lineTo(480, 435);
        ctx.lineTo(465, 420);
        ctx.fill();
        
        // Draw box
        ctx.strokeRect(340, 420, 120, 30);
        
        ctx.font = '20px Arial'; // Font size and type
        ctx.fillStyle = 'white'; // Text color
        ctx.textAlign = 'center'; // Alignment of text
        // let shapeString = 'Circle'
        let shapeString = keys[index]
        ctx.fillText(shapeString.charAt(0).toUpperCase() + shapeString.slice(1), 350+100/2, 441);
        return index
    }

    function radarViewCheckbox(radarView){
        // Draw box
        if (radarView){
            ctx.fillStyle = "red"
        }else{
            ctx.fillStyle = "white"
        }
        roundRectangle(320,460,20,20,7)
        ctx.font = '20px Arial'; // Font size and type
        ctx.fillStyle = 'white'; // Text color
        ctx.textAlign = 'left'; // Alignment of text
        ctx.fillText("Radar View", 345,477);
        return radarView;
        }

    function bottomBar() {
        ctx.save()
        ctx.beginPath()
        ctx.fillStyle = "black";
        ctx.strokeStyle = "white"
        ctx.rect(0, 400, canvas.width, canvas.height);
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
        ctx.restore()

        // Adding a top bar too
        ctx.save()
        ctx.beginPath()
        ctx.fillStyle = "black";
        ctx.strokeStyle = "white"
        ctx.rect(0, 0, canvas.width, 50);
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
    }
    function roundRectangle(x, y, w, h, r) {
        // roundRect() does not work on some browsers (early safari and ALL firefox) so I created my own rounded rectangle function 
        ctx.beginPath()
        //seg 1
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y)
        //curve 1
        ctx.quadraticCurveTo(x + w, y, x + w, y+r);

        //seg 2
        ctx.lineTo(x + w, y + h - r)
        //curve 2
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

        //seg 3
        ctx.lineTo(x + r, y + h)
        //curve 3
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);

        //seg 4
        ctx.lineTo(x, y + r)
        //curve 4
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath()
        ctx.fill();
    }

    function sum(arr) {
        return arr.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    }

    setup();
    drawGame();
}

closure();
