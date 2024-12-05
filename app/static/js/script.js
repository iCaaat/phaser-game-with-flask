const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 320,
  // width: window.innerWidth,  // 动态设置宽度
  // height: window.innerHeight,  // 动态设置高度
  backgroundColor: "#eeeeee",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);

let ball, paddle, bricks, brickInfo;
let score = 0;
let scoreText, lives = 3, livesText, lifeLostText, playing = false;
let startButton;

function preload() {
  // 处理远程图片加载
  this.load.setBaseURL(
    "https://end3r.github.io/Gamedev-Phaser-Content-Kit/demos/"
  );
  this.load.crossOrigin = "anonymous";

  // 加载资源
  this.load.image("paddle", "img/paddle.png");
  this.load.image("brick", "img/brick.png");
  this.load.spritesheet("ball", "img/wobble.png", {
    frameWidth: 20,
    frameHeight: 20,
  });
  this.load.spritesheet("button", "img/button.png", {
    frameWidth: 120,
    frameHeight: 40,
  });
}

function create() {
  // 初始化球
  ball = this.physics.add.sprite(this.scale.width / 2, this.scale.height - 25, "ball")
    .setCollideWorldBounds(true)
    .setBounce(1)
  ball.anims.create({ key: "wobble", frames: this.anims.generateFrameNumbers("ball"), frameRate: 24 });

  // 初始化挡板
  paddle = this.physics.add.sprite(this.scale.width / 2, this.scale.height - 5, "paddle")
    .setImmovable(true);

  // 添加砖块
  bricks = this.physics.add.staticGroup();
  initBricks(this);

  // 碰撞逻辑
  this.physics.add.collider(ball, paddle, ballHitPaddle, null, this);
  this.physics.add.collider(ball, bricks, ballHitBrick, null, this);

  // 右上角文字显示
  scoreText = this.add.text(5, 5, "Points: 0", { font: "18px Arial", fill: "#0095DD" });
  livesText = this.add.text(this.scale.width - 5, 5, "Lives: " + lives, { font: "18px Arial", fill: "#0095DD" }).setOrigin(1, 0);
  lifeLostText = this.add.text(this.scale.width / 2, this.scale.height / 2, "Life lost, tap to continue", {
    font: "18px Arial",
    fill: "#0095DD",
  }).setOrigin(0.5).setVisible(false);

  // 开始按钮
  startButton = this.add.sprite(this.scale.width / 2, this.scale.height / 2, "button", 0).setInteractive().setOrigin(0.5);
  startButton.on("pointerdown", startGame, this);

  // 绑定鼠标事件
  this.input.on("pointermove", (pointer) => {
    paddle.x = Phaser.Math.Clamp(pointer.x, paddle.width / 2, this.scale.width - paddle.width / 2);
  });

  // 世界边界检测
  ball.body.onWorldBounds = true;
  this.physics.world.on("worldbounds", (body, up, down) => {
    if (down && body.gameObject === ball) ballLeaveScreen(this);
  });
}

function update() {
  if (!playing) return;
}

function initBricks(scene) {
  brickInfo = {
    width: 50,
    height: 20,
    count: { row: 7, col: 3 },
    offset: { top: 50, left: 60 },
    padding: 10,
  };
  bricks = scene.physics.add.staticGroup();
  for (let c = 0; c < brickInfo.count.col; c++) {
    for (let r = 0; r < brickInfo.count.row; r++) {
      let x = r * (brickInfo.width + brickInfo.padding) + brickInfo.offset.left;
      let y = c * (brickInfo.height + brickInfo.padding) + brickInfo.offset.top;
      let brick = scene.add.sprite(x, y, "brick").setOrigin(0.5);
      scene.physics.add.existing(brick, true);
      bricks.add(brick);
    }
  }
}

function ballHitBrick(ball, brick) {
  const killTween = this.tweens.add({
    targets: brick,
    scaleX: 0,
    scaleY: 0,
    duration: 200,
    onComplete: () => brick.destroy(),
  });
  score += 10;
  scoreText.setText("Points: " + score);
  if (score === brickInfo.count.row * brickInfo.count.col * 10) {
    alert("You won the game, congratulations!");
    location.reload();
  }
}

function ballLeaveScreen(scene) {
  lives -= 1;
  if (lives > 0) {
    livesText.setText("Lives: " + lives);
    lifeLostText.setVisible(true);

    ball.setPosition(scene.cameras.main.width * 0.5, scene.cameras.main.height - 25);
    paddle.setPosition(scene.cameras.main.width * 0.5, scene.cameras.main.height - 5);

    ball.setVelocity(0, 0);

    scene.input.once("pointerdown", () => {
      lifeLostText.setVisible(false);
      ball.setVelocity(150, -150);
    });
  } else {
    alert("You lost, game over!");
    location.reload();
  }
}

function ballHitPaddle(ball, paddle) {
  ball.anims.play("wobble", true);
  ball.setVelocityX(-1 * 5 * (paddle.x - ball.x));
}

function startGame() {
  startButton.destroy();
  ball.setVelocity(150, -150);
  playing = true;
}
