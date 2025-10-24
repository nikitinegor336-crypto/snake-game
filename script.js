const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

// ===== Меню =====
const menu = document.getElementById("menu");
const gameContainer = document.getElementById("game-container");
const playBtn = document.getElementById("playBtn");
const recordsBtn = document.getElementById("recordsBtn");
const settingsBtn = document.getElementById("settingsBtn");
const restartBtn = document.getElementById("restartBtn");

// ====== Игра ======
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const box = 20;
let score = 0;
let snake, food, dir, game;

// ====== Мини-змейка в меню ======
const animCanvas = document.getElementById("snake-animation");
const animCtx = animCanvas.getContext("2d");
let animSnake = [{ x: 5, y: 5 }];
let animDir = "RIGHT";
let animBox = 10;

function drawAnimatedSnake() {
  animCtx.clearRect(0, 0, animCanvas.width, animCanvas.height);
  for (let i = 0; i < animSnake.length; i++) {
    animCtx.fillStyle = i === 0 ? "#00FF7F" : "#008000";
    animCtx.fillRect(animSnake[i].x * animBox, animSnake[i].y * animBox, animBox, animBox);
  }
  let head = { ...animSnake[0] };
  if (animDir === "RIGHT") head.x++;
  if (animDir === "LEFT") head.x--;
  if (animDir === "UP") head.y--;
  if (animDir === "DOWN") head.y++;

  animSnake.unshift(head);
  animSnake.pop();

  if (head.x >= 40 || head.x < 0) animDir = animDir === "RIGHT" ? "LEFT" : "RIGHT";
  if (head.y >= 20 || head.y < 0) animDir = animDir === "DOWN" ? "UP" : "DOWN";
}

setInterval(drawAnimatedSnake, 100);

// ====== Запуск игры ======
playBtn.addEventListener("click", () => {
  menu.style.display = "none";
  gameContainer.style.display = "block";
  startGame();
});

restartBtn.addEventListener("click", () => {
  startGame();
});

function startGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  food = randomFood();
  dir = null;
  score = 0;
  document.getElementById("score").innerText = score;
  clearInterval(game);
  game = setInterval(draw, 150);
}

function randomFood() {
  return {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box,
  };
}

// ====== Клавиатурное управление ======
document.addEventListener("keydown", direction);

function direction(event) {
  if (event.keyCode == 37 && dir !== "RIGHT") dir = "LEFT";
  else if (event.keyCode == 38 && dir !== "DOWN") dir = "UP";
  else if (event.keyCode == 39 && dir !== "LEFT") dir = "RIGHT";
  else if (event.keyCode == 40 && dir !== "UP") dir = "DOWN";
}

// ====== Улучшенное мобильное управление (свайпы) ======
let startX, startY;
const SWIPE_THRESHOLD = 30;

document.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
}, false);

document.addEventListener('touchend', function(e) {
    let endX = e.changedTouches[0].clientX;
    let endY = e.changedTouches[0].clientY;

    let dx = endX - startX;
    let dy = endY - startY;

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && dir !== "LEFT") dir = "RIGHT";
        else if (dx < 0 && dir !== "RIGHT") dir = "LEFT";
    } else {
        if (dy > 0 && dir !== "UP") dir = "DOWN";
        else if (dy < 0 && dir !== "DOWN") dir = "UP";
    }
}, false);

// Блокировка скролла страницы при свайпе
document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

// ====== Виртуальные кнопки на экране ======
document.getElementById("upBtn").addEventListener("click", () => { if(dir !== "DOWN") dir = "UP"; });
document.getElementById("downBtn").addEventListener("click", () => { if(dir !== "UP") dir = "DOWN"; });
document.getElementById("leftBtn").addEventListener("click", () => { if(dir !== "RIGHT") dir = "LEFT"; });
document.getElementById("rightBtn").addEventListener("click", () => { if(dir !== "LEFT") dir = "RIGHT"; });

// ====== Основная функция игры ======
function draw() {
  ctx.clearRect(0, 0, 400, 400);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i == 0 ? "#00FF7F" : "#008000";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "#FF4040";
  ctx.fillRect(food.x, food.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (dir == "LEFT") snakeX -= box;
  if (dir == "UP") snakeY -= box;
  if (dir == "RIGHT") snakeX += box;
  if (dir == "DOWN") snakeY += box;

  if (snakeX == food.x && snakeY == food.y) {
    score++;
    document.getElementById("score").innerText = score;
    food = randomFood();
  } else {
    snake.pop();
  }
