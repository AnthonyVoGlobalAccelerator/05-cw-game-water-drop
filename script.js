const MAX_HEALTH = 5;
const LANE_COUNT = 5;
const LANE_POSITIONS = [10, 30, 50, 70, 90];
const BASE_TRASH_CHANCE = 0.28;
const TRASH_CHANCE_PER_LEVEL = 0.1;

const container = document.getElementById("game-container");
const player = document.getElementById("player");
const scoreElement = document.getElementById("score");
const waterElement = document.getElementById("water");
const healthElement = document.getElementById("health");
const levelElement = document.getElementById("level");
const timeElement = document.getElementById("time");
const startButton = document.getElementById("start-btn");
const pauseButton = document.getElementById("pause-btn");
const replayButton = document.getElementById("replay-btn");
const settingsButton = document.getElementById("settings-btn");
const homeButton = document.getElementById("home-btn");
const settingsPanel = document.getElementById("settings-panel");
const closeSettingsButton = document.getElementById("close-settings-btn");
const feedback = document.getElementById("feedback");
const gameMessage = document.getElementById("game-message");
const communityPanel = document.getElementById("community-panel");
const resultPanel = document.getElementById("result-panel");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const finalScore = document.getElementById("final-score");
const finalWater = document.getElementById("final-water");
const finalTime = document.getElementById("final-time");
const answerFeedback = document.getElementById("answer-feedback");
const confetti = document.getElementById("confetti");

let gameState = "ready";
let score = 0;
let water = 0;
let health = MAX_HEALTH;
let elapsedTime = 0;
let playerLane = 2;
let lastFrame = 0;
let spawnTimer = 0;
let timerId;
let animationId;
let objects = [];
let confettiTimeout;

function updateHud() {
  const level = getLevel();
  scoreElement.textContent = score;
  waterElement.textContent = water;
  healthElement.textContent = health;
  levelElement.textContent = level;
  timeElement.textContent = elapsedTime;
}

function getLevel() {
  return Math.floor(water / 20) + 1;
}

function showConfetti() {
  window.clearTimeout(confettiTimeout);
  confetti.replaceChildren();
  for (let index = 0; index < 36; index += 1) {
    const piece = document.createElement("span");
    piece.style.setProperty("--x", `${Math.random() * 100}%`);
    piece.style.setProperty("--delay", `${Math.random() * 0.25}s`);
    piece.style.setProperty("--color", ["#ffc907", "#2e9df7", "#4fcb53", "#ff902a"][index % 4]);
    piece.style.setProperty("--rotation", `${Math.random() * 360}deg`);
    confetti.appendChild(piece);
  }
  confetti.classList.add("celebrate");
  confettiTimeout = window.setTimeout(() => {
    confetti.classList.remove("celebrate");
    confetti.replaceChildren();
  }, 1800);
}

function resetGame() {
  window.clearInterval(timerId);
  window.cancelAnimationFrame(animationId);
  window.clearTimeout(confettiTimeout);
  confetti.classList.remove("celebrate");
  confetti.replaceChildren();
  objects.forEach((object) => object.element.remove());
  objects = [];
  score = 0;
  water = 0;
  health = MAX_HEALTH;
  elapsedTime = 0;
  playerLane = 2;
  player.style.left = `${LANE_POSITIONS[playerLane]}%`;
  updateHud();
  gameMessage.textContent = "";
  feedback.textContent = "Switch lanes to collect drops and avoid trash.";
  answerFeedback.textContent = "";
  communityPanel.hidden = true;
  resultPanel.hidden = true;
  pauseButton.disabled = true;
  pauseButton.textContent = "Pause";
}

function startTimer() {
  timerId = window.setInterval(() => {
    if (gameState !== "playing") return;
    elapsedTime += 1;
    updateHud();
    if (elapsedTime % 100 === 0) {
      showConfetti();
      feedback.textContent = `${elapsedTime} seconds survived!`;
    }
  }, 1000);
}

function startGame() {
  if (gameState === "playing") return;
  resetGame();
  gameState = "playing";
  startButton.textContent = "Journey in progress";
  startButton.disabled = true;
  pauseButton.disabled = false;
  container.focus();
  lastFrame = performance.now();
  spawnTimer = 0;
  animationId = requestAnimationFrame(gameLoop);
  startTimer();
}

function togglePause() {
  if (gameState === "playing") {
    gameState = "paused";
    window.clearInterval(timerId);
    window.cancelAnimationFrame(animationId);
    pauseButton.textContent = "Resume";
    feedback.textContent = "Game paused.";
    return;
  }
  if (gameState === "paused") {
    gameState = "playing";
    lastFrame = performance.now();
    animationId = requestAnimationFrame(gameLoop);
    startTimer();
    pauseButton.textContent = "Pause";
    feedback.textContent = "Journey resumed.";
  }
}

function movePlayer(direction) {
  if (gameState !== "playing") return;
  playerLane = Math.max(0, Math.min(LANE_COUNT - 1, playerLane + direction));
  player.style.left = `${LANE_POSITIONS[playerLane]}%`;
}

function createObject() {
  const trashChance = Math.min(
    0.8,
    BASE_TRASH_CHANCE + (getLevel() - 1) * TRASH_CHANCE_PER_LEVEL
  );
  const isObstacle = Math.random() < trashChance;
  const element = document.createElement("div");
  element.className = isObstacle ? "game-object obstacle" : "game-object droplet";
  element.textContent = isObstacle ? "🧻" : "💧";
  element.setAttribute("aria-label", isObstacle ? "Rolled paper trash obstacle" : "Water droplet");
  const lane = Math.floor(Math.random() * LANE_COUNT);
  element.style.left = `${LANE_POSITIONS[lane]}%`;
  element.style.top = "-8%";
  container.appendChild(element);
  objects.push({ element, isObstacle, lane, y: -8 });
}

function hasCollision(object) {
  const playerRect = player.getBoundingClientRect();
  const objectRect = object.element.getBoundingClientRect();
  const sameLane = object.lane === playerLane;
  const sameDepth = playerRect.top < objectRect.bottom &&
    playerRect.bottom > objectRect.top;
  return sameLane && sameDepth;
}

function collectObject(object) {
  object.element.remove();
  if (object.isObstacle) {
    health -= 1;
    score = Math.max(0, score - 5);
    feedback.textContent = "Ouch! Trash cost 5 points and one life.";
    container.classList.add("hit-flash");
    window.setTimeout(() => container.classList.remove("hit-flash"), 220);
    if (health <= 0) endGame(false, "Your journey stopped after too many obstacles.");
  } else {
    const previousLevel = getLevel();
    score += 10;
    water += 1;
    feedback.textContent = "+10 points and +1 oz of clean water!";
    if (getLevel() > previousLevel) {
      feedback.textContent = `Level ${getLevel()} reached! More trash is coming.`;
      showConfetti();
    }
    container.classList.add("collect-flash");
    window.setTimeout(() => container.classList.remove("collect-flash"), 220);
  }
  updateHud();
}

function gameLoop(timestamp) {
  if (gameState !== "playing") return;
  const elapsed = Math.min(timestamp - lastFrame, 100);
  lastFrame = timestamp;
  spawnTimer += elapsed;
  if (spawnTimer >= 850) {
    createObject();
    spawnTimer = 0;
  }

  objects = objects.filter((object) => {
    object.y += elapsed * 0.038;
    object.element.style.top = `${object.y}%`;
    if (hasCollision(object)) {
      collectObject(object);
      return false;
    }
    if (object.y > 105) {
      object.element.remove();
      return false;
    }
    return true;
  });
  animationId = requestAnimationFrame(gameLoop);
}

function endGame(won, message) {
  if (gameState === "result") return;
  gameState = "result";
  window.clearInterval(timerId);
  cancelAnimationFrame(animationId);
  objects.forEach((object) => object.element.remove());
  objects = [];
  resultTitle.textContent = won ? "The community is thriving!" : "Journey over";
  resultMessage.textContent = `${message} You gained ${score} points this journey.`;
  finalScore.textContent = score;
  finalWater.textContent = `${water} oz`;
  finalTime.textContent = `${elapsedTime}s`;
  resultPanel.hidden = false;
  startButton.textContent = "Start journey";
  startButton.disabled = false;
  pauseButton.disabled = true;
  pauseButton.textContent = "Pause";
}

function goHome() {
  resetGame();
  gameState = "ready";
  startButton.textContent = "Start journey";
  startButton.disabled = false;
  feedback.textContent = "Switch lanes to collect drops and avoid trash.";
}

function openSettings() {
  settingsPanel.hidden = false;
}

function closeSettings() {
  settingsPanel.hidden = true;
}

function answerQuestion(event) {
  const answer = event.target.closest(".answer-button");
  if (!answer || gameState !== "community") return;
  if (answer.dataset.correct === "true") {
    gameState = "answering";
    score += 25;
    updateHud();
    answerFeedback.textContent = "Correct! Bonus +25 points.";
    answerFeedback.className = "answer-feedback success";
    window.setTimeout(() => {
      communityPanel.hidden = true;
      endGame(true, "You collected water and shared clean-water knowledge.");
    }, 650);
  } else {
    score = Math.max(0, score - 5);
    updateHud();
    answerFeedback.textContent = "Not quite. Try another answer (-5 points).";
    answerFeedback.className = "answer-feedback error";
  }
}

startButton.addEventListener("click", startGame);
pauseButton.addEventListener("click", togglePause);
replayButton.addEventListener("click", startGame);
settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
homeButton.addEventListener("click", goHome);
document.querySelector(".answer-list").addEventListener("click", answerQuestion);
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    event.preventDefault();
    movePlayer(-1);
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    event.preventDefault();
    movePlayer(1);
  }
});
document.querySelectorAll(".move-button").forEach((button) => {
  button.addEventListener("click", () => movePlayer(button.dataset.direction === "left" ? -1 : 1));
});

updateHud();
