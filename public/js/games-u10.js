// ============================================================================
// GAMES-U10.JS - Giochi per Bambini Sotto i 10 Anni
// 1. Camillo il Camaleonte (Torce RGB)
// 2. Esploratore nel Bosco Buio (La Torcia Magica - SOSTITUISCE GLI INDOVINELLI!)
// 3. Acchiappa la Stellina Luminosa
// ============================================================================

const U10State = {
  rgbScore: 0,
  rgbRound: 0,
  torches: { r: false, g: false, b: false },

  flashlightScore: 0,
  flashlightLevel: 0,
  flashlightItems: [],
  flashlightEnemies: [],
  flashlightAnimId: null,
  flashlightPos: { x: 380, y: 145 },
  flashlightRadius: 78,

  starLevel: 1,
  starScore: 0
};

window.getU10TotalScore = function () {
  return U10State.rgbScore + U10State.flashlightScore + U10State.starScore;
};

// ============================================================================
// GIOCO 1 UNDER 10: CAMILLO IL CAMALEONTE E LE TORCE RGB
// ============================================================================
const RGB_MISSIONS = [
  {
    targetName: 'GIALLO SOLE 🌟',
    targetHex: '#ffff00',
    r: true, g: true, b: false,
    hint: 'Accendi insieme la Torcia ROSSA 🔴 + la Torcia VERDE 🟢 (e lascia spenta la Blu)!'
  },
  {
    targetName: 'AZZURRO MARE 🐬',
    targetHex: '#00ffff',
    r: false, g: true, b: true,
    hint: 'Accendi insieme la Torcia VERDE 🟢 + la Torcia BLU 🔵 (e lascia spenta la Rossa)!'
  },
  {
    targetName: 'ROSA MAGENTA 🦄',
    targetHex: '#ff00ff',
    r: true, g: false, b: true,
    hint: 'Accendi insieme la Torcia ROSSA 🔴 + la Torcia BLU 🔵!'
  },
  {
    targetName: 'BIANCO BRILLANTE ☀️',
    targetHex: '#ffffff',
    r: true, g: true, b: true,
    hint: 'Accendi TUTTE E TRE le torce insieme: ROSSA 🔴 + VERDE 🟢 + BLU 🔵!'
  },
  {
    targetName: 'VERDE RANA 🐸',
    targetHex: '#00ff55',
    r: false, g: true, b: false,
    hint: 'Facilissimo: accendi SOLO la Torcia VERDE 🟢!'
  }
];

function toggleTorch(color) {
  U10State.torches[color] = !U10State.torches[color];
  updateTorchButtonsUI();
  drawRgbCanvas();
}

function giveRgbKidsHint() {
  if (U10State.rgbRound >= RGB_MISSIONS.length) return;
  const m = RGB_MISSIONS[U10State.rgbRound];
  document.getElementById('u10RgbFeedback').innerHTML = `🦉 <strong>Gufo Ottico dice:</strong> "${m.hint}"`;
}

function updateTorchButtonsUI() {
  const { r, g, b } = U10State.torches;
  const rBtn = document.getElementById('torchRedBtn');
  const gBtn = document.getElementById('torchGreenBtn');
  const bBtn = document.getElementById('torchBlueBtn');
  if (!rBtn) return;

  rBtn.classList.toggle('on', r);
  gBtn.classList.toggle('on', g);
  bBtn.classList.toggle('on', b);

  document.getElementById('torchRedState').textContent = r ? 'ACCESA ✨' : 'SPENTA';
  document.getElementById('torchGreenState').textContent = g ? 'ACCESA ✨' : 'SPENTA';
  document.getElementById('torchBlueState').textContent = b ? 'ACCESA ✨' : 'SPENTA';
}

function getCurrentMixColor() {
  const { r, g, b } = U10State.torches;
  const rv = r ? 255 : 40;
  const gv = g ? 255 : 55;
  const bv = b ? 255 : 75;
  return { css: `rgb(${rv}, ${gv}, ${bv})`, r, g, b };
}

function drawRgbCanvas() {
  const canvas = document.getElementById('rgbCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const mission = RGB_MISSIONS[Math.min(U10State.rgbRound, RGB_MISSIONS.length - 1)];
  const { r, g, b } = U10State.torches;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  if (r) {
    ctx.beginPath();
    ctx.arc(215, 130, 82, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.85)';
    ctx.fill();
  }
  if (g) {
    ctx.beginPath();
    ctx.arc(275, 130, 82, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.85)';
    ctx.fill();
  }
  if (b) {
    ctx.beginPath();
    ctx.arc(245, 185, 82, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 100, 255, 0.9)';
    ctx.fill();
  }
  ctx.restore();

  const mix = getCurrentMixColor();
  const bodyCol = (r || g || b) ? mix.css : '#475569';

  ctx.beginPath();
  ctx.arc(192, 175, 22, 0, Math.PI * 1.6);
  ctx.lineWidth = 10;
  ctx.strokeStyle = bodyCol;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(245, 158, 52, 38, 0, 0, Math.PI * 2);
  ctx.fillStyle = bodyCol;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(230, 122);
  ctx.lineTo(260, 122);
  ctx.lineTo(245, 88);
  ctx.closePath();
  ctx.fillStyle = '#f472b6';
  ctx.fill();
  ctx.strokeStyle = '#fde047';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(268, 148, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(271, 148, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(265, 162, 12, 0.15 * Math.PI, 0.75 * Math.PI);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.fillRect(14, 14, 155, 82);
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 3;
  ctx.strokeRect(14, 14, 155, 82);
  ctx.fillStyle = '#1e1b4b';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('COLORE DA CREARE:', 24, 34);
  ctx.fillStyle = mission.targetHex;
  ctx.fillRect(24, 42, 135, 42);
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 42, 135, 42);
}

function updateRgbMissionBanner() {
  const missionEl = document.getElementById('u10RgbMission');
  const scoreEl = document.getElementById('u10RgbScore');
  if (!missionEl) return;

  scoreEl.textContent = `⭐ Punti: ${U10State.rgbScore} / 500`;
  if (U10State.rgbRound >= RGB_MISSIONS.length) {
    missionEl.innerHTML = '🏆 <strong>SUPER MAGO DEI COLORI!</strong> Camillo ha fatto tutti i 5 colori dell\'arcobaleno!';
    return;
  }
  const m = RGB_MISSIONS[U10State.rgbRound];
  missionEl.innerHTML = `🎯 Missione ${U10State.rgbRound + 1} di 5: Trasforma Camillo in <strong>${m.targetName}</strong>!`;
}

function verifyRgbMix() {
  if (U10State.rgbRound >= RGB_MISSIONS.length) return;
  const m = RGB_MISSIONS[U10State.rgbRound];
  const { r, g, b } = U10State.torches;
  const feedbackEl = document.getElementById('u10RgbFeedback');

  if (r === m.r && g === m.g && b === m.b) {
    playSound('success');
    if (typeof launchConfetti === 'function') launchConfetti();
    if (typeof unlockSticker === 'function') {
      unlockSticker('badge-rgb', '🦎 <strong>Evviva!</strong> Hai sbloccato l\'Adesivo d\'Oro <strong>Mago dei Colori</strong>!');
    }
    U10State.rgbScore += 100;
    U10State.rgbRound += 1;
    feedbackEl.innerHTML = `🎉 <strong>BRAVISSIMO!</strong> Camillo è diventato ${m.targetName}! (+100 punti)`;
    U10State.torches = { r: false, g: false, b: false };
    updateTorchButtonsUI();
    updateRgbMissionBanner();
    drawRgbCanvas();
  } else {
    playSound('error');
    feedbackEl.innerHTML = `💡 Quasi! <strong>Aiutino di Camillo:</strong> ${m.hint}`;
  }
}

function resetRgbGame() {
  U10State.rgbScore = 0;
  U10State.rgbRound = 0;
  U10State.torches = { r: false, g: false, b: false };
  updateTorchButtonsUI();
  updateRgbMissionBanner();
  drawRgbCanvas();
  document.getElementById('u10RgbFeedback').textContent = '👆 Tocca i bottoni delle torce per accenderle!';
}

// ============================================================================
// GIOCO 2 UNDER 10: ESPLORATORE NEL BOSCO BUIO (LA TORCIA MAGICA!)
// Sostituisce il gioco degli indovinelli con un gioco d'azione visiva!
// ============================================================================
const FLASHLIGHT_LEVELS = [
  {
    title: 'Livello 1: Il Prato delle Farfalle Notturne 🦋',
    bgGrad: ['#064e3b', '#14532d'],
    emojis: ['🦋', '🐞', '🐝', '🦄', '🌸'],
    enemies: ['🦇', '🕷️']
  },
  {
    title: 'Livello 2: La Grotta dei Cristalli Lucenti 💎',
    bgGrad: ['#311068', '#1e1b4b'],
    emojis: ['💎', '👑', '🔮', '⭐', '🪙'],
    enemies: ['🦇', '🦂', '👻']
  },
  {
    title: 'Livello 3: Il Mare Profondo degli Abissi 🐬',
    bgGrad: ['#0c4a6e', '#0369a1'],
    emojis: ['🐬', '🐙', '🐠', '🦀', '🐢'],
    enemies: ['🦈', '🪼', '🐡']
  },
  {
    title: 'Livello 4: Lo Spazio delle Galassie 🚀',
    bgGrad: ['#1e1b4b', '#4c1d95'],
    emojis: ['🚀', '🪐', '🛸', '☄️', '🌟'],
    enemies: ['👾', '🕳️', '☄️']
  }
];

function initFlashlightGame() {
  U10State.flashlightScore = 0;
  U10State.flashlightLevel = 0;
  setupFlashlightEvents();
  startFlashlightLevel();
}

function setupFlashlightEvents() {
  const canvas = document.getElementById('flashlightCanvas');
  if (!canvas || canvas.dataset.bound === 'true') return;
  canvas.dataset.bound = 'true';

  const getCoords = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  canvas.addEventListener('mousemove', (e) => {
    U10State.flashlightPos = getCoords(e.clientX, e.clientY);
    drawFlashlightCanvas();
  });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      e.preventDefault();
      U10State.flashlightPos = getCoords(e.touches[0].clientX, e.touches[0].clientY);
      drawFlashlightCanvas();
      checkFlashlightClick(U10State.flashlightPos.x, U10State.flashlightPos.y);
    }
  }, { passive: false });

  canvas.addEventListener('click', (e) => {
    const pt = getCoords(e.clientX, e.clientY);
    U10State.flashlightPos = pt;
    checkFlashlightClick(pt.x, pt.y);
  });
}

function startFlashlightLevel() {
  const lvlIdx = U10State.flashlightLevel;
  const scoreEl = document.getElementById('u10FlashlightScore');
  const statusEl = document.getElementById('u10FlashlightStatus');
  if (!statusEl) return;

  scoreEl.textContent = `⭐ Punti: ${U10State.flashlightScore}`;

  if (lvlIdx >= FLASHLIGHT_LEVELS.length) {
    statusEl.innerHTML = '🏆 <strong>SUPER ESPLORATORE DELLA LUCE!</strong> Hai trovato tutti gli amici nascosti nel buio!';
    return;
  }

  const lvl = FLASHLIGHT_LEVELS[lvlIdx];
  U10State.flashlightItems = lvl.emojis.map((em, i) => ({
    emoji: em,
    x: 80 + ((i * 145 + Math.floor(Math.random() * 55)) % 600),
    y: 65 + Math.floor(Math.random() * 165),
    found: false
  }));

  U10State.flashlightEnemies = (lvl.enemies || ['🦇', '🕷️']).map((em, i) => ({
    emoji: em,
    x: 120 + ((i * 210 + Math.floor(Math.random() * 80)) % 540),
    y: 70 + Math.floor(Math.random() * 160),
    vx: (Math.random() < 0.5 ? -1 : 1) * (0.9 + Math.random() * 0.8),
    vy: (Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 0.7)
  }));

  updateFlashlightBanner();
  drawFlashlightCanvas();
  syncFlashlightLoop();
}

function syncFlashlightLoop() {
  const tab = document.getElementById('tab-u10');
  const stage = document.getElementById('u10-flashlight');
  const isVisible = tab && tab.classList.contains('active') && stage && stage.classList.contains('active');

  if (isVisible && !U10State.flashlightAnimId && U10State.flashlightLevel < FLASHLIGHT_LEVELS.length) {
    function tick() {
      const t = document.getElementById('tab-u10');
      const s = document.getElementById('u10-flashlight');
      if (!t || !t.classList.contains('active') || !s || !s.classList.contains('active') || U10State.flashlightLevel >= FLASHLIGHT_LEVELS.length) {
        U10State.flashlightAnimId = null;
        return;
      }
      U10State.flashlightEnemies.forEach(en => {
        en.x += en.vx;
        en.y += en.vy;
        if (en.x < 40 || en.x > 720) en.vx *= -1;
        if (en.y < 50 || en.y > 265) en.vy *= -1;
      });
      drawFlashlightCanvas();
      U10State.flashlightAnimId = requestAnimationFrame(tick);
    }
    U10State.flashlightAnimId = requestAnimationFrame(tick);
  } else if (!isVisible && U10State.flashlightAnimId) {
    cancelAnimationFrame(U10State.flashlightAnimId);
    U10State.flashlightAnimId = null;
  }
}

function updateFlashlightBanner() {
  const lvl = FLASHLIGHT_LEVELS[Math.min(U10State.flashlightLevel, FLASHLIGHT_LEVELS.length - 1)];
  const remaining = U10State.flashlightItems.filter(it => !it.found);
  const statusEl = document.getElementById('u10FlashlightStatus');
  const basketEl = document.getElementById('u10FlashlightBasket');

  if (statusEl) {
    const enemyIcons = (lvl.enemies || []).join(' ');
    statusEl.innerHTML = `🔦 <strong>${lvl.title}</strong> — Amici: <strong>${remaining.map(r => r.emoji).join(' ')}</strong> | ⚠️ Evita i nemici: <strong>${enemyIcons}</strong>`;
  }
  if (basketEl) {
    const foundList = U10State.flashlightItems.filter(it => it.found).map(it => it.emoji).join(' ');
    basketEl.innerHTML = `🧺 <strong>Trovati (${5 - remaining.length}/5):</strong> ${foundList || 'Muovi la torcia nel quadro buio e clicca sugli amici (attento ai nemici rossi!)'}`;
  }
}

function checkFlashlightClick(cx, cy) {
  // Controlla prima se il giocatore ha cliccato un nemico!
  let hitEnemy = null;
  U10State.flashlightEnemies.forEach(en => {
    if (Math.hypot(cx - en.x, cy - en.y) <= 38) {
      hitEnemy = en;
    }
  });

  if (hitEnemy) {
    playSound('error');
    U10State.flashlightScore = Math.max(0, U10State.flashlightScore - 30);
    document.getElementById('u10FlashlightScore').textContent = `⭐ Punti: ${U10State.flashlightScore}`;
    const basketEl = document.getElementById('u10FlashlightBasket');
    if (basketEl) {
      basketEl.innerHTML = `⚠️ <strong>AHI! Hai cliccato un nemico (${hitEnemy.emoji})! -30 punti!</strong> Fai attenzione al cerchio rosso!`;
    }
    // Sposta il nemico lontano dal clic
    hitEnemy.x = cx < 380 ? 640 : 120;
    hitEnemy.y = cy < 150 ? 240 : 70;
    drawFlashlightCanvas();
    return;
  }

  let hitAny = false;
  U10State.flashlightItems.forEach(item => {
    if (!item.found) {
      const dist = Math.hypot(cx - item.x, cy - item.y);
      if (dist <= 44) {
        item.found = true;
        hitAny = true;
        U10State.flashlightScore += 50;
      }
    }
  });

  if (hitAny) {
    playSound('success');
    document.getElementById('u10FlashlightScore').textContent = `⭐ Punti: ${U10State.flashlightScore}`;
    updateFlashlightBanner();
    drawFlashlightCanvas();

    const remaining = U10State.flashlightItems.filter(it => !it.found);
    if (remaining.length === 0) {
      if (typeof launchConfetti === 'function') launchConfetti();
      if (typeof unlockSticker === 'function') {
        unlockSticker('badge-animals', '🔦 <strong>Super Esploratore!</strong> Hai vinto l\'Adesivo d\'Oro della <strong>Torcia Magica</strong>!');
      }
      setTimeout(() => {
        U10State.flashlightLevel += 1;
        startFlashlightLevel();
      }, 1100);
    }
  }
}

function drawFlashlightCanvas() {
  const canvas = document.getElementById('flashlightCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const lvl = FLASHLIGHT_LEVELS[Math.min(U10State.flashlightLevel, FLASHLIGHT_LEVELS.length - 1)];

  // 1. Sfondo buio pesto (Notte senza luce)
  ctx.fillStyle = '#03050c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Piccole lucciole tenui nel buio
  ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.arc((i * 97) % canvas.width, (i * 53) % canvas.height, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('🔦 Muovi il mouse (o il dito) per illuminare il buio e CLICCA sugli amici che trovi!', 110, 26);

  // 2. Cerchio illuminato dalla Torcia Magica!
  const { x, y } = U10State.flashlightPos;
  const r = U10State.flashlightRadius;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();

  // Scena coloratissima visibile solo dove c'è la luce!
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, lvl.bgGrad[0]);
  grad.addColorStop(1, lvl.bgGrad[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Decorazione erba/stelle dentro il fascio di luce
  ctx.fillStyle = 'rgba(255,255,255,0.12)';
  for (let i = 0; i < 25; i++) {
    ctx.beginPath();
    ctx.arc((i * 67) % canvas.width, (i * 43) % canvas.height, 8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Disegna gli oggetti nascosti quando illuminati dalla torcia!
  ctx.font = '44px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  U10State.flashlightItems.forEach(item => {
    if (!item.found) {
      // Alone luminoso dietro l'amico scoperto
      ctx.beginPath();
      ctx.arc(item.x, item.y, 28, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
      ctx.fill();
      ctx.fillText(item.emoji, item.x, item.y);
    }
  });

  // Disegna i nemici in movimento con alone rosso di pericolo!
  U10State.flashlightEnemies.forEach(en => {
    ctx.beginPath();
    ctx.arc(en.x, en.y, 28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(239, 68, 68, 0.48)';
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ef4444';
    ctx.stroke();
    ctx.fillText(en.emoji, en.x, en.y);
  });
  ctx.restore();

  // Mostra in trasparenza con una spunta verde quelli già trovati
  ctx.save();
  ctx.font = '26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  U10State.flashlightItems.forEach(item => {
    if (item.found) {
      ctx.fillText('✅', item.x, item.y);
    }
  });
  ctx.restore();

  // Bordo dorato del fascio della torcia
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#fde047';
  ctx.stroke();
}

// ============================================================================
// GIOCO 3 UNDER 10: ACCHIAPPA LA STELLINA LUMINOSA
// ============================================================================
const CUTE_ICONS = ['⭐', '🌟', '🦄', '🌈', '🦋', '🌞'];

function renderU10StarGrid() {
  const grid = document.getElementById('u10StarGrid');
  const scoreEl = document.getElementById('u10StarScore');
  if (!grid) return;

  const size = Math.min(5, 2 + Math.floor((U10State.starLevel - 1) / 2));
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  scoreEl.textContent = `Livello: ${U10State.starLevel} | Punti: ${U10State.starScore}`;

  const total = size * size;
  const targetIdx = Math.floor(Math.random() * total);
  const hue = Math.floor(Math.random() * 360);
  const diff = Math.max(15, 35 - U10State.starLevel * 2);
  const icon = CUTE_ICONS[(U10State.starLevel - 1) % CUTE_ICONS.length];

  grid.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const btn = document.createElement('button');
    btn.className = 'color-cell';
    const light = i === targetIdx ? 50 + diff : 50;
    btn.style.backgroundColor = `hsl(${hue}, 88%, ${light}%)`;
    btn.textContent = icon;
    btn.addEventListener('click', () => {
      const fb = document.getElementById('u10StarFeedback');
      if (i === targetIdx) {
        playSound('success');
        if (U10State.starLevel === 2 && typeof unlockSticker === 'function') {
          unlockSticker('badge-stars', '⭐ <strong>Super Vista!</strong> Hai sbloccato l\'Adesivo <strong>Occhio Stellare</strong>!');
        }
        U10State.starScore += 50;
        U10State.starLevel += 1;
        fb.innerHTML = `🌟 <strong>BRAVISSIMO!</strong> L'hai trovata subito! (+50 punti)`;
        renderU10StarGrid();
      } else {
        playSound('error');
        fb.innerHTML = `👀 Guarda bene: cerca la casella con il colore più chiaro!`;
      }
    });
    grid.appendChild(btn);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  resetRgbGame();
  initFlashlightGame();
  renderU10StarGrid();
});
