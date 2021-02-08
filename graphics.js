const letterCoordinates = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function setup() {
    textAlign(CENTER, CENTER)
    
    ellipseMode(RADIUS)

    let boardString = getURLParams().board

    if (boardString) {
        board = loadBoard(boardString)
    } else {
        board = new Board(8)
    }

    createButton('6').mousePressed(() => {
        board = new Board(6)
        windowResized()
    })
    createButton('8').mousePressed(() => {
        board = new Board(8)
        windowResized()
    })
    createButton('10').mousePressed(() => {
        board = new Board(10)
        windowResized()
    })
    createButton('Link').mousePressed(() => {
        history.pushState({}, '', '?board=' + board.toString())
    })
    influence = createCheckbox('Influence', getItem('influence') || false).changed(() => {
        storeItem('influence', influence.checked())
    })

    coordinates = createCheckbox('Coordinates', getItem('coordinates') || false).changed(() => {
        storeItem('coordinates', coordinates.checked())
        windowResized()
    })

    windowResized()

    playerToMove = createP()

    createButton('Pass').mousePressed(() => {
        board.turn = -board.turn
        updateScores()
    })
    redScoreP = createP()
    whiteScoreP = createP()

    createA('https://github.com/le4TC/tumbleweed', 'Help', '_blank')

    updateScores()
}

function updateScores() {
    let redScore = 0
    let whiteScore = 0
    for (let H of board.hexes) {
        if (H.color == 1) redScore ++
        else if (H.color == -1) whiteScore ++
        else if (H.height == 0) {
            if (H.los[1] > H.los[-1]) redScore ++
            if (H.los[-1] > H.los[1]) whiteScore ++
        }
    }

    playerToMove.elt.innerHTML = 'Player to move: ' + ((board.turn > 0) ? 'Red' : 'White')
    redScoreP.elt.innerHTML = 'Red score: ' + redScore
    whiteScoreP.elt.innerHTML = 'White score: ' + whiteScore
}

stackColors = {
    '1': 'red',
    '0': 'gray',
    '-1': 'white'
}

hexColors = {
    '0': '#FF8888',
    '-1': '#FFCCCC',
    '1': '#FF4444'
}

'0123456789abcdef'

function draw() {
    // background(150)
    clear()

    let N = board.size

    if (coordinates.checked()) {
        push()
        textSize(R/2)
        fill('black')
        noStroke()
        for (let q = 1; q < N+1; q ++) {
            let r = -N
            let H = new Hex(q, r, -q-r)
            let center = L.hexToPixel(H)
            noStroke()
            text(letterCoordinates[q-1], center.x, center.y)
            push()
            translate(center.x, center.y)
            rotate(TAU/12)
            stroke('black')
            line(0, R/2, 0, R)
            pop()
        }

        for (let r = -N+1; r < 0; r ++) {
            let q = N
            let H = new Hex(q, r, -q-r)
            let center = L.hexToPixel(H)
            text(letterCoordinates[2*N + r - 1], center.x, center.y)
            push()
            translate(center.x, center.y)
            rotate(TAU/12)
            stroke('black')
            line(0, R/2, 0, R)
            pop()
        }

        for (let r = -N+1; r < N; r ++) {
            let q = max(-N-r, -N)
            let H = new Hex(q, r, -q-r)
            let center = L.hexToPixel(H)
            noStroke()
            text(r+N, center.x, center.y)
            stroke('black')
            line(center.x + R/2, center.y, center.x + R, center.y)
        }
        pop()
    }

    let prevColor, prevHeight, temp

    let M = L.pixelToHex(new Point(mouseX, mouseY)).round()
    if (board.contains(M.q, M.r, M.s)) {
        M = board[M.q][M.r]
        if (M.playableFor(board.turn) || ((board.moveNumber < 3) && M.height == 0)) {
            prevColor = M.color
            prevHeight = M.height
            temp = true
            board.update(M.q, M.r, board.turn, max(M.los[board.turn], 1))
        }
    }
    for (let q = -N+1; q < N; q ++) {
        for (let r = -N+1; r < N; r ++) {
            let s = -q-r
            if (abs(s) < N) {
                let H = board[q][r]
                let center = L.hexToPixel(H)
                let corners = L.polygonCorners(H)
                if (H.height) {
                    // fill(hexColors[H.color])
                    // if (H.color && H.los[-H.color] > H.height) {
                    //     fill(stackColors[-H.color])
                    // }
                    if (H.color) fill(hexColors[H.color])
                    else fill(50)
                    // fill(50)
                    
                } else {
                    if (H.los[1] == 0 && H.los[-1] == 0) {
                        fill(50)
                    } else {
                        fill(hexColors[Math.sign(H.los[1]-H.los[-1])])
                    }
                    
                }
                
                if (!influence.checked()) fill('#EAC185')
                stroke('black')
                beginShape()
                for (let corner of corners) {
                    vertex(corner.x, corner.y)
                }
                endShape(CLOSE)
            }
            
        }
    }
    push()
    for (let q = -N+1; q < N; q ++) {
        for (let r = -N+1; r < N; r ++) {
            let s = -q-r
            if (abs(s) < N) {
                let H = board[q][r]
                let center = L.hexToPixel(H)
                if (H.height) {
                    fill(stackColors[H.color])
                    strokeWeight(3)
                    if (H.color) {
                        if (H.playableFor(-H.color)) {
                            stroke(stackColors[-H.color])
                        } else {
                            stroke('black')
                            strokeWeight(1)
                        }
                    } else {
                        if (H.playableFor(1)) {
                            if (H.playableFor(-1)) {
                                stroke(hexColors[0])
                            } else {
                                stroke(stackColors[1])
                            }
                        } else {
                            if (H.playableFor(-1)) {
                                stroke(stackColors[-1])
                            } else {
                                stroke('black')
                                strokeWeight(1)
                            }
                        }
                    }
                    circle(center.x, center.y, stackR)
                    strokeWeight(1)
                    fill('black')
                    noStroke()
                    text(H.height, center.x, center.y+1)
                }
            }
        }
    }
    pop()

    // updateScores()

    if (temp) {
        board.update(M.q, M.r, prevColor, prevHeight)
        board.moveNumber -= 2
    }

    // fill('black')
    // noStroke()
    // text(M.q, 50, 50)
    // text(M.r, 50, 100)

}

function mousePressed() {
    let H = L.pixelToHex(new Point(mouseX, mouseY)).round()
    if (board.contains(H.q, H.r, H.s)) {
        H = board[H.q][H.r]
        if (H.playableFor(board.turn) || ((board.moveNumber < 3) && H.height == 0)) {
            board.update(H.q, H.r, board.turn, max(H.los[board.turn], 1))
            board.turn = -board.turn
            updateScores()
            
        }
    }
}

function keyPressed() {
    let i = 'ytrewq0123456+'.indexOf(key)
    if (i == -1) return
    let color, height
    if (i == 13) {
        color = 0
        height = 2
    } else {
        i -= 6
        color = Math.sign(i)
        height = abs(i)
    }
    let H = L.pixelToHex(new Point(mouseX, mouseY)).round()
    if (board.contains(H.q, H.r, H.s)) {
        H = board[H.q][H.r]
        board.update(H.q, H.r, color, height)
        updateScores()
    }
}

function windowResized() {
    let N = board.size + coordinates.checked()
    let Rx = windowWidth/(2*sqrt(3)*N)
    let Ry = windowHeight/(3*N)
    R = min(Rx, Ry)
    resizeCanvas(R*2*sqrt(3)*N, R*3*N)
    stackR = R*sqrt(3)/2*0.9
    textSize(R)
    strokeWeight(1)
    L = new Layout(Layout.pointy, new Point(R, R), new Point(width/2, height/2))
}