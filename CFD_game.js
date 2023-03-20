// TODO:
// add progress bar
// maybe add total velocity plot? (normalized)
// Better UI
// color data border to a grey?
// add more buttons? ask for ideas?
// add a noticeable area where it shows it is done
// think of more todo things hehe
// continue button for more iterations (+1000?)




function closure() {
    const canvas = document.getElementById("CFD_game");
    const ctx = canvas.getContext("2d");
    // from stack overflow
    const zip = (a, b) => a.map((k, i) => [k, b[i]]);

    // mouse initializations
    let mouseX = 0;
    let mouseY = 0;
    let isDragging = false;
    let isPlacing = false;
    let clicked = false;

    // Arrays
    var cube_points = new Array()
    var projection_matrix = [[1, 0, 0],
    [0, 1, 0],
    [0, 0, 0]]



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

    let fps = 60
    var animdt = 1 / fps * 1000; // milliseconds per frame - animation delta time

    // sim constants
    const nx = 16
    const ny = 16
    const rho = 1
    const nu = .1
    const dt = .001
    var dx = 2 / (nx - 1)
    var dy = 2 / (ny - 1)
    var x = linspace(0, 2, nx)
    var y = linspace(0, 2, ny)


    // initialization
    var meshPosArray = []
    var meshStrArray = []

    // creating zeros array
    var meshObjArray = zeros2d(nx)
    var u = zeros2d(nx)
    var v = zeros2d(nx)
    var p = zeros2d(nx)
    var b = zeros2d(nx)

    // setting boundary conditions
    // u.map(column => column[0] = 0);
    // u.map(column => column[column.length - 1] = 1);
    p.map(col => col[0] = 1);  // Top side pressure
    p.map(col => col[col.length - 1] = 0); // Bottom side pressure
    p[p.length - 1] = p[p.length - 2]   // Left pressure
    p[0] = p[1] // Right pressure


    var meshDataUnit = "Velocity (x)"


    calculationFinished = false
    calculationStarted = false
    var iterationsTotal = 0
    drawGame()
    function drawGame() {
        setTimeout(drawGame, animdt)
        clearScreen()
        buttons()
        dataContainer()
        drawMesh(nx, ny,meshDataUnit)
        
        if (runToggled && !calculationFinished) {
            
            calculationStarted = true
            
            startTimer = performance.now()
            u, v, p, calculationFinished, iterations = flowCalc(u, v, dt, dx, dy, p, rho, nu,iterationsTotal)
            
            iterationsTotal += iterations

            endTimer = performance.now()   
            // // below clutters up console.
            // console.log("Iterations Finished in", round((endTimer - startTimer) / 1000, 3), "seconds")
            
            if(calculationFinished){
                console.log("Total Finished in", round(((endTimer - startTimer) / 1000)*iterationsTotal/50, 3), "seconds.\nAnd " + iterationsTotal,"iterations")
                runToggled = false
                calculationStarted = false
            }
        }








        clicked = false
    }

    function clearScreen(x,y,w,h) {
        ctx.fillStyle = "black";
        if(x != undefined && y != undefined && w != undefined && h != undefined){
            ctx.fillRect(x, y, w, h);
        }else{
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    var runToggled = false
    var shapeSaved = false
    function buttons() {
        runButton()
        resetButton()
        setShape()
        // roundRectangle(425, 100, 50, 50, 10)
    }

    function runButton() {
        if (checkClickZone(cWidth + 10, 20, 80, 20)) {
            ctx.fillStyle = "hsl(0,0%,25%)"
            roundRectangle(cWidth + 10, 20, 80, 20, 5)
            if(clicked){

                clicked = false
                if (runToggled) {
                    runToggled = false
                    ctx.fillStyle = "white"
                }
                else if (!runToggled && !calculationFinished) {
                    ctx.fillStyle = "grey"
                    runToggled = true
                }
            }
        }else{
            if (runToggled) {
                ctx.fillStyle = "white"
                roundRectangle(cWidth + 10, 20, 80, 20, 5)

            }
            else {
                ctx.fillStyle = "grey"
                roundRectangle(cWidth + 10, 20, 80, 20, 5)
            }
            
        }
        if(runToggled){
            ctx.fillStyle = "black"
            ctx.textAlign = "center"
            ctx.font = "14px monospace"
            ctx.fillText("Running...", cWidth + 50, 33)
        }else{
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.font = "14px monospace"
            ctx.fillText("Start Run", cWidth + 50, 33)
        }
    }

    function resetButton() {
        if (checkClickZone(cWidth + 10, 50, 80, 20)) {
            ctx.fillStyle = "hsl(0,89%,28%)"
            roundRectangle(cWidth + 10, 50, 80, 20, 5)

            if(clicked){
                clicked = false
                initializeVars()
                shapeSaved = false
                runToggled = false
            }
        }else{
            ctx.fillStyle = "red"
            roundRectangle(cWidth + 10, 50, 80, 20, 5)
        }


        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.font = "16px monospace"
        ctx.fillText("Reset", cWidth + 50, 65)
    }

    function setShape() {
        if (checkClickZone(cWidth + 10, 80, 80, 40)) {
            ctx.fillStyle = "hsl(0,0%,25%)"
            roundRectangle(cWidth + 10, 80, 80, 40, 5)
            if(clicked){
                clicked = false
                shapeSaved = true
            }
        }else{
            if (shapeSaved) {
                ctx.fillStyle = "white"
                roundRectangle(cWidth + 10, 80, 80, 40, 5)
            } else {
                ctx.fillStyle = "grey"
                roundRectangle(cWidth + 10, 80, 80, 40, 5)
            }
        }
        
        if(shapeSaved){
            ctx.fillStyle = "black"
            ctx.textAlign = "center"
            ctx.font = "16px monospace"
            ctx.fillText("Set!", cWidth+50, 103)
        }else{
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.font = "16px monospace"
            ctx.fillText("Set", cWidth+50, 95)
            ctx.fillText("Shape", cWidth+50, 114)
        }
    }

    function dataContainer(){
        if (meshDataUnit == "Pressure") {
            dataTable = p
        }
        else if (meshDataUnit == "Velocity (x)") {
            dataTable = u
        }
        else if (meshDataUnit == "Velocity (y)") {
            dataTable = v
        }
        meshDataUnit = colorScale(dataTable)
    }

    function colorScale(valueMatrix){
        maxRow = valueMatrix.map(function (row) { return Math.max.apply(Math, row); });
        max = Math.max.apply(null, maxRow);
        minRow = valueMatrix.map(function (row) { return Math.min.apply(Math, row); });
        min = Math.min.apply(null, minRow);
        
        hue = convertRange(max, min, max, 250, 0)
        if (isNaN(hue)) hue=0
        ctx.fillStyle = `hsla(${hue},70%,50%,1)`
        roundRectangle(10,cHeight + 20,20,20,5)
        hue = convertRange((min+max)/2, min, max, 250, 0)
        if (isNaN(hue)) hue=0
        ctx.fillStyle = `hsla(${hue},70%,50%,1)`
        roundRectangle(10,cHeight + 45,20,20,5)
        hue = convertRange(min, min, max, 250, 0)
        if (isNaN(hue)) hue=0
        ctx.fillStyle = `hsla(${hue},70%,50%,1)`
        roundRectangle(10,cHeight + 70,20,20,5)

        ctx.textAlign = "start"
        ctx.fillStyle = "white"
        ctx.fillText(round(max,2),38,cHeight + 34)
        ctx.fillText(round((max+min)/2,2),38,cHeight + 34+25)
        ctx.fillText(round(min,2),38,cHeight + 34+50)
        
        
        
        options = ["Velocity (x)","Velocity (y)","Pressure"]
        
        inter_unit = dropdownSelector(8,cHeight+1,130,17,options)
        if(inter_unit != undefined){
            meshDataUnit = inter_unit 
        }

        if(!dropdownMenuOpen){
            ctx.fillStyle = "white"
            ctx.fillText(meshDataUnit,10,cHeight + 14)
        }

        return meshDataUnit

    }


    var dropdownMenuOpen = false
    function dropdownSelector(x,y,w,h,options){
        if(checkClickZone(x,y,w,h) && clicked && !dropdownMenuOpen){
            clicked = false
            dropdownMenuOpen = true
        }
        if(dropdownMenuOpen){
            // need two loops here or else the drop down boxes cover the text
            for(opt=1;opt<options.length+1;opt++){
                ctx.beginPath()
                ctx.fillStyle = "rgb(200,210,210)"
                ctx.strokeStyle = "rgb(75,50,170)"
                ctx.fillRect(x,y+(h+4)*(opt-1),w,(h+4))
                ctx.rect(x,y+(h+4)*(opt-1),w,(h+4))
                ctx.stroke()
                ctx.closePath()

                if(checkClickZone(x,y+(h+4)*(opt-1),w,(h+4))){
                    if(clicked){
                        clicked = false
                        dropdownMenuOpen = false
                        return options[opt-1]


                    }
                    ctx.beginPath()
                    ctx.fillStyle = "rgb(255,255,255)"
                    ctx.strokeStyle = "rgb(75,50,170)"
                    ctx.fillRect(x,y+(h+4)*(opt-1),w,(h+4))
                    ctx.rect(x,y+(h+4)*(opt-1),w,(h+4))
                    ctx.stroke()
                    ctx.closePath()

                }


            }
            for(opt=1;opt<options.length+1;opt++){
                ctx.font = "14px monospace"
                ctx.fillStyle = "rgb(10,30,255)"
                ctx.fillText(options[opt-1],x+5,y-2+18*opt)
            }



        }else{
            ctx.fillStyle = "grey"
            ctx.fillRect(x,y,w,h)
            
            ctx.fillStyle = "rgb(75,50,170)"
            ctx.beginPath()
            ctx.moveTo(w/1.10-w/15+x,y+h/5)
            ctx.lineTo(w/1.10+w/15+x,y+h/5)
            ctx.lineTo(w/1.10     +x,y+4*h/5)
            ctx.closePath()
            ctx.fill()
        }
    
        if(!checkClickZone(x,y,w,(h+4)*options.length)){
            dropdownMenuOpen = false
        }





    }

    function data2color(meshX, meshY, unit) {

        if (meshDataUnit == "Pressure") {
            dataTable = p
        }
        else if (meshDataUnit == "Velocity (x)") {
            dataTable = u
        }
        else if (meshDataUnit == "Velocity (y)") {
            dataTable = v
        }
        colorScale(dataTable)

        
        maxRow = dataTable.map(function (row) { return Math.max.apply(Math, row); });
        max = Math.max.apply(null, maxRow);
        minRow = dataTable.map(function (row) { return Math.min.apply(Math, row); });
        min = Math.min.apply(null, minRow);
        
        hue = convertRange(dataTable[meshX][meshY], min, max, 250, 0)
        
        
        
        
        return [hue,min,max]
    }

    function drawMesh(nx, ny,meshDataUnit) {
        var canvas_dx = cWidth / nx
        var canvas_dy = cHeight / ny

        for (i = 0; i < nx; i++) {
            for (j = 0; j < ny; j++) {

                if (calculationFinished || calculationStarted) {
                    ctx.beginPath()
                    ctx.fillStyle = `hsla(${data2color(i, j, meshDataUnit)[0]},70%,50%,1)`
                    ctx.fillRect(j * canvas_dy + 1, i * canvas_dx + 1, canvas_dx - 2, canvas_dy - 2)
                    ctx.closePath()
                    ctx.strokeStyle = "black"
                }
                else ctx.strokeStyle = "white"

                ctx.beginPath()
                ctx.moveTo((i) * canvas_dx, (j) * canvas_dy)
                ctx.lineTo((i + 1) * canvas_dx, (j) * canvas_dy)
                ctx.moveTo((i) * canvas_dx, (j) * canvas_dy)
                ctx.lineTo((i) * canvas_dx, (j + 1) * canvas_dy)
                ctx.closePath()
                ctx.stroke()

                if ((mouseX > i * canvas_dx) && (mouseX < (i + 1) * canvas_dx) && (mouseY > j * canvas_dy) && (mouseY < (j + 1) * canvas_dy)) {
                    if (clicked) {
                        meshPosArray[meshPosArray.length] = [i, j]
                        meshStrArray[meshStrArray.length] = `${i},${j}`

                        dupeIndex = Object.values(meshStrArray.getDuplicates()) // get duplicates and remove BOTH of the duplicates
                        if (dupeIndex.length >= 1) {
                            meshPosArray.splice(dupeIndex[0][1], 1)
                            meshStrArray.splice(dupeIndex[0][1], 1)
                            meshPosArray.splice(dupeIndex[0][0], 1)
                            meshStrArray.splice(dupeIndex[0][0], 1)
                        }
                        clicked = false
                    }
                }
                for (meshPosition of meshPosArray) {
                    ctx.beginPath()
                    ctx.fillStyle = "red"
                    ctx.fillRect(meshPosition[0] * canvas_dx, meshPosition[1] * canvas_dy, canvas_dx, canvas_dy)
                    ctx.closePath()

                    meshObjArray[meshPosition[0]][meshPosition[1]] = 1
                    // console.log(meshObjArray) // turning on causes large slowdown when multiple boxes are clicked
                }

            }
        }
    }

    function initializeVars() {
        // creating zeros array
        meshObjArray = zeros2d(nx)
        meshPosArray = []
        meshStrArray = []
        u = zeros2d(nx)
        v = zeros2d(nx)
        p = zeros2d(nx)
        b = zeros2d(nx)

        // boundary conditions
        p.map(col => col[0] = 1);  // Top side pressure
        p.map(col => col[col.length - 1] = 0); // Bottom side pressure
        p[p.length - 1] = p[p.length - 2]   // Left pressure
        p[0] = p[1] // Right pressure


        calculationFinished = false
        calculationStarted = false
        iterationsTotal = 0
        errorText = ""

    }



    function poissonPressure(p, dx, dy, b) {

        var pn = p.map(function (arr) {
            return arr.slice();
        });
        var pdiff = 1
        var pdiff_error = 1
        var pdiff_prev = pdiff
        while (pdiff > 5e-3) {
            if (pdiff_error < 1e-9) {
                return drawError("pressure")
            }
            var pn = p.map(function (arr) { // for some reason in javascript, there is no command for copying/cloning a multidimensional array. It is only copied from the top level.
                return arr.slice();
            });

            for (i = 1; i < nx - 1; i++) {
                for (j = 1; j < ny - 1; j++) {


                    b[i][j] = (rho * (1 / dt *
                        ((u[i][j + 1] - u[i][j - 1]) /
                            (2 * dx) + (v[i + 1][j] - v[i - 1][j]) / (2 * dy)) -
                        ((u[i][j + 1] - u[i][j - 1]) / (2 * dx)) ** 2 -
                        2 * ((u[i + 1][j] - u[i - 1][j]) / (2 * dy) *
                            (v[i][j + 1] - v[i][j - 1]) / (2 * dx)) -
                        ((v[i + 1][j] - v[i - 1][j]) / (2 * dy)) ** 2))

                    p[i][j] = (((pn[i][j + 1] + pn[i][j - 1]) * dy ** 2 +
                        (pn[i + 1][j] + pn[i - 1][j]) * dx ** 2) /
                        (2 * (dx ** 2 + dy ** 2)) -
                        dx ** 2 * dy ** 2 / (2 * (dx ** 2 + dy ** 2)) *
                        b[i][j])

                }
            }

            // p.map(col => col[col.length - 1] = col[col.length - 2]); //R ight side pressure
            // p.map(col => col[0] = col[1]);  // Left side pressure

            p.map(col => col[0] = 1);  // Top side pressure
            p.map(col => col[col.length - 1] = 0); // Bottom side pressure
            p[p.length - 1] = p[p.length - 2]   // Left pressure
            p[0] = p[1] // Right pressure




            // p.map(col => col[0] = col[1]);  // Top side pressure
            // p.map(col => col[col.length - 1] = col[col.length - 2]); // Bottom side pressure
            // p[p.length - 1] = new Array(nx).fill(1)   // Left pressure
            // p[0] = new Array(nx).fill(0) // Right pressure





            sum_p = p.reduce(function (a, b) { return a.concat(b) }) // flatten array
                .reduce(function (a, b) { return a + b });      // sum
            sum_pn = pn.reduce(function (a, b) { return a.concat(b) }) // flatten array
                .reduce(function (a, b) { return a + b });      // sum


            pdiff = Math.abs(sum_p - sum_pn)

            pdiff_error = math.abs(pdiff - pdiff_prev)    // this is to make sure the U array does not converge to a random number

            pdiff_prev = pdiff
        }
        return b, p
    }

    function flowCalc(u, v, dt, dx, dy, p, rho, nu) {

        // for max number of iterations.. this has multiple factors
        // -one being the size of the grid. 5000 iterations of 11x11 != 41x41
        // -second consideration being constraints. if we constain the bottom and top to be velocity = 0, need less iterations
        // -should allow the user to set their desired iteration amount, within a reasonable amount. More interesting to see quick low iteration examples than slow high iterations -- its not a real cfd program


        var iterations = 0
        var udiff = 1
        var udiff_error = 1
        var udiff_prev = udiff
        while ((udiff > 1e-3) && (iterations < 50)) {
            if (udiff_error < 1e-9) {
                return drawError("velocity")
            }


            var un = u.map(function (arr) {
                return arr.slice();
            });

            var vn = v.map(function (arr) {
                return arr.slice();
            });

            // b = build_up_b(b, rho, dt, u, v, dx, dy)
            b, p = poissonPressure(p, dx, dy, b)


            for (i = 1; i < nx - 1; i++) {
                for (j = 1; j < ny - 1; j++) {

                    u[i][j] = (un[i][j] -
                        un[i][j] * dt / dx *
                        (un[i][j] - un[i][j - 1]) -
                        vn[i][j] * dt / dy *
                        (un[i][j] - un[i - 1][j]) -
                        dt / (2 * rho * dx) * (p[i][j + 1] - p[i][j - 1]) +
                        nu * (dt / dx ** 2 *
                            (un[i][j + 1] - 2 * un[i][j] + un[i][j - 1]) +
                            dt / dy ** 2 *
                            (un[i + 1][j] - 2 * un[i][j] + un[i - 1][j])))


                    v[i][j] = (vn[i][j] -
                        un[i][j] * dt / dx *
                        (vn[i][j] - vn[i][j - 1]) -
                        vn[i][j] * dt / dy *
                        (vn[i][j] - vn[i - 1][j]) -
                        dt / (2 * rho * dy) * (p[i + 1][j] - p[i - 1][j]) +
                        nu * (dt / dx ** 2 *
                            (vn[i][j + 1] - 2 * vn[i][j] + vn[i][j - 1]) +
                            dt / dy ** 2 *
                            (vn[i + 1][j] - 2 * vn[i][j] + vn[i - 1][j])))
                }
            }

            if (shapeSaved) {
                for (i = 1; i < nx - 1; i++) {
                    for (j = 1; j < ny - 1; j++) {
                        if (meshObjArray[i][j] == 1) {
                            u[j][i] = 0
                        }
                    }
                }
            }
            // setting boundary conditions
            // Top
            // u[0].map(element => element = 0)
            u[0] = u[1]
            // Bottom
            // u[u.length - 1].map(element => element = 0)
            u[u.length - 1] = u[u.length - 2]
            // Left
            u.map(col => col[0] = col[1]);
            // Right
            u.map(col => col[col.length - 1] = col[col.length - 2]);




            // Top
            v[0].map(element => element = 0)
            // Bottom
            v[u.length - 1].map(element => element = 0)
            // Left
            v.map(col => col[0] = col[1]);
            // Right
            v.map(col => col[col.length - 1] = col[col.length - 2]);


            // convergence criteria
            sum_u = u.reduce(function (a, b) { return a.concat(b) }) // flatten array
                .reduce(function (a, b) { return a + b });      // sum
            sum_un = un.reduce(function (a, b) { return a.concat(b) }) // flatten array
                .reduce(function (a, b) { return a + b });      // sum

            udiff = Math.abs(sum_u - sum_un)

            udiff_error = math.abs(udiff - udiff_prev)    // this is to make sure the U array does not converge to a random number

            udiff_prev = udiff

            iterations++     
        }
        if((udiff < 5e-3) || (iterationsTotal >= 5450)){
            console.log(udiff)
            calculationFinished = true
        }else{
            calculationFinished = false
        }
        
        
        
        return u, v, p, calculationFinished, iterations
    }



    function drawError(errorText) {
        clearScreen(centerX-175,centerY-35,350,60)
        if(errorText == "velocity"){
            ctx.textAlign = "center"
            ctx.fillStyle = "white"
            ctx.font = "14px monospace"
            ctx.fillText("Solution could not converge,", centerX, centerY-20)
            ctx.fillText("please wait or reset to try again.", centerX, centerY)
            ctx.fillText("(Velocity)", centerX, centerY+20)
        }
        if(errorText == "pressure"){
            ctx.textAlign = "center"
            ctx.fillStyle = "white"
            ctx.font = "14px monospace"
            ctx.fillText("Solution could not converge,", centerX, centerY-20)
            ctx.fillText("please wait or reset to try again.", centerX, centerY)
            ctx.fillText("(Pressure)", centerX, centerY+20)
        }
    }

    Array.prototype.getDuplicates = function () {
        var duplicates = {};
        for (var i = 0; i < this.length; i++) {
            if (duplicates.hasOwnProperty(this[i])) {
                duplicates[this[i]].push(i);
            } else if (this.lastIndexOf(this[i]) !== i) {
                duplicates[this[i]] = [i];
            }
        }

        return duplicates;
    };

    function round(x, sigfigs) {
        return Math.round(x * 10 ** sigfigs) / 10 ** sigfigs;
    };

    function linspace(startVal, stopVal, arrayLength) {
        stepSize = (startVal + stopVal) / arrayLength
        if (stepSize < 0.00000000001) {
            throw Error("Step size too small")
        }
        output = new Array(arrayLength)
        step = startVal
        for (i = 0; i < arrayLength; i++) {
            output[i] = round(step, 12)
            step += stepSize
        }
        return output
    }

    function zeros2d(arrayLength) {
        var arr = new Array(arrayLength).fill([]);
        for (val in arr) {
            arr[val] = new Array(arrayLength).fill(0)
        }
        return arr
    }
    // Converts one range to another ie with the radius slider, 410-490 => 10-30
    function convertRange(oldValue, oldMin, oldMax, newMin, newMax) {
        oldRange = oldMax - oldMin
        newRange = newMax - newMin
        newValue = newMin + (((oldValue - oldMin) * newRange) / oldRange)
        return newValue
    }
    function checkClickZone(x, y, w, h) {
        // Checks if mouse is in zone.
        return ((mouseX > x && mouseX < x + w) && (mouseY > y && mouseY < y + h))
    }


    function roundRectangle(x, y, w, h, r) {
        // roundRect() does not work on some browsers (early safari and ALL firefox) so I created my own rounded rectangle function 
        ctx.beginPath()
        //seg 1
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y)
        //curve 1
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);

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

}
closure()