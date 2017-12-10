const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const progressBar = document.querySelector("progress");

const enemySpriteURL =
  "http://clipartix.com/wp-content/uploads/2016/05/Chicken-clipart-black-and-white-free-clipart-images.png";
const playerSpriteURL =
  "http://i.pinimg.com/originals/e6/ca/0d/e6ca0db4d941220ff21e96399c99b475.png";
const powerUpSpriteURL =
  "http://freeclipartimage.com//storage/upload/egg-clip-art/egg-clip-art-2.png";
const backgroundURL = "http://i.imgur.com/bTgbcZR.png";

const enemySpriteWidth = 40;
const playerSpriteWidth = 80;
const powerUpSpriteWidth = 24;
const powerUpSpriteHeight = 30;
const enemyBaseSpeed = 0.005;
const playerSpeed = 0.1;
const powerUpSpeed = -0.001;

let paused = false;
let secondsElapsed = 0;
let mostRecentTime = 0;
let level = 1;
let score = 0;
let highScore = 0;

function getRandomPosition() {
  return Math.floor(Math.random() * canvas.width + 1);
}

function distanceBetween(sprite1, sprite2) {
  return Math.hypot(sprite1.x - sprite2.x, sprite1.y - sprite2.y);
}

function haveCollided(sprite1, sprite2) {
  return distanceBetween(sprite1, sprite2) < sprite1.radius + sprite2.radius;
}

class Sprite {
  draw() {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}

class Player extends Sprite {
  constructor(x, y, width, height, speed) {
    super();
    Object.assign(this, { x, y, width, height, speed });
    this.image = new Image();
    this.image.src = playerSpriteURL;
    this.radius = this.height / 2;
    this.centerX = this.x + this.width / 2;
    this.centerY = this.y + this.radius;
  }
}

let player = new Player(
  canvas.width / 2,
  canvas.height / 2,
  playerSpriteWidth,
  playerSpriteWidth,
  playerSpeed
);

class Enemy extends Sprite {
  constructor(x, y, width, height, speed) {
    super();
    Object.assign(this, { x, y, width, height, speed });
    this.image = new Image();
    this.image.src = enemySpriteURL;
    this.radius = this.width / 2;
    this.centerX = this.x + this.radius;
    this.centerY = this.y + this.height / 2;
  }
}

let enemies = [
  new Enemy(
    getRandomPosition(),
    getRandomPosition(),
    enemySpriteWidth,
    enemySpriteWidth,
    0.025
  ),
  new Enemy(
    getRandomPosition(),
    getRandomPosition(),
    enemySpriteWidth,
    enemySpriteWidth,
    0.01
  ),
  new Enemy(
    getRandomPosition(),
    getRandomPosition(),
    enemySpriteWidth,
    enemySpriteWidth,
    enemyBaseSpeed
  )
];

class PowerUp extends Sprite {
  constructor(x, y, width, height, speed) {
    super();
    Object.assign(this, { x, y, width, height, speed });
    this.image = new Image();
    this.image.src = powerUpSpriteURL;
    this.radius = this.width / 2;
    this.centerX = this.x + this.radius;
    this.centerY = this.y + this.height / 2;
  }
}

let powerUps = [];

let mouse = { x: 0, y: 0 };
document.body.addEventListener("mousemove", updateMouse);
function updateMouse(event) {
  const { left, top } = canvas.getBoundingClientRect();
  mouse.x = event.clientX - left;
  mouse.y = event.clientY - top;
}

function follow(target, chaser, speed) {
  chaser.x += (target.x - chaser.x) * speed;
  chaser.y += (target.y - chaser.y) * speed;
}

function pushOff(sprite1, sprite2) {
  let [dx, dy] = [sprite2.x - sprite1.x, sprite2.y - sprite1.y];
  const L = Math.hypot(dx, dy);
  let distToMove = sprite1.radius + sprite1.radius - L;
  if (distToMove > 0) {
    dx /= L;
    dy /= L;
    sprite1.x -= dx * distToMove / 2;
    sprite1.y -= dy * distToMove / 2;
    sprite2.x += dx * distToMove / 2;
    sprite2.y += dy * distToMove / 2;
  }
}

setInterval(function() {
  if (!paused) {
    secondsElapsed++;
    score += 2;
    if (level > 1 && secondsElapsed % 8 === 0) {
      powerUps.push(
        new PowerUp(
          getRandomPosition(),
          getRandomPosition(),
          powerUpSpriteWidth,
          powerUpSpriteHeight,
          powerUpSpeed
        )
      );
    }
  }
}, 1000);

function updateScene() {
  follow(mouse, player, player.speed);
  enemies.forEach(enemy => follow(player, enemy, enemy.speed));
  enemies.forEach(enemy => {
    if (haveCollided(enemy, player)) {
      progressBar.value -= 0.1;
    }
  });
  for (let i = 0; i < enemies.length; i += 1) {
    for (let j = i + 1; j < enemies.length; j += 1) {
      pushOff(enemies[i], enemies[j]);
    }
  }
  powerUps.forEach(powerUp => follow(player, powerUp, powerUp.speed));
  powerUps.forEach(powerUp => {
    if (haveCollided(powerUp, player)) {
      score += 50;
      progressBar.value += 20;
      powerUps.splice(powerUps.indexOf(powerUp), 1);
    }
  });
  if (secondsElapsed === mostRecentTime + 10) {
    level++;
    enemies.push(
      new Enemy(
        getRandomPosition(),
        getRandomPosition(),
        enemySpriteWidth,
        enemySpriteWidth,
        enemies[enemies.length - 1].speed + 0.01
      )
    );
    mostRecentTime += 10;
  }
  if (score > highScore) {
    highScore = score;
  }
  document.getElementById("level").innerHTML = level;
  document.getElementById("timeElapsed").innerHTML = secondsElapsed;
  document.getElementById("score").innerHTML = score;
  document.getElementById("healthPercent").innerHTML = progressBar.value;
  document.getElementById("highScore").innerHTML = highScore;
}

function startGame() {
  if (progressBar.value <= 0) {
    progressBar.value = 100;
    secondsElapsed = 0;
    mostRecentTime = 0;
    score = 0;
    level = 1;
    enemies.length = 3;
    powerUps.length = 0;
    requestAnimationFrame(drawScene);
  }
}

document.body.onkeyup = function(e) {
  if (e.keyCode == 32) {
    paused = !paused;
    if (!paused) {
      requestAnimationFrame(drawScene);
    }
  }
};

function drawPaused() {
  ctx.fillStyle = "white";
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, canvas.height / 4, canvas.width, canvas.height / 2);
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.font = "60px Jokerman";
  ctx.fillText("- PAUSED -", canvas.width / 2, canvas.height / 2);
  ctx.font = "20px Jokerman";
  ctx.fillText(
    "Hit spacebar again to resume.",
    canvas.width / 2,
    canvas.height * 2 / 3
  );
}

function drawGameOver() {
  ctx.fillStyle = "white";
  ctx.globalAlpha = 0.4;
  ctx.fillRect(0, canvas.height / 8, canvas.width, canvas.height * 3 / 4);
  ctx.globalAlpha = 1.0;
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.font = "60px Jokerman";
  ctx.fillText("GAME OVER!", canvas.width / 2, canvas.height / 3);
  ctx.font = "15px Jokerman";
  ctx.fillText(
    "Timmy the T-Rex has fallen and can't get up",
    canvas.width / 2,
    canvas.height / 2
  );
  ctx.fillText(
    "due to too many evil chickens.",
    canvas.width / 2,
    canvas.height / 2 + 20
  );
  ctx.font = "20px Jokerman";
  ctx.fillText("Click to play again!", canvas.width / 2, canvas.height * 5 / 6);
  ctx.fillStyle = "lemonChiffon";
  if (score === highScore) {
    ctx.fillText(
      "You've achieved a new high score!",
      canvas.width / 2,
      canvas.height * 2 / 3
    );
  } else {
    ctx.fillText(
      "You didn't reach your high score.",
      canvas.width / 2,
      canvas.height * 2 / 3
    );
    ctx.fillText(
      "Don't let those darn chickens beat you!",
      canvas.width / 2,
      canvas.height * 2 / 3 + 25
    );
  }
}

function clearBackground() {
  let background = new Image();
  background.src = backgroundURL;
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
}

function drawScene() {
  clearBackground();
  enemies.forEach(enemy => enemy.draw());
  powerUps.forEach(powerUp => powerUp.draw());
  player.draw();
  updateScene();
  if (progressBar.value <= 0) {
    requestAnimationFrame(drawGameOver);
    clearInterval();
  } else if (paused) {
    requestAnimationFrame(drawPaused);
  } else {
    requestAnimationFrame(drawScene);
  }
}

canvas.addEventListener("click", startGame);
requestAnimationFrame(drawScene);


