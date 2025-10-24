document.addEventListener("DOMContentLoaded", () => {
  const tg = window.Telegram.WebApp;
  tg.expand();
  tg.ready();

  // ===== Элементы =====
  const menu = document.getElementById("menu");
  const gameContainer = document.getElementById("game-container");
  const playBtn = document.getElementById("playBtn");
  const restartBtn = document.getElementById("restartBtn");
  const scoreDisplay = document.getElementById("score");
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");

  const box = 20;
  let snake, food, dir, game, score = 0;

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
    menu.style.display = "none";
    gameContainer.style.display = "block";
    startGame();
  });

  restartBtn.addEventListener("click", startGame);

  function startGame() {
    snake = [{ x: 9 * box, y: 10 * box }];
    food = randomFood();
    dir = null;
    score = 0;
    scoreDisplay.innerText = score;
    clearInterval(game);
    game = setInterval(draw, 150);
  }

  function randomFood() {
    return {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box,
    };
  }

  // ===== Управление (клавиатура) =====
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && dir !== "RIGHT") dir = "LEFT";
    else if (e.key === "ArrowUp" && dir !== "DOWN") dir = "UP";
    else if (e.key === "ArrowRight" && dir !== "LEFT") dir = "RIGHT";
    else if (e.key === "ArrowDown" && dir !== "UP") dir = "DOWN";
  });

  // ===== Управление свайпами =====
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

  // ===== Блокировка системных свайпов =====
  document.body.addEventListener('touchmove', e => e.preventDefault(), { passive: false });

  // ===== Виртуальные кнопки =====
  document.getElementById("upBtn").addEventListener("click", () => { if(dir !== "DOWN") dir = "UP"; });
  document.getElementById("downBtn").addEventListener("click", () => { if(dir !== "UP") dir = "DOWN"; });
  document.getElementById("leftBtn").addEventListener("click", () => { if(dir !== "RIGHT") dir = "LEFT"; });
  document.getElementById("rightBtn").addEventListener("click", () => { if(dir !== "LEFT") dir = "RIGHT"; });

// ===== Основная логика игры =====
function draw() {
  ctx.clearRect(0, 0, 400, 400);

  // Отрисовка змейки
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "#00FF7F" : "#008000";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // Отрисовка еды
  ctx.fillStyle = "#FF4040";
  ctx.fillRect(food.x, food.y, box, box);

  // Координаты головы
  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  // Управление направлением
  if (dir === "LEFT") snakeX -= box;
  if (dir === "UP") snakeY -= box;
  if (dir === "RIGHT") snakeX += box;
  if (dir === "DOWN") snakeY += box;

  // Проверка на поедание еды
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    scoreDisplay.innerText = score;
    food = randomFood();
  } else {
    snake.pop();
  }

  // Создаём новую голову
  const newHead = { x: snakeX, y: snakeY };

  // Проверяем на выход за границы или столкновение
  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX > canvas.width - box ||  // ✅ исправлено
    snakeY > canvas.height - box || // ✅ исправлено
    collision(newHead, snake)
  ) {
    clearInterval(game);
    alert("Игра окончена! Ваш счёт: " + score);
    menu.style.display = "block";
    gameContainer.style.display = "none";
  }

  // Добавляем новую голову змейки
  snake.unshift(newHead);
}

  function collision(head, arr) {
    for (let i = 0; i < arr.length; i++) {
      if (head.x === arr[i].x && head.y === arr[i].y) return true;
    }
    return false;
  }
});

