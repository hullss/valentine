const screens = [...document.querySelectorAll(".screen")];
const totalSteps = screens.length;
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const fxLayer = document.getElementById("fxLayer");
const finalTyped = document.getElementById("finalTyped");
const finalCard = document.getElementById("finalCard");
const openCard = document.getElementById("openCard");
const replayBox = document.querySelector(".replayBox");
const musicToggle = document.getElementById("musicToggle");
const bgMusic = document.getElementById("bgMusic");
const letterInput = document.getElementById("letterInput");
const flowersCanvas = document.getElementById("flowersCanvas");
const clearFlowers = document.getElementById("clearFlowers");
const restartQuest = document.getElementById("restartQuest");
const defaultFinalText = finalTyped?.dataset.text || "";

let lastMouseX = window.innerWidth / 2;
let lastMouseY = window.innerHeight / 2;
let heartsTimer = null;
let flowersCtx = null;

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function updateProgress(id) {
  const current = document.getElementById(id);
  const step = Number(current?.dataset.step || 1);
  const percent = (step / totalSteps) * 100;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `Step ${step} of ${totalSteps}`;
}

function go(id) {
  screens.forEach((screen) => screen.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  updateProgress(id);

  if (id === "s6") {
    requestAnimationFrame(resizeFlowersCanvas);
  }

  if (id === "s7") {
    runFinalEffects();
  }
}

function addSpark(button) {
  button.classList.remove("spark");
  void button.offsetWidth;
  button.classList.add("spark");
}

document.querySelectorAll("button").forEach((button) => {
  button.addEventListener("mouseenter", () => addSpark(button));
  button.addEventListener("click", () => addSpark(button));
});

function startTypewriter() {
  if (!finalTyped || finalTyped.dataset.done === "1") return;
  const text = finalTyped.dataset.text || "";
  let i = 0;
  finalTyped.textContent = "";
  finalTyped.classList.add("typing");

  const timer = setInterval(() => {
    finalTyped.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(timer);
      finalTyped.classList.remove("typing");
      finalTyped.dataset.done = "1";
      if (replayBox) replayBox.classList.add("show");
    }
  }, 24);
}

function runFinalEffects() {
  if (!finalCard) return;
  finalCard.classList.remove("open");
  if (replayBox) replayBox.classList.remove("show");
  if (finalTyped) {
    finalTyped.textContent = "";
    finalTyped.dataset.done = "0";
    finalTyped.classList.remove("typing");
  }
}

function openFinalCard() {
  if (!finalCard) return;
  finalCard.classList.add("open");
  if (navigator.vibrate) navigator.vibrate(20);
  startTypewriter();
}

function resizeFlowersCanvas() {
  if (!flowersCanvas) return;
  const ratio = window.devicePixelRatio || 1;
  const width = Math.floor(flowersCanvas.clientWidth);
  const height = Math.floor(flowersCanvas.clientHeight);
  flowersCanvas.width = Math.floor(width * ratio);
  flowersCanvas.height = Math.floor(height * ratio);
  flowersCtx = flowersCanvas.getContext("2d");
  flowersCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
  flowersCtx.fillStyle = "#000";
  flowersCtx.fillRect(0, 0, width, height);
}

function drawGlowLine(ctx, x1, y1, cx, cy, x2, y2, color, width) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = width;
  ctx.strokeStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 7;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.quadraticCurveTo(cx, cy, x2, y2);
  ctx.stroke();
  ctx.restore();
}

function drawFlower(x, y) {
  if (!flowersCtx || !flowersCanvas) return;
  const width = flowersCanvas.clientWidth;
  const height = flowersCanvas.clientHeight;
  const baseX = x;
  const baseY = height - 4;
  const headY = Math.max(28, y);
  const ctrlX = x + rand(-36, 36);
  const ctrlY = rand(height * 0.42, height * 0.9);

  drawGlowLine(flowersCtx, baseX, baseY, ctrlX, ctrlY, x, headY, "#56d36f", rand(1.2, 2.4));

  const petals = 5 + Math.floor(Math.random() * 3);
  const flowerSize = rand(9, 16);
  const angleStep = (Math.PI * 2) / petals;
  const c1 = Math.random() > 0.5 ? "#ff4f92" : "#ff7cc9";
  const c2 = Math.random() > 0.5 ? "#9a48ff" : "#ff8a66";

  flowersCtx.save();
  flowersCtx.translate(x, headY);
  for (let i = 0; i < petals; i++) {
    const a = i * angleStep + rand(-0.08, 0.08);
    flowersCtx.save();
    flowersCtx.rotate(a);
    const grad = flowersCtx.createRadialGradient(0, 0, 0, flowerSize * 0.2, 0, flowerSize);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    flowersCtx.fillStyle = grad;
    flowersCtx.shadowColor = c1;
    flowersCtx.shadowBlur = 10;
    flowersCtx.beginPath();
    flowersCtx.ellipse(flowerSize, 0, flowerSize, flowerSize * 0.6, 0, 0, Math.PI * 2);
    flowersCtx.fill();
    flowersCtx.restore();
  }
  flowersCtx.fillStyle = "#ffd95e";
  flowersCtx.shadowColor = "#ffd95e";
  flowersCtx.shadowBlur = 8;
  flowersCtx.beginPath();
  flowersCtx.arc(0, 0, flowerSize * 0.26, 0, Math.PI * 2);
  flowersCtx.fill();
  flowersCtx.restore();
}

function handleFlowerPointer(clientX, clientY) {
  if (!flowersCanvas) return;
  const rect = flowersCanvas.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;
  if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
  drawFlower(x, y);
}

function initFlowers() {
  if (!flowersCanvas) return;
  resizeFlowersCanvas();
  window.addEventListener("resize", resizeFlowersCanvas);

  flowersCanvas.addEventListener("click", (e) => {
    handleFlowerPointer(e.clientX, e.clientY);
  });

  flowersCanvas.addEventListener(
    "touchstart",
    (e) => {
      const touch = e.touches[0];
      if (!touch) return;
      e.preventDefault();
      handleFlowerPointer(touch.clientX, touch.clientY);
    },
    { passive: false }
  );

  if (clearFlowers) {
    clearFlowers.addEventListener("click", () => resizeFlowersCanvas());
  }

  window.setTimeout(() => {
    const rect = flowersCanvas.getBoundingClientRect();
    handleFlowerPointer(rect.left + rect.width * 0.35, rect.top + rect.height * 0.3);
    handleFlowerPointer(rect.left + rect.width * 0.63, rect.top + rect.height * 0.25);
  }, 420);
}

function resetQuestState() {
  tries = 0;
  hint1.textContent = "";
  no1.style.left = "";
  no1.style.top = "";
  no1.style.right = "";

  const hint2 = document.getElementById("hint2");
  document.getElementById("q1").value = "";
  document.getElementById("q2").value = "";
  document.getElementById("q3").value = "";
  document.getElementById("q4").value = "";
  if (hint2) hint2.textContent = "";

  opened = 0;
  openedCount.textContent = "0";
  heartText.textContent = "";
  to4.disabled = true;
  document.querySelectorAll(".heart").forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("pop");
  });

  openedPhotos = 0;
  to5.disabled = true;
  document.querySelectorAll(".photoSpoiler").forEach((btn) => btn.classList.remove("revealed"));

  if (specialSpoiler) specialSpoiler.classList.remove("revealed");

  if (letterInput) letterInput.value = "";

  if (finalCard) finalCard.classList.remove("open");
  if (finalTyped) {
    finalTyped.textContent = "";
    finalTyped.classList.remove("typing");
    finalTyped.dataset.done = "0";
    finalTyped.dataset.text = defaultFinalText;
  }
  if (replayBox) replayBox.classList.remove("show");
}

function spawnHeart() {
  const heart = document.createElement("span");
  const cursorBias = ((lastMouseX / window.innerWidth) - 0.5) * 120;
  const startX = Math.max(0, Math.min(window.innerWidth, Math.random() * window.innerWidth + cursorBias));
  const driftX = (Math.random() - 0.5) * 180 + ((lastMouseX / window.innerWidth) - 0.5) * 80;

  heart.className = "floatHeart";
  heart.style.left = `${startX}px`;
  heart.style.setProperty("--driftX", `${driftX}px`);
  heart.style.animationDuration = `${5 + Math.random() * 4}s`;
  heart.style.opacity = `${0.45 + Math.random() * 0.5}`;
  fxLayer.appendChild(heart);

  setTimeout(() => heart.remove(), 9300);
}

function startFloatingHearts() {
  if (heartsTimer) return;
  heartsTimer = setInterval(spawnHeart, 620);
}

function toggleMusic(forceOn = null) {
  const shouldPlay = forceOn !== null ? forceOn : bgMusic.paused;

  if (shouldPlay) {
    bgMusic.play().then(() => {
      musicToggle.classList.add("on");
      musicToggle.textContent = "Sound: On";
      musicToggle.setAttribute("aria-pressed", "true");
    }).catch(() => {
      musicToggle.classList.remove("on");
      musicToggle.textContent = "Sound: Off";
      musicToggle.setAttribute("aria-pressed", "false");
    });
  } else {
    bgMusic.pause();
    musicToggle.classList.remove("on");
    musicToggle.textContent = "Sound: Off";
    musicToggle.setAttribute("aria-pressed", "false");
  }
}

musicToggle.addEventListener("click", () => toggleMusic());

window.addEventListener("mousemove", (e) => {
  lastMouseX = e.clientX;
  lastMouseY = e.clientY;
  document.body.style.setProperty("--mx", `${lastMouseX}px`);
  document.body.style.setProperty("--my", `${lastMouseY}px`);
});

window.addEventListener("touchmove", (e) => {
  const touch = e.touches[0];
  if (!touch) return;
  lastMouseX = touch.clientX;
  lastMouseY = touch.clientY;
}, { passive: true });

/* Screen 1: "No" runs away */
const area1 = document.getElementById("area1");
const no1 = document.getElementById("no1");
const yes1 = document.getElementById("yes1");
const hint1 = document.getElementById("hint1");

function moveNo() {
  const a = area1.getBoundingClientRect();
  const b = no1.getBoundingClientRect();
  const x = Math.random() * (a.width - b.width);
  const y = Math.random() * (a.height - b.height);
  no1.style.left = `${x}px`;
  no1.style.top = `${y}px`;
  no1.style.right = "auto";
}

let tries = 0;
no1.addEventListener("mouseenter", () => {
  tries++;
 hint1.textContent = tries < 4 ? "Нууу ні!!" : "Ну що ж… сьогодні це не прокатить 😄";

  moveNo();
});

no1.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    tries++;
    hint1.textContent = tries < 4 ? "Нууу ні!!" : "Ну що ж… сьогодні це не прокатить 😄";
    moveNo();
  },
  { passive: false }
);

yes1.addEventListener("click", () => go("s2"));

/* Screen 2: mini quiz */
document.getElementById("to3").addEventListener("click", () => {
  const q1 = document.getElementById("q1").value.trim();
  const q2 = document.getElementById("q2").value.trim();
  const q3 = document.getElementById("q3").value.trim();
  const q4 = document.getElementById("q4").value.trim();
  const hint2 = document.getElementById("hint2");

  if (!q1 || !q2 || !q3 || !q4) {
    hint2.textContent = "Та ну, мені ж цікаві твої відовіді :)";
    return;
  }
  hint2.textContent = "";
  go("s3");
});

/* Screen 3: hearts */
const heartText = document.getElementById("heartText");
const to4 = document.getElementById("to4");
const openedCount = document.getElementById("openedCount");
let opened = 0;

document.querySelectorAll(".heart").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    btn.disabled = true;
    if (navigator.vibrate) navigator.vibrate([18, 25, 18]);
    opened++;
    openedCount.textContent = String(opened);
    heartText.textContent = btn.dataset.text;
    btn.classList.add("pop");
    if (opened >= 3) to4.disabled = false;
  });
});

to4.addEventListener("click", () => go("s4"));

/* Screen 4: reveal gallery photos */
const to5 = document.getElementById("to5");
let openedPhotos = 0;

document.querySelectorAll(".photoSpoiler").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.classList.contains("revealed")) return;
    btn.classList.add("revealed");
    openedPhotos++;
    if (openedPhotos >= 3) to5.disabled = false;
  });
});

to5.addEventListener("click", () => go("s5"));

/* Screen 5 -> 6 */
document.getElementById("to6").addEventListener("click", () => {
  const userText = letterInput?.value.trim();
  if (userText) {
    finalTyped.dataset.text = userText;
  }
  go("s6");
});

/* Screen 6 -> 7 */
document.getElementById("to7").addEventListener("click", () => go("s7"));

/* Special photo spoiler */
const specialSpoiler = document.getElementById("specialSpoiler");
if (specialSpoiler) {
  specialSpoiler.addEventListener("click", () => {
    specialSpoiler.classList.add("revealed");
  });
}

if (openCard) {
  openCard.addEventListener("click", openFinalCard);
}

if (restartQuest) {
  restartQuest.addEventListener("click", () => {
    resetQuestState();
    go("s1");
  });
}

startFloatingHearts();
initFlowers();
updateProgress("s1");
