// ============================================================================
// ESCAPE-ROOM.JS - Escape Room Scientifica Avanzata (Durata 10-15+ Minuti)
// 6 Stanze Multi-Step + Enigma Finale dell'Ordine Spettrale (380nm -> 700nm)
// ============================================================================

const EscapeState = {
  secondsLeft: 900, // 15 minuti
  timerId: null,
  started: false,
  escaped: false,

  // Cifre scoperte nelle singole stanze (Stanza 1..6):
  // Stanza 1 (BLU 470nm)       -> 4
  // Stanza 2 (ROSSO 680nm)     -> 9
  // Stanza 3 (VERDE 530nm)     -> 2
  // Stanza 4 (VIOLETTO 400nm)  -> 7
  // Stanza 5 (ARANCIONE 610nm) -> 5
  // Stanza 6 (GIALLO 580nm)    -> 3
  roomDigits: {
    1: { digit: '4', colorName: '🔵 BLU (470 nm)' },
    2: { digit: '9', colorName: '🔴 ROSSO (680 nm)' },
    3: { digit: '2', colorName: '🟢 VERDE (530 nm)' },
    4: { digit: '7', colorName: '🟣 VIOLETTO (400 nm)' },
    5: { digit: '5', colorName: '🟠 ARANCIONE (610 nm)' },
    6: { digit: '3', colorName: '🟡 GIALLO (580 nm)' }
  },
  // Codice Finale ordinato per lunghezza d'onda crescente:
  // Violetto(400nm)=7 -> Blu(470nm)=4 -> Verde(530nm)=2 -> Giallo(580nm)=3 -> Arancione(610nm)=5 -> Rosso(680nm)=9
  finalSpectralCode: ['7', '4', '2', '3', '5', '9'],

  solvedRooms: { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false },
  inventory: [],

  // Stanza 1: Labirinto Laser 7x5 con 10 specchi, 3 gemme (R,G,B), 3 trappole ('TRAP') e 4 Porte d'uscita (2, 4, 6, 8)
  mirrorGrid: [],
  laserValidExitPort: null,

  // Stanza 2: 4 Filtri Cromatici (r, g, b, uv) con falsi indizi e veri indizi
  activeFilter: 'r',
  lensMouse: { x: 140, y: 95 },

  // Stanza 3: 4 Tavole di Ishihara a doppia cifra (16, 28, 43, 55)
  activePlate: 0,
  plateNumbers: ['16', '28', '43', '55'],
  plateDots: [[], [], [], []],

  // Stanza 4: Camera Oscura Accoppiata (Lights-Out 3x3: cliccare una cella inverte quella e le 4 adiacenti!)
  coupledGrid: [true, true, true, true, true, true, true, true, true],
  cameraGridAligned: false,

  // Stanza 5: Microscopio a 3 Strati (α, β, γ) senza valori suggeriti
  activeMicroLayer: 0, // 0=Strato Alfa, 1=Strato Beta, 2=Strato Gamma
  microTargets: [
    { zoom: 150, focus: 70, angle: 40, text: 'X = 18', label: 'Strato α' },
    { zoom: 300, focus: 25, angle: 90, text: 'Y = 11', label: 'Strato β' },
    { zoom: 225, focus: 50, angle: 15, text: 'Z = 2',  label: 'Strato γ' }
  ],

  // Stanza 6: Sequenziatore Sinaptico a 6 Nodi e 4 Round (4, 5, 6, 7 impulsi)
  simonLevel: 1, // 1..4
  simonSeq: [],
  simonUserIdx: 0,
  simonPlaying: false,
  litPad: -1
};

function startEscapeTimerIfNeeded() {
  if (EscapeState.started || EscapeState.escaped) return;
  EscapeState.started = true;
  EscapeState.timerId = setInterval(() => {
    if (EscapeState.secondsLeft > 0 && !EscapeState.escaped) {
      EscapeState.secondsLeft -= 1;
      updateEscapeTimerUI();
    } else if (EscapeState.secondsLeft === 0 && !EscapeState.escaped) {
      clearInterval(EscapeState.timerId);
      document.getElementById('escapeGlobalMessage').innerHTML =
        '⏰ <strong>I 15 minuti sono scaduti!</strong> Non arrenderti: continua a risolvere le stanze per aprire il laboratorio!';
    }
  }, 1000);
}

function updateEscapeTimerUI() {
  const m = String(Math.floor(EscapeState.secondsLeft / 60)).padStart(2, '0');
  const s = String(EscapeState.secondsLeft % 60).padStart(2, '0');
  const el = document.getElementById('escapeTimerDisplay');
  if (el) el.textContent = `${m}:${s}`;
}

function addInventoryItem(itemText) {
  if (!EscapeState.inventory.includes(itemText)) {
    EscapeState.inventory.push(itemText);
    const invEl = document.getElementById('escapeInventoryList');
    if (invEl) {
      invEl.innerHTML = EscapeState.inventory.map(it => `<span class="age-badge age-u10" style="margin:2px;">${it}</span>`).join(' ');
    }
  }
}

function markRoomSolved(roomNum, rewardTool) {
  EscapeState.solvedRooms[roomNum] = true;
  const info = EscapeState.roomDigits[roomNum];
  playSound('unlock');
  if (typeof launchConfetti === 'function') launchConfetti();
  if (typeof unlockSticker === 'function') {
    unlockSticker('badge-escape', '🔐 <strong>Super Detective!</strong> Stai risolvendo la Grande Escape Room!');
  }

  if (rewardTool) addInventoryItem(`${rewardTool} [${info.colorName}: ${info.digit}]`);

  const card = document.getElementById(`roomCard${roomNum}`);
  const status = document.getElementById(`roomStatus${roomNum}`);
  const slot = document.getElementById(`slotDigit${roomNum}`);

  if (card) card.classList.add('solved');
  if (status) status.textContent = `✅ ${info.colorName} = ${info.digit}`;
  if (slot) {
    slot.textContent = `${info.digit}`;
    slot.title = info.colorName;
    slot.classList.add('unlocked');
  }

  const solvedCount = Object.values(EscapeState.solvedRooms).filter(Boolean).length;
  if (solvedCount === 6) {
    document.getElementById('escapeGlobalMessage').innerHTML =
      `🎉 <strong>TUTTE E 6 LE STANZE RISOLTE!</strong> Ora risolvi l'<strong>Enigma Finale dell'Ordine Spettrale</strong> sulla Porta Blindata in fondo (ordina le 6 cifre da 380 nm Violetto a 700 nm Rosso)!`;
  } else {
    document.getElementById('escapeGlobalMessage').innerHTML =
      `🔓 <strong>Stanza ${roomNum} Completata!</strong> Hai scoperto il frammento <strong>${info.colorName} = ${info.digit}</strong> (${solvedCount}/6 stanze risolte).`;
  }
}

// ============================================================================
// STANZA 1: LABIRINTO LASER 7x5 CON 10 SPECCHI, TRAPPOLE E 4 PORTE D'USCITA
// ============================================================================
// Percorso vincente studiato su griglia 7 colonne x 5 righe:
// Start: (0,0) dir=RIGHT(1)
// (0,1)='R' -> (0,2)=Specchio '\'(2) -> scende a (2,2)=Specchio '\'(2) -> va a destra a (2,3)='G' -> (2,4)=Specchio '/'(1) ->
// sale a (1,4)=Specchio '\'(2) -> va a destra a (1,5)=Specchio '\'(2) -> scende a (4,5)=Specchio '/'(1) ->
// va a sinistra a (4,3)='B' -> (4,1)=Specchio '/'(1) -> no, facciamolo uscire sulla parete destra (colonna 6)!
// Ricostruiamo il percorso verso la parete destra (colonna 6):
// Start (0,0) RIGHT -> (0,1)='R' -> (0,2)=Specchio '\'(2) -> DOWN
// -> (1,2) -> (2,2)=Specchio '/'(1) -> LEFT
// -> (2,1)='G' -> (2,0)=Specchio '/'(1) -> DOWN
// -> (3,0) -> (4,0)=Specchio '\'(2) -> RIGHT
// -> (4,1) -> (4,2) -> (4,3)=Specchio '/'(1) -> UP
// -> (3,3)='B' -> (2,3) -> (1,3)=Specchio '/'(1) -> RIGHT
// -> (1,4) -> (1,5)=Specchio '\'(2) -> DOWN
// -> (2,5)=Specchio '\'(2) -> RIGHT -> (2,6) = PORTA '4'!
function initLaserRoom() {
  // 1 = Specchio '/', 2 = Specchio '\', 'TRAP' = Trappola teschio, 'P2','P4','P6','P8' = Porte d'uscita
  // Mescoliamo gli orientamenti iniziali degli specchi così il giocatore deve ragionare su tutta la catena!
  EscapeState.mirrorGrid = [
    [0,   'R', 1,      'TRAP', 2,      0,   'P2'],
    [0,   2,   0,      2,      0,      1,   'P6'],
    [2,   'G', 2,      0,      'TRAP', 1,   'P4'],
    [0,   0,   'TRAP', 'B',    1,      0,   'P8'],
    [1,   0,   0,      2,      0,      2,   9]
  ];
  EscapeState.laserValidExitPort = null;

  const canvas = document.getElementById('escapeLaserCanvas');
  if (!canvas) return;
  if (canvas.dataset.bound !== 'true') {
    canvas.dataset.bound = 'true';
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      const cols = 7, rows = 5;
      const cw = canvas.width / cols;
      const ch = canvas.height / rows;
      const c = Math.floor(mx / cw);
      const r = Math.floor(my / ch);
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        const val = EscapeState.mirrorGrid[r][c];
        if (val === 1 || val === 2) {
          EscapeState.mirrorGrid[r][c] = val === 1 ? 2 : 1;
          playSound('success');
          drawLaserRoom();
        }
      }
    });
  }
  drawLaserRoom();
}

function traceLaserBeam() {
  let r = 0, c = 0, dir = 1; // 0=UP, 1=RIGHT, 2=DOWN, 3=LEFT
  const path = [{ r: 0, c: -0.5 }, { r: 0, c: 0 }];
  const crystalsHit = { R: false, G: false, B: false };
  let hitTrap = false;
  let exitPort = null;

  for (let step = 0; step < 45; step++) {
    if (r < 0 || r >= 5 || c < 0 || c >= 7) break;
    const cell = EscapeState.mirrorGrid[r][c];
    if (cell === 9) break;
    if (cell === 'TRAP') {
      hitTrap = true;
      break;
    }
    if (cell === 'R') crystalsHit.R = true;
    if (cell === 'G') crystalsHit.G = true;
    if (cell === 'B') crystalsHit.B = true;
    if (typeof cell === 'string' && cell.startsWith('P')) {
      exitPort = cell.slice(1); // '2', '4', '6', '8'
      break;
    }

    if (cell === 1) { // '/'
      if (dir === 1) dir = 0;
      else if (dir === 0) dir = 1;
      else if (dir === 2) dir = 3;
      else if (dir === 3) dir = 2;
    } else if (cell === 2) { // '\'
      if (dir === 1) dir = 2;
      else if (dir === 2) dir = 1;
      else if (dir === 3) dir = 0;
      else if (dir === 0) dir = 3;
    }

    if (dir === 0) r -= 1;
    else if (dir === 1) c += 1;
    else if (dir === 2) r += 1;
    else if (dir === 3) c -= 1;

    path.push({ r, c });
  }

  return { path, crystalsHit, hitTrap, exitPort };
}

function drawLaserRoom() {
  const canvas = document.getElementById('escapeLaserCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cols = 7, rows = 5;
  const cw = canvas.width / cols;
  const ch = canvas.height / rows;

  const trace = traceLaserBeam();
  const allCrystals = trace.crystalsHit.R && trace.crystalsHit.G && trace.crystalsHit.B;
  const validWin = allCrystals && !trace.hitTrap && trace.exitPort === '4';
  EscapeState.laserValidExitPort = validWin ? '4' : null;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw;
      const y = r * ch;
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, cw, ch);

      const val = EscapeState.mirrorGrid[r][c];
      const cx = x + cw / 2;
      const cy = y + ch / 2;

      if (val === 'TRAP') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(x + 3, y + 3, cw - 6, ch - 6);
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💀', cx, cy + 6);
      } else if (val === 'R' || val === 'G' || val === 'B') {
        const hit = trace.crystalsHit[val];
        const colMap = { R: '#ef4444', G: '#22c55e', B: '#3b82f6' };
        ctx.beginPath();
        ctx.arc(cx, cy, 13, 0, Math.PI * 2);
        ctx.fillStyle = hit ? colMap[val] : 'rgba(255,255,255,0.1)';
        ctx.fill();
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = colMap[val];
        ctx.stroke();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(val, cx, cy + 4);
      } else if (typeof val === 'string' && val.startsWith('P')) {
        const portNum = val.slice(1);
        const isHitPort = trace.exitPort === portNum;
        ctx.fillStyle = isHitPort ? (allCrystals ? '#22c55e' : '#f59e0b') : '#1e293b';
        ctx.fillRect(x + 4, y + 6, cw - 8, ch - 12);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(x + 4, y + 6, cw - 8, ch - 12);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`USCITA ${portNum}`, cx, cy + 4);
      } else if (val === 1 || val === 2) {
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
        ctx.fill();

        ctx.save();
        ctx.translate(cx, cy);
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        if (val === 1) {
          ctx.moveTo(-12, 12);
          ctx.lineTo(12, -12);
        } else {
          ctx.moveTo(-12, -12);
          ctx.lineTo(12, 12);
        }
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  if (trace.path.length > 1) {
    ctx.save();
    ctx.strokeStyle = trace.hitTrap ? '#ef4444' : (validWin ? '#4ade80' : '#ff0055');
    ctx.lineWidth = 3.5;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    trace.path.forEach((pt, idx) => {
      const px = (pt.c + 0.5) * cw;
      const py = (pt.r + 0.5) * ch;
      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();
    ctx.restore();
  }
}

function checkRoom1() {
  const userPort = String(document.getElementById('room1PortInput').value).trim();
  if (EscapeState.laserValidExitPort === '4' && userPort === '4') {
    markRoomSolved(1, '🔦 Spettroscopio a 4 Filtri');
  } else if (EscapeState.laserValidExitPort !== '4') {
    playSound('error');
    document.getElementById('escapeGlobalMessage').innerHTML =
      '⚠️ <strong>Stanza 1:</strong> Il raggio laser NON sta ancora attraversando tutte e 3 le gemme (R, G, B) senza toccare i teschi 💀! Ruota gli specchi finché il raggio diventa VERDE!';
  } else {
    playSound('error');
    document.getElementById('escapeGlobalMessage').innerHTML =
      '⚠️ <strong>Stanza 1:</strong> Guarda su quale numero di USCITA (a destra) termina il raggio laser verde e scrivilo nella casella!';
  }
}

// ============================================================================
// STANZA 2: MURO CRIPTATO A 4 FILTRI (R, G, B, UV) CON TRAPPOLE E FORMULA UV
// ============================================================================
// Sotto Filtro Rosso ('r'): ci sono 2 scritte: una dice "FALSO: ▲ = 2" e in basso a sinistra "VERO: ▲ = 7"
// Sotto Filtro Verde ('g'): una dice "FALSO: ● = 9" e in alto a centro-destra "VERO: ● = 4"
// Sotto Filtro Blu ('b'): una dice "FALSO: ■ = 1" e in basso a destra "VERO: ■ = 5"
// Sotto Filtro UV ('uv'): al centro appare la formula: "CODICE = (▲ × ●) - (■ × 4) + 1"
// Calcolo: (7 * 4) - (5 * 4) + 1 = 28 - 20 + 1 = 9!
function setRoom2Filter(color) {
  EscapeState.activeFilter = color;
  ['r', 'g', 'b', 'uv'].forEach(c => {
    const btn = document.getElementById(`filterBtn-${c}`);
    if (btn) btn.classList.toggle('active', c === color);
  });
  drawFilterRoom();
}

function initFilterRoomCanvas() {
  const canvas = document.getElementById('escapeFilterCanvas');
  if (!canvas) return;

  const updatePos = (clientX, clientY) => {
    const rect = canvas.getBoundingClientRect();
    EscapeState.lensMouse.x = (clientX - rect.left) * (canvas.width / rect.width);
    EscapeState.lensMouse.y = (clientY - rect.top) * (canvas.height / rect.height);
    drawFilterRoom();
  };

  canvas.addEventListener('mousemove', e => updatePos(e.clientX, e.clientY));
  canvas.addEventListener('touchmove', e => {
    if (e.touches[0]) {
      e.preventDefault();
      updatePos(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: false });

  drawFilterRoom();
}

function drawFilterRoom() {
  const canvas = document.getElementById('escapeFilterCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#090d1e';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const noiseColors = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'];
  for (let i = 0; i < 210; i++) {
    const x = (i * 61) % canvas.width;
    const y = (i * 37) % canvas.height;
    ctx.fillStyle = noiseColors[i % noiseColors.length];
    ctx.font = 'bold 14px monospace';
    ctx.fillText('▲●■?', x, y);
  }

  // Lente di precisione r = 42px
  const { x, y } = EscapeState.lensMouse;
  const f = EscapeState.activeFilter;
  const lensBg = { r: '#3b0707', g: '#042f16', b: '#0f1d42', uv: '#2e1065' }[f];
  const lensBorder = { r: '#ef4444', g: '#22c55e', b: '#3b82f6', uv: '#c084fc' }[f];

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, 44, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = lensBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.textAlign = 'center';

  if (f === 'r') {
    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('TRAPPOLA:', 410, 45);
    ctx.fillText('▲ = 2', 410, 62);

    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('[VERO]', 85, 130);
    ctx.font = 'bold 24px monospace';
    ctx.fillText('▲ = 7', 85, 154);
  } else if (f === 'g') {
    ctx.fillStyle = '#86efac';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('TRAPPOLA:', 90, 50);
    ctx.fillText('● = 9', 90, 68);

    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('[VERO]', 340, 42);
    ctx.font = 'bold 24px monospace';
    ctx.fillText('● = 4', 340, 66);
  } else if (f === 'b') {
    ctx.fillStyle = '#93c5fd';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('TRAPPOLA:', 180, 140);
    ctx.fillText('■ = 1', 180, 158);

    ctx.fillStyle = '#f472b6';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('[VERO]', 425, 128);
    ctx.font = 'bold 24px monospace';
    ctx.fillText('■ = 5', 425, 152);
  } else if (f === 'uv') {
    ctx.fillStyle = '#e9d5ff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('FORMULA SEGRETA UV:', 255, 76);
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('(▲ × ●) − (■ × 4) + 1', 255, 102);
  }
  ctx.restore();

  ctx.beginPath();
  ctx.arc(x, y, 44, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = lensBorder;
  ctx.stroke();
}

function checkRoom2() {
  const tri = String(document.getElementById('room2TriInput').value).trim();
  const cir = String(document.getElementById('room2CirInput').value).trim();
  const sq = String(document.getElementById('room2SqInput').value).trim();
  const val = String(document.getElementById('room2Input').value).trim();

  if (tri === '7' && cir === '4' && sq === '5' && val === '9') {
    markRoomSolved(2, '🎨 Atlante Clinico Ishihara');
  } else if (tri !== '7' || cir !== '4' || sq !== '5') {
    playSound('error');
    document.getElementById('escapeGlobalMessage').innerHTML =
      '⚠️ <strong>Stanza 2:</strong> Uno o più valori delle forme (<strong>▲, ●, ■</strong>) non sono esatti! Ignora le scritte "TRAPPOLA" e inserisci i 3 valori marchiati con <strong>[VERO]</strong> sotto i filtri Rosso, Verde e Blu!';
  } else {
    playSound('error');
    document.getElementById('escapeGlobalMessage').innerHTML =
      '⚠️ <strong>Stanza 2:</strong> I 3 valori (▲, ●, ■) sono giusti! Ora leggi la formula al centro usando il <strong>Filtro UV 🟣</strong> e scrivi il risultato nell\'ultima casella!';
  }
}

// ============================================================================
// STANZA 3: 4 TAVOLE DI ISHIHARA A DOPPIA CIFRA (16, 28, 43, 55) + FORMULA
// Formula richiesta: (TavolaA + TavolaB + TavolaC - TavolaD) / 16 = (16+28+43-55)/16 = 32/16 = 2
// ============================================================================
const SMALL_DIGITS = {
  '1': ['010', '110', '010', '010', '111'],
  '2': ['111', '001', '111', '100', '111'],
  '3': ['111', '001', '111', '001', '111'],
  '4': ['101', '101', '111', '001', '001'],
  '5': ['111', '100', '111', '001', '111'],
  '6': ['111', '100', '111', '101', '111'],
  '8': ['111', '101', '111', '101', '111']
};

function initIshiharaRoom() {
  const canvas = document.getElementById('escapeIshiharaCanvas');
  if (!canvas) return;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const radius = 82;

  const off = document.createElement('canvas');
  off.width = 180;
  off.height = 180;
  const octx = off.getContext('2d');

  EscapeState.plateNumbers.forEach((numStr, pIdx) => {
    octx.clearRect(0, 0, 180, 180);
    octx.fillStyle = '#000000';
    octx.font = '900 84px sans-serif';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(numStr, 90, 92);
    const imgData = octx.getImageData(0, 0, 180, 180).data;

    const dots = [];
    for (let y = cy - radius; y <= cy + radius; y += 5.5) {
      for (let x = cx - radius; x <= cx + radius; x += 5.5) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= radius * radius) {
          const ox = Math.max(0, Math.min(179, Math.round(90 + dx)));
          const oy = Math.max(0, Math.min(179, Math.round(90 + dy)));
          const alpha = imgData[(oy * 180 + ox) * 4 + 3];
          const isDigit = alpha > 90;
          dots.push({
            x: x + (Math.random() - 0.5) * 1.4,
            y: y + (Math.random() - 0.5) * 1.4,
            r: isDigit ? (2.5 + Math.random() * 0.7) : (2.1 + Math.random() * 0.8),
            isDigit
          });
        }
      }
    }
    EscapeState.plateDots[pIdx] = dots;
  });

  drawIshiharaPlate();
}

function selectIshiharaPlate(idx) {
  EscapeState.activePlate = idx;
  [0, 1, 2, 3].forEach(i => {
    const btn = document.getElementById(`plateBtn-${i}`);
    if (btn) btn.classList.toggle('active', i === idx);
  });
  drawIshiharaPlate();
}

function drawIshiharaPlate() {
  const canvas = document.getElementById('escapeIshiharaCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const pIdx = EscapeState.activePlate;
  const dots = EscapeState.plateDots[pIdx] || [];
  const palettes = [
    { bg: ['#15803d', '#22c55e', '#4ade80'], fg: ['#ef4444', '#f97316', '#fb7185'] },
    { bg: ['#1d4ed8', '#3b82f6', '#60a5fa'], fg: ['#eab308', '#facc15', '#fb923c'] },
    { bg: ['#6d28d9', '#8b5cf6', '#a78bfa'], fg: ['#10b981', '#34d399', '#6ee7b7'] },
    { bg: ['#334155', '#475569', '#64748b'], fg: ['#ec4899', '#f43f5e', '#fb7185'] }
  ][pIdx];

  dots.forEach((d, i) => {
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    const list = d.isDigit ? palettes.fg : palettes.bg;
    ctx.fillStyle = list[i % list.length];
    ctx.fill();
  });

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(`Tavola ${['A', 'B', 'C', 'D'][pIdx]} (Numero a 2 cifre)`, 14, 24);
}

function checkRoom3() {
  const a = Number(document.getElementById('ishiharaA').value);
  const b = Number(document.getElementById('ishiharaB').value);
  const c = Number(document.getElementById('ishiharaC').value);
  const d = Number(document.getElementById('ishiharaD').value);
  const res = Number(document.getElementById('ishiharaFormulaInput').value);

  if (a === 16 && b === 28 && c === 43 && d === 55 && res === 2) {
    markRoomSolved(3, '🙃 Otturatore Camera Oscura');
  } else if (a !== 16 || b !== 28 || c !== 43 || d !== 55) {
    playSound('error');
    document.getElementById('escapeGlobalMessage').innerHTML =
      '⚠️ <strong>Stanza 3:</strong> Uno o più numeri delle 4 Tavole (A, B, C, D) non sono esatti! Osserva bene i pallini colorati di tutte e 4 le tavole (sono numeri a 2 cifre)!';
  } else {
    playSound('error');
    document.getElementById('escapeGlobalMessage').innerHTML =
      '⚠️ <strong>Stanza 3:</strong> I 4 numeri delle tavole sono giusti! Ora calcola la formula: <strong>(A + B + C − D) ÷ 16</strong> e scrivi il risultato nell\'ultima casella!';
  }
}

// ============================================================================
// STANZA 4: MATRICE RETINICA ACCOPPIATA (LIGHTS-OUT 3x3) + CODICE CAPOVOLTO
// Cliccare una cella inverte quella cella E le sue adiacenti (su, giù, sinistra, destra)!
// Quando tutte e 9 sono VERDI (⬆️), appare un'equazione capovolta a testa in giù da risolvere!
// ============================================================================
function toggleCoupledMove(board, idx) {
  const r = Math.floor(idx / 3);
  const c = idx % 3;
  const neighbors = [
    [r, c],
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1]
  ];
  neighbors.forEach(([nr, nc]) => {
    if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
      const nIdx = nr * 3 + nc;
      board[nIdx] = !board[nIdx];
    }
  });
}

function initCameraObscuraRoom() {
  // Partiamo da tutto true (Verde) e applichiamo 4 mosse note (es. angoli 0, 2, 6 + centro 4)
  // così il puzzle è 100% risolvibile con logica!
  EscapeState.coupledGrid = [true, true, true, true, true, true, true, true, true];
  [0, 2, 4, 6].forEach(m => toggleCoupledMove(EscapeState.coupledGrid, m));
  EscapeState.cameraGridAligned = false;

  const canvas = document.getElementById('escapeCameraCanvas');
  if (!canvas) return;

  if (canvas.dataset.bound !== 'true') {
    canvas.dataset.bound = 'true';
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
      const my = (e.clientY - rect.top) * (canvas.height / rect.height);
      const gridX = 25;
      const gridY = 14;
      const cellS = 54;
      const col = Math.floor((mx - gridX) / cellS);
      const row = Math.floor((my - gridY) / cellS);
      if (row >= 0 && row < 3 && col >= 0 && col < 3) {
        const idx = row * 3 + col;
        toggleCoupledMove(EscapeState.coupledGrid, idx);
        playSound('success');
        drawCameraObscuraRoom();
      }
    });
  }
  drawCameraObscuraRoom();
}

function drawCameraObscuraRoom() {
  const canvas = document.getElementById('escapeCameraCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gridX = 25;
  const gridY = 14;
  const cellS = 54;
  const allAligned = EscapeState.coupledGrid.every(v => v === true);
  EscapeState.cameraGridAligned = allAligned;

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const idx = row * 3 + col;
      const isUp = EscapeState.coupledGrid[idx];
      const cx = gridX + col * cellS + cellS / 2;
      const cy = gridY + row * cellS + cellS / 2;

      ctx.save();
      ctx.translate(cx, cy);
      if (!isUp) ctx.rotate(Math.PI);

      ctx.fillStyle = isUp ? 'rgba(34, 197, 94, 0.28)' : 'rgba(234, 179, 8, 0.22)';
      ctx.fillRect(-cellS / 2 + 2, -cellS / 2 + 2, cellS - 4, cellS - 4);
      ctx.strokeStyle = isUp ? '#4ade80' : '#facc15';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-cellS / 2 + 2, -cellS / 2 + 2, cellS - 4, cellS - 4);

      ctx.fillStyle = isUp ? '#4ade80' : '#facc15';
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(-11, 9);
      ctx.lineTo(11, 9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  // Riquadro di proiezione della Camera Oscura a destra
  ctx.strokeStyle = allAligned ? '#4ade80' : '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(210, 16, 280, 158);

  if (!allAligned) {
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('🔒 OTTURATORE CHIUSO', 275, 70);
    ctx.fillText('Attenzione: ogni cella è collegata', 240, 95);
    ctx.fillText('a croce (+) con le sue vicine!', 250, 115);
    ctx.fillText('Falle diventare tutte VERDI (⬆️)!', 240, 140);
  } else {
    ctx.fillStyle = '#fde047';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('🙃 PROIEZIONE RETINICA CAPOVOLTA:', 230, 42);

    // Disegna l'equazione CAPOVOLTA (ruotata di 180° come sulla retina!)
    // L'equazione dritta è: "19 - 12 = ?" -> Risultato = 7
    ctx.save();
    ctx.translate(350, 105);
    ctx.rotate(Math.PI);
    ctx.fillStyle = '#00f2fe';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CALCOLA: 19 − 12', 0, 8);
    ctx.restore();
  }
}

function checkRoom4() {
  const val = String(document.getElementById('room4Input').value).trim();
  if (!EscapeState.cameraGridAligned) {
    playSound('error');
    document.getElementById('escapeGlobalMessage').innerHTML =
      '⚠️ <strong>Stanza 4:</strong> Prima devi allineare tutte le 9 celle retiniche facendole diventare <strong>VERDI ⬆️</strong> (ricorda che ogni clic inverte una croce + di celle)!';
    return;
  }
  if (val === '7') {
    markRoomSolved(4, '🔬 Vetrino Multi-Strato');
  } else {
    playSound('error');
    document.getElementById('escapeGlobalMessage').innerHTML =
      '⚠️ <strong>Stanza 4:</strong> Leggi il messaggio azzurro proiettato A TESTA IN GIÙ sulla retina e inserisci il risultato dell\'operazione!';
  }
}

// ============================================================================
// STANZA 5: MICROSCOPIO A 3 STRATI CELATI (CACCIA ALLA MESSA A FUOCO ALLA CIECA!)
// Nessun valore suggerito! Il giocatore usa il misuratore di nitidezza % per
// mettere a fuoco Strato α (X=18), Strato β (Y=11), Strato γ (Z=2) -> X - Y - Z = 5
// ============================================================================
function selectMicroLayer(idx) {
  EscapeState.activeMicroLayer = idx;
  [0, 1, 2].forEach(i => {
    const btn = document.getElementById(`microLayerBtn-${i}`);
    if (btn) btn.classList.toggle('active', i === idx);
  });
  updateMicroscopeRoom();
}

function updateMicroscopeRoom() {
  const z = Number(document.getElementById('microZoomSlider').value);
  const f = Number(document.getElementById('microFocusSlider').value);
  const a = Number(document.getElementById('microContrastSlider').value);

  const target = EscapeState.microTargets[EscapeState.activeMicroLayer];
  const errZ = Math.abs(z - target.zoom) / 3.5;
  const errF = Math.abs(f - target.focus);
  const errA = Math.abs(a - target.angle);

  const totalDist = errZ + errF + errA;
  const sharpness = Math.max(0, Math.min(100, Math.round(100 - totalDist * 0.85)));
  const isReadable = sharpness >= 88;

  document.getElementById('microValsDisplay').textContent =
    `${target.label} — Nitidezza Ottica: ${sharpness}%`;

  const canvas = document.getElementById('escapeMicroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Barra laterale di risonanza/nitidezza
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(20, 25, 22, 125);
  const barH = (sharpness / 100) * 125;
  ctx.fillStyle = isReadable ? '#22c55e' : (sharpness > 60 ? '#facc15' : '#ef4444');
  ctx.fillRect(20, 150 - barH, 22, barH);
  ctx.strokeStyle = '#ffffff';
  ctx.strokeRect(20, 25, 22, 125);

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx + 20, cy, 74, 0, Math.PI * 2);
  ctx.clip();

  ctx.fillStyle = '#041f1e';
  ctx.fillRect(cx - 60, cy - 80, 160, 160);

  const blurPx = isReadable ? 0 : Math.max(2.5, (100 - sharpness) * 0.16);
  const ghostOffset = isReadable ? 0 : (a - target.angle) * 0.45;
  ctx.filter = `blur(${blurPx.toFixed(1)}px)`;

  ctx.fillStyle = isReadable ? '#4ade80' : 'rgba(148, 163, 184, 0.5)';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  // Doppia immagine fantasma se il polarizzatore non è allineato!
  ctx.fillText(isReadable ? target.text : '???', cx + 20 - ghostOffset, cy + 10);
  if (!isReadable) {
    ctx.fillText('###', cx + 20 + ghostOffset, cy + 10);
  }
  ctx.filter = 'none';
  ctx.restore();

  ctx.beginPath();
  ctx.arc(cx + 20, cy, 74, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = isReadable ? '#4ade80' : '#38bdf8';
  ctx.stroke();
}

function checkRoom5() {
  const xVal = String(document.getElementById('room5XInput').value).trim();
  const yVal = String(document.getElementById('room5YInput').value).trim();
  const zVal = String(document.getElementById('room5ZInput').value).trim();
  const val = String(document.getElementById('room5Input').value).trim();

  if (xVal === '18' && yVal === '11' && zVal === '2' && val === '5') {
    markRoomSolved(5, '🧠 Sinapsi Corticale');
  } else if (xVal !== '18' || yVal !== '11' || zVal !== '2') {
    playSound('error');
    document.getElementById('escapeGlobalMessage').innerHTML =
      '⚠️ <strong>Stanza 5:</strong> Uno o più valori intermedi (<strong>X, Y, Z</strong>) non sono esatti! Metti a fuoco uno alla volta Strato α, Strato β e Strato γ oltre l\'88% di nitidezza e inserisci tutti e 3 i valori!';
  } else {
    playSound('error');
    document.getElementById('escapeGlobalMessage').innerHTML =
      '⚠️ <strong>Stanza 5:</strong> X, Y e Z sono giusti! Ora calcola <strong>X − Y − Z</strong> e inserisci il risultato nell\'ultima casella!';
  }
}

// ============================================================================
// STANZA 6: SEQUENZIATORE SINAPTICO A 6 FOTORECETTORI (4 ROUND: 4, 5, 6, 7 IMPULSI)
// ============================================================================
function startSimonSequence() {
  if (EscapeState.simonPlaying) return;
  const seqLen = 3 + EscapeState.simonLevel; // Round 1=4, Round 2=5, Round 3=6, Round 4=7
  // Se esiste già una sequenza della stessa lunghezza per questo round (es. dopo un errore),
  // riutilizza la STESSA sequenza senza cambiarla!
  if (!Array.isArray(EscapeState.simonSeq) || EscapeState.simonSeq.length !== seqLen) {
    EscapeState.simonSeq = [];
    for (let i = 0; i < seqLen; i++) {
      EscapeState.simonSeq.push(Math.floor(Math.random() * 6));
    }
  }
  EscapeState.simonUserIdx = 0;
  EscapeState.simonPlaying = true;

  document.getElementById('simonStatusText').innerHTML =
    `👀 <strong>Memorizza i ${seqLen} impulsi neurali (Round ${EscapeState.simonLevel}/4)...</strong>`;

  let step = 0;
  const interval = setInterval(() => {
    if (step >= EscapeState.simonSeq.length) {
      clearInterval(interval);
      EscapeState.litPad = -1;
      EscapeState.simonPlaying = false;
      renderSimonPads();
      document.getElementById('simonStatusText').innerHTML =
        `👆 <strong>Tocca a te!</strong> Ripeti la sequenza di ${seqLen} impulsi sui 6 recettori!`;
      return;
    }
    EscapeState.litPad = EscapeState.simonSeq[step];
    playSound('success');
    renderSimonPads();
    setTimeout(() => {
      EscapeState.litPad = -1;
      renderSimonPads();
    }, 320);
    step++;
  }, 560);
}

function pressSimonPad(padIdx) {
  if (EscapeState.simonPlaying || EscapeState.simonSeq.length === 0) return;

  EscapeState.litPad = padIdx;
  renderSimonPads();
  setTimeout(() => {
    EscapeState.litPad = -1;
    renderSimonPads();
  }, 200);

  if (padIdx === EscapeState.simonSeq[EscapeState.simonUserIdx]) {
    playSound('success');
    EscapeState.simonUserIdx += 1;
    if (EscapeState.simonUserIdx >= EscapeState.simonSeq.length) {
      if (EscapeState.simonLevel >= 4) {
        document.getElementById('simonStatusText').innerHTML =
          `🎉 <strong>CORTECCIA VISIVA SINCRONIZZATA (4/4 Round)! Frammento GIALLO (580 nm) = 3!</strong>`;
        markRoomSolved(6, '🌈 Prisma dello Spettro Finale');
      } else {
        EscapeState.simonLevel += 1;
        document.getElementById('simonStatusText').innerHTML =
          `✅ <strong>Round superato!</strong> Preparati al Round ${EscapeState.simonLevel}/4...`;
        setTimeout(() => startSimonSequence(), 850);
      }
    }
  } else {
    playSound('error');
    EscapeState.simonUserIdx = 0;
    document.getElementById('simonStatusText').innerHTML =
      `❌ <strong>Errore sinaptico!</strong> Riprovo la <strong>stessa sequenza</strong> del Round ${EscapeState.simonLevel}/4...`;
    setTimeout(() => startSimonSequence(), 950);
  }
}

function renderSimonPads() {
  for (let i = 0; i < 6; i++) {
    const btn = document.getElementById(`simonPad-${i}`);
    if (btn) {
      btn.style.transform = EscapeState.litPad === i ? 'scale(1.12)' : 'scale(1)';
      btn.style.filter = EscapeState.litPad === i ? 'brightness(1.6)' : 'brightness(0.85)';
      btn.style.boxShadow = EscapeState.litPad === i ? '0 0 24px #ffffff' : '0 4px 0 rgba(0,0,0,0.4)';
    }
  }
}

// Consigli scientifici metodologici SENZA SPOILER DEI NUMERI!
function showEscapeHint() {
  alert(
    '🦉 CONSIGLI DI METODO SCIENTIFICO (SENZA SOLUZIONI):\n\n' +
    '• Stanza 1 (Laser): Segui il raggio a ritroso dalla gemma B e G; evita i teschi 💀 e leggi il numero della Porta d\'Uscita toccata.\n' +
    '• Stanza 2 (4 Filtri): Ignora le scritte "TRAPPOLA". Annota solo i 3 valori marchiati [VERO] e poi passa al Filtro UV 🟣 per vedere l\'equazione al centro.\n' +
    '• Stanza 3 (Ishihara): Ogni tavola contiene un numero a 2 cifre. Inseriscili tutti e 4 e calcola (A + B + C − D) ÷ 16.\n' +
    '• Stanza 4 (Camera Oscura): È un puzzle logico a croce (+): prova a cliccare i 4 angoli e il centro! Quando si apre l\'otturatore, leggi l\'operazione capovolta.\n' +
    '• Stanza 5 (Microscopio): Guarda la barra verticale a sinistra sul vetrino: muovi un cursore alla volta finché la Nitidezza sale al 90-100%, per tutti e 3 gli strati (α, β, γ).\n' +
    '• Porta Finale: NON inserire le cifre in ordine di stanza (1..6), ma ordinale per colore dello spettro dal VIOLETTO (400 nm) fino al ROSSO (680 nm)!'
  );
}

function unlockFinalVault() {
  const solvedCount = Object.values(EscapeState.solvedRooms).filter(Boolean).length;
  if (solvedCount < 6) {
    playSound('error');
    alert(`🔒 Hai risolto solo ${solvedCount} stanze su 6! Devi completare tutte e 6 le stanze prima di poter aprire la Porta Blindata!`);
    return;
  }

  let entered = '';
  for (let i = 1; i <= 6; i++) {
    const el = document.getElementById(`vault${i}`);
    entered += el ? el.value.trim() : '';
  }
  const expected = EscapeState.finalSpectralCode.join('');

  if (entered === expected) {
    EscapeState.escaped = true;
    if (EscapeState.timerId) clearInterval(EscapeState.timerId);
    playSound('unlock');
    if (typeof launchConfetti === 'function') {
      launchConfetti();
      setTimeout(launchConfetti, 500);
    }

    const timeUsed = 900 - EscapeState.secondsLeft;
    const mm = String(Math.floor(timeUsed / 60)).padStart(2, '0');
    const ss = String(timeUsed % 60).padStart(2, '0');

    document.getElementById('escapeGlobalMessage').innerHTML =
      `🎉 <strong>PORTA BLINDATA SBLOCCATA!</strong> Avete decodificato tutte le 6 stanze e ordinato lo spettro visibile in <strong>${mm}:${ss}</strong>!`;
    alert(`🎉 TRIONFO SCIENTIFICO! SIETE USCITI DAL LABORATORIO OTTICO!\n\nOrdine Spettrale (Violetto -> Rosso): 7 - 4 - 2 - 3 - 5 - 9\nTempo impiegato: ${mm}:${ss}!`);
  } else {
    playSound('error');
    alert(
      '❌ Combinazione Spettrale errata!\n\n' +
      'Ricorda: NON inserire le cifre in ordine da Stanza 1 a Stanza 6!\n' +
      'Devi ordinarle secondo lo SPETTRO DELLA LUCE dalla lunghezza d\'onda più corta (400 nm) alla più lunga (680 nm):\n' +
      '1° 🟣 VIOLETTO (400 nm)\n' +
      '2° 🔵 BLU (470 nm)\n' +
      '3° 🟢 VERDE (530 nm)\n' +
      '4° 🟡 GIALLO (580 nm)\n' +
      '5° 🟠 ARANCIONE (610 nm)\n' +
      '6° 🔴 ROSSO (680 nm)'
    );
  }
}

function resetEscapeRoom() {
  if (EscapeState.timerId) clearInterval(EscapeState.timerId);
  EscapeState.secondsLeft = 900;
  EscapeState.started = false;
  EscapeState.escaped = false;
  EscapeState.solvedRooms = { 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
  EscapeState.inventory = [];
  EscapeState.simonLevel = 1;
  EscapeState.simonSeq = [];

  const invEl = document.getElementById('escapeInventoryList');
  if (invEl) invEl.innerHTML = '<span style="color:var(--card-muted);">Nessuno strumento ancora raccolto...</span>';

  for (let i = 1; i <= 6; i++) {
    const card = document.getElementById(`roomCard${i}`);
    if (card) card.classList.remove('solved');
    const st = document.getElementById(`roomStatus${i}`);
    if (st) st.textContent = '🔒 Bloccata';
    const slot = document.getElementById(`slotDigit${i}`);
    if (slot) {
      slot.textContent = '?';
      slot.classList.remove('unlocked');
    }
    const v = document.getElementById(`vault${i}`);
    if (v) v.value = '';
  }

  updateEscapeTimerUI();
  initLaserRoom();
  drawFilterRoom();
  initIshiharaRoom();
  initCameraObscuraRoom();
  updateMicroscopeRoom();
  startEscapeTimerIfNeeded();
}

window.addEventListener('DOMContentLoaded', () => {
  initLaserRoom();
  initFilterRoomCanvas();
  initIshiharaRoom();
  initCameraObscuraRoom();
  updateMicroscopeRoom();
});
