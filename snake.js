// elements
const boardDiv = document.getElementById("boardDiv")
const statsDiv = document.getElementById("statsDiv")
const playBtn = document.getElementById("playBtn")
const infoPar = document.getElementById("info")
const scoreSpan = document.getElementById("score")
const highestScoreSpan = document.getElementById("highestScore")
// let snakeHead = null;
let food = null;

// constants
const SQUARE_SIZE_PX = 24
const BOARD_SIZE = 480
const SQUARES_ON_EACH_DIRECTION = BOARD_SIZE / SQUARE_SIZE_PX

// initial values
let highestScore = localStorage.getItem("highestScore") || 0
let isPlaying = false
let isGameOver = null
let snakeSegments = []
let snakeLength = 3
let initialSpeed = 1
let headPos = [120, BOARD_SIZE / 2 - SQUARE_SIZE_PX]
let score = 0
let direction = "RIGHT"

const createSnake = () => {
    for (let i = 0; i < snakeLength; i++) {
        const segment = document.createElement("div")
        segment.style.width = `${SQUARE_SIZE_PX}px`
        segment.style.height = `${SQUARE_SIZE_PX}px`
        segment.style.position = "absolute"
        segment.style.left = (headPos[0] - i * SQUARE_SIZE_PX) + "px"
        segment.style.top = headPos[1] + "px"
        segment.style.backgroundColor = "#6c6"
        if (i === 0) {
            // segment.style.borderRadius = "0 50% 50% 0"
        }
        boardDiv.appendChild(segment)
        snakeSegments.push(segment)
    }
    // snakeHead = snakeSegments[0]

}
const createFood = () => {
    const [x, y] = getRandomAxes()
    // Recreate the food if it overlaps with the snake
    for (let i = 0; i < snakeSegments.length; i++) {
        const segment = snakeSegments[i]
        const segmentX = segment.offsetLeft
        const segmentY = segment.offsetTop
        if (segmentX === x && segmentY === y) {
            console.log(segmentX, segmentY, "---", x, y);
            createFood()
            return
        }
    }
    food = document.createElement("div")
    food.style.height = `${SQUARE_SIZE_PX}px`
    food.style.width = `${SQUARE_SIZE_PX}px`
    food.style.position = "absolute"
    food.style.display = "flex"
    food.style.justifyContent = "center"
    food.style.alignItems = "center"
    food.style.left = x + "px"
    food.style.top = y + "px"
    food.style.userSelect = "none"
    food.textContent = "🍎"
    boardDiv.appendChild(food)
}
const getRandomAxes = () => {
    const x = Math.floor(Math.random() * SQUARES_ON_EACH_DIRECTION) * SQUARE_SIZE_PX
    const y = Math.floor(Math.random() * SQUARES_ON_EACH_DIRECTION) * SQUARE_SIZE_PX
    const randomAxes = [x, y]
    return randomAxes
}
// const getSnakesCoordinates = () => {
//     //
//     const currSnakesCoordinates = [snakeHead.offsetLeft, snakeHead.offsetTop]
//     // console.log("current head's axes", currSnakesCoordinates)
//     return currSnakesCoordinates
// }
const startGame = () => {
    gameLoop = setInterval(moveSnake, 100)
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
    infoPar.textContent = "GAME IS OVER"
    if (score > highestScore) {
        highestScoreSpan.textContent = score
        localStorage.setItem("highestScore", score)
    }
}

const checkCollisions = () => {
    // Boundry collision
    if (
        headPos[0] < 0 ||
        headPos[0] >= BOARD_SIZE ||
        headPos[1] < 0 ||
        headPos[1] >= BOARD_SIZE) {
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
    snakeSegments = []
    headPos = [120, BOARD_SIZE / 2 - SQUARE_SIZE_PX]
    isPlaying = false
    isGameOver = false
    score = 0
    direction = "RIGHT"
    highestScore = localStorage.getItem("highestScore")
    boardDiv.innerHTML = ''
    scoreSpan.textContent = score
    highestScoreSpan.textContent = highestScore
    infoPar.textContent = 'Press the "Space" key on your keyboard to start'

    createSnake()
    createFood()
}

startNewGame()

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
        infoPar.textContent = `${isPlaying ? 'Game is ON' : 'PAUSED'}`
    }
})

// Snake's navigation
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

    // Remove tail (last segment)
    const tail = snakeSegments.pop()
    boardDiv.removeChild(tail)

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

    // Create a new head segment at new position 
    const newHead = document.createElement("div")
    newHead.style.width = SQUARE_SIZE_PX + "px"
    newHead.style.height = SQUARE_SIZE_PX + "px"
    newHead.style.position = "absolute"
    newHead.style.left = newHeadX + "px"
    newHead.style.top = newHeadY + "px"
    newHead.style.backgroundColor = "#6c6"
    // newHead.style.borderRadius = "0 50% 50% 0"
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

        createFood()
        score++
        scoreSpan.textContent = score
    }

    checkCollisions()

}