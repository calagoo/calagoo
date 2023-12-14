currentTab = "";
function checkTab(name){
    currentTab = name
    console.log(`Current Tab: ${currentTab}`)
}

function closure() {
    const canvas = document.getElementById("InProg");
    const ctx = canvas.getContext("2d");

    // https://www.youtube.com/watch?v=TOEi6T2mtHo&t=654s
    // https://www.radartutorial.eu/01.basics/Radar%20Cross%20Section.en.html

    class Boundary {
        constructor(x1, y1, x2, y2,type = "int") {
            this.a = { x: x1, y: y1 };
            this.b = { x: x2, y: y2 };
            this.type = type
        }

        show() {
            ctx.beginPath();
            ctx.strokeStyle = "white";
            ctx.moveTo(this.a.x, this.a.y);
            ctx.lineTo(this.b.x, this.b.y);
            ctx.stroke();
        }
    }

    class Dish {
        constructor(x, y) {
            this.pos = { x: x, y: y }
            this.rays = []
            this.centerX = canvas.width / 2;
            this.centerY = canvas.height / 2;
            this.angle = Math.atan2((this.pos.y - this.centerY), this.pos.x - this.centerX);
            this.dist = Math.sqrt(Math.pow((this.centerX - this.pos.x), 2) + Math.pow((this.centerY - this.pos.y), 2));
            this.dist -= 20;
            this.rectW = 50
            this.rect = {
                x1: (this.dist * Math.cos(this.angle)) + this.centerX  + (this.rectW * Math.cos(this.angle + Math.PI/2)),
                y1: (this.dist * Math.sin(this.angle)) + this.centerY  + (this.rectW * Math.sin(this.angle + Math.PI/2)),
                x2: (this.dist * Math.cos(this.angle)) + this.centerX  + (this.rectW * Math.cos(this.angle - Math.PI/2)),
                y2: (this.dist * Math.sin(this.angle)) + this.centerY  + (this.rectW * Math.sin(this.angle - Math.PI/2))
            }
            this.raynum = 15
            for (let i = 0; i < this.raynum; i += 1) {
                this.rays.push(new Ray({ x:this.rect.x1*i/this.raynum, y:this.rect.y1*i/this.raynum },i*(Math.PI/180),i))
            }
        }
        
        show() {
                    
            ctx.save(); // Save the current context state
        
            // Draw the rotating rectangle
            ctx.beginPath();
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

        look(boundaries) {
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
                if (closest) {
                    // Draw the initial ray
                    ctx.beginPath();
                    ctx.strokeStyle = "white";
                    ctx.moveTo(ray.pos.x, ray.pos.y);
                    ctx.lineTo(closest.x, closest.y);
                    ctx.stroke();
                    ctx.closePath();
        
                    // Check for bounce
                    if (ray.bounces < ray.max_bounces && ray.bounce(closestBoundary, closest) && closestBoundary.type != "ext") {
                        let bouncedRecord = Infinity;
                        let bouncedClosest = null;
                        let bouncedClosestBoundary = null;
        
                        // Check for intersection with each boundary
                        for (let boundary of boundaries) {
                            const pt = ray.cast(boundary);
                            if (pt) {
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
        
                        const dishxy = { a: { x: this.rect.x1, y: this.rect.y1 }, b: { x: this.rect.x2, y: this.rect.y2 }};
                        const dishxyPoint = ray.cast(dishxy);
                        if (dishxyPoint) {
                            let dishxyDist = Math.sqrt(Math.pow((dishxyPoint.x - closest.x), 2) + Math.pow((dishxyPoint.y - closest.y), 2));
                            if (dishxyDist < bouncedRecord) {
                                // Draw to axy if it's closer
                                bouncedClosest = dishxyPoint;
                                bouncedClosestBoundary = dishxy;
                                // Draw the bounced ray
                                if (bouncedClosest) {
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
        
        
        update(x,y) {
            this.pos.x = x
            this.pos.y = y

            this.angle = Math.atan2((this.pos.y - this.centerY), this.pos.x - this.centerX);
            this.dist = Math.sqrt(Math.pow((this.centerX - this.pos.x), 2) + Math.pow((this.centerY - this.pos.y), 2));
            this.dist -= 20;
            this.rect = {
                x1: (this.dist * Math.cos(this.angle)) + this.centerX  + (this.rectW * Math.cos(this.angle + Math.PI/2)),
                y1: (this.dist * Math.sin(this.angle)) + this.centerY  + (this.rectW * Math.sin(this.angle + Math.PI/2)),
                x2: (this.dist * Math.cos(this.angle)) + this.centerX  + (this.rectW * Math.cos(this.angle - Math.PI/2)),
                y2: (this.dist * Math.sin(this.angle)) + this.centerY  + (this.rectW * Math.sin(this.angle - Math.PI/2))
            }


            for (let ray of this.rays) {
                ray.pos.x = (this.rect.x1 + ray.index/this.raynum * (this.rect.x2 - this.rect.x1))
                ray.pos.y = (this.rect.y1 + ray.index/this.raynum * (this.rect.y2 - this.rect.y1))
                ray.dir.x = -Math.cos(this.angle)
                ray.dir.y = -Math.sin(this.angle)
                ray.bounces = 0
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
            this.max_bounces = 1
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
            if (this.bounces > this.max_bounces) {
                return;
            }
        
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
        
            // Mark the ray as bounced
            this.bounces += 1;
            return true
        }
    }

    let mouseX = 0;
    let mouseY = 0;
    canvas.addEventListener('mousemove', function (event) {
        var rect = canvas.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });

    let wallSet = {fighter:[], circle:[]}
    let selectedShape = "fighter"
    let ray;
    let dish;
    function setup() {

        // fighter jet test
        wallSet.fighter.push(new Boundary(canvas.width/2+50,canvas.height/2,canvas.width/2+20,canvas.height/2-10))
        wallSet.fighter.push(new Boundary(canvas.width/2+20,canvas.height/2-10,canvas.width/2-10,canvas.height/2-8))
        wallSet.fighter.push(new Boundary(canvas.width/2-10,canvas.height/2-8,canvas.width/2-50,canvas.height/2-8))
        wallSet.fighter.push(new Boundary(canvas.width/2-50,canvas.height/2-8,canvas.width/2-80,canvas.height/2-30))
        wallSet.fighter.push(new Boundary(canvas.width/2-80,canvas.height/2-30,canvas.width/2-80,canvas.height/2))
        wallSet.fighter.push(new Boundary(canvas.width/2-80,canvas.height/2,canvas.width/2-50,canvas.height/2+5))
        wallSet.fighter.push(new Boundary(canvas.width/2-50,canvas.height/2+5,canvas.width/2-20,canvas.height/2+5))
        wallSet.fighter.push(new Boundary(canvas.width/2-20,canvas.height/2+5,canvas.width/2+40,canvas.height/2+5))
        wallSet.fighter.push(new Boundary(canvas.width/2+40,canvas.height/2+5,canvas.width/2+50,canvas.height/2))

        // circle
        const numSegments = 50
        const radius = 25
        let angleStep = Math.PI * 2 / numSegments;

        for (let i = 0; i < numSegments; i++) {
            // Calculate start point
            let x1 = canvas.width/2 + radius * Math.cos(angleStep * i);
            let y1 = canvas.height/2 + radius * Math.sin(angleStep * i);
    
            // Calculate end point
            let x2 = canvas.width/2 + radius * Math.cos(angleStep * (i + 1));
            let y2 = canvas.height/2 + radius * Math.sin(angleStep * (i + 1));
    
            // Create a boundary for this segment
            wallSet.circle.push(new Boundary(x1, y1, x2, y2));
        }

        // exterior walls
        for (let shape in wallSet){
            wallSet[shape].push(new Boundary(0,0,canvas.width,0,"ext")) // top
            wallSet[shape].push(new Boundary(canvas.width,0,canvas.width,canvas.height,"ext")) // right
            wallSet[shape].push(new Boundary(0,canvas.height,canvas.width,canvas.height,"ext")) // bottom
            wallSet[shape].push(new Boundary(0,0,0,canvas.height,"ext")) // left
        }

        // ray = new Ray(100, 200);
        dish = new Dish(100,200);
    }

    function drawGame() {
        setTimeout(drawGame, 16.666); // Approximately 60 frames per second
        clearScreen();
        for (let wall of wallSet[selectedShape]){
            wall.show();
        }
        dish.show();
        dish.look(wallSet[selectedShape]);
        dish.update(mouseX,mouseY)
    }

    function clearScreen() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    setup();
    drawGame();
}

closure();
