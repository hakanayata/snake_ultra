document.addEventListener("DOMContentLoaded", () => {
    // elements
    const boardDiv = document.getElementById("boardDiv")
    const statsDiv = document.getElementById("statsDiv")
    const infoPar = document.getElementById("info")
    const scoreSpan = document.getElementById("score")
    const highestScoreSpan = document.getElementById("highestScore")
    const speedSpan = document.getElementById("speed")
    const header = document.getElementById("header")
    const title = document.getElementById("title")
    const mobileNavigationDiv = document.getElementById("mobileNav")
    const arrowBtnsDiv = document.getElementById("arrowBtns")
    const arrow1stRowDiv = document.getElementById("arrow1stRow")
    const arrow2ndRowDiv = document.getElementById("arrow2ndRow")
    const arrow3rdRowDiv = document.getElementById("arrow3rdRow")
    const playBtnDiv = document.getElementById("playBtn")


    // initial values
    let SQUARE_SIZE_PX = 24
    let BOARD_SIZE_X = null
    let BOARD_SIZE_Y = null
    let SQUARES_ON_X = BOARD_SIZE_X / SQUARE_SIZE_PX
    let SQUARES_ON_Y = BOARD_SIZE_Y / SQUARE_SIZE_PX

    const isMobile = () => {
        if (window.innerWidth < 700 || window.innerHeight < 700) {
            return true
        } else {
            return false
        }
    }

    const drawBoard = (w, h) => {
        const horizontalSquares = w / SQUARE_SIZE_PX
        const verticalSquares = h / SQUARE_SIZE_PX
        // console.log("W:", horizontalSquares, "H:", verticalSquares);

        for (let i = 0; i < horizontalSquares; i++) {
            const squareRow = document.createElement("div")
            for (let j = 0; j < verticalSquares; j++) {
                const square = document.createElement("div")
                square.style.width = SQUARE_SIZE_PX + "px"
                square.style.height = SQUARE_SIZE_PX + "px"
                // square.style.border = "1px #555 solid"
                square.style.backgroundColor = "#113"
                squareRow.appendChild(square)

            }
            boardDiv.appendChild(squareRow)
        }
    }

    const adjustVariablesToScreen = () => {
        // Check if on device type
        if (isMobile()) {
            BOARD_SIZE_X = 288
            BOARD_SIZE_Y = 336
            header.style.padding = "8px"
            title.style.fontSize = "1.5rem"
            statsDiv.style.width = "300px"
            statsDiv.style.fontSize = "1.2rem"
            statsDiv.style.margin = ".5rem 0"
            speedSpan.style.width = "100px"
            scoreSpan.style.width = "100px"
            highestScoreSpan.style.width = "100px"
            infoPar.style.display = "none"
            createMobileButtons()
        } else {
            BOARD_SIZE_X = 480
            BOARD_SIZE_Y = 480
            header.style.padding = "16px"
        }
        SQUARES_ON_X = BOARD_SIZE_X / SQUARE_SIZE_PX
        SQUARES_ON_Y = BOARD_SIZE_Y / SQUARE_SIZE_PX
    }

    let highestScore = localStorage.getItem("highestScore") || 0
    let isPlaying = false
    let food = null;
    let isGameOver = null
    let snakeSegments = []
    let snakeLength = 3
    let sqps = 5
    let headPos = [120, BOARD_SIZE_X / 2 - SQUARE_SIZE_PX]
    let score = 0
    let direction = "RIGHT"
    // let snakeHead = null;



    const createSnake = () => {
        for (let i = 0; i < snakeLength; i++) {
            const segment = document.createElement("div")
            segment.style.width = `${SQUARE_SIZE_PX}px`
            segment.style.height = `${SQUARE_SIZE_PX}px`
            segment.style.position = "absolute"
            segment.style.left = (headPos[0] - i * SQUARE_SIZE_PX) + "px"
            segment.style.top = headPos[1] + "px"
            segment.style.backgroundColor = "#6c6"
            segment.style.borderRadius = "20%"
            if (i === 0) {
                segment.style.backgroundColor = "#bbc"
            }
            boardDiv.appendChild(segment)
            snakeSegments.push(segment)
        }
        // snakeHead = snakeSegments[0]

    }

    const getRandomAxes = () => {
        const x = Math.floor(Math.random() * SQUARES_ON_X) * SQUARE_SIZE_PX
        const y = Math.floor(Math.random() * SQUARES_ON_Y) * SQUARE_SIZE_PX
        const randomAxes = [x, y]
        return randomAxes
    }

    const createFood = () => {
        const [x, y] = getRandomAxes()
        // Recreate the food if it overlaps with the snake
        for (let i = 0; i < snakeSegments.length; i++) {
            const segment = snakeSegments[i]
            const segmentX = segment.offsetLeft
            const segmentY = segment.offsetTop
            if (segmentX === x && segmentY === y) {
                // console.log(segmentX, segmentY, "---", x, y);
                createFood()
                return
            }
        }
        food = document.createElement("div")
        food.style.height = SQUARE_SIZE_PX + "px"
        food.style.width = SQUARE_SIZE_PX + "px"
        food.style.position = "absolute"
        food.style.display = "flex"
        food.style.justifyContent = "center"
        food.style.alignItems = "center"
        food.style.left = x + "px"
        food.style.top = y + "px"
        food.style.userSelect = "none"
        food.style.fontSize = SQUARE_SIZE_PX + "px"
        food.textContent = "🍎"
        // food.textContent = `${SQUARE_SIZE_PX}`
        food.style.color = "white"
        boardDiv.appendChild(food)
    }

    const startGame = () => {
        gameLoop = setInterval(moveSnake, 1000 / sqps)
    }

    const pauseGame = () => {
        clearInterval(gameLoop)
    }

    const togglePlaying = () => {
        if (isGameOver) return
        if (isPlaying) {
            isPlaying = false
        } else {
            isPlaying = true
        }
    }

    const gameOver = () => {
        pauseGame()
        isGameOver = true
        sqps = 5
        infoPar.textContent = "GAME OVER"
        if (score > highestScore) {
            highestScoreSpan.textContent = score
            localStorage.setItem("highestScore", score)
        }
    }

    const increaseSpeed = () => {
        sqps += 1 / 3
        speedSpan.textContent = sqps.toFixed(0)
    }

    const checkCollisions = () => {
        // Boundry collision
        if (
            headPos[0] < 0 ||
            headPos[0] >= BOARD_SIZE_X ||
            headPos[1] < 0 ||
            headPos[1] >= BOARD_SIZE_Y) {
            gameOver()
            return
        }
        // Self-collision
        for (let i = 1; i < snakeSegments.length; i++) {
            const segment = snakeSegments[i]
            const segmentX = segment.offsetLeft
            const segmentY = segment.offsetTop

            if (headPos[0] === segmentX && headPos[1] === segmentY) {
                gameOver()
                return
            }
        }
    }

    const startNewGame = () => {
        adjustVariablesToScreen()
        snakeSegments = []
        headPos = [120, BOARD_SIZE_X / 2 - SQUARE_SIZE_PX]
        isPlaying = false
        isGameOver = false
        score = 0
        direction = "RIGHT"
        highestScore = localStorage.getItem("highestScore") || 0
        boardDiv.innerHTML = ""
        drawBoard(BOARD_SIZE_X, BOARD_SIZE_Y)
        speedSpan.textContent = sqps
        scoreSpan.textContent = score
        highestScoreSpan.textContent = highestScore
        infoPar.textContent = 'Press "Space" key to start'

        createSnake()
        createFood()
    }

    const createMobileButtons = () => {
        const playBtn = document.createElement("button")
        playBtn.textContent = "⏯"
        playBtn.dataset["roles"] = "playPause"
        const upBtn = document.createElement("button")
        upBtn.textContent = "↑"
        upBtn.role = "button"
        upBtn.dataset["direction"] = "UP"
        const downBtn = document.createElement("button")
        downBtn.textContent = "↓"
        downBtn.role = "button"
        downBtn.dataset["direction"] = "DOWN"
        const leftBtn = document.createElement("button")
        leftBtn.textContent = "←"
        leftBtn.role = "button"
        leftBtn.dataset["direction"] = "LEFT"
        const rightBtn = document.createElement("button")
        rightBtn.textContent = "→"
        rightBtn.role = "button"
        rightBtn.dataset["direction"] = "RIGHT"

        playBtnDiv.appendChild(playBtn)
        arrow1stRowDiv.appendChild(upBtn)
        arrow3rdRowDiv.appendChild(downBtn)
        arrow2ndRowDiv.appendChild(leftBtn)
        arrow2ndRowDiv.appendChild(rightBtn)

    }

    // Listen for game start / stop
    document.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
            if (isGameOver) {
                startNewGame()
                return
            }
            if (isPlaying) {
                pauseGame()
            } else {
                startGame()
            }
            togglePlaying()
            infoPar.textContent = `${isPlaying ? 'Game is ON, use arrow keys to navigate' : 'PAUSED'}`
        }
    })

    document.addEventListener("click", (e) => {
        if (e.target.dataset.roles === "playPause") {
            if (isGameOver) {
                arrow1stRowDiv.innerHTML = ""
                arrow2ndRowDiv.innerHTML = ""
                arrow3rdRowDiv.innerHTML = ""
                playBtnDiv.innerHTML = ""
                startNewGame()
                return
            }
            if (isPlaying) {
                pauseGame()
            } else {
                startGame()
            }
            togglePlaying()
        }
    })

    // Snake's navigation
    document.addEventListener("click", (e) => {
        if (!isPlaying || isGameOver) return

        if (e.target.dataset.direction === "LEFT" && direction !== "RIGHT") {
            direction = "LEFT"
        } else if (e.target.dataset.direction === "RIGHT" && direction !== "LEFT") {
            direction = "RIGHT"
        } else if (e.target.dataset.direction === "UP" && direction !== "DOWN") {
            direction = "UP"
        } else if (e.target.dataset.direction === "DOWN" && direction !== "UP") {
            direction = "DOWN"
        }

    })

    document.addEventListener("keydown", (e) => {
        if (!isPlaying || isGameOver) return

        if (e.code === "ArrowLeft" && direction !== "RIGHT") {
            direction = "LEFT"
        } else if (e.code === "ArrowRight" && direction !== "LEFT") {
            direction = "RIGHT"
        } else if (e.code === "ArrowUp" && direction !== "DOWN") {
            direction = "UP"
        } else if (e.code === "ArrowDown" && direction !== "UP") {
            direction = "DOWN"
        }

        moveSnake()
    })

    const moveSnake = () => {
        // ? Fix or not fix the problem (feature) where holding a key pressed causes change in speed

        // Calculate new position
        let [newHeadX, newHeadY] = headPos

        if (direction === "LEFT") {
            newHeadX -= SQUARE_SIZE_PX
        } else if (direction === "RIGHT") {
            newHeadX += SQUARE_SIZE_PX
        } else if (direction === "UP") {
            newHeadY -= SQUARE_SIZE_PX
        } else if (direction === "DOWN") {
            newHeadY += SQUARE_SIZE_PX
        }

        // Check if newHead is within the boundary
        if (newHeadX < 0 ||
            newHeadX >= BOARD_SIZE_X ||
            newHeadY < 0 ||
            newHeadY >= BOARD_SIZE_Y) {
            gameOver();
            return
        }

        // Remove tail (last segment)
        const tail = snakeSegments.pop()
        boardDiv.removeChild(tail)

        // Create a new head segment at new position 
        const newHead = document.createElement("div")
        newHead.style.width = SQUARE_SIZE_PX + "px"
        newHead.style.height = SQUARE_SIZE_PX + "px"
        newHead.style.position = "absolute"
        newHead.style.left = newHeadX + "px"
        newHead.style.top = newHeadY + "px"
        newHead.style.backgroundColor = "#6c6"
        newHead.style.borderRadius = "20%"
        boardDiv.appendChild(newHead)

        // Add the new head to the snake array
        snakeSegments.unshift(newHead)

        // Update the snake's position
        headPos = [newHeadX, newHeadY]

        // When snake's head and food overlaps
        if (newHeadX === food.offsetLeft && newHeadY === food.offsetTop) {
            // Remove food
            boardDiv.removeChild(food)
            // Increase snake's size
            const belly = document.createElement("div")
            belly.style.width = SQUARE_SIZE_PX + "px"
            belly.style.height = SQUARE_SIZE_PX + "px"
            belly.style.position = "absolute"

            const lastSegment = snakeSegments[snakeSegments.length - 1]
            const lastSegmentX = lastSegment.offsetLeft
            const lastSegmentY = lastSegment.offsetTop

            belly.style.left = lastSegmentX + "px"
            belly.style.top = lastSegmentY + "px"
            belly.style.backgroundColor = "#6c6"
            boardDiv.appendChild(belly)
            snakeSegments.push(belly)

            pauseGame()
            increaseSpeed()
            startGame()
            createFood()
            score++
            scoreSpan.textContent = score
        }

        // Format head segment while moving
        for (let i = 0; i < snakeSegments.length; i++) {
            if (i === 0) {
                const headSegment = snakeSegments[i]
                headSegment.style.backgroundColor = "#bbc"
            } else {
                const bodySegment = snakeSegments[i]
                bodySegment.style.backgroundColor = "#6c6"
            }
        }

        checkCollisions()

    }

    startNewGame()
})

// const getSnakesCoordinates = () => {
//     //
//     const currSnakesCoordinates = [snakeHead.offsetLeft, snakeHead.offsetTop]
//     // console.log("current head's axes", currSnakesCoordinates)
//     return currSnakesCoordinates
// }