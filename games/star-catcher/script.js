// Star Catcher - Game Logic
// Follows GR-5: Technical Requirements

// ===== Canvas Setup =====
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let canvasWidth = 0;
let canvasHeight = 0;

// ===== Game State =====
let score = 0;
let starsCaught = 0;
let totalStarsFallen = 0;
let timeLeft = 60;
let gameRunning = false;
let gameLoopId = null;
let spawnInterval = null;
let timerInterval = null;
let basketSpeed = 5;
let basketSlowdown = false;
let slowdownTimer = null;

// ===== Basket =====
const basket = {
  width: 80,
  height: 40,
  x: 0,
  y: 0,
  emoji: '🧺'
};

// ===== Falling Objects =====
let fallingObjects = [];
const objectTypes = [
  { type: 'star', emoji: '⭐', points: 1, probability: 60, speed: 2, size: 32 },
  { type: 'star', emoji: '⭐', points: 1, probability: 60, speed: 2, size: 32 },
  { type: 'star', emoji: '⭐', points: 1, probability: 60, speed: 2, size: 32 },
  { type: 'star', emoji: '⭐', points: 1, probability: 60, speed: 2, size: 32 },
  { type: 'star', emoji: '⭐', points: 1, probability: 60, speed: 2, size: 32 },
  { type: 'rainbow', emoji: '🌈', points: 5, probability: 10, speed: 1.5, size: 48 },
  { type: 'moon', emoji: '🌙', points: 3, probability: 15, speed: 2, size: 36 },
  { type: 'planet', emoji: '🪐', points: 2, probability: 15, speed: 2, size: 36 },
  { type: 'cloud', emoji: '☁️', points: 0, probability: 10, speed: 1.5, size: 40 }
];

// ===== DOM Elements =====
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const counterDisplay = document.getElementById('counter-display');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreDisplay = document.getElementById('final-score');
const playAgainBtn = document.getElementById('play-again-btn');
const backToGamesBtn = document.getElementById('back-to-games-btn');
const arrowBtns = document.querySelectorAll('.arrow-btn');

// ===== Initialization =====
function init() {
  resizeCanvas();
  resetGame();
  setupEventListeners();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  const container = canvas.parentElement;
  const maxWidth = Math.min(container.clientWidth, 600);
  canvasWidth = maxWidth;
  canvasHeight = Math.min(window.innerHeight * 0.6, 500);
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  
  // Position basket at bottom center
  basket.x = canvasWidth / 2;
  basket.y = canvasHeight - 50;
  
  if (!gameRunning) {
    draw();
  }
}

function resetGame() {
  score = 0;
  starsCaught = 0;
  totalStarsFallen = 0;
  timeLeft = 60;
  basket.x = canvasWidth / 2;
  basket.y = canvasHeight - 50;
  basketSpeed = 5;
  basketSlowdown = false;
  fallingObjects = [];
  updateScoreDisplay();
  updateTimerDisplay();
  updateCounterDisplay();
}

// ===== Game Loop =====
function startGame() {
  resetGame();
  gameRunning = true;
  gameOverScreen.classList.add('hidden');
  
  // Spawn objects every 1-2 seconds
  spawnInterval = setInterval(spawnObject, 1500);
  
  // Timer countdown
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    
    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
  
  // Start game loop
  gameLoop();
}

function gameLoop() {
  if (!gameRunning) return;
  
  update();
  draw();
  gameLoopId = requestAnimationFrame(gameLoop);
}

function update() {
  // Update falling objects
  fallingObjects.forEach(obj => {
    obj.y += obj.speed;
  });
  
  // Remove objects that fell off screen
  fallingObjects = fallingObjects.filter(obj => {
    if (obj.y > canvasHeight) {
      if (obj.type === 'star' || obj.type === 'rainbow' || obj.type === 'moon' || obj.type === 'planet') {
        totalStarsFallen++;
        updateCounterDisplay();
        
        // Check if 20 stars have fallen
        if (totalStarsFallen >= 20) {
          endGame();
        }
      }
      return false;
    }
    
    // Check collision with basket
    if (checkCollision(obj)) {
      catchObject(obj);
      return false;
    }
    
    return true;
  });
}

function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  
  // Draw background stars
  drawBackgroundStars();
  
  // Draw basket
  ctx.font = `${basket.height}px "Comic Sans MS", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(basket.emoji, basket.x, basket.y);
  
  // Draw falling objects
  fallingObjects.forEach(obj => {
    ctx.font = `${obj.size}px "Comic Sans MS", sans-serif`;
    ctx.fillText(obj.emoji, obj.x, obj.y);
  });
}

function drawBackgroundStars() {
  // Draw static twinkling stars in background
  ctx.fillStyle = 'white';
  for (let i = 0; i < 20; i++) {
    const x = (i * 37) % canvasWidth;
    const y = (i * 23) % (canvasHeight - 100);
    const size = 2 + (i % 3);
    const opacity = 0.3 + Math.sin(Date.now() / 1000 + i) * 0.3;
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// ===== Spawning =====
function spawnObject() {
  if (!gameRunning) return;
  
  // Random object type based on probability
  const rand = Math.random() * 100;
  let cumulative = 0;
  let selectedType = objectTypes[0];
  
  for (const type of objectTypes) {
    cumulative += type.probability;
    if (rand <= cumulative) {
      selectedType = type;
      break;
    }
  }
  
  fallingObjects.push({
    type: selectedType.type,
    emoji: selectedType.emoji,
    points: selectedType.points,
    x: Math.random() * (canvasWidth - 60) + 30,
    y: -50,
    speed: selectedType.speed,
    size: selectedType.size
  });
}

// ===== Collision Detection =====
function checkCollision(obj) {
  const basketLeft = basket.x - basket.width / 2;
  const basketRight = basket.x + basket.width / 2;
  const basketTop = basket.y - basket.height / 2;
  
  return (
    obj.y + obj.size / 2 >= basketTop &&
    obj.y - obj.size / 2 <= basket.y + basket.height / 2 &&
    obj.x >= basketLeft &&
    obj.x <= basketRight
  );
}

function catchObject(obj) {
  if (obj.type === 'cloud') {
    // Slow down basket
    applySlowdown();
  } else {
    // Add score
    score += obj.points;
    starsCaught++;
    updateScoreDisplay();
    updateCounterDisplay();
    playSound(obj.type);
  }
}

function applySlowdown() {
  basketSlowdown = true;
  playSound('cloud');
  
  if (slowdownTimer) clearTimeout(slowdownTimer);
  
  slowdownTimer = setTimeout(() => {
    basketSlowdown = false;
  }, 3000);
}

// ===== Score Display =====
function updateScoreDisplay() {
  scoreDisplay.innerHTML = '';
  for (let i = 0; i < score; i++) {
    const star = document.createElement('span');
    star.className = 'score-star';
    star.textContent = '⭐';
    scoreDisplay.appendChild(star);
  }
}

function updateTimerDisplay() {
  timerDisplay.textContent = `${timeLeft}s`;
  
  // Color change based on time remaining
  timerDisplay.classList.remove('green', 'yellow', 'red');
  if (timeLeft > 30) {
    timerDisplay.classList.add('green');
  } else if (timeLeft > 10) {
    timerDisplay.classList.add('yellow');
  } else {
    timerDisplay.classList.add('red');
  }
}

function updateCounterDisplay() {
  counterDisplay.textContent = `${starsCaught}/20`;
}

// ===== Game Over =====
function endGame() {
  gameRunning = false;
  clearInterval(spawnInterval);
  clearInterval(timerInterval);
  cancelAnimationFrame(gameLoopId);
  
  // Show game over screen
  showGameOver();
}

function showGameOver() {
  finalScoreDisplay.innerHTML = '';
  for (let i = 0; i < score; i++) {
    const star = document.createElement('span');
    star.className = 'score-star';
    star.textContent = '⭐';
    finalScoreDisplay.appendChild(star);
  }
  
  gameOverScreen.classList.remove('hidden');
  playSound('gameover');
}

// ===== Controls =====
let leftPressed = false;
let rightPressed = false;

function setupEventListeners() {
  // Arrow buttons
  arrowBtns.forEach(btn => {
    btn.addEventListener('mousedown', () => {
      const direction = btn.dataset.direction;
      if (direction === 'left') leftPressed = true;
      if (direction === 'right') rightPressed = true;
    });
    
    btn.addEventListener('mouseup', () => {
      const direction = btn.dataset.direction;
      if (direction === 'left') leftPressed = false;
      if (direction === 'right') rightPressed = false;
    });
    
    btn.addEventListener('mouseleave', () => {
      const direction = btn.dataset.direction;
      if (direction === 'left') leftPressed = false;
      if (direction === 'right') rightPressed = false;
    });
    
    // Touch support
    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const direction = btn.dataset.direction;
      if (direction === 'left') leftPressed = true;
      if (direction === 'right') rightPressed = true;
    });
    
    btn.addEventListener('touchend', (e) => {
      e.preventDefault();
      const direction = btn.dataset.direction;
      if (direction === 'left') leftPressed = false;
      if (direction === 'right') rightPressed = false;
    });
  });
  
  // Basket drag
  let isDragging = false;
  
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateBasketPosition(e.clientX);
  });
  
  canvas.addEventListener('mousemove', (e) => {
    if (isDragging) {
      updateBasketPosition(e.clientX);
    }
  });
  
  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });
  
  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
  });
  
  // Touch drag
  canvas.addEventListener('touchstart', (e) => {
    isDragging = true;
    updateBasketPosition(e.touches[0].clientX);
  });
  
  canvas.addEventListener('touchmove', (e) => {
    if (isDragging) {
      e.preventDefault();
      updateBasketPosition(e.touches[0].clientX);
    }
  });
  
  canvas.addEventListener('touchend', () => {
    isDragging = false;
  });
  
  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = true;
    if (e.key === 'ArrowRight') rightPressed = true;
  });
  
  document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') leftPressed = false;
    if (e.key === 'ArrowRight') rightPressed = false;
  });
  
  // Game over buttons
  playAgainBtn.addEventListener('click', startGame);
  backToGamesBtn.addEventListener('click', () => {
    window.location.href = '../../index.html';
  });
}

function updateBasketPosition(clientX) {
  const rect = canvas.getBoundingClientRect();
  const relativeX = clientX - rect.left;
  
  // Constrain basket to canvas bounds
  basket.x = Math.max(basket.width / 2, Math.min(canvasWidth - basket.width / 2, relativeX));
}

// Update basket position in game loop based on button state
const originalUpdate = update;
update = function() {
  // Handle arrow button / keyboard input
  const speed = basketSlowdown ? basketSpeed / 2 : basketSpeed;
  if (leftPressed && basket.x > basket.width / 2) {
    basket.x -= speed;
  }
  if (rightPressed && basket.x < canvasWidth - basket.width / 2) {
    basket.x += speed;
  }
  
  originalUpdate();
};

// ===== Audio =====
function playSound(type) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  switch(type) {
    case 'star':
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
      
    case 'rainbow':
      // Magical twinkle arpeggio
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, i) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.08 + 0.3);
        osc.start(audioContext.currentTime + i * 0.08);
        osc.stop(audioContext.currentTime + i * 0.08 + 0.3);
      });
      break;
      
    case 'moon':
      oscillator.frequency.value = 400;
      oscillator.type = 'triangle';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
      break;
      
    case 'planet':
      oscillator.frequency.value = 300;
      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
      break;
      
    case 'cloud':
      oscillator.frequency.value = 200;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      break;
      
    case 'gameover':
      // Gentle "aww" then celebration
      if (score > 0) {
        [392, 493.88, 587.33, 659.25, 783.99].forEach((freq, i) => {
          const osc = audioContext.createOscillator();
          const gain = audioContext.createGain();
          osc.connect(gain);
          gain.connect(audioContext.destination);
          osc.frequency.value = freq;
          osc.type = 'sine';
          gain.gain.setValueAtTime(0.2, audioContext.currentTime + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 0.15 + 0.4);
          osc.start(audioContext.currentTime + i * 0.15);
          osc.stop(audioContext.currentTime + i * 0.15 + 0.4);
        });
      } else {
        oscillator.frequency.value = 300;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
      break;
  }
}

// ===== Start =====
init();
// Auto-start game after a brief delay
setTimeout(startGame, 500);
