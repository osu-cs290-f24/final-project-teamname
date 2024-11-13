const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 40;
const tileCount = canvas.width / gridSize;

var snake = [{ x: 10, y: 10 }, {x: 9, y: 10}];
var direction = { x: 0, y: 0 };
var food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
var gameOver = false;
var startSnakeMovement = false;

var allTimeHighScore = 0;
var allTimeHighScoreSpan = document.getElementById('allTimeHighScore');

var yourHighScore = 0;
var yourHighScoreSpan = document.getElementById('yourHighScore');

var currScore = 0;
var currScoreSpan = document.getElementById('currScore');

function resetGame(){
    currScore = 0;
    currScoreSpan.innerText = 0;

    startSnakeMovement = false;
    gameOver = false;

    snake = [{ x: 10, y: 10 }, {x: 9, y: 10}];
    direction = { x: 0, y: 0 };
    food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
}

function gameLoop() {

  if (gameOver) {
    alert("Game Over! Play again?");

    resetGame();
  }

  drawGame();

  if(startSnakeMovement){
    moveSnake();
    checkCollisions();
  }
  
  //Call gameLoop function again with 100ms delay 
  setTimeout(gameLoop, 100);
}

function moveSnake() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

  //Add new head to front of snake array
  snake.unshift(head); 
  
  if (head.x === food.x && head.y === food.y) {
    food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
    currScore++;
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
        ctx.fillStyle = '#A9A9A9'; 
      } else {
        ctx.fillStyle = '#808080'; 
      }
      ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
    }
  }

  //Draw the snake
  ctx.fillStyle = '#0F0';
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

  //Draw the food
  ctx.beginPath();
  ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2, 0, 2 * Math.PI);
  ctx.fillStyle = '#F00';
  ctx.fill();
  
}

function handleMovementKeys(event){
  switch (event.key) {
    case 'ArrowUp':
    case 'w':
      if (direction.y === 0) {
        direction = { x: 0, y: -1 };
        startSnakeMovement = true;
      }
      break;
    case 'ArrowDown':
    case 's':
      if (direction.y === 0) {
        direction = { x: 0, y: 1 };
        startSnakeMovement = true;
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
        direction = { x: 1, y: 0 };
        startSnakeMovement = true;
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
  for (var i = 1; i < snake.length; i++) {
    if (head.x === snake[i].x && head.y === snake[i].y) {
      gameOver = true;
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
  