/*variables for the game board*/
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 30;
const tileCount = canvas.width / gridSize;

/*variables for the snake*/
var snake = [{ x: 10, y: 10 }, {x: 9, y: 10}];
var direction = { x: 0, y: 0 };
var food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
var gameOver = false;
var startSnakeMovement = false;

/*variables for the speed up power up*/
var speedUp = { x: null, y: null };
var isSpeedUpActive = false;
var speedUpDuration = 5000; // 5 seconds
var normalSpeed = 100;
var fastSpeed = 75;
var currentSpeed = normalSpeed;
var speedUpTimeout;
var speedUpInterval;

/*variables for double points power up*/
var doublePoints = { x: null, y: null };
var isDoublePointsActive = false;
var doublePointsDuration = 10000; // 10 seconds
var doublePointsTimeout;
var doublePointsInterval;

/*variables for break power up*/
var breakPowerUp = { x: null, y: null };
var isBreakPowerUpActive = false;
var breakPowerUpInterval;

// Load images
var speedUpImage = new Image();
speedUpImage.src = 'images/speedUp.png';

var doublePointsImage = new Image();
doublePointsImage.src = 'images/doubleUp.png';

var breakPowerUpImage = new Image();
breakPowerUpImage.src = 'images/breakUp.png';

var foodImage = new Image();
foodImage.src = 'images/food.png';

speedUpImage.onload = () => console.log('Speed-up image loaded');
doublePointsImage.onload = () => console.log('Double points image loaded');
breakPowerUpImage.onload = () => console.log('Break power-up image loaded');
foodImage.onload = () => console.log('Food image loaded');

/*variables for the high scores*/
var allTimeHighScore = 0;
var allTimeHighScoreSpan = document.getElementById('allTimeHighScore');

var yourHighScore = 0;
var yourHighScoreSpan = document.getElementById('yourHighScore');

var currScore = 0;
var currScoreSpan = document.getElementById('currScore');

// Select modal and close button
const modal = document.getElementById('infoModal');
const closeModalButton = document.getElementById('closeModalButton');

var modalOpen = true;

// Function to hide the modal
function closeModal() {
  modal.classList.add("hidden");
  modalOpen = false;
}

// Event listener for the close button
closeModalButton.addEventListener('click', closeModal);


//functions for generation power ups
function generateSpeedUp() {
  do {
    speedUp.x = Math.floor(Math.random() * tileCount);
    speedUp.y = Math.floor(Math.random() * tileCount);
  } while (
    (speedUp.x === breakPowerUp.x && speedUp.y === breakPowerUp.y) || // Avoid break power-up
    (speedUp.x === doublePoints.x && speedUp.y === doublePoints.y) || // Avoid double points power-up
    (speedUp.x === food.x && speedUp.y === food.y) || // Avoid food
    snake.some((part) => part.x === speedUp.x && part.y === speedUp.y) // Avoid snake
  );

  isSpeedUpActive = true;
}

function generateBreakPowerUp() {
  do {
    breakPowerUp.x = Math.floor(Math.random() * tileCount);
    breakPowerUp.y = Math.floor(Math.random() * tileCount);
  } while (
    (breakPowerUp.x === speedUp.x && breakPowerUp.y === speedUp.y) || // Avoid speed power-up
    (breakPowerUp.x === doublePoints.x && breakPowerUp.y === doublePoints.y) || // Avoid double points power-up
    (breakPowerUp.x === food.x && breakPowerUp.y === food.y) || // Avoid food
    snake.some((part) => part.x === breakPowerUp.x && part.y === breakPowerUp.y) // Avoid snake
  );

  isBreakPowerUpActive = false;
}

function generateDoublePoints() {
  do {
    doublePoints.x = Math.floor(Math.random() * tileCount);
    doublePoints.y = Math.floor(Math.random() * tileCount);
  } while (
    (doublePoints.x === speedUp.x && doublePoints.y === speedUp.y) || // Avoid speed power-up
    (doublePoints.x === breakPowerUp.x && doublePoints.y === breakPowerUp.y) || // Avoid break power-up
    (doublePoints.x === food.x && doublePoints.y === food.y) || // Avoid food
    snake.some((part) => part.x === doublePoints.x && part.y === doublePoints.y) // Avoid snake
  );

  isDoublePointsActive = false;
}

// start the intervals for generating power-ups
function startIntervals () {
  speedUpInterval = setInterval(() => {
    if (!isSpeedUpActive) {
      generateSpeedUp();
    }
  }, 15000);
  
  breakPowerUpInterval = setInterval(() => {
    if (!isBreakPowerUpActive) {
      generateBreakPowerUp();
    }
  }, 25000);

  doublePointsInterval = setInterval(() => {
    if (!isDoublePointsActive) {
      generateDoublePoints();
    }
  }, 20000);
}

var gameOverModal = document.getElementById("gameOverModal");

function resetGame(){
    gameOverModal.classList.add("hidden");
    modalOpen = false;

    currScore = 0;
    currScoreSpan.innerText = 0;

    speedUp = { x: null, y: null };
    doublePoints = { x: null, y: null };
    breakPowerUp = { x: null, y: null };

    startSnakeMovement = false;
    gameOver = false;
    isBreakPowerUpActive = false;
    isSpeedUpActive = false;
    isDoublePointsActive = false;
    currentSpeed = normalSpeed;

    clearTimeout(speedUpTimeout);
    clearTimeout(doublePointsTimeout);
    clearInterval(doublePointsInterval);
    clearInterval(speedUpInterval);
    clearInterval(breakPowerUpInterval);

    snake = [{ x: 10, y: 10 }, {x: 9, y: 10}];
    direction = { x: 0, y: 0 };
    food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
}

function showGameOver(){
  modalOpen = true;
  gameOverModal.classList.remove("hidden");
  var modalScore = document.getElementById("gameOverModalScore");

  modalScore.innerText = currScore;
}

var playAgainButton = document.getElementById("playAgainButton");
playAgainButton.addEventListener('click', resetGame)

function gameLoop() {

  if (gameOver) {
     showGameOver();
  }

  if(!gameOver){
    drawGame();

    if(startSnakeMovement){
      moveSnake();
      checkCollisions();
  }
}
  
  //Call gameLoop function again with 100ms delay 
  setTimeout(gameLoop, currentSpeed);
}

function moveSnake() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  //Add new head to front of snake array
  snake.unshift(head); 

  //if snake eats power up
  if (isSpeedUpActive && head.x === speedUp.x && head.y === speedUp.y) {
    isSpeedUpActive = false;
    currentSpeed = fastSpeed;

    clearTimeout(speedUpTimeout);
    speedUpTimeout = setTimeout(() => {
      currentSpeed = normalSpeed;
    }, speedUpDuration);
  }

  //if snake eats double points power up
  if (head.x === doublePoints.x && head.y === doublePoints.y) {
    isDoublePointsActive = true; 
    doublePoints = { x: null, y: null }; 
  
    // Activate the double points effect
    clearTimeout(doublePointsTimeout); 
    doublePointsTimeout = setTimeout(() => {
      isDoublePointsActive = false;
    }, doublePointsDuration);
  }
  

  if (head.x === breakPowerUp.x && head.y === breakPowerUp.y) {
    isBreakPowerUpActive = true; 
    breakPowerUp = { x: null, y: null }; 
  }
   
  if (head.x === food.x && head.y === food.y) {
    food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
    if (isDoublePointsActive) {
      currScore += 2;
    } else {
      currScore++;
    }
    currScoreSpan.innerText = currScore;  

    if(currScore > yourHighScore){
        yourHighScore = currScore;
        yourHighScoreSpan.innerText = yourHighScore;
    }

    if(currScore > allTimeHighScore){
        allTimeHighScore = currScore;
        allTimeHighScoreSpan.innerText = allTimeHighScore;
        submitScore(allTimeHighScore);
    }

  } else {

    //Remove tail of snake array
    snake.pop(); 
  }
}

function drawGame() {
  
  //Draw the checkered board
  for (var row = 0; row < tileCount; row++) {
    for (var col = 0; col < tileCount; col++) {
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = '#b08d54'; 
      } else {
        ctx.fillStyle = '#D1B17D'; 
      }
      ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
    }
  }


  //Draw the snake
  ctx.fillStyle = isBreakPowerUpActive ? '#FFFF00' : '#fc7979'; // Yellow when break power-up is active, green otherwise
  snake.forEach((part) => {
    if(part === snake[0]){

        //Draw snake head
        ctx.beginPath();
        ctx.arc(part.x * gridSize + gridSize / 2, part.y * gridSize + gridSize / 2, gridSize / 2 + 5, 0, 2 * Math.PI);
        ctx.fill();
    }else{

        //Draw rest of snake
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
    }
  });

  // Draw the break power-up
  if (breakPowerUp.x !== null && breakPowerUp.y !== null) {
    ctx.drawImage(
      breakPowerUpImage,
      breakPowerUp.x * gridSize,
      breakPowerUp.y * gridSize,
      gridSize,
      gridSize
    );
  }

  // Draw speed-up power-up
  if (isSpeedUpActive) {
    ctx.drawImage(
      speedUpImage,
      speedUp.x * gridSize,
      speedUp.y * gridSize,
      gridSize,
      gridSize
    );
  }

  // Draw double points power-up
  if (doublePoints.x !== null && doublePoints.y !== null) {
    ctx.drawImage(
      doublePointsImage,
      doublePoints.x * gridSize,
      doublePoints.y * gridSize,
      gridSize,
      gridSize
    );
  }

  // Draw food
  if (foodImage.complete) {
    ctx.drawImage(
      foodImage,
      food.x * gridSize,
      food.y * gridSize,
      gridSize,
      gridSize
    );
  } else {
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2, 0, 2 * Math.PI);
    ctx.fillStyle = '#F00';
    ctx.fill();
  }
}

function handleMovementKeys(event){

  if(modalOpen){
    return;
  }

  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      if (direction.y === 0) {
        if(!startSnakeMovement){
          startSnakeMovement = true;
          startIntervals();
        }
        direction = { x: 0, y: -1 };
      }
      break;
    case 'ArrowDown':
    case 's':
      if (direction.y === 0) {
        if(!startSnakeMovement){
          startSnakeMovement = true;
          startIntervals();
        }
        direction = { x: 0, y: 1 };
        
      }
      break;
    case 'ArrowLeft':
    case 'a':
      if (direction.x === 0 && startSnakeMovement) {
        direction = { x: -1, y: 0 };
      }
      break;
    case 'ArrowRight':
    case 'd':
      if (direction.x === 0) {
        if(!startSnakeMovement){
          startSnakeMovement = true;
          startIntervals();
        }
        direction = { x: 1, y: 0 };
      }
      break;
  }
}

document.addEventListener('keydown', handleMovementKeys);

function checkCollisions() {
  const head = snake[0];

  //Check if snake head is out of bounds
  if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
    gameOver = true;
  }



  //Check if snake head hit its body
  for (let i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      if (isBreakPowerUpActive) {
        // Break power-up active: remove all parts after collision
        snake = snake.slice(0, i); 
        isBreakPowerUpActive = false; 
        break; 
      } else {
        gameOver = true; 
      }
    }
  }
}

async function initializeAllTimeHighScore(){
  await updateHighScore();
  allTimeHighScoreSpan.innerText = allTimeHighScore;
}

initializeAllTimeHighScore();
gameLoop();


// Function to submit a new score
async function submitScore(score) {
    try {
      const response = await fetch('http://localhost:3000/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score })
      });
      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  }
  
// Function to update high score
async function updateHighScore() {
  try {
    const response = await fetch('http://localhost:3000/get-scores');
    const scores = await response.json();

    if(scores.length === 0){
      allTimeHighScore = 0;
    }else{
      allTimeHighScore = scores[0].score;
    }
  } catch (error) {
    console.error('Error retrieving scores:', error);
  }
}
  