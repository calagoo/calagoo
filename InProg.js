function closure() {

    const canvas = document.getElementById("InProg");
    const ctx = canvas.getContext("2d");


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
        isMouseOnCanvas = false
        mousePressed = false
    })

    
    let mousePressed = false
    let mouseUp = false
    let mouseClick = false

    canvas.addEventListener('mousedown', function () {
        mousePressed = true
        mouseClick = true
        mouseUp = false
    })

    canvas.addEventListener('mouseup', function () {
        mouseUp = true
        mousePressed = false
        mouseClick = false
    })


    class FenUtil {
        constructor(){
            this.fen_map = {}
        }
        
        static fen_parser(fen){
            this.fen = fen.split(" ");
            this.fen_map = {moves: this.fen[0], turn: this.fen[1], castling: this.fen[2], en_passant: this.fen[3], halfmove_clock: this.fen[4], fullmove_number: this.fen[5]};
            return this.fen_map;
        }
        
        static compileFen(fen_map){
            this.fen = fen_map.moves + " " + fen_map.turn + " " + fen_map.castling + " " + fen_map.en_passant + " " + fen_map.halfmove_clock + " " + fen_map.fullmove_number;
            return this.fen
        }

        static positionFromFen(fen){
            this.fen_map = this.fen_parser(fen)
            let pos_array = new Array(64)
            let rank = 7
            let file = 0

            for (let char of this.fen_map.moves){
                if (char == "/"){
                    file = 0
                    rank--
                } else{
                    if (!isNaN(parseInt(char))) {
                        // char is a number/digit
                        for (let i = 0; i < parseInt(char); i++){
                            pos_array[rank * 8 + file] = {char: null, pos: (rank * 8 + file)}
                            file++
                        }
                        }
                    else{
                        pos_array[rank * 8 + file] = {char: char, pos: (rank * 8 + file)}
                        file++
                    }
                }
            }
            return pos_array
        }

        static fen_to_array(fen){
            let fen_dict = this.fen_parser(fen)
            let board_array = new Array(8)
            for (let i = 0; i < 8; i++){
                board_array[i] = new Array(8)
            }
    
            let files = 0
            let ranks = 0
            for (let char of fen_dict.moves){
                if (!isNaN(parseInt(char))) {
                    // char is a number/digit
                    if (parseInt(char) == 1){
                        board_array[files][ranks] = [null, null]
                    }else{
                        for (let i = 0; i < parseInt(char); i++){
                            board_array[files][ranks] = [null, null]
                            files++
                        }
                        continue
                    }
                } else if (char == "/"){
                    files = 0
                    ranks++
                    continue
                } else {
                    let color = (char === char.toUpperCase()) ? "white" : "black";
                    board_array[files][ranks] = [char, color];
                }
                files++
            }
            return board_array
        }
    
        static fen_create(board_array){
            // TODO: Add castling, en passant, halfmove clock, fullmove number
    
            let fen = ""
            let files = 0
            let ranks = 0
            let empty = 0
            for ( let i = 0; i < 64; i++){
                if (board_array[i].char == null) {
                    empty++
                } else {
                    if (empty > 0){
                        fen += empty
                        empty = 0
                    }
                    fen += board_array[i].char
                }
                files ++ 
                if (files >= 8){
                    if (empty > 0){
                        fen += empty
                        empty = 0
                    }
                    if (ranks < 7){
                        fen += "/"
                    }
                    files = 0
                    ranks ++
                    continue
                }
            }
            return fen
        }

        static bitboardToFen(fen,bitboard,piece){
            let pos_array = FenUtil.positionFromFen(fen)
            if (piece == "P"){
                for (let i = 0; i < 64; i++){
                    if ((bitboard & (1n << BigInt(i))) != 0n){
                        pos_array[i].char = "P"
                    }else if (pos_array[i].char == "P"){
                        pos_array[i].char = null
                    }
                }
            }
            return FenUtil.fen_create(pos_array)
        }



        static fenToBitboard(color,pos_array,piece){
            let bitboard = 0n
            for (let i = 0; i < 64; i++){
                if (color == "white"){
                    if (pos_array[i].char == piece.toUpperCase()){
                        bitboard |= 1n << BigInt(pos_array[i].pos)
                    }
                } else {
                    if (pos_array[i].char == piece){
                        bitboard |= 1n << BigInt(pos_array[i].pos)
                    }
                }
            }
            return bitboard
        }
    }


    function resetBitboard(bitboard){
        for (let i = 0; i < bitboard.length; i++){
            bitboard[i] = 0
        }
        return bitboard
    }

    class Piece{
        constructor(color,piece){
            this.color = color
            this.bitboard = 0n
            this.piece = piece
            if (color == "white"){
                this.piece = this.piece.toUpperCase()
            }
        }
        update(pos_array){
            this.bitboard = FenUtil.fenToBitboard(this.color,pos_array,this.piece)
        }
    }

    class Pawn extends Piece{
        constructor(color){
            super(color, "p")
            if (color == "white"){
                this.moveDirections = {forward: 8, forward2: 16, captureRight: 9, captureLeft: 7}
            } else {
                this.moveDirections = {forward: -8, forward2: -16, captureLeft: -9, captureRight: -7}
            }
            this.drawBitboard = 0n
            this.moveBitboard = 0n
            this.mask = 0n
        }
        update(pos_array){
            // Call the original update function
            super.update(pos_array)
        }
        checkMoves(pos, number_to_edge,bitboards){
            this.drawBitboard = 0n;
            for (let offset in this.moveDirections){

                if(offset == "captureLeft"){
                    if(number_to_edge.numWest < (pos + this.moveDirections[offset])%8){
                        continue
                    }
                    
                } else if(offset == "captureRight"){
                    if(number_to_edge.numEast < (8-(pos + this.moveDirections[offset])%8)){
                        continue
                    }
                }

                //check if pawn is on starting rank
                if (this.color == "white"){
                    if (pos >= 15){
                        if (offset == "forward2"){
                            continue
                        }
                    }
                } else {
                    if (pos <= 48){
                        if (offset == "forward2"){
                            continue
                        }
                    }
                }

                //check if pawn can move forward
                if (offset == "forward" || offset == "forward2"){
                    if (bitboards["all"] & (1n << BigInt(pos + this.moveDirections[offset]))){
                        continue
                    }
                }

                //check if pawn can capture
                if (offset == "captureLeft" || offset == "captureRight"){
                    if (bitboards["empty"] & (1n << BigInt(pos + this.moveDirections[offset]))){
                        continue
                    }
                }


                let newPos = pos + this.moveDirections[offset];
                if((newPos >= 0 && newPos < 64)) { // Ensure newPos is within board boundaries and same file as current position
                    this.drawBitboard |= 1n << BigInt(newPos);
                }
            }
        }
        move(pos, target_pos, number_to_edge, bitboards){
            

            // if(number_to_edge.numWest < (pos + (target_pos-pos))%8){
            //     return
            // }
            
            // if(number_to_edge.numEast < (8-(pos + (target_pos-pos))%8)){
            //     return
            // }


            if (pos >= 15){
                if (target_pos > pos + 9){
                    return
                }
            }
            
            // set pos to target_pos
            this.moveBitboard = 0n
            this.mask = ~(1n << BigInt(pos))
            this.moveBitboard |= 1n << BigInt(target_pos)
            this.bitboard |= this.moveBitboard
            this.bitboard &= this.mask
        }
    }

    class Bishop extends Piece{
        constructor(color){
            super(color, "b")
            this.moveDirections = [-9, -7, 7, 9]
        }
        update(pos_array){
            // Call the original update function
            super.update(pos_array);    
        }
        checkMoves(pos, number_to_edge){
            this.moveBitboard = 0n;
            for (let offset of this.moveDirections){
                if (offset < 0 && number_to_edge.numWest < Math.abs(offset%8)){
                    continue
                } else if (offset > 0 && number_to_edge.numEast < offset%8){
                    continue
                }
                let newPos = pos + offset;
                if((newPos >= 0 && newPos < 64)) { // Ensure newPos is within board boundaries and same file as current position
                    this.moveBitboard |= 1n << BigInt(newPos);
                }
            }
        }
    }
    
    class Knight extends Piece{
        constructor(color){
            super(color, "n")
            this.moveDirections = [-17, -15, -10, -6, 6, 10, 15, 17]
        }
        update(pos_array){
            // Call the original update function
            super.update(pos_array);    
        }
    }
    
    class Rook extends Piece{
        constructor(color){
            super(color, "r")
            this.moveDirections = [-8, -1, 1, 8]
        }
        update(pos_array){
            // Call the original update function
            super.update(pos_array);    
        }
        checkMoves(pos, number_to_edge){
            this.moveBitboard = 0n;
            for (let offset of this.moveDirections){
                if (offset < 0 && number_to_edge.numWest < Math.abs(offset%8)){
                    continue
                } else if (offset > 0 && number_to_edge.numEast < offset%8){
                    continue
                }
                let newPos = pos + offset;
                if((newPos >= 0 && newPos < 64)) { // Ensure newPos is within board boundaries and same file as current position
                    this.moveBitboard |= 1n << BigInt(newPos);
                }
            }
        }
    }
    
    class Queen extends Piece{
        constructor(color){
            super(color, "q")
            this.moveDirections = [-9, -8, -7, -1, 1, 7, 8, 9]
        }
        update(pos_array){
            // Call the original update function
            super.update(pos_array);    
        }
    }
    
    class King extends Piece{
        constructor(color){
            super(color, "k")
            this.moveDirections = [-9, -8, -7, -1, 1, 7, 8, 9]
        }
        update(pos_array){
            // Call the original update function
            super.update(pos_array);    
        }
    }

    class Board{
        constructor(){
            this.fen_board = new Array(8)
            for (let i = 0; i < 8; i++){
                this.fen_board[i] = new Array(8)
                for (let j = 0; j < 8; j++){
                }
            }
        }
        
        drawChessBoard(fen){
            this.fen_board = FenUtil.fen_to_array(fen)
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "30px Arial";
            let files = 0
            let ranks = 0
            for (let i = 0; i < 64; i++){
                if ((files+ranks)%2 != 0){
                    ctx.fillStyle = "rgb(150, 150, 150)";
                } else {
                    ctx.fillStyle = "rgb(20, 50, 94)";
                }
                ctx.fillRect(files*canvas.height/8,ranks*canvas.height/8,files*canvas.width/8+canvas.width/8,ranks*canvas.height/8+canvas.height/8)
                ctx.fillStyle = this.fen_board[files][ranks][1];
                ctx.fillText(this.fen_board[files][ranks][0], files*canvas.width/8+canvas.width/16, ranks*canvas.height/8+canvas.height/16);
                files ++ 
                if (files >= 8){
                    files = 0
                    ranks ++
                }
            } 
        }
        
        getPiece(coord){
            return this.fen_board[coord[0]][coord[1]]
        }

        numToEdge(coord){
            return {numNorth: coord[1], numSouth: 7-coord[1], numEast: 7-coord[0], numWest: coord[0]}
        }

        checkAllMoves(coord, piece){
            if (piece[0] == "P"){
                return this.checkPawnMoves(coord)
            }
        }

        checkPawnMoves(coord){
            // Check if pawn is on starting rank
            // Check if pawn can move forward
            // Check if pawn can capture
            // Check if pawn can en passant
            // Check if pawn can promote
        }

        checkBishopMoves(coord){
            // Check if bishop can move
            // Check if bishop can capture
        }

        checkPin(){
            // Check if piece is pinned
        }

        drawLegalMoves(coord){
            // Draw legal moves
            
        }

        drawHover(coord){
            ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
            ctx.fillRect(coord[0]*canvas.height/8,coord[1]*canvas.height/8,canvas.width/8,canvas.height/8)
        }

        drawBitboard(bitboard){
            for (let i = 0; i < 64; i++){
                if ((bitboard & (1n << BigInt(i))) != 0n){
                    board.drawHover([i%8,7-Math.floor(i/8)])
                }
            }
        }

    }

    function closestMouseSquare(){
        let closestX = -1
        let closestY = -1
        if (isMouseOnCanvas){
            closestX = Math.floor(mouseX/(canvas.width/8))
            closestY = Math.floor(mouseY/(canvas.height/8))
        }
        
        return [closestX, closestY]
    }
    
    function update(fen, piece_dict,loaded){
        fen_dict = FenUtil.fen_parser(fen)
        pos_array = FenUtil.positionFromFen(fen)
        let piece
        let new_fen = fen
        
        if (!loaded){


            select_square = [-1,-1]
            target_square = [-1,-1]
            for (piece in piece_dict){
                piece_dict[piece].update(pos_array)
                bitboards[piece] = piece_dict[piece].bitboard
                bitboards["white"] = 0n
                bitboards["black"] = 0n
                bitboards["all"] = 0n
                bitboards["empty"] = 0n
                console.log(piece_dict[piece])                    
            }
            for (piece in piece_dict){
                if(piece_dict[piece].color == "white"){
                    bitboards["white"] = piece_dict[piece].bitboard | bitboards["white"]
                }
                if(piece_dict[piece].color == "black"){
                    bitboards["black"] = piece_dict[piece].bitboard | bitboards["black"]
                }
                bitboards["all"] = piece_dict[piece].bitboard | bitboards["all"]

                bitboards["empty"] = ~bitboards["all"]

            }
            loaded = true
        }

        if (fen_dict.turn == "w"){
            // human move
            
            mouse_board_coord = closestMouseSquare()
            if (mouse_board_coord[0]+mouse_board_coord[1] >= 0){
                // 1. Check mouse position on hover
                board.drawHover(mouse_board_coord)
                
                // 1.1. Check mouse position on click
                if (mouseClick) {
                    mouseClick = false
                    select_square = closestMouseSquare()
                }
                if (mouseUp){
                    mouseUp = false
                    target_square = closestMouseSquare()
                }
                // 1.2. Check mouse position on release
                

                // 2. Show valid moves
                // 2.1. Get piece
                
                piece = board.getPiece(mouse_board_coord)
                
                if (select_square[0]+select_square[1] >= 0 && target_square[0]+target_square[1] >= 0){
                    piece = board.getPiece(select_square)
                    piece_dict[piece[0]].move(select_square[0]+(7-select_square[1])*8,target_square[0]+(7-target_square[1])*8,number_to_edge,bitboards)
                    
                    fen_dict.moves = FenUtil.bitboardToFen(fen,piece_dict[piece[0]].bitboard,piece[0])
                    fen_dict.moves = fen_dict.moves.split("/").reverse().join("/")
                    
                    // console.log(fen)
                    // fen = FenUtil.fen_create(pos_array)
                    // console.log(select_square,target_square)
                    select_square = [-1,-1]
                    target_square = [-1,-1]
                }
                
                
                // 2.2. Check Color
                if (piece[1] == "white"){
                    // 2.2.1. Check piece type
                    
                    // get coord, [coord[0]+coord[1]*8]
                    // get piece type, check moves from coord for piece type
                    // piece_dict[piece[0]].checkMoves(mouse_board_coord)

                    number_to_edge = board.numToEdge(mouse_board_coord)
                    piece_dict[piece[0]].checkMoves(mouse_board_coord[0]+(7-mouse_board_coord[1])*8,number_to_edge,bitboards)
                    board.drawBitboard(piece_dict[piece[0]].drawBitboard)
                    

                    // console.log(piece)
                    
                    // 2.2.2. Get possible moves
                    // 2.2.3. Draw possible moves
                }else if (piece[1] == "black"){
                    piece_dict[piece[0]].checkMoves(mouse_board_coord[0]+(7-mouse_board_coord[1])*8)
                    for (let i = 0; i < 64; i++){
                        if ((piece_dict[piece[0]].moveBitboard & (1n << BigInt(i))) != 0n){
                            board.drawHover([i%8,7-Math.floor(i/8)])
                        }
                    }
                    console.log(piece)
                }

            }



            // 3. Check mouse position on click
            // 4. Check mouse position on release
            // 5. Check if move is valid
            // 6. Update fen
            // 7. Make the move on the board
            // 8. Check for checkmate or stalemate
            // 9. Switch to computer's turn
        } else {
            // computer move
            // 1. Generate possible moves
            // 2. Evaluate the best move
            // 3. Make the move on the board
            // 4. Check for checkmate or stalemate
            // 5. Switch to human's turn
        }
        return loaded
    }

    // init board
    let board = new Board()

    // let fen_start = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    let fen_start = "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e3 0 1"
    let fen = fen_start
    let bitboards = {}
    
    // init pieces
    const wpawn = new Pawn("white")
    const bpawn = new Pawn("black")
    const wbishop = new Bishop("white")
    const bbishop = new Bishop("black")
    const wknight = new Knight("white")
    const bknight = new Knight("black")
    const wrook = new Rook("white")
    const brook = new Rook("black")
    const wqueen = new Queen("white")
    const bqueen = new Queen("black")
    const wking = new King("white")
    const bking = new King("black")    
    
    const piece_dict = {"P": wpawn, "p": bpawn, "B": wbishop, "b": bbishop, "N": wknight, "n": bknight, "R": wrook, "r": brook, "Q": wqueen, "q": bqueen, "K": wking, "k": bking}
    let loaded = false
    function setup(){
    }
    
    function drawGame() {
        setTimeout(drawGame, 100);
        clearScreen();
        board.drawChessBoard(fen);
        
        loaded = update(fen,piece_dict,loaded);

        fen = FenUtil.compileFen(fen_dict)

        // console.log(fen.split("/").reverse().join("/"));
        // console.log(fen.split("/"))
    }
    
    function clearScreen() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    setup();
    drawGame();
}
closure();