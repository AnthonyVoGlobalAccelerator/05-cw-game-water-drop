const MAX_HEALTH = 5;
const LANE_COUNT = 5;
const LANE_POSITIONS = [10, 30, 50, 70, 90];
const BASE_TRASH_CHANCE = 0.28;
const TRASH_CHANCE_PER_LEVEL = 0.1;
const SPRING_CHANCE = 0.05;
const WATERING_CAN_CHANCE = 0.05;
const HEART_CHANCE = 0.04;
const JUMP_DURATION = 6000;
const DIFFICULTIES = {
  easy: { lives: 7, targetWater: 30, spawnInterval: 1000, objectSpeed: 0.038, trashMultiplier: 0.75, trashTypes: [0], timeLimit: null },
  normal: { lives: 5, targetWater: 40, spawnInterval: 850, objectSpeed: 0.05, trashMultiplier: 1, trashTypes: [0, 1, 2, 3], timeLimit: null },
  hard: { lives: 1, targetWater: 60, spawnInterval: 520, objectSpeed: 0.075, trashMultiplier: 1.3, trashTypes: [0, 1, 2, 3], timeLimit: 90 }
};
const MILESTONES = [
  { score: 100, message: "First 100 points! The community is counting on you." },
  { score: 250, message: "250 points! Your clean-water journey is growing." },
  { score: 500, message: "500 points! A huge step for the community." }
];
const TRASH_TYPES = [
  { icon: "🧻", label: "Toilet paper" },
  { icon: "🥫", label: "Empty can" },
  { icon: "🛍️", label: "Plastic bag" },
  { icon: "🧴", label: "Plastic bottle" }
];

const container = document.getElementById("game-container");
const player = document.getElementById("player");
const scoreElement = document.getElementById("score");
const waterElement = document.getElementById("water");
const healthElement = document.getElementById("health");
const levelElement = document.getElementById("level");
const schoolElement = document.getElementById("school");
const timeElement = document.getElementById("time");
const difficultySelect = document.getElementById("difficulty-select");
const goalStatus = document.getElementById("goal-status");
const startButton = document.getElementById("start-btn");
const pauseButton = document.getElementById("pause-btn");
const restartButton = document.getElementById("restart-btn");
const homeGameButton = document.getElementById("home-game-btn");
const soundButton = document.getElementById("sound-btn");
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
const soundToggle = document.getElementById("sound-toggle");
const soundStatus = document.getElementById("sound-status");

let gameState = "ready";
let score = 0;
let water = 0;
let health = MAX_HEALTH;
let schoolLevel = 1;
let jumpUntil = 0;
let elapsedTime = 0;
let playerLane = 2;
let playerHeight = 28;
let lastFrame = 0;
let spawnTimer = 0;
let timerId;
let animationId;
let objects = [];
let confettiTimeout;
let milestoneTimeout;
let milestonesReached = [];
let audioContext;
let soundEnabled = true;

function getDifficulty() {
  return DIFFICULTIES[difficultySelect.value] || DIFFICULTIES.normal;
}

function updateGoalStatus() {
  const difficulty = getDifficulty();
  const timeText = difficulty.timeLimit ? ` within ${difficulty.timeLimit} seconds` : "";
  goalStatus.textContent = `Reach ${difficulty.targetWater} water drops${timeText} to complete the journey.`;
}

function updateHud() {
  const level = getLevel();
  scoreElement.textContent = score;
  waterElement.textContent = water;
  healthElement.textContent = health;
  levelElement.textContent = level;
  schoolElement.textContent = `${getSchoolMultiplier()}x`;
  timeElement.textContent = elapsedTime;
}

function checkMilestones() {
  MILESTONES.forEach((milestone) => {
    if (score >= milestone.score && !milestonesReached.includes(milestone.score)) {
      milestonesReached.push(milestone.score);
      gameMessage.textContent = milestone.message;
      window.clearTimeout(milestoneTimeout);
      milestoneTimeout = window.setTimeout(() => {
        gameMessage.textContent = "";
      }, 2400);
      showConfetti();
      playSound("milestone");
    }
  });
}

function playSound(type) {
  if (!soundEnabled) return;
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  const tones = {
    collect: [520, 0.08],
    powerup: [720, 0.14],
    hit: [150, 0.16],
    milestone: [880, 0.2],
    waterMilestone: [960, 0.24],
    win: [1040, 0.28],
    lose: [100, 0.28]
  };
  const [frequency, duration] = tones[type] || tones.collect;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type === "hit" || type === "lose" ? "sawtooth" : "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

function checkWaterMilestones(previousWater) {
  const firstMilestone = Math.ceil((previousWater + 1) / 20) * 20;
  for (let milestone = firstMilestone; milestone <= water; milestone += 20) {
    gameMessage.textContent = `${milestone} water drops collected!`;
    playSound("waterMilestone");
    showConfetti();
  }
}

function updateSoundSetting() {
  soundEnabled = soundToggle.checked;
  soundStatus.textContent = soundEnabled ? "On" : "Off";
  soundButton.textContent = `Sound: ${soundEnabled ? "On" : "Off"}`;
}

function toggleSound() {
  soundToggle.checked = !soundToggle.checked;
  updateSoundSetting();
}

function getLevel() {
  return Math.floor(water / 20) + 1;
}

function getSchoolLevel() {
  return Math.min(4, Math.floor(water / 15) + 1);
}

function getSchoolMultiplier() {
  return (1 + (getSchoolLevel() - 1) * 0.5).toFixed(1).replace(".0", "");
}

function isJumping() {
  return performance.now() < jumpUntil;
}

function showConfetti() {
  window.clearTimeout(confettiTimeout);
  window.clearTimeout(milestoneTimeout);
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
  health = getDifficulty().lives;
  schoolLevel = 1;
  jumpUntil = 0;
  milestonesReached = [];
  elapsedTime = 0;
  playerLane = 2;
  playerHeight = 28;
  player.style.left = `${LANE_POSITIONS[playerLane]}%`;
  player.style.bottom = `${playerHeight}px`;
  player.classList.remove("jumping");
  updateHud();
  gameMessage.textContent = "";
  feedback.textContent = "Switch lanes to collect drops and avoid trash.";
  answerFeedback.textContent = "";
  communityPanel.hidden = true;
  resultPanel.hidden = true;
  pauseButton.disabled = true;
  pauseButton.textContent = "Pause";
  updateGoalStatus();
  difficultySelect.disabled = false;
}

function startTimer() {
  timerId = window.setInterval(() => {
    if (gameState !== "playing") return;
    elapsedTime += 1;
    updateHud();
    if (getDifficulty().timeLimit && elapsedTime >= getDifficulty().timeLimit) {
      endGame(false, "Time ran out before the community reached its water goal.");
      return;
    }
    if (elapsedTime % 100 === 0) {
      showConfetti();
      feedback.textContent = `${elapsedTime} seconds survived!`;
    }
  }, 1000);
}

function startGame() {
  if (gameState === "playing") return;
  resetGame();
  difficultySelect.disabled = true;
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

function movePlayerVertical(direction) {
  if (gameState !== "playing") return;
  playerHeight = Math.max(28, Math.min(180, playerHeight + direction * 32));
  player.style.bottom = `${playerHeight}px`;
}

function restartGame() {
  startGame();
}

function createObject() {
  const trashChance = Math.min(
    0.9,
    (BASE_TRASH_CHANCE + (getLevel() - 1) * TRASH_CHANCE_PER_LEVEL) * getDifficulty().trashMultiplier
  );
  const powerupRoll = Math.random();
  const isSpring = powerupRoll < SPRING_CHANCE;
  const isWateringCan = !isSpring && powerupRoll < SPRING_CHANCE + WATERING_CAN_CHANCE;
  const isHeart = !isSpring && !isWateringCan && powerupRoll < SPRING_CHANCE + WATERING_CAN_CHANCE + HEART_CHANCE;
  const isPowerup = isSpring || isWateringCan || isHeart;
  const isObstacle = !isPowerup && Math.random() < trashChance;
  const availableTrash = getDifficulty().trashTypes;
  const trashIndex = availableTrash[Math.floor(Math.random() * availableTrash.length)];
  const trash = TRASH_TYPES[trashIndex];
  const element = document.createElement("div");
  element.className = isSpring ? "game-object spring" : isWateringCan ? "game-object watering-can" : isHeart ? "game-object heart" : isObstacle ? "game-object obstacle" : "game-object droplet";
  element.textContent = isSpring ? "🌀" : isHeart ? "❤️" : isWateringCan || isObstacle ? "" : "💧";
  if (isObstacle) element.textContent = trash.icon;
  element.setAttribute("aria-label", isSpring ? "Spring jump power-up" : isWateringCan ? "Watering can worth ten water drops" : isHeart ? "Heart extra-life power-up" : isObstacle ? `${trash.label} obstacle` : "Water droplet");
  const lane = Math.floor(Math.random() * LANE_COUNT);
  element.style.left = `${LANE_POSITIONS[lane]}%`;
  element.style.top = "-8%";
  container.appendChild(element);
  objects.push({ element, isObstacle, isPowerup, isSpring, isWateringCan, isHeart, lane, y: -8, speed: getDifficulty().objectSpeed });
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
  if (object.isPowerup) {
    if (object.isSpring) {
      jumpUntil = performance.now() + JUMP_DURATION;
      player.classList.add("jumping");
      feedback.textContent = "Spring collected! You can jump over trash for 6 seconds.";
      playSound("powerup");
      window.setTimeout(() => {
        if (!isJumping()) player.classList.remove("jumping");
      }, JUMP_DURATION);
    } else if (object.isWateringCan) {
      const previousLevel = getLevel();
      const previousSchoolLevel = getSchoolLevel();
      const previousWater = water;
      const waterBonus = 10;
      water += waterBonus;
      score += waterBonus * 10 * Number(getSchoolMultiplier());
      feedback.textContent = "Watering can collected! +10 water drops.";
      playSound("powerup");
      checkWaterMilestones(previousWater);
      checkMilestones();
      if (getLevel() > previousLevel || getSchoolLevel() > previousSchoolLevel) {
        schoolLevel = getSchoolLevel();
        feedback.textContent = `Watering can upgraded the school to ${getSchoolMultiplier()}x points!`;
        showConfetti();
      }
    } else if (object.isHeart) {
      health += 1;
      feedback.textContent = "Heart collected! +1 life.";
      playSound("powerup");
    }
  } else if (object.isObstacle) {
    if (isJumping()) {
      score += 5;
      feedback.textContent = "Nice jump! You cleared the trash +5 points.";
      playSound("collect");
      checkMilestones();
      updateHud();
      return;
    }
    health -= 1;
    score = Math.max(0, score - 5);
    feedback.textContent = "Ouch! Trash cost 5 points and one life.";
    playSound("hit");
    container.classList.add("hit-flash");
    window.setTimeout(() => container.classList.remove("hit-flash"), 220);
    if (health <= 0) endGame(false, "Your journey stopped after too many obstacles.");
  } else {
    const previousLevel = getLevel();
    const previousSchoolLevel = getSchoolLevel();
    const previousWater = water;
    score += 10;
    water += 1;
    score += Math.floor(10 * (Number(getSchoolMultiplier()) - 1));
    playSound("collect");
    checkWaterMilestones(previousWater);
    checkMilestones();
    feedback.textContent = `+${Math.floor(10 * Number(getSchoolMultiplier()))} points and +1 oz of clean water!`;
    if (getLevel() > previousLevel) {
      feedback.textContent = `Level ${getLevel()} reached! More trash is coming.`;
      showConfetti();
    }
    if (getSchoolLevel() > previousSchoolLevel) {
      schoolLevel = getSchoolLevel();
      feedback.textContent = `The school upgraded to ${getSchoolMultiplier()}x points!`;
      showConfetti();
    }
    container.classList.add("collect-flash");
    window.setTimeout(() => container.classList.remove("collect-flash"), 220);
  }
  if (water >= getDifficulty().targetWater && gameState === "playing") {
    openCommunityChallenge();
  }
  updateHud();
}

function gameLoop(timestamp) {
  if (gameState !== "playing") return;
  const elapsed = Math.min(timestamp - lastFrame, 100);
  lastFrame = timestamp;
  spawnTimer += elapsed;
  if (spawnTimer >= getDifficulty().spawnInterval) {
    createObject();
    spawnTimer = 0;
  }

  objects = objects.filter((object) => {
    object.y += elapsed * object.speed;
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
  playSound(won ? "win" : "lose");
  difficultySelect.disabled = false;
  startButton.textContent = "Start journey";
  startButton.disabled = false;
  pauseButton.disabled = true;
  pauseButton.textContent = "Pause";
}

function openCommunityChallenge() {
  gameState = "community";
  window.clearInterval(timerId);
  window.cancelAnimationFrame(animationId);
  objects.forEach((object) => object.element.remove());
  objects = [];
  communityPanel.hidden = false;
  answerFeedback.textContent = "";
  answerFeedback.className = "answer-feedback";
  feedback.textContent = "Your water goal is complete. Answer one final community question.";
  playSound("milestone");
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

function clickObject(event) {
  const element = event.target.closest(".game-object");
  if (!element || gameState !== "playing") return;
  const object = objects.find((candidate) => candidate.element === element);
  if (!object) return;
  collectObject(object);
  objects = objects.filter((candidate) => candidate !== object);
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
    playSound("collect");
    checkMilestones();
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
restartButton.addEventListener("click", restartGame);
replayButton.addEventListener("click", startGame);
settingsButton.addEventListener("click", openSettings);
closeSettingsButton.addEventListener("click", closeSettings);
homeButton.addEventListener("click", goHome);
homeGameButton.addEventListener("click", goHome);
soundButton.addEventListener("click", toggleSound);
soundToggle.addEventListener("change", updateSoundSetting);
document.querySelectorAll(".move-button").forEach((button) => {
  button.addEventListener("click", () => {
    const direction = button.dataset.direction;
    if (direction === "left" || direction === "right") {
      movePlayer(direction === "left" ? -1 : 1);
    } else {
      movePlayerVertical(direction === "up" ? 1 : -1);
    }
    container.focus();
  });
});
document.querySelector(".answer-list").addEventListener("click", answerQuestion);
container.addEventListener("click", clickObject);
difficultySelect.addEventListener("change", updateGoalStatus);
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
    event.preventDefault();
    movePlayer(-1);
  }
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
    event.preventDefault();
    movePlayer(1);
  }
  if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
    event.preventDefault();
    movePlayerVertical(1);
  }
  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
    event.preventDefault();
    movePlayerVertical(-1);
  }
});
updateGoalStatus();
updateSoundSetting();
updateHud();
