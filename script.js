const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const bestElement = document.getElementById("best");

const tileCount = 20;
const tileSize = canvas.width / tileCount;
const gameSpeed = 110;

let snake;
let food;
let direction;
let nextDirection;
let score;
let gameLoopTimer;
let isPaused = false;

const bestScoreKey = "snake-best-score";
let bestScore = Number(localStorage.getItem(bestScoreKey)) || 0;
bestElement.textContent = String(bestScore);

function resetGame() {
  snake = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { ...direction };
  score = 0;
  scoreElement.textContent = String(score);
  isPaused = false;
  placeFood();
  draw();
}

function placeFood() {
  do {
    food = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (snake.some((part) => part.x === food.x && part.y === food.y));
}

function update() {
  if (isPaused) {
    draw("暂停中");
    return;
  }

  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  const hitWall =
    head.x < 0 || head.y < 0 || head.x >= tileCount || head.y >= tileCount;
  const hitSelf = snake.some((part) => part.x === head.x && part.y === head.y);

  if (hitWall || hitSelf) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += 10;
    scoreElement.textContent = String(score);
    if (score > bestScore) {
      bestScore = score;
      bestElement.textContent = String(bestScore);
      localStorage.setItem(bestScoreKey, String(bestScore));
    }
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function draw(message = "") {
  ctx.fillStyle = "#081121";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  ctx.fillStyle = "#ff5d8f";
  ctx.beginPath();
  ctx.roundRect(food.x * tileSize + 2, food.y * tileSize + 2, tileSize - 4, tileSize - 4, 6);
  ctx.fill();

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? "#73ffb2" : "#4adf96";
    ctx.beginPath();
    ctx.roundRect(
      segment.x * tileSize + 1,
      segment.y * tileSize + 1,
      tileSize - 2,
      tileSize - 2,
      index === 0 ? 8 : 5
    );
    ctx.fill();
  });

  if (message) {
    ctx.fillStyle = "rgba(4, 7, 14, 0.72)";
    ctx.fillRect(0, canvas.height / 2 - 34, canvas.width, 68);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 9);
  }
}

function drawGrid() {
  ctx.strokeStyle = "rgba(129, 166, 214, 0.12)";
  ctx.lineWidth = 1;
  for (let i = 1; i < tileCount; i += 1) {
    const pos = i * tileSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
    ctx.stroke();
  }
}

function gameOver() {
  clearInterval(gameLoopTimer);
  draw("游戏结束");
}

function startGameLoop() {
  clearInterval(gameLoopTimer);
  gameLoopTimer = setInterval(update, gameSpeed);
}

function setDirection(newX, newY) {
  if (direction.x === -newX && direction.y === -newY) {
    return;
  }
  nextDirection = { x: newX, y: newY };
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " ", "enter", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
  }

  if (key === "arrowup" || key === "w") setDirection(0, -1);
  if (key === "arrowdown" || key === "s") setDirection(0, 1);
  if (key === "arrowleft" || key === "a") setDirection(-1, 0);
  if (key === "arrowright" || key === "d") setDirection(1, 0);

  if (key === " ") {
    isPaused = !isPaused;
    if (!isPaused) draw();
  }

  if (key === "enter") {
    resetGame();
    startGameLoop();
  }
});

resetGame();
startGameLoop();
