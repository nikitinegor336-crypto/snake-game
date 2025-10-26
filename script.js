document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.expand();
    tg.ready();
  }

  // ===== Элементы =====
  const menu = document.getElementById("menu");
  const gameContainer = document.getElementById("game-container");
  const playBtn = document.getElementById("playBtn");
  const scoreDisplay = document.getElementById("score");
  const title = document.querySelector(".title");
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  // Экран окончания игры
  const gameOverScreen = document.createElement("div");
  gameOverScreen.classList.add("game-over");
  gameOverScreen.innerHTML = `
    <h2>Игра окончена 🐍</h2>
    <p id="finalScore">Ваш счёт: 0</p>
    <button id="tryAgainBtn" class="neon-button">Играть снова</button>
  `;
  gameContainer.appendChild(gameOverScreen);
  gameOverScreen.style.display = "none";
  const tryAgainBtn = gameOverScreen.querySelector("#tryAgainBtn");

  // Название
  title.textContent = "🐍 Snake";

  const box = 20;
  let snake, food, dir, game, score = 0, isGameOver = false;


  // ===== Звуки =====
  const eatSound = new Audio("sounds/eat.wav");
  const gameOverSound = new Audio("sounds/gameover.wav");
  const clickSound = new Audio("sounds/click.wav");


  // ===== Мини-змейка в меню =====
  const animCanvas = document.getElementById("snake-animation");
  const animCtx = animCanvas.getContext("2d");
  let animSnake = [{ x: 5, y: 5 }];
  let animDir = "RIGHT";
  const animBox = 10;

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

  // ===== Запуск игры =====
  playBtn.addEventListener("click", () => {
    clickSound.play();
    menu.style.display = "none";
    gameContainer.style.display = "block";
    startGame();
  });

  tryAgainBtn.addEventListener("click", startGame);

  function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    food = randomFood();
    dir = null;
    score = 0;
    isGameOver = false;
    scoreDisplay.innerText = score;
    gameOverScreen.style.display = "none";
    clearInterval(game);
    game = setInterval(draw, 150);
  }

  function randomFood() {
    return {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box,
    };
  }

  // ===== Управление =====
  window.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (["arrowleft", "a"].includes(key) && dir !== "RIGHT") dir = "LEFT";
    else if (["arrowup", "w"].includes(key) && dir !== "DOWN") dir = "UP";
    else if (["arrowright", "d"].includes(key) && dir !== "LEFT") dir = "RIGHT";
    else if (["arrowdown", "s"].includes(key) && dir !== "UP") dir = "DOWN";
  });

  // Свайпы (телефон)
  let startX, startY;
  const SWIPE_THRESHOLD = 30;
  document.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, false);

  document.addEventListener("touchend", e => {
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

  document.body.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

  // Виртуальные кнопки
  document.getElementById("upBtn").addEventListener("click", () => { if(dir !== "DOWN") dir = "UP"; });
  document.getElementById("downBtn").addEventListener("click", () => { if(dir !== "UP") dir = "DOWN"; });
  document.getElementById("leftBtn").addEventListener("click", () => { if(dir !== "RIGHT") dir = "LEFT"; });
  document.getElementById("rightBtn").addEventListener("click", () => { if(dir !== "LEFT") dir = "RIGHT"; });

  // ===== Основная логика =====
  function draw() {
    if (isGameOver) return;
    ctx.clearRect(0, 0, 400, 400);

    // Еда
    drawApple(food.x, food.y);

    // Змейка
    for (let i = 0; i < snake.length; i++) {
      if (i === 0) drawSnakeHead(snake[i].x, snake[i].y);
      else drawSnakeBody(snake[i].x, snake[i].y);
    }

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (dir === "LEFT") snakeX -= box;
    if (dir === "UP") snakeY -= box;
    if (dir === "RIGHT") snakeX += box;
    if (dir === "DOWN") snakeY += box;

    if (snakeX === food.x && snakeY === food.y) {
      eatSound.play();
      score++;
      scoreDisplay.innerText = score;
      food = randomFood();
    } else snake.pop();

    const newHead = { x: snakeX, y: snakeY };

    if (
      snakeX < 0 ||
      snakeY < 0 ||
      snakeX > canvas.width - box ||
      snakeY > canvas.height - box ||
      collision(newHead, snake)
    ) {
      gameOver(score);
      return;
    }

    snake.unshift(newHead);
  }

  function gameOver(finalScore) {
    gameOverSound.play();
    clearInterval(game);
    isGameOver = true;
    document.getElementById("finalScore").textContent = "Ваш счёт: " + finalScore;
    gameOverScreen.style.display = "flex";
  }

  // ===== Графика =====
  function drawSnakeHead(x, y) {
    ctx.fillStyle = "#00FF7F";
    ctx.beginPath();
    ctx.roundRect(x, y, box, box, 6);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(x + 6, y + 6, 2, 0, Math.PI * 2);
    ctx.arc(x + 14, y + 6, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawSnakeBody(x, y) {
    const gradient = ctx.createLinearGradient(x, y, x + box, y + box);
    gradient.addColorStop(0, "#008000");
    gradient.addColorStop(1, "#00CC66");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(x, y, box, box, 4);
    ctx.fill();
  }

  function drawApple(x, y) {
    ctx.beginPath();
    ctx.arc(x + box / 2, y + box / 2, box / 2.5, 0, Math.PI * 2);
    ctx.fillStyle = "#FF3B30";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + box / 2, y + box / 2 - 10);
    ctx.lineTo(x + box / 2, y + box / 2 - 15);
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + box / 2, y + box / 2 - 13);
    ctx.quadraticCurveTo(x + box / 2 + 4, y + box / 2 - 16, x + box / 2 + 6, y + box / 2 - 10);
    ctx.fillStyle = "#00A000";
    ctx.fill();
  }

  function collision(head, arr) {
    for (let i = 0; i < arr.length; i++) {
      if (head.x === arr[i].x && head.y === arr[i].y) return true;
    }
    return false;
  }
});




