// main.js - Versione definitiva del gioco Arkanoid

(function(){
  // --- UTILITIES ---
  // Legge un parametro dalla query string
  function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
  }
  
  // --- PARAMETRI DI CONFIGURAZIONE ---
  const playerName      = getQueryParam('player')   || 'Player';
  const paddleColor     = getQueryParam('paddle')   || '#00ff00';
  const ballColor       = getQueryParam('ball')     || '#ffffff';
  // I colori dei mattoni "one-hit" (si rompono al primo tocco):
  const brickWhiteColor   = "#ffffff";
  const brickGreenColor   = "#00ff00";
  const brickBlueColor    = "#0000ff";
  const brickPurpleColor  = "#800080";
  const brickBrownColor   = "#A52A2A";
  // Tipo copper (richiede due tocchi – inizialmente color rame)
  const brickCopperColor  = "#B87333";
  // Mattoni indistruttibili (gray)
  const brickGrayColor    = "#888888";
  // Mattoni gold
  const brickGoldColor    = "#FFD700";
  // In fase di danno per i mattoni copper scegliamo un colore casuale tra quelli one‑hit
  const damagedColors = [brickWhiteColor, brickGreenColor, brickBlueColor, brickPurpleColor, brickBrownColor];
  function randomDamagedColor() {
    return damagedColors[Math.floor(Math.random() * damagedColors.length)];
  }
  
  // --- IMPOSTAZIONI DISPLAY ---
  document.getElementById('playerDisplay').innerText = "Giocatore: " + playerName;
  
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const WIDTH = canvas.width, HEIGHT = canvas.height;
  
  let level = 1;
  let score = 0;
  const totalLevels = 10;
  let gameOver = false;

  function updateGameInfo() {
    document.getElementById('levelDisplay').innerText = " | Level: " + level;
    document.getElementById('scoreDisplay').innerText = " | Points: " + score;
  }
  updateGameInfo();

  // --- POWER-UP VARIABILI ---
  let powerUps = [];       // Array di capsule attive
  let activePower = null;  // "shoot" oppure "paddleBoost"
  let powerEndTime = 0;    // Tempo (in ms) in cui scade il potenziamento

  // --- OGGETTI DI GIOCO ---
  // Paddle
  let paddle = {
    width: 100,
    height: 15,
    x: WIDTH / 2 - 50,
    y: HEIGHT - 30,
    speed: 7,
    color: paddleColor
  };

  // Palla
  let ball = {
    x: WIDTH / 2,
    y: HEIGHT - 45,
    radius: 8,
    dx: 4,
    dy: -4,
    color: ballColor
  };

  // Proprietà fisse dei mattoni (le dimensioni sono costanti)
  let brick = {
    rowCount: 0,      // settato in initBricks()
    columnCount: 0,   // settato in initBricks()
    width: 75,
    height: 20,
    padding: 12,      // Spaziatura aumentata per facilitare rimbalzi
    offsetTop: 50,
    offsetLeft: 35
  };

  let bricks = [];

  // --- INIZIALIZZAZIONE MATTONCINI ---
  // Utilizza la configurazione del livello (definita in stage.js, che deve essere incluso prima di main.js)
  function initBricks() {
    let currentStage = stageConfig[level - 1];
    brick.rowCount = currentStage.brickRowCount;
    brick.columnCount = currentStage.brickColumnCount;
    
    bricks = [];
    for (let r = 0; r < brick.rowCount; r++){
      bricks[r] = [];
      for (let c = 0; c < brick.columnCount; c++){
        let brickX = c * (brick.width + brick.padding) + brick.offsetLeft;
        let brickY = r * (brick.height + brick.padding) + brick.offsetTop;
        let rnd = Math.random();
        let b = { x: brickX, y: brickY };
        // Le probabilità devono essere definite in stageConfig con le chiavi:
        // white, green, blue, purple, brown, copper, gray, gold
        const p = currentStage.probabilities;
        if(rnd < p.white) {
          b.type = "white";  // rompe al primo colpo
          b.status = 1;
          b.color = brickWhiteColor;
        } else if(rnd < p.white + p.green) {
          b.type = "green";
          b.status = 1;
          b.color = brickGreenColor;
        } else if(rnd < p.white + p.green + p.blue) {
          b.type = "blue";
          b.status = 1;
          b.color = brickBlueColor;
        } else if(rnd < p.white + p.green + p.blue + p.purple) {
          b.type = "purple";
          b.status = 1;
          b.color = brickPurpleColor;
        } else if(rnd < p.white + p.green + p.blue + p.purple + p.brown) {
          b.type = "brown";
          b.status = 1;
          b.color = brickBrownColor;
        } else if(rnd < p.white + p.green + p.blue + p.purple + p.brown + p.copper) {
          b.type = "copper";  // richiede 2 colpi
          b.status = 2;
          b.color = brickCopperColor;
          b.damagedColor = null; // verrà assegnato al primo colpo
        } else if(rnd < p.white + p.green + p.blue + p.purple + p.brown + p.copper + p.gray) {
          b.type = "unbreakable";  // indistruttibile comporta mattoncino grigio
          b.status = 1;
          b.color = brickGrayColor;
        } else {
          b.type = "gold";  // rompe al colpo e può rilasciare capsule
          b.status = 1;
          b.color = brickGoldColor;
          b.goldCapsuleProbability = currentStage.goldCapsuleProbability || 0.5;
        }
        bricks[r][c] = b;
      }
    }
  }
  initBricks();

  // --- COLLISIONI ---
  // Funzione di collisione cerchio–rettangolo
  function circleRectCollision(circle, rect) {
    let distX = Math.abs(circle.x - rect.x - rect.width/2);
    let distY = Math.abs(circle.y - rect.y - rect.height/2);
    if(distX > (rect.width/2 + circle.radius)) return false;
    if(distY > (rect.height/2 + circle.radius)) return false;
    if(distX <= (rect.width/2)) return true;
    if(distY <= (rect.height/2)) return true;
    let dx = distX - rect.width/2;
    let dy = distY - rect.height/2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
  }

  // Funzione che risolve la collisione spostando la palla fuori dal mattone
  function resolveCollision(circle, rect) {
    let nearestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    let nearestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    let diffX = circle.x - nearestX;
    let diffY = circle.y - nearestY;
    let dist = Math.sqrt(diffX*diffX + diffY*diffY) || 0.1;
    let overlap = circle.radius - dist;
    if(overlap > 0) {
      circle.x += (diffX/dist) * overlap;
      circle.y += (diffY/dist) * overlap;
    }
  }

  // --- CAPSULE POWER‑UP ---
  // Due tipi: "shoot" (spara, colore rosso) e "paddleBoost" (aumenta larghezza, colore blu)
  function Capsule(x, y, type) {
    this.x = x;
    this.y = y;
    this.radius = 8;
    this.dy = 3;
    this.type = type;
  }
  Capsule.prototype.update = function() {
    this.y += this.dy;
  };
  Capsule.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = (this.type === "shoot") ? "red" : ((this.type === "paddleBoost") ? "blue" : "yellow");
    ctx.fill();
  };

  // --- BULLET SPECIAL ---
  function Bullet(x, y, angle) {
    this.x = x;
    this.y = y;
    this.velocity = { x: Math.cos(angle) * 8, y: Math.sin(angle) * 8 };
    this.radius = 3;
    this.life = 60;
    this.color = ballColor;
  }
  Bullet.prototype.update = function() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;
    this.life--;
  };
  Bullet.prototype.draw = function() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = this.color;
    ctx.fill();
  };

  let bullets = [];  // Array dei proiettili speciali (attivati con "shoot")

  // --- EVENTI DI INPUT ---
  let keys = {};
  document.addEventListener("keydown", function(e) {
    keys[e.code] = true;
    // Se il potenziamento "shoot" è attivo e viene premuto S, spara un proiettile speciale
    if(e.code === "KeyS" && activePower === "shoot") {
      let bulletX = paddle.x + paddle.width/2;
      let bulletY = paddle.y;
      let pb = new Bullet(bulletX, bulletY, -Math.PI/2);
      pb.color = "red";
      bullets.push(pb);
    }
  });
  document.addEventListener("keyup", function(e) {
    keys[e.code] = false;
  });

  // Movimento del paddle con mouse e touch
  canvas.addEventListener("mousemove", function(e) {
    let rect = canvas.getBoundingClientRect();
    let relativeX = e.clientX - rect.left;
    paddle.x = relativeX - paddle.width/2;
  });
  canvas.addEventListener("touchmove", function(e) {
    e.preventDefault();
    let rect = canvas.getBoundingClientRect();
    let touch = e.touches[0];
    let relativeX = touch.clientX - rect.left;
    paddle.x = relativeX - paddle.width/2;
  }, {passive: false});

  // --- UPDATE FUNZIONI ---
  function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;
    
    // Collisione con le pareti laterali
    if(ball.x + ball.radius > WIDTH || ball.x - ball.radius < 0) {
      ball.dx = -ball.dx;
      if(ball.x + ball.radius > WIDTH) ball.x = WIDTH - ball.radius;
      if(ball.x - ball.radius < 0) ball.x = ball.radius;
    }
    // Collisione con il soffitto
    if(ball.y - ball.radius < 0) {
      ball.dy = -ball.dy;
      ball.y = ball.radius;
    }
    
    // Collisione con il paddle usando circleRectCollision
    let paddleRect = { x: paddle.x, y: paddle.y, width: paddle.width, height: paddle.height };
    if(circleRectCollision(ball, paddleRect)) {
      // Posiziona la palla appena sopra il paddle
      ball.y = paddle.y - ball.radius;
      ball.dy = -Math.abs(ball.dy);
      let deltaX = ball.x - (paddle.x + paddle.width/2);
      ball.dx = deltaX * 0.15;
    } else if(ball.y + ball.radius > HEIGHT) {
      // La palla è caduta
      gameOver = true;
      let finalMsg = "You lose! 💥\nPlayer: " + playerName +
                     "\nLevel: " + level + "\nPoints: " + score;
      showFinalOverlay(finalMsg);
      saveScore();
      return;
    }
  }

  function updateBricks() {
    for(let r = 0; r < brick.rowCount; r++){
      for(let c = 0; c < brick.columnCount; c++){
        let b = bricks[r][c];
        if(b.status <= 0) continue; // Salta i mattoni già rotti
        let rect = { x: b.x, y: b.y, width: brick.width, height: brick.height };
        if(circleRectCollision(ball, rect)) {
          // Risolvi la collisione: sposta la palla fuori dal mattone
          resolveCollision(ball, rect);
          // Inverte la velocità verticale
          ball.dy = -ball.dy;
          
          // Gestione del danno in base al tipo di mattone:
          if(b.type === "white" || b.type === "green" ||
             b.type === "blue" || b.type === "purple" || b.type === "brown") {
            // Questi mattoni si rompono al primo tocco
            b.status = 0;
          } else if(b.type === "copper") {
            if(b.status === 2) {
              b.status = 1;
              // Al primo impatto, assegna un colore danneggiato
              b.damagedColor = randomDamagedColor();
            } else {
              b.status = 0;
            }
          } else if(b.type === "gold") {
            // Si rompe al primo tocco e può rilasciare una capsula
            b.status = 0;
            if(Math.random() < (b.goldCapsuleProbability || stageConfig[level-1].goldCapsuleProbability || 0.5)) {
              let capsuleType = (Math.random() < 0.5) ? "shoot" : "paddleBoost";
              let capsule = new Capsule(b.x + brick.width/2, b.y + brick.height/2, capsuleType);
              powerUps.push(capsule);
            }
          }
          // Per i mattoni "gray" (indistruttibili) non modifichiamo lo status
          // Aggiorna lo score soltanto per i mattoni distruttibili
          if(b.type !== "unbreakable") {
            if(b.type === "copper" && b.status === 1) {
              score += 2;  // Primo colpo
            } else {
              score += 5;
            }
            updateGameInfo();
          }
        }
      }
    }
  }

  function checkBricksCleared() {
    for(let r = 0; r < brick.rowCount; r++){
      for(let c = 0; c < brick.columnCount; c++){
        let b = bricks[r][c];
        if(b.type !== "unbreakable" && b.status > 0) return false;
      }
    }
    return true;
  }

  function updatePowerUps() {
    for(let i = powerUps.length - 1; i >= 0; i--){
      powerUps[i].update();
      let paddleRect = { x: paddle.x, y: paddle.y, width: paddle.width, height: paddle.height };
      if(circleRectCollision(powerUps[i], paddleRect)) {
        activePower = powerUps[i].type;
        powerEndTime = Date.now() + 5000;
        if(activePower === "paddleBoost") {
          paddle.width += 30;
        }
        powerUps.splice(i,1);
      } else if(powerUps[i].y - powerUps[i].radius > HEIGHT) {
        powerUps.splice(i,1);
      }
    }
    if(activePower && Date.now() > powerEndTime) {
      if(activePower === "paddleBoost") {
        paddle.width -= 30;
      }
      activePower = null;
    }
  }

  function updateBullets() {
    for(let i = bullets.length - 1; i >= 0; i--){
      bullets[i].update();
      if(bullets[i].life <= 0 ||
         bullets[i].x < 0 || bullets[i].x > WIDTH ||
         bullets[i].y < 0 || bullets[i].y > HEIGHT) {
        bullets.splice(i,1);
      }
    }
  }

  function update() {
    if(keys["ArrowLeft"] && paddle.x > 0) {
      paddle.x -= paddle.speed;
    }
    if(keys["ArrowRight"] && paddle.x < WIDTH - paddle.width) {
      paddle.x += paddle.speed;
    }
    
    updateBall();
    updateBricks();
    updatePowerUps();
    updateBullets();
    
    if(checkBricksCleared()){
      if(level < totalLevels) {
        level++;
        let currentStage = stageConfig[level - 1];
        ball.dx *= currentStage.ballSpeedFactor;
        ball.dy *= currentStage.ballSpeedFactor;
        initBricks();
        updateGameInfo();
      } else {
        gameOver = true;
        let finalMsg = "Congratulations! 🎉\nYou have completed the game.\nThank you for playing, " + playerName +
                       "!\nLevel: " + level + "\nPoints: " + score;
        showFinalOverlay(finalMsg);
        saveScore();
        return;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    // Disegna i mattoni
    for(let r = 0; r < brick.rowCount; r++){
      for(let c = 0; c < brick.columnCount; c++){
        let b = bricks[r][c];
        if(b.status > 0) {
          if(b.type === "copper") {
            ctx.fillStyle = (b.status === 2) ? b.color : b.damagedColor;
          } else {
            ctx.fillStyle = b.color;
          }
          ctx.fillRect(b.x, b.y, brick.width, brick.height);
        }
      }
    }
    // Disegna il paddle
    ctx.fillStyle = paddle.color;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    // Disegna la palla
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
    // Disegna i proiettili speciali
    bullets.forEach(b => b.draw());
    // Disegna le capsule
    powerUps.forEach(p => p.draw());
    // Disegna il punteggio
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Points: " + score, 8, 20);
  }

  function showFinalOverlay(finalText) {
    const overlay = document.getElementById("finalOverlay");
    document.getElementById("finalMessage").innerText = finalText;
    overlay.style.display = "flex";
  }

  function gameLoop() {
    if(!gameOver){
      update();
      draw();
      requestAnimationFrame(gameLoop);
    }
  }
  requestAnimationFrame(gameLoop);

  function saveScore() {
    let formData = new FormData();
    formData.append("player", playerName);
    formData.append("score", score);
    formData.append("level", level);
    fetch("saveScore.php", { method: "POST", body: formData })
      .then(res => res.json())
      .then(data => console.log("Score salvato:", data))
      .catch(err => console.error("Errore nel salvataggio del punteggio:", err));
  }

  document.getElementById("exitButton").addEventListener("click", function(){
    window.location.href = "index.html";
  });
  document.getElementById("finalExitButton").addEventListener("click", function(){
    window.location.href = "index.html";
  });

  // Supporto per tasti aggiuntivi, se necessario
  let keysPaddle = {};
  document.addEventListener("keydown", function(e) {
    keysPaddle[e.code] = true;
  });
  document.addEventListener("keyup", function(e) {
    keysPaddle[e.code] = false;
  });
})();
