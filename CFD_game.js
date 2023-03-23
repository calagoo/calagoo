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

    class particle {
        constructor(x, y, vx, vy) {
            this.x = x
            this.y = y
            this.vx = vx
            this.vy = vy
        }
        drawSelf() {
            ctx.fillStyle = `hsl(${this.color}, 80%, 50%)`
            ctx.fillRect(this.x, this.y, 2, 2)
        }
        movementSelf() {
            this.x += this.vx
            this.y += this.vy
        }
        colorHue(arrayMin, arrayMax) {
            this.v = (this.vx ** 2 + this.vy ** 2) ** 0.5
            this.color = convertRange(this.v, arrayMin, arrayMax, 250, 0)
        }
    }
    var particleArray = []

    // canvas coordinates
    cWidth = canvas.width - 100
    cHeight = canvas.height - 100
    const centerX = cWidth / 2;
    const centerY = cHeight / 2;

    let fps = 60
    var animdt = 1 / fps * 1000; // milliseconds per frame - animation delta time

    // sim constants
    const nx = 11
    const ny = nx
    const rho = 1
    const nu = .1
    const dt = .001
    var dx = 2 / (nx - 1)
    var dy = 2 / (ny - 1)
    var iterationsTotal = 0

    var loops = 1 // amount of times interpolation is doubled
    var particleAmount = 200
    var udiff = 1
    
    // initialization
    var meshPosArray = []
    var meshStrArray = []

    // Sliders
    var sliderSelect = [false,false] // sets whether or not slider is selected 
    var sliderVal = [410,445] // sets default slider values

    // creating zeros array
    var meshObjArray = zeros2d(nx)
    var u = zeros2d(nx)
    var v = zeros2d(nx)
    var uv = zeros2d(nx) // magnitude of the two velocities
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

    // Init Booleans
    calculationFinished = false
    calculationStarted = false
    continueIterations = false
    meshEnable = true
    particleEnable = false
    frame = 0 
    drawGame()
    function drawGame() {
        setTimeout(drawGame, animdt)
        clearScreen()
        frame ++ 
        if(frame >= fps){
            frame = 0
        }

        buttons()

        if (meshEnable && !particleEnable) drawMesh(nx, ny, meshDataUnit)
        else {
            drawParticles()
            colorScale(dataContainer("Velocity (x)"))
        }
        if(udiff < 5e-3 && calculationFinished){
            ctx.textAlign ="start"
            ctx.fillStyle = "white"
            ctx.fillText("Convergence",375,410)
            ctx.fillText("Reached!",375,425)
        }
        
        if(continueIterations){
            iterationsTotal = 5000
            calculationFinished = false
            continueIterations = false
        }
        if (runToggled && !calculationFinished) {


            calculationStarted = true

            startTimer = performance.now()
            u, v, p, calculationFinished, udiff, iterations = flowCalc(u, v, dt, dx, dy, p, rho, nu, iterationsTotal)
            iterationsTotal += iterations
            endTimer = performance.now()
            // // below clutters up console.
            // console.log("Iterations Finished in", round((endTimer - startTimer) / 1000, 3), "seconds")

            if (calculationFinished) {
                console.log("Total Finished in", round(((endTimer - startTimer) / 1000) * iterationsTotal / 50, 3), "seconds.\nAnd " + iterationsTotal, "iterations")
                runToggled = false
                calculationStarted = false
            }
        }
        clicked = false
    }

    function clearScreen(x, y, w, h) {
        ctx.fillStyle = "black";
        if (x != undefined && y != undefined && w != undefined && h != undefined) {
            ctx.fillRect(x, y, w, h);
        } else {
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }




    ////////////////////////////////////////////////////////////////////////////////
    //  ____        _   _                  
    // |  _ \      | | | |                 
    // | |_) |_   _| |_| |_ ___  _ __  ___ 
    // |  _ <| | | | __| __/ _ \| '_ \/ __|
    // | |_) | |_| | |_| || (_) | | | \__ \
    // |____/ \__,_|\__|\__\___/|_| |_|___/
    //                                      
    ////////////////////////////////////////////////////////////////////////////////

    var runToggled = false
    var shapeSaved = false

    
    function buttons() {
        border()
        progressBar()
        runButton()
        resetButton()
        setShape()
        enableParticlesButton()
        sliderContainer()
    }

    function border(){
        ctx.strokeStyle = "white"
        ctx.beginPath()
        ctx.moveTo(0,cHeight)
        ctx.lineTo(cWidth,cHeight)
        ctx.lineTo(cWidth,0)
        ctx.lineTo(0,0)
        ctx.closePath()
        ctx.stroke()

        const gradient = ctx.createLinearGradient(0,0,0,1000)
        gradient.addColorStop(0,"rgb(225,193,110)")
        gradient.addColorStop(1,"rgb(180,120,50)")
        // gradient.addColorStop(1,"rgb(205,0,105)")
        ctx.fillStyle = gradient
        // ctx.fillStyle = "rgb(225,193,110)"
        ctx.fillRect(0,cHeight,canvas.width,100)
        ctx.fillRect(cWidth,0,100,canvas.height)


    }

    function progressBar(){
        ctx.fillStyle = "black"
        roundRectangle(410,7,80,5,5)

        prog = 80*(iterationsTotal/5500)
        if(prog){
            if(calculationFinished){
                ctx.fillStyle = "green"
                roundRectangle(410,7,80,5,5)
            }else{
                ctx.fillStyle = "green"
                roundRectangle(410,7,prog,5,5)
            }
        }
    } 


    function runButton() {
        if (checkClickZone(cWidth + 10, 20, 80, 20)) {
            ctx.fillStyle = "hsl(0,0%,25%)"
            roundRectangle(cWidth + 10, 20, 80, 20, 5)
            if (clicked) {
                clicked = false
                if (runToggled) {
                    runToggled = false
                    ctx.fillStyle = "white"
                }
                else if (!runToggled && !calculationFinished) {
                    ctx.fillStyle = "grey"
                    runToggled = true
                } 
                else if(!runToggled && calculationFinished){
                    runToggled = true
                    continueIterations = true
                }
            }
        } else {
            if (runToggled) {
                ctx.fillStyle = "white"
                roundRectangle(cWidth + 10, 20, 80, 20, 5)

            }
            else {
                ctx.fillStyle = "grey"
                roundRectangle(cWidth + 10, 20, 80, 20, 5)
            }

        }
        if (runToggled) {
            ctx.fillStyle = "black"
            ctx.textAlign = "center"
            ctx.font = "14px monospace"
            ctx.fillText("Running...", cWidth + 50, 33)
        } else if(!calculationFinished){
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.font = "14px monospace"
            ctx.fillText("Start Run", cWidth + 50, 33)
        }else{
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.font = "14px monospace"
            ctx.fillText("Continue", cWidth + 50, 33)
        }
    }

    function resetButton() {
        if (checkClickZone(cWidth + 10, 50, 80, 20)) {
            ctx.fillStyle = "hsl(0,89%,28%)"
            roundRectangle(cWidth + 10, 50, 80, 20, 5)
            
            if (clicked) {
                clicked = false
                initializeVars()
                shapeSaved = false
                runToggled = false
            }
        } else {
            ctx.fillStyle = "red"
            roundRectangle(cWidth + 10, 50, 80, 20, 5)
        }
        
        
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.font = "16px monospace"
        ctx.fillText("Reset", cWidth + 50, 65)
    }
    
    function setShape() {
        hover = false
        if (checkClickZone(cWidth + 10, 80, 80, 40)) {
            ctx.fillStyle = "hsl(0,0%,25%)"
            roundRectangle(cWidth + 10, 80, 80, 40, 5)
            hover = true
            if (clicked) {
                clicked = false
                shapeSaved = true
            }
        } else {
            if (shapeSaved) {
                ctx.fillStyle = "white"
                roundRectangle(cWidth + 10, 80, 80, 40, 5)
            } else {
                ctx.fillStyle = "grey"
                roundRectangle(cWidth + 10, 80, 80, 40, 5)
            }
        }

        if (shapeSaved && !hover) {
            ctx.fillStyle = "black"
            ctx.textAlign = "center"
            ctx.font = "16px monospace"

            ctx.fillText("Shape", cWidth + 50, 95)
            ctx.fillText("Set!", cWidth + 50, 114)
        } else {
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.font = "16px monospace"
            ctx.fillText("Set", cWidth + 50, 95)
            ctx.fillText("Shape", cWidth + 50, 114)
        }
    }

    function sliderContainer(){
        sliderSelect, sliderVal[0] = slider([410,490,215,215], 10, sliderVal[0], sliderSelect, sliderIndex=0, horizontal=true)
        loops = round(convertRange(sliderVal[0],410,490,1,3),0)
        ctx.fillStyle = "navy"
        ctx.textAlign = "start"
        ctx.fillText(`Interp.`,410,235)
        ctx.fillText(`Loops: ${loops}`,410,248)
        
        
        sliderSelect, sliderVal[1] = slider([410,490,265,265], 10, sliderVal[1], sliderSelect, sliderIndex=1, horizontal=true)
        particleAmount = round(convertRange(sliderVal[1],406,484,50,350),0)
        ctx.fillStyle = "navy"
        ctx.textAlign = "start"
        ctx.fillText(`Particles`,410,285)
        ctx.textAlign = "center"
        ctx.fillText(`${particleAmount}`,450,300)
    }

    ///////////////////////////////////////////////
    //  _____           _   _      _           
    // |  __ \         | | (_)    | |          
    // | |__) |_ _ _ __| |_ _  ___| | ___  ___ 
    // |  ___/ _` | '__| __| |/ __| |/ _ \/ __|
    // | |  | (_| | |  | |_| | (__| |  __/\__ \
    // |_|   \__,_|_|   \__|_|\___|_|\___||___/
    ///////////////////////////////////////////////
    var uInterp;
    var vInterp;
    var meshPosArrayInterp;
    var acldict_x = {}
    var acldict_y = {}
    function enableParticlesButton() {
        if (checkClickZone(cWidth + 10, 130, 80, 40)) {
            ctx.fillStyle = "hsl(0,0%,25%)"
            roundRectangle(cWidth + 10, 130, 80, 40, 5)
            if (clicked) {
                clicked = false
                if (particleEnable) {
                    particleEnable = false
                }
                else if (!particleEnable && calculationFinished) {
                    ctx.fillStyle = "grey"
                    particleEnable = true


                    uInterp = interp2D(u, loops)
                    vInterp = interp2D(v, loops)
                    // transposing matrix
                    uInterp = uInterp[0].map((_, colIndex) => uInterp.map(row => row[colIndex]))
                    vInterp = vInterp[0].map((_, colIndex) => vInterp.map(row => row[colIndex]))

                    arrayCoordLimits = getMeshCoordinates(uInterp.length)

                    tmp = hashingFunction(arrayCoordLimits)

                    aclHash = tmp[0]
                    newIndices = tmp[1]

                    // reorder uinterp to the same indices as the hash map
                    uInterpHash = zeros2d(uInterp.length)

                    uInterp.map((row, rowIndex) => row.map((val, valIndex) => {
                        uInterpHash[newIndices[rowIndex]][newIndices[valIndex]] = val
                    }))

                    tempDict = {}
                    arrayCoordLimits.forEach((el, index) => {
                        tempDict[el] = uInterpHash[hashIndexFinderArray(aclHash, el)]
                    })

                    for ([index, val] of aclHash.entries()) {
                        acldict_x[index] = [val, tempDict[val]]
                    }


                    vInterpHash = zeros2d(vInterp.length)
                    vInterp.map((row, rowIndex) => row.map((val, valIndex) => {
                        vInterpHash[newIndices[rowIndex]][newIndices[valIndex]] = val
                    }))

                    tempDict = {}
                    arrayCoordLimits.forEach((el, index) => {
                        tempDict[el] = vInterpHash[hashIndexFinderArray(aclHash, el)]
                    })

                    for ([index, val] of aclHash.entries()) {
                        acldict_y[index] = [val, tempDict[val]]
                    }

                    // interpolating this 2d array using 1d interpolation
                    // doing this manually because they are always coordinates, so only 2 columns ever

                    meshObjArrayInterp = interp2D(meshObjArray, loops)
                    meshPosArrayInterp = []

                    meshObjArrayInterp.map((row, rIdx) => row.map((val, cIdx) => {
                        if (val > 0.5) {
                            meshPosArrayInterp[meshPosArrayInterp.length] = [rIdx, cIdx]
                        }
                    }))
                }
            }else if((!particleEnable && !calculationFinished)){
                ctx.fillStyle = "red"
                ctx.fillText("Start Run",cWidth + 50, 190)
                ctx.fillText("First!",cWidth + 50, 207)
        }
        } else {
            if (particleEnable) {
                ctx.fillStyle = "white"
                roundRectangle(cWidth + 10, 130, 80, 40, 5)
            } else {
                ctx.fillStyle = "grey"
                roundRectangle(cWidth + 10, 130, 80, 40, 5)
            }
        }

        if (particleEnable) {
            ctx.fillStyle = "black"
            ctx.textAlign = "center"
            ctx.font = "16px monospace"
            ctx.fillText("Enabled", cWidth+50, 155)
        } else {
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.font = "16px monospace"
            ctx.fillText("Particle", cWidth+50, 145)
            ctx.fillText("Mode", cWidth+50, 163)
        }
    }



    function drawParticles() {

        // clearScreen()
        // use new interpolated values!        
        nxNew = uInterp.length
        nyNew = uInterp[0].length

        sizeDifference = uInterp.length / u.length

        var canvas_dx = cWidth / nxNew
        var canvas_dy = cHeight / nyNew

        if (particleArray.length < particleAmount) {
            particleArray[particleArray.length] = new particle(0, Math.random() * cHeight, 0, 0, hue)
        }//Math.random() * cHeight


        for ([idx, ps] of particleArray.entries()) {

            coordLimit_x = NaN
            coordLimit_y = NaN

            for (indexACL = 0; indexACL < arrayCoordLimits.length; indexACL++) {
                ACL = arrayCoordLimits[indexACL]
                if (indexACL - 1 == -1) {
                    ACLPrev = 0
                } else {
                    ACLPrev = arrayCoordLimits[indexACL - 1]
                }

                if (((ps.x >= ACLPrev) && (ps.x <= ACL))) {
                    coordLimit_x = arrayCoordLimits[indexACL]
                }
                if (((ps.y >= ACLPrev) && (ps.y <= ACL))) {
                    coordLimit_y = arrayCoordLimits[indexACL]
                }
                if (!isNaN(coordLimit_x) && !isNaN(coordLimit_y)) break
            }

            if ((ps.x < 0 || ps.x >= cWidth || ps.y >= cHeight || ps.y <= 0) || (ps.vx == 0 && ps.x > 10)) {
                particleArray.splice(idx, 1)
            } else {
                // Format: Dict  [get index of dict from coordinate] ---[uInterp][get column index from hashed y val]
                ps.vx = acldict_x[hashIndexFinderDict(acldict_x, coordLimit_x)][1][hashIndexFinderDict(acldict_x, coordLimit_y)]
                ps.vy = acldict_y[hashIndexFinderDict(acldict_y, coordLimit_y)][1][hashIndexFinderDict(acldict_y, coordLimit_x)]
                // ps.color = "white"
                // min and max for velocity
                maxRow = dataContainer("Velocity").map(function (row) { return Math.max.apply(Math, row); });
                max = Math.max.apply(null, maxRow);
                minRow = dataContainer("Velocity").map(function (row) { return Math.min.apply(Math, row); });
                min = Math.min.apply(null, minRow);


                ps.colorHue(min, max)
                ps.drawSelf();
                ps.movementSelf();

            }
        }
        for (meshPosition of meshPosArrayInterp) {
            ctx.beginPath()
            ctx.fillStyle = "red"
            ctx.fillRect(meshPosition[0] * canvas_dx, meshPosition[1] * canvas_dy, canvas_dx, canvas_dy)
            ctx.closePath()
        }
    }

    function getMeshCoordinates(size) {
        /** This function gets the right-most and bottom-most coordinates for the mesh in the x and y directions respectively */
        var array = new Array(size).fill(NaN)

        meshdx = cWidth / size

        // Only need 1 loop because array is always a square matrix
        for (i = 0; i < size; i++) {
            array[i] = round((i + 1) * meshdx, 0)
        }
        return array
    }

    function dataContainer(meshDataUnit) {
        u.map((row, rowIndex) => row.map((val, valIndex) => {
            uv[rowIndex][valIndex] = (u[rowIndex][valIndex] ** 2 + v[rowIndex][valIndex] ** 2) ** 0.5
        }))

        var dataTable
        if (meshDataUnit == "Pressure") {
            dataTable = p
        }
        else if (meshDataUnit == "Velocity (x)") {
            dataTable = u
        }
        else if (meshDataUnit == "Velocity (y)") {
            dataTable = v
        }
        else if (meshDataUnit == "Velocity") {
            dataTable = uv
        }
        // meshDataUnit = colorScale(dataTable)
        return dataTable
    }
    function drawHoverValues(i, j,meshDataUnit) {
        dataTable = dataContainer(meshDataUnit)
        
        ctx.fillStyle = "navy"
        ctx.textAlign = "left"
        ctx.fillText(`${meshDataUnit} = ` + round(dataTable[j][i],2), 145, cHeight + 13)
    }

    function colorScale(valueMatrix) {
        maxRow = valueMatrix.map(function (row) { return Math.max.apply(Math, row); });
        max = Math.max.apply(null, maxRow);
        minRow = valueMatrix.map(function (row) { return Math.min.apply(Math, row); });
        min = Math.min.apply(null, minRow);

        hue = convertRange(max, min, max, 250, 0)
        if (isNaN(hue)) hue = 0
        ctx.fillStyle = `hsla(${hue},70%,50%,1)`
        roundRectangle(10, cHeight + 20, 20, 20, 5)
        hue = convertRange((min + max) / 2, min, max, 250, 0)
        if (isNaN(hue)) hue = 0
        ctx.fillStyle = `hsla(${hue},70%,50%,1)`
        roundRectangle(10, cHeight + 45, 20, 20, 5)
        hue = convertRange(min, min, max, 250, 0)
        if (isNaN(hue)) hue = 0
        ctx.fillStyle = `hsla(${hue},70%,50%,1)`
        roundRectangle(10, cHeight + 70, 20, 20, 5)

        ctx.textAlign = "start"
        ctx.fillStyle = "white"
        ctx.fillText(round(max, 2), 38, cHeight + 34)
        ctx.fillText(round((max + min) / 2, 2), 38, cHeight + 34 + 25)
        ctx.fillText(round(min, 2), 38, cHeight + 34 + 50)

        options = ["Velocity (x)", "Velocity (y)", "Velocity", "Pressure"]

        inter_unit = dropdownSelector(8, cHeight + 1, 130, 17, options)
        if (inter_unit != undefined) {
            meshDataUnit = inter_unit
        }
        if (!dropdownMenuOpen) {
            ctx.fillStyle = "white"
            ctx.fillText(meshDataUnit, 10, cHeight + 14)
        }
    }

    var dropdownMenuOpen = false
    function dropdownSelector(x, y, w, h, options) {
        if (checkClickZone(x, y, w, h) && clicked && !dropdownMenuOpen) {
            clicked = false
            dropdownMenuOpen = true
        }
        if (dropdownMenuOpen) {
            // need two loops here or else the drop down boxes cover the text
            for (opt = 1; opt < options.length + 1; opt++) {
                ctx.beginPath()
                ctx.fillStyle = "rgb(200,210,210)"
                ctx.strokeStyle = "rgb(75,50,170)"
                ctx.fillRect(x, y + (h + 4) * (opt - 1), w, (h + 4))
                ctx.rect(x, y + (h + 4) * (opt - 1), w, (h + 4))
                ctx.stroke()
                ctx.closePath()

                if (checkClickZone(x, y + (h + 4) * (opt - 1), w, (h + 4))) {
                    if (clicked) {
                        clicked = false
                        dropdownMenuOpen = false
                        return options[opt - 1]
                    }
                    ctx.beginPath()
                    ctx.fillStyle = "rgb(255,255,255)"
                    ctx.strokeStyle = "rgb(75,50,170)"
                    ctx.fillRect(x, y + (h + 4) * (opt - 1), w, (h + 4))
                    ctx.rect(x, y + (h + 4) * (opt - 1), w, (h + 4))
                    ctx.stroke()
                    ctx.closePath()

                }


            }
            for (opt = 1; opt < options.length + 1; opt++) {
                ctx.font = "14px monospace"
                ctx.fillStyle = "rgb(10,30,255)"
                ctx.fillText(options[opt - 1], x + 5, y - 2 + 20 * opt)
            }



        } else {
            ctx.fillStyle = "grey"
            ctx.fillRect(x, y, w, h)

            ctx.fillStyle = "rgb(75,50,170)"
            ctx.beginPath()
            ctx.moveTo(w / 1.10 - w / 15 + x, y + h / 5)
            ctx.lineTo(w / 1.10 + w / 15 + x, y + h / 5)
            ctx.lineTo(w / 1.10 + x, y + 4 * h / 5)
            ctx.closePath()
            ctx.fill()
        }

        if (!checkClickZone(x, y, w, (h + 4) * options.length)) {
            dropdownMenuOpen = false
        }





    }

    function data2color(meshX, meshY, dataTable) {

        colorScale(dataTable)

        maxRow = dataTable.map(function (row) { return Math.max.apply(Math, row); });
        max = Math.max.apply(null, maxRow);
        minRow = dataTable.map(function (row) { return Math.min.apply(Math, row); });
        min = Math.min.apply(null, minRow);

        hue = convertRange(dataTable[meshX][meshY], min, max, 250, 0)




        return [hue, min, max]
    }

    function drawMesh(nx, ny, meshDataUnit) {
        var canvas_dx = cWidth / nx
        var canvas_dy = cHeight / ny

        for (i = 0; i < nx; i++) {
            for (j = 0; j < ny; j++) {

                if (calculationFinished || calculationStarted) {
                    ctx.beginPath()
                    ctx.fillStyle = `hsla(${data2color(i, j, dataContainer(meshDataUnit))[0]},70%,50%,1)`
                    ctx.fillRect(j * canvas_dy + 1, i * canvas_dx + 1, canvas_dx - 2, canvas_dy - 2)
                    ctx.closePath()
                    ctx.strokeStyle = "rgba(0,0,0,1)"
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
                    } else if (calculationFinished) {
                        //hovering over mesh
                        drawHoverValues(i, j,meshDataUnit)
                    }

                }
                meshObjArray = zeros2d(nx)
                for (meshPosition of meshPosArray) {
                    ctx.beginPath()
                    ctx.fillStyle = "red"
                    ctx.fillRect(meshPosition[0] * canvas_dx, meshPosition[1] * canvas_dy, canvas_dx, canvas_dy)
                    ctx.closePath()

                    meshObjArray[meshPosition[0]][meshPosition[1]] = 1
                }
            }
        }
    }


    function initializeVars() {
        // creating zeros array
        meshPosArray = []
        meshStrArray = []
        u = zeros2d(nx)
        v = zeros2d(nx)
        uv = zeros2d(nx)
        p = zeros2d(nx)
        b = zeros2d(nx)

        //// boundary conditions
        p.map(col => col[0] = 1);  // Left side pressure
        p.map(col => col[col.length - 1] = 0); // Right side pressure
        p[p.length - 1] = p[p.length - 2]   // Bottom pressure
        p[0] = p[1] // Top pressure
        
        u[0] = u[1] // Top
        u[u.length - 1] = u[u.length - 2] // Bottom
        u.map(col => col[0] = col[1]); // Left
        u.map(col => col[col.length - 1] = col[col.length - 2]); // Right
        
        v[0].map(element => element = 0) // Top
        v[u.length - 1].map(element => element = 0) // Bottom
        v.map(col => col[0] = col[1]); // Left
        v.map(col => col[col.length - 1] = col[col.length - 2]); // Right
        //// boundary conditions

        velError = 0
        calculationFinished = false
        calculationStarted = false
        particleEnable = false
        continueIterations = false
        iterationsTotal = 0
        errorText = ""
        particleArray = []
    }

///////////////////////////////////////////////////////////
//      _____      _            _       _   _             
//     / ____|    | |          | |     | | (_)            
//    | |     __ _| | ___ _   _| | __ _| |_ _  ___  _ __  
//    | |    / _` | |/ __| | | | |/ _` | __| |/ _ \| '_ \ 
//    | |___| (_| | | (__| |_| | | (_| | |_| | (_) | | | |
//     \_____\__,_|_|\___|\__,_|_|\__,_|\__|_|\___/|_| |_|
///////////////////////////////////////////////////////////
    function poissonPressure(p, dx, dy, b) {

        var pn = p.map(function (arr) {
            return arr.slice();
        });
        var iterationsP = 0
        var pdiff = 1
        var pdiff_error = 1
        var pdiff_prev = pdiff
        while (pdiff > 5e-3 && iterationsP < 5000) {
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

            p.map(col => col[0] = 1);  // Left side pressure
            p.map(col => col[col.length - 1] = 0); // Right side pressure
            p[p.length - 1] = p[p.length - 2]   // Bottom pressure
            p[0] = p[1] // Top pressure




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
            iterationsP++
        }
        return b, p
    }

    function flowCalc(u, v, dt, dx, dy, p, rho, nu) {

        // for max number of iterations.. this has multiple factors
        // -one being the size of the grid. 5000 iterations of 11x11 != 41x41
        // -second consideration being constraints. if we constain the bottom and top to be velocity = 0, need less iterations
        // -should allow the user to set their desired iteration amount, within a reasonable amount. More interesting to see quick low iteration examples than slow high iterations -- its not a real cfd program


        var iterations = 0
        udiff = 1
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
            u[0] = u[1]

            // Bottom
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
        if ((udiff < 5e-3) || (iterationsTotal >= 5450)) {
            console.log("Velocity Difference:",udiff)
            calculationFinished = true
        } else {
            calculationFinished = false
        }

        return u, v, p, calculationFinished, udiff, iterations
    }

    function drawError(errorText) {
        clearScreen(centerX - 175, centerY - 35, 350, 60)
        if (errorText == "velocity") {
            ctx.textAlign = "center"
            ctx.fillStyle = "white"
            ctx.font = "14px monospace"
            ctx.fillText("Solution could not converge,", centerX, centerY - 20)
            ctx.fillText("please wait or reset to try again. (Velocity)", centerX, centerY)
            ctx.fillText("Ensure you have clicked 'Set Shape'", centerX, centerY + 20)
        }
        if (errorText == "pressure") {
            ctx.textAlign = "center"
            ctx.fillStyle = "white"
            ctx.font = "14px monospace"
            ctx.fillText("Solution could not converge,", centerX, centerY - 20)
            ctx.fillText("please wait or reset to try again.", centerX, centerY)
            ctx.fillText("(Pressure)", centerX, centerY + 20)
        }
    }

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

    function fill2d(arrayLength, value) { // had to modify this
        var arr = new Array(arrayLength).fill([]);
        for (val in arr) {
            arr[val] = new Array(arrayLength).fill(value)
        }
        return arr
    }

    function interp1d(arrayOld, loops = 1, multiple) {
        for (i = 0; i < loops; i++) {
            var arrayNew = new Array(((arrayOld.length - 1) * 2) + 1).fill(NaN)
            arrayNew.map((_, idx) => {
                if (!(idx % 2)) {
                    arrayNew[idx] = multiple * arrayOld[idx / 2]
                }
            })
            for (idx = 0; idx < arrayNew.length - 2; idx += 2) {
                arrayNew[idx + 1] = (arrayNew[idx] + arrayNew[idx + 2]) / 2
            }
            arrayOld = arrayNew
        }
        return arrayNew
    }

    function interp2D(arrayOld, loops) {
        /**
        *Interpolates over a 2d array to increase size.
        *Of an nxn matrix uses 2n-1 to find the maximum increase in one iteration
        *@param {Array} arrayOld - input array to be sized up
        *@param {Int} loops - input how many loops to increase size
        */

        if ((arrayOld.length != arrayOld[0].length)) {
            throw console.error("interp2D error: Arrays are not nxn, please check.");
        }

        n = arrayOld.length
        sizeDiff = n

        for (i = 0; i < loops; i++) { // this method cannot do more than one size different interpolation at a time, so we will do it "i" number of times to get to the desired size


            sizeDiff += (i + 1) * (n - 1)
            var arrayNew = fill2d(sizeDiff, NaN) // fill a new array with the desired larger array size

            // Increase size of array, adding NaN's in between unknown vars
            arrayNew.map((row, rowIndex) => row.map((val, valIndex) => {
                if (!(rowIndex % 2) && !(valIndex % 2)) {
                    arrayNew[rowIndex][valIndex] = arrayOld[rowIndex / 2][valIndex / 2]
                }
            }))


            // Linear interpolate between values per row
            arrayNew.map((row, rowIndex) => row.map((val, valIndex) => {
                if (isNaN(arrayNew[rowIndex][valIndex])) {
                    arrayNew[rowIndex][valIndex] = (arrayNew[rowIndex][valIndex - 1] + arrayNew[rowIndex][valIndex + 1]) / 2
                }
            }))

            // Linear interpolate between values per column
            arrayNew.map((col, colIndex) => arrayNew.map((row, rowIndex) => {
                if (isNaN(row[colIndex])) {
                    arrayNew[rowIndex][colIndex] = (arrayNew[rowIndex - 1][colIndex] + arrayNew[rowIndex + 1][colIndex]) / 2
                }
            }))

            var arrayOld = arrayNew.map(function (arr) {
                return arr.slice();
            });
        }
        return arrayNew
    }

    function hashingFunction(array) {

        arrayHash = new Array(array.length).fill(NaN)
        indexArrayHash = []
        array.forEach((element, index) => {
            indexHash = element % array.length
            while (!isNaN(arrayHash[indexHash])) {
                indexHash++
                if (indexHash >= array.length) {
                    indexHash = 0
                }
            }
            arrayHash[indexHash] = element
            indexArrayHash[indexArrayHash.length] = indexHash
        });
        return [arrayHash, indexArrayHash]
    }

    function hashIndexFinderArray(array, val) {

        aLen = array.length

        index = val % aLen // index is also the key
        if (array[index] == val) {
            return index
        } else {
            while (array[index] != val) {
                index++
                if (index >= aLen) {
                    index = 0
                }
            }
            return index
        }
    }
    function hashIndexFinderDict(dict, val) {

        dLen = Object.keys(dict).length

        index = val % dLen // index is also the key
        if (dict[index][0] == val) {
            return index
        } else {
            while (dict[index][0] != val) {
                index++
                if (index >= dLen) {
                    index = 0
                }
            }
            return index
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




}
closure()