// ============================================================================
// APP.JS - Coriandoli, Adesivi Magici, Gufo Ottico & Simulatore Occhio Cartoon
// I.I.S. "G. Asproni - E. Fermi" Iglesias - Festival della Scienza
// ============================================================================

const AppState = {
  u10TotalScore: 0,
  u16TotalScore: 0,
  selectedAnatomyPart: 'cornea',
  pupilLight: 55,
  playerName: '',
  playerClass: '',
  leaderboardFilter: 'all'
};

const NAME_NOUNS = [
  'Gufo', 'Falco', 'Lince', 'Aquila', 'Prisma', 'Fotone', 'Raggio',
  'Camaleonte', 'Delfino', 'Volpe', 'Lupo', 'Drago', 'Cometa', 'Laser'
];
const NAME_ADJECTIVES = [
  'Ottico', 'Fotonico', 'Arcobaleno', 'Neutrino', 'Stellare', 'Quantistico',
  'Solare', 'Cromatico', 'Elettrico', 'Cosmico', 'Spettrale', 'Luminoso', 'Bionico'
];

function generatePlayerName() {
  const noun = NAME_NOUNS[Math.floor(Math.random() * NAME_NOUNS.length)];
  const adj = NAME_ADJECTIVES[Math.floor(Math.random() * NAME_ADJECTIVES.length)];
  const num = Math.floor(10 + Math.random() * 90);
  return `${noun} ${adj} #${num}`;
}

function initPlayerProfile() {
  let savedName = '';
  let savedClass = '';
  try {
    savedName = localStorage.getItem('festival_player_name') || '';
    savedClass = localStorage.getItem('festival_player_class') || '';
  } catch (e) {}

  AppState.playerName = savedName || generatePlayerName();
  AppState.playerClass = savedClass;
  try {
    localStorage.setItem('festival_player_name', AppState.playerName);
  } catch (e) {}
  updatePlayerProfileUI();
}

function regeneratePlayerName() {
  AppState.playerName = generatePlayerName();
  try {
    localStorage.setItem('festival_player_name', AppState.playerName);
  } catch (e) {}
  updatePlayerProfileUI();
}

function syncPlayerClass(val) {
  AppState.playerClass = String(val || '').toUpperCase().slice(0, 20);
  try {
    localStorage.setItem('festival_player_class', AppState.playerClass);
  } catch (e) {}
  document.querySelectorAll('.js-player-class').forEach(inp => {
    if (inp.value !== AppState.playerClass) inp.value = AppState.playerClass;
  });
}

function updatePlayerProfileUI() {
  document.querySelectorAll('.js-player-name').forEach(el => {
    el.textContent = AppState.playerName;
  });
  document.querySelectorAll('.js-player-class').forEach(inp => {
    inp.value = AppState.playerClass;
  });
}

// ============================================================================
// SISTEMA DI CORIANDOLI E STELLINE FESTIVE PER BAMBINI
// ============================================================================
let confettiParticles = [];
let confettiAnimId = null;

function launchConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext('2d');

  const colors = ['#ff006e', '#ffbe0b', '#fb5607', '#3a86ff', '#8338ec', '#06d6a0'];
  for (let i = 0; i < 85; i++) {
    confettiParticles.push({
      x: canvas.width * (0.2 + Math.random() * 0.6),
      y: canvas.height * 0.35,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 14 - 4,
      size: 8 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.25,
      life: 100
    });
  }

  if (!confettiAnimId) {
    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettiParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravità
        p.rot += p.vrot;
        p.life -= 1;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
        ctx.restore();
      });
      confettiParticles = confettiParticles.filter(p => p.life > 0 && p.y < canvas.height + 30);
      if (confettiParticles.length > 0) {
        confettiAnimId = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        confettiAnimId = null;
      }
    }
    confettiAnimId = requestAnimationFrame(step);
  }
}

function unlockSticker(badgeId, speechText) {
  const badge = document.getElementById(badgeId);
  if (badge && !badge.classList.contains('earned')) {
    badge.classList.add('earned');
    launchConfetti();
  }
  const speech = document.getElementById('mascotSpeech');
  if (speech && speechText) {
    speech.innerHTML = speechText;
  }
}

// Sintetizzatore Web Audio API per suoni allegri da cartone animato
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      osc.frequency.setValueAtTime(1046.5, now + 0.24);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.start(now);
      osc.stop(now + 0.42);
    } else if (type === 'error') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.setValueAtTime(190, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.28);
    } else if (type === 'unlock') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.09);
      osc.frequency.setValueAtTime(783.99, now + 0.18);
      osc.frequency.setValueAtTime(1046.5, now + 0.27);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    }
  } catch (e) {}
}

function switchTab(tabId) {
  document.querySelectorAll('.tab-section').forEach(sec => {
    sec.classList.toggle('active', sec.id === tabId);
  });
  document.querySelectorAll('.main-nav .nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });

  if (tabId === 'tab-escape' && typeof startEscapeTimerIfNeeded === 'function') {
    startEscapeTimerIfNeeded();
  }
  if (tabId === 'tab-leaderboard') {
    loadLeaderboard(AppState.leaderboardFilter);
  }
  if (typeof syncQuickDrawTimers === 'function') {
    syncQuickDrawTimers();
  }
  if (typeof syncFlashlightLoop === 'function') {
    syncFlashlightLoop();
  }
}

function switchSubGame(category, stageId, btnEl) {
  const parent = document.getElementById(`tab-${category}`);
  if (!parent) return;
  parent.querySelectorAll('.game-stage').forEach(st => {
    st.classList.toggle('active', st.id === stageId);
  });
  parent.querySelectorAll('.subgame-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  if (typeof syncQuickDrawTimers === 'function') {
    syncQuickDrawTimers();
  }
  if (typeof syncFlashlightLoop === 'function') {
    syncFlashlightLoop();
  }
}

// ============================================================================
// HERO CANVAS: GUFO OTTICO CON DUE OCCHIONI CHE SEGUONO LA FARFALLA ARCOBALENO!
// ============================================================================
function initHeroCanvas() {
  const canvas = document.getElementById('heroEyeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let mouseX = canvas.width * 0.78;
  let mouseY = canvas.height * 0.35;
  let t = 0;

  const updatePointer = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (clientX - rect.left) * (canvas.width / rect.width);
    mouseY = (clientY - rect.top) * (canvas.height / rect.height);
  };

  canvas.addEventListener('mousemove', e => updatePointer(e.clientX, e.clientY));
  canvas.addEventListener('touchmove', e => {
    if (e.touches[0]) updatePointer(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  function render() {
    t += 0.04;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Stelline di sfondo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    [[40, 40], [380, 50], [60, 220], [370, 230], [215, 25]].forEach(([sx, sy], idx) => {
      ctx.beginPath();
      ctx.arc(sx, sy, 2 + Math.sin(t + idx) * 1.2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Corpo simpatico di Gufo Ottico al centro-sinistra (cx = 165, cy = 150)
    const ox = 165;
    const oy = 152;

    // Ciuffetti orecchie gufo
    ctx.fillStyle = '#9333ea';
    ctx.beginPath();
    ctx.moveTo(ox - 68, oy - 45);
    ctx.lineTo(ox - 88, oy - 92);
    ctx.lineTo(ox - 30, oy - 68);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(ox + 68, oy - 45);
    ctx.lineTo(ox + 88, oy - 92);
    ctx.lineTo(ox + 30, oy - 68);
    ctx.closePath();
    ctx.fill();

    // Testa rotonda del gufo
    ctx.beginPath();
    ctx.ellipse(ox, oy, 86, 76, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#a855f7';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();

    // Due grandi occhioni del gufo che seguono il cursore!
    [-36, 36].forEach(dx => {
      const ex = ox + dx;
      const ey = oy - 6;

      // Sclera bianca
      ctx.beginPath();
      ctx.arc(ex, ey, 32, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#38bdf8';
      ctx.stroke();

      // Direzione verso il mouse
      const ang = Math.atan2(mouseY - ey, mouseX - ex);
      const dist = Math.min(10, Math.hypot(mouseX - ex, mouseY - ey) * 0.08);
      const px = ex + Math.cos(ang) * dist;
      const py = ey + Math.sin(ang) * dist;

      // Iride azzurra brillante
      ctx.beginPath();
      ctx.arc(px, py, 18, 0, Math.PI * 2);
      ctx.fillStyle = '#06b6d4';
      ctx.fill();

      // Pupilla nera
      ctx.beginPath();
      ctx.arc(px, py, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Scintilla bianca nell'occhio
      ctx.beginPath();
      ctx.arc(px - 5, py - 5, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });

    // Becco arancione sorridente
    ctx.beginPath();
    ctx.moveTo(ox - 12, oy + 14);
    ctx.lineTo(ox + 12, oy + 14);
    ctx.lineTo(ox, oy + 32);
    ctx.closePath();
    ctx.fillStyle = '#fb923c';
    ctx.fill();

    // Raggio arcobaleno verso la stellina/farfalla sul mouse
    const rainbow = ['#ff006e', '#ffbe0b', '#06d6a0', '#3a86ff'];
    rainbow.forEach((col, i) => {
      ctx.beginPath();
      ctx.moveTo(ox + 36, oy - 6);
      ctx.lineTo(mouseX, mouseY + (i - 1.5) * 6);
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.2;
      ctx.globalAlpha = 0.65;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;

    // Farfallina/Stellina magica sul puntatore del bambino
    ctx.font = '28px sans-serif';
    ctx.fillText('🦋', mouseX - 14, mouseY + 10);

    requestAnimationFrame(render);
  }
  render();
}

// ============================================================================
// SIMULATORE DELL'OCCHIO CARTOON CON ALBERELLO E CERVELLO SORRIDENTE
// ============================================================================
const ANATOMY_DATA = {
  cornea: {
    tag: 'Tappa #1 • La Finestra dell\'Occhio',
    title: '1. La Cornea: Lo Scudo Trasparente 🛡️',
    desc: 'È come il vetro trasparente del casco di un astronauta! Sta proprio davanti all\'occhio, lo protegge dalla polvere e fa entrare i raggi di luce.',
    fact: '✨ Lo sapevi? È trasparente come l\'acqua pulita perché non contiene nemmeno una goccia di sangue!'
  },
  pupilla: {
    tag: 'Tappa #2 • Il Portoncino della Luce',
    title: '2. Iride e Pupilla: La Porta che si Allarga e si Stringe 🚪',
    desc: 'L\'Iride è la parte colorata del tuo occhio, mentre la Pupilla è il cerchietto nero al centro! Quando c\'è buio si apre tantissimo; al sole diventa piccolissima!',
    fact: '🔦 Prova a muovere il cursore della Torcia qui sotto per vedere la Pupilla cambiare grandezza!'
  },
  cristallino: {
    tag: 'Tappa #3 • La Lente Elastica',
    title: '3. Il Cristallino: Lo Zoom che Capovolge! 🔍',
    desc: 'È una lente morbida nascosta dietro la pupilla! Mette a fuoco le cose vicine e lontane... e fa una magia buffa: gira l\'alberello A TESTA IN GIÙ!',
    fact: '🙃 Guarda nel disegno come i raggi si incrociano e capovolgono l\'alberello!'
  },
  retina: {
    tag: 'Tappa #4 • Il Grande Schermo del Cinema',
    title: '4. La Retina: Coni e Bastoncelli 🎬',
    desc: 'È il tappeto magico sul fondo dell\'occhio dove arriva l\'alberello capovolto! Qui abitano i CONI (che vedono i colori) e i BASTONCELLI (che vedono al buio!).',
    fact: '🎨 Abbiamo 6 milioni di Coni per i colori e 120 milioni di Bastoncelli per la notte!'
  },
  nervo: {
    tag: 'Tappa #5 • Il Cavo Super-Veloce',
    title: '5. Il Nervo Ottico e il Cervello 🧠⚡',
    desc: 'Il Nervo Ottico porta l\'immagine capovolta fino al nostro amico CERVELLO a destra, che in un lampo la rimette DRITTA così vediamo il mondo nel verso giusto!',
    fact: '🚀 I messaggi viaggiano dall\'occhio al cervello a oltre 300 chilometri all\'ora!'
  }
};

function drawAnatomySimulator() {
  const canvas = document.getElementById('anatomyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const part = AppState.selectedAnatomyPart;
  const light = AppState.pupilLight;

  // 1. Alberello DRITTO a sinistra (x = 58, y = 155)
  ctx.save();
  // Tronco
  ctx.fillStyle = '#92400e';
  ctx.fillRect(50, 165, 16, 42);
  // Chioma verde
  ctx.beginPath();
  ctx.arc(58, 138, 32, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#fde047';
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('🌳 DRITTO', 26, 232);
  ctx.restore();

  // 2. Grande Occhio Cartoon al centro (cx = 315, cy = 160, r = 105)
  const ex = 315;
  const ey = 160;
  const er = 105;

  ctx.beginPath();
  ctx.arc(ex, ey, er, -Math.PI * 0.78, Math.PI * 0.78);
  ctx.lineWidth = 8;
  ctx.strokeStyle = part === 'retina' ? '#4ade80' : '#94a3b8';
  ctx.stroke();

  // Cornea anteriore
  ctx.beginPath();
  ctx.arc(ex - 86, ey, 62, -Math.PI * 0.42, Math.PI * 0.42);
  ctx.lineWidth = part === 'cornea' ? 8 : 5;
  ctx.strokeStyle = part === 'cornea' ? '#facc15' : '#38bdf8';
  ctx.stroke();

  // Pupilla e Iride
  const pupilGap = 40 - (light / 100) * 25;
  ctx.lineWidth = 9;
  ctx.strokeStyle = part === 'pupilla' ? '#facc15' : '#ec4899';
  ctx.beginPath();
  ctx.moveTo(222, ey - 50);
  ctx.lineTo(222, ey - pupilGap);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(222, ey + 50);
  ctx.lineTo(222, ey + pupilGap);
  ctx.stroke();

  // Cristallino
  ctx.beginPath();
  ctx.ellipse(246, ey, 16, 44, 0, 0, Math.PI * 2);
  ctx.fillStyle = part === 'cristallino' ? 'rgba(250, 204, 21, 0.55)' : 'rgba(56, 189, 248, 0.35)';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = part === 'cristallino' ? '#facc15' : '#38bdf8';
  ctx.stroke();

  // Raggi di luce gialli che si incrociano nel cristallino
  ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(58, 110);
  ctx.lineTo(222, ey - pupilGap * 0.5);
  ctx.lineTo(246, ey);
  ctx.lineTo(405, 195);

  ctx.moveTo(58, 205);
  ctx.lineTo(222, ey + pupilGap * 0.5);
  ctx.lineTo(246, ey);
  ctx.lineTo(405, 125);
  ctx.stroke();

  // Alberello CAPOVOLTO sulla Retina (x = 400)!
  ctx.save();
  // Tronco in ALTO!
  ctx.fillStyle = '#92400e';
  ctx.fillRect(390, 125, 10, 24);
  // Chioma verde in BASSO!
  ctx.beginPath();
  ctx.arc(395, 168, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.fill();
  ctx.fillStyle = '#fde047';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('🙃 SOTTO-SOPRA!', 335, 285);
  ctx.restore();

  // 3. Cavo Nervo Ottico + Simpatico Cervello a destra (x = 525, y = 160)
  ctx.fillStyle = part === 'nervo' ? '#f472b6' : '#64748b';
  ctx.fillRect(420, ey - 10, 62, 20);

  // Nuvola rosa del Cervello
  ctx.beginPath();
  ctx.arc(525, ey, 45, 0, Math.PI * 2);
  ctx.fillStyle = '#f472b6';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('CERVELLO 🧠', 485, ey + 65);
  ctx.font = '26px sans-serif';
  ctx.fillText('🌳', 510, ey + 10);
  ctx.font = 'bold 11px sans-serif';
  ctx.fillStyle = '#4ade80';
  ctx.fillText('TORNA DRITTO!', 480, ey - 55);
}

function initAnatomyExplorer() {
  const container = document.getElementById('anatomyButtons');
  if (container) {
    container.querySelectorAll('.part-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.part-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const key = btn.dataset.part;
        AppState.selectedAnatomyPart = key;
        const info = ANATOMY_DATA[key];
        if (info) {
          document.getElementById('anatomyTag').textContent = info.tag;
          document.getElementById('anatomyTitle').textContent = info.title;
          document.getElementById('anatomyDesc').textContent = info.desc;
          document.getElementById('anatomyFact').textContent = info.fact;
        }
        playSound('success');
        drawAnatomySimulator();
      });
    });
  }

  const slider = document.getElementById('lightIntensitySlider');
  if (slider) {
    slider.addEventListener('input', () => {
      AppState.pupilLight = Number(slider.value);
      drawAnatomySimulator();
    });
  }

  drawAnatomySimulator();
}

async function loadScienceFacts() {
  const container = document.getElementById('factsContainer');
  if (!container) return;
  try {
    const res = await fetch('/api/facts');
    const facts = await res.json();
    container.innerHTML = facts.map(f => `
      <article class="fact-card">
        <span class="fact-badge">${f.badge}</span>
        <h4>${f.title}</h4>
        <p style="color:var(--card-muted); font-weight:600; font-size:0.95rem;">${f.summary}</p>
        <div class="fact-formula">${f.formula}</div>
      </article>
    `).join('');
  } catch (e) {
    container.innerHTML = '<p>Impossibile caricare i dati dal server.</p>';
  }
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

async function loadLeaderboard(filter = 'all') {
  AppState.leaderboardFilter = filter;
  ['all', 'u10', 'u16', 'escape'].forEach(f => {
    const btn = document.getElementById(`lbFilter-${f}`);
    if (btn) btn.classList.toggle('active', f === filter);
  });

  const tbody = document.getElementById('leaderboardTableBody');
  if (!tbody) return;

  try {
    const res = await fetch(`/api/leaderboard?category=${encodeURIComponent(filter)}`);
    const rows = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Nessun punteggio ancora registrato in questa categoria!</td></tr>';
      return;
    }

    tbody.innerHTML = rows.map((r, idx) => {
      const medal = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `${idx + 1}°`));
      const classeText = r.classe ? escapeHtml(r.classe) : '—';
      const safeId = escapeHtml(String(r.id));
      return `
        <tr>
          <td><strong>${medal}</strong></td>
          <td><strong>${escapeHtml(r.name)}</strong></td>
          <td><span class="age-badge age-u10">${classeText}</span></td>
          <td>${escapeHtml(r.game)}</td>
          <td><strong style="color:#db2777;">${Number(r.score)} pt</strong></td>
          <td>${escapeHtml(r.detail || '')}</td>
          <td>
            <button type="button" class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.85rem; border-color:#ef4444; color:#dc2626;" onclick="deleteLeaderboardEntry('${safeId}')" title="Elimina voce">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Errore nel caricamento della classifica.</td></tr>';
  }
}

async function deleteLeaderboardEntry(id) {
  const pwd = prompt('🔐 Inserisci la password per eliminare questo elemento dalla classifica:');
  if (pwd === null) return;

  try {
    const res = await fetch(`/api/leaderboard/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'X-Admin-Password': pwd.trim() }
    });
    const data = await res.json();
    if (!res.ok) {
      playSound('error');
      alert(data.error || 'Impossibile eliminare l\'elemento.');
      return;
    }
    playSound('success');
    loadLeaderboard(AppState.leaderboardFilter);
  } catch (e) {
    alert('Errore di connessione con il server.');
  }
}

async function saveCategoryScore(category) {
  const classe = (AppState.playerClass || '').trim();
  if (!classe) {
    playSound('error');
    alert('🏫 Inserisci prima la tua CLASSE (es. 3B, 4A, 5A INF) nella casella accanto al nome!');
    return;
  }

  let game = '';
  let score = 0;
  let detail = '';

  if (category === 'u10') {
    const baseScore = typeof window.getU10TotalScore === 'function' ? window.getU10TotalScore() : 0;
    const qdScore = typeof QuickDrawState !== 'undefined' ? QuickDrawState.u10.score : 0;
    score = baseScore + qdScore;
    game = 'Giochi Bambini (<10 anni)';
    detail = `Punteggio Totale (${score} pt)`;
  } else if (category === 'u16') {
    const baseScore = typeof window.getU16TotalScore === 'function' ? window.getU16TotalScore() : 0;
    const qdScore = typeof QuickDrawState !== 'undefined' ? QuickDrawState.u16.score : 0;
    score = baseScore + qdScore;
    game = 'Giochi Ragazzi (10-16 anni)';
    detail = `Sfide Ottiche (${score} pt)`;
  } else if (category === 'escape') {
    if (typeof EscapeState !== 'undefined' && EscapeState.escaped) {
      const timeUsed = 900 - EscapeState.secondsLeft;
      const mm = String(Math.floor(timeUsed / 60)).padStart(2, '0');
      const ss = String(timeUsed % 60).padStart(2, '0');
      score = Math.max(200, 1000 - timeUsed);
      game = 'Escape Room (6 Stanze)';
      detail = `Usciti in ${mm}:${ss}!`;
    } else {
      const solved = typeof EscapeState !== 'undefined'
        ? Object.values(EscapeState.solvedRooms).filter(Boolean).length
        : 0;
      if (solved === 0) {
        playSound('error');
        alert('🔐 Risolvi almeno una stanza dell\'Escape Room prima di salvare!');
        return;
      }
      score = solved * 100;
      game = 'Escape Room (Parziale)';
      detail = `${solved}/6 stanze risolte`;
    }
  }

  if (score <= 0) {
    playSound('error');
    alert('🎮 Gioca prima almeno una sfida per ottenere dei punti da salvare!');
    return;
  }

  try {
    const res = await fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: AppState.playerName,
        classe,
        category,
        game,
        score,
        detail
      })
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || 'Errore nel salvataggio.');
      return;
    }
    playSound('unlock');
    if (typeof launchConfetti === 'function') launchConfetti();
    alert(`🏆 Punteggio salvato in classifica!\n\nNome: ${AppState.playerName}\nClasse: ${classe}\nPunti: ${score} pt`);
    loadLeaderboard(AppState.leaderboardFilter);
  } catch (e) {
    alert('Errore di connessione con il server.');
  }
}

window.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.main-nav .nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  initPlayerProfile();
  initHeroCanvas();
  initAnatomyExplorer();
  loadScienceFacts();
  loadLeaderboard('all');
});
