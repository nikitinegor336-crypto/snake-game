const tg = window.Telegram.WebApp;
tg.expand(); // делает окно на весь экран
tg.ready(); // сообщает Telegram, что приложение загружено


const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const box = 20;
let score = 0;

let snake = [{ x: 9 * box, y: 10 * box }];
let food = {
  x: Math.floor(Math.random() * 20) * box,
  y: Math.floor(Math.random() * 20) * box
};
let dir;

document.addEventListener("keydown", direction);

function direction(event) {
  if (event.keyCode == 37 && dir !== "RIGHT") dir = "LEFT";
  else if (event.keyCode == 38 && dir !== "DOWN") dir = "UP";
  else if (event.keyCode == 39 && dir !== "LEFT") dir = "RIGHT";
  else if (event.keyCode == 40 && dir !== "UP") dir = "DOWN";
}

function draw() {
  ctx.clearRect(0, 0, 400, 400);

  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i == 0 ? "#00FF00" : "#008000";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  ctx.fillStyle = "#FF0000";
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
    food = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box
    };
  } else {
    snake.pop();
  }

  const newHead = { x: snakeX, y: snakeY };

  if (
    snakeX < 0 ||
    snakeY < 0 ||
    snakeX >= 400 ||
    snakeY >= 400 ||
    collision(newHead, snake)
  ) {
    clearInterval(game);
    alert("Игра окончена! Ваш счёт: " + score);
  }

  snake.unshift(newHead);
}

function collision(head, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (head.x == arr[i].x && head.y == arr[i].y) return true;
  }
  return false;
}

let game = setInterval(draw, 150);
