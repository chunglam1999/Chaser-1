const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

function clearBackground() {
  ctx.fillStyle = "lightGreen";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

let ball = {x: 150, y: 150, dx: 1, dy: 2, radius: 25, color: "teal"};
let enemy = {x: 250, y: 250, width: 20, color: "red"};
let mouse = {x: 0, y:0,}

function updateMouse(event) {
  const canvasRect = canvas.getBoundingClientRect();
  mouse.x = event.clientX - canvasRect.left;
  mouse.y = event.clientY - canvasRect.top;
}

document.body.addEventListener('mousemove', updateMouse);

function drawBall() {
  ctx.fillStyle = ball.color;
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fill();
  ctx.stroke();
}

function drawEnemy() {
  ctx.fillStyle = enemy.color;
  ctx.fillRect(enemy.x-enemy.width/2, enemy.y-enemy.width/2, enemy.width, enemy.width);
  ctx.strokeRect(enemy.x-enemy.width/2, enemy.y-enemy.width/2, enemy.width, enemy.width);
}

function follow(target, chaser, speed) {
  chaser.x += (target.x - chaser.x) * speed;
  chaser.y += (target.y - chaser.y) * speed;
}

function updateScene() {
  follow(mouse, ball, 0.1);
  follow(ball, enemy, 0.025);
}

function drawScene() {
  clearBackground(); //there is no given function for this but we can write one
  drawBall();
  drawEnemy();
  updateScene();
  requestAnimationFrame(drawScene);
}

requestAnimationFrame(drawScene);
