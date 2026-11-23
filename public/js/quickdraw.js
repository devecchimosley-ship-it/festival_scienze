// ============================================================================
// QUICKDRAW.JS - "Quick, Draw!" con Riconoscitore Geometrico & Template 16x16 Reale
// Rifiuta linee a caso e scarabocchi! Analizza forma, topologia, loop chiusi,
// simmetria, distribuzione spaziale 16x16 e angoli dei tratti.
// ============================================================================

// Template 16x16 (8x8 espansi) e regole strutturali RIGOROSE per ogni disegno
const QUICKDRAW_PROMPTS = {
  u10: [
    {
      id: 'sole',
      label: 'UN SOLE ☀️',
      hint: 'Disegna un CERCHIO chiuso al centro e almeno 4 RAGGI staccati tutto intorno!',
      wrongGuesses: ['un cerchio vuoto', 'un ragno', 'una ruota', 'un fiore'],
      // Regola rigorosa per il Sole:
      // - Deve avere almeno 5 tratti distinti (1 cerchio centrale + almeno 4 raggi attorno)
      // - Proporzione quasi quadrata (0.68 .. 1.45)
      // - Presenza di inchiostro sia al centro sia nei 4 bordi esterni (raggi)
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.strokeCount >= 5 && f.strokeCount <= 16) score += 35;
        else if (f.strokeCount >= 3) score += 15;
        if (f.aspect >= 0.68 && f.aspect <= 1.45) score += 20;
        if (f.hasClosedLoop) score += 20;
        if (f.outerRingDensity >= 0.12 && f.centerDensity >= 0.14) score += 25;
        return score;
      }
    },
    {
      id: 'casa',
      label: 'UNA CASA 🏠',
      hint: 'Disegna un quadrato/rettangolo sotto e un tetto a punta (triangolo) sopra!',
      wrongGuesses: ['una scatola', 'una busta', 'un cappello', 'una torre'],
      // Regola rigorosa per la Casa:
      // - Parte alta più stretta a punta (tetto triangolare: topNarrow < midWide)
      // - Parte bassa quadrata con lati verticali (bottomLeft e bottomRight attivi)
      // - Almeno 2 angoli netti (corners >= 3)
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.aspect >= 0.65 && f.aspect <= 1.45) score += 20;
        if (f.topWidthRatio < 0.72 && f.bottomWidthRatio > 0.75) score += 35;
        if (f.corners >= 3) score += 25;
        if (f.bottomHalfDensity >= 0.35 && f.topHalfDensity >= 0.2) score += 20;
        return score;
      }
    },
    {
      id: 'occhio',
      label: 'UN OCCHIO 👁️',
      hint: 'Disegna una forma larga a mandorla/ovale con un cerchietto (pupilla) dentro al centro!',
      wrongGuesses: ['una bocca', 'un limone', 'un pesce', 'un uovo'],
      // Regola rigorosa per l'Occhio:
      // - Più largo che alto (aspect >= 1.32)
      // - Almeno 2 tratti (contorno esterno + iride/pupilla interna)
      // - Alta concentrazione al centro (pupilla) e simmetria sinistra-destra
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.aspect >= 1.32 && f.aspect <= 2.9) score += 35;
        if (f.strokeCount >= 2 && f.strokeCount <= 10) score += 20;
        if (f.centerDensity >= 0.24) score += 25;
        if (f.leftRightSymmetry >= 0.68) score += 20;
        return score;
      }
    },
    {
      id: 'stella',
      label: 'UNA STELLA ⭐',
      hint: 'Disegna una stella con le punte aguzze (almeno 4 o 5 cambi di direzione netti)!',
      wrongGuesses: ['un triangolo', 'un aquilone', 'un fiocco', 'una freccia'],
      // Regola rigorosa per la Stella:
      // - Molti vertici/angoli acuti (corners >= 5)
      // - Proporzione equilibrata (0.7 .. 1.4)
      // - Raggi che toccano tutti e 4 i quadranti
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.corners >= 5 && f.corners <= 22) score += 40;
        else if (f.corners >= 4) score += 20;
        if (f.aspect >= 0.68 && f.aspect <= 1.45) score += 25;
        if (f.quadrantsActive === 4) score += 20;
        if (f.leftRightSymmetry >= 0.6) score += 15;
        return score;
      }
    },
    {
      id: 'albero',
      label: 'UN ALBERO 🌳',
      hint: 'Disegna il tronco stretto in basso e una grande chioma rotonda in alto!',
      wrongGuesses: ['un fungo', 'un semaforo', 'un fiore', 'un gelato'],
      // Regola rigorosa per l'Albero:
      // - Più alto che largo (aspect <= 1.15)
      // - Parte superiore (chioma) molto più larga e densa della parte inferiore (tronco stretto al centro)
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.aspect >= 0.42 && f.aspect <= 1.15) score += 30;
        if (f.topHalfDensity > f.bottomHalfDensity * 1.15) score += 30;
        if (f.topWidthRatio > f.bottomWidthRatio * 1.2) score += 25;
        if (f.strokeCount >= 2) score += 15;
        return score;
      }
    },
    {
      id: 'pesce',
      label: 'UN PESCE 🐟',
      hint: 'Disegna il corpo ovale orizzontale e la coda a triangolo su un lato!',
      wrongGuesses: ['un sottomarino', 'una barca', 'una foglia', 'una scarpa'],
      // Regola rigorosa per il Pesce:
      // - Nettamente orizzontale (aspect >= 1.38)
      // - Loop chiuso o corpo pieno + angoli per la coda
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.aspect >= 1.38 && f.aspect <= 3.2) score += 40;
        if (f.hasClosedLoop || f.corners >= 2) score += 25;
        if (f.quadrantsActive >= 3) score += 20;
        if (f.strokeCount >= 1 && f.strokeCount <= 8) score += 15;
        return score;
      }
    }
  ],
  u16: [
    {
      id: 'occhiali',
      label: 'UN PAIO DI OCCHIALI 👓',
      hint: 'Disegna due lenti distinte a sinistra e a destra unite da una stanghetta al centro!',
      wrongGuesses: ['un manubrio', 'una bicicletta', 'un binocolo', 'due cerchi'],
      // Regola rigorosa per gli Occhiali:
      // - Molto larghi (aspect >= 1.55)
      // - Alta densità a sinistra e a destra (le 2 lenti) con ponte centrale più sottile
      // - Elevata simmetria sinistra-destra
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.aspect >= 1.55 && f.aspect <= 3.8) score += 40;
        if (f.leftRightSymmetry >= 0.68) score += 25;
        if (f.leftThirdDensity > 0.25 && f.rightThirdDensity > 0.25 && f.midThirdDensity < 0.35) score += 35;
        return score;
      }
    },
    {
      id: 'prisma',
      label: 'UN PRISMA TRIANGOLARE 🔺',
      hint: 'Disegna un grande triangolo con la punta in alto e la base orizzontale in basso!',
      wrongGuesses: ['una piramide', 'una montagna', 'una tenda', 'un cono'],
      // Regola rigorosa per il Prisma:
      // - Punta stretta in alto (topWidthRatio < 0.55) e base larga in basso (bottomWidthRatio > 0.78)
      // - Tra 2 e 8 angoli netti, centro relativamente vuoto
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.topWidthRatio < 0.58 && f.bottomWidthRatio > 0.75) score += 45;
        if (f.corners >= 2 && f.corners <= 12) score += 25;
        if (f.aspect >= 0.65 && f.aspect <= 1.55) score += 15;
        if (f.centerDensity < 0.35) score += 15;
        return score;
      }
    },
    {
      id: 'lampadina',
      label: 'UNA LAMPADINA 💡',
      hint: 'Disegna il bulbo rotondo largo in alto e l\'attacco a vite stretto in basso!',
      wrongGuesses: ['una mongolfiera', 'un microfono', 'una pera', 'un gelato'],
      // Regola rigorosa per la Lampadina:
      // - Verticale (aspect <= 1.05)
      // - Parte superiore rotonda e più larga della base inferiore
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.aspect >= 0.45 && f.aspect <= 1.05) score += 35;
        if (f.topWidthRatio > f.bottomWidthRatio * 1.15) score += 30;
        if (f.hasClosedLoop) score += 20;
        if (f.strokeCount >= 2) score += 15;
        return score;
      }
    },
    {
      id: 'lente',
      label: 'UNA LENTE D\'INGRANDIMENTO 🔍',
      hint: 'Disegna un cerchio in alto a sinistra e un manico obliquo che scende in basso a destra!',
      wrongGuesses: ['una racchetta', 'una padella', 'un lecca-lecca', 'un cucchiaio'],
      // Regola rigorosa per la Lente d'ingrandimento:
      // - Forte asimmetria diagonale (cerchio in un quadrante + manico nell'opposto)
      // - Loop chiuso (la lente) + tratto rettilineo (il manico)
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.diagonalBalance >= 0.22) score += 35;
        if (f.hasClosedLoop) score += 30;
        if (f.aspect >= 0.65 && f.aspect <= 1.45) score += 20;
        if (f.strokeCount >= 2 && f.strokeCount <= 6) score += 15;
        return score;
      }
    },
    {
      id: 'fotocamera',
      label: 'UNA FOTOCAMERA 📷',
      hint: 'Disegna un rettangolo orizzontale con un grande cerchio (obiettivo) proprio al centro!',
      wrongGuesses: ['una radio', 'una televisione', 'una valigia', 'un forno'],
      // Regola rigorosa per la Fotocamera:
      // - Orizzontale (aspect >= 1.18 && aspect <= 2.2)
      // - Almeno 2 tratti (corpo rettangolare + lente circolare al centro)
      // - Sia bordi esterni rettangolari sia alta densità nel cerchio centrale
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.aspect >= 1.18 && f.aspect <= 2.2) score += 30;
        if (f.strokeCount >= 2 && f.strokeCount <= 8) score += 20;
        if (f.centerDensity >= 0.22 && f.outerRingDensity >= 0.2) score += 30;
        if (f.corners >= 3) score += 20;
        return score;
      }
    },
    {
      id: 'fulmine',
      label: 'UN FULMINE DI LUCE ⚡',
      hint: 'Disegna una saetta a zig-zag inclinata dall\'alto verso il basso con angoli acuti!',
      wrongGuesses: ['una scala', 'un serpente', 'una freccia', 'una montagna'],
      // Regola rigorosa per il Fulmine:
      // - Più alto che largo (aspect <= 1.05)
      // - Almeno 2 cambi di direzione a zig-zag (corners >= 2)
      // - NON ha cerchi grandi chiusi rotondi (non è un albero o una lampadina)
      evaluate: (f) => {
        if (f.isScribble) return 0;
        let score = 0;
        if (f.aspect >= 0.3 && f.aspect <= 1.08) score += 35;
        if (f.corners >= 2 && f.corners <= 12) score += 35;
        if (f.strokeCount <= 3) score += 15;
        if (f.diagonalBalance >= 0.12) score += 15;
        return score;
      }
    }
  ]
};

const QuickDrawState = {
  u10: {
    round: 0,
    score: 0,
    timeLeft: 25,
    timerId: null,
    isDrawing: false,
    strokes: [],
    currentStroke: [],
    guessed: false,
    penColor: '#1e1b4b'
  },
  u16: {
    round: 0,
    score: 0,
    timeLeft: 25,
    timerId: null,
    isDrawing: false,
    strokes: [],
    currentStroke: [],
    guessed: false,
    penColor: '#00f2fe'
  }
};

function initQuickDraw(mode) {
  const st = QuickDrawState[mode];
  st.round = 0;
  st.score = 0;
  setupQuickDrawCanvas(mode);
  startQuickDrawRound(mode);
}

function setupQuickDrawCanvas(mode) {
  const canvas = document.getElementById(`qdCanvas-${mode}`);
  if (!canvas || canvas.dataset.bound === 'true') return;
  canvas.dataset.bound = 'true';

  const getCoords = (e) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const startDraw = (e) => {
    const st = QuickDrawState[mode];
    if (st.guessed) return;
    st.isDrawing = true;
    const pt = getCoords(e);
    st.currentStroke = [pt];
    st.strokes.push(st.currentStroke);
    renderQuickDrawPad(mode);
  };

  const moveDraw = (e) => {
    const st = QuickDrawState[mode];
    if (!st.isDrawing || st.guessed) return;
    if (e.cancelable) e.preventDefault();
    const pt = getCoords(e);
    const last = st.currentStroke[st.currentStroke.length - 1];
    // Campiona punti distanti almeno 4px per evitare rumore
    if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) >= 4) {
      st.currentStroke.push(pt);
      renderQuickDrawPad(mode);
      evaluateQuickDrawLive(mode, false);
    }
  };

  const endDraw = () => {
    const st = QuickDrawState[mode];
    if (!st.isDrawing) return;
    st.isDrawing = false;
    evaluateQuickDrawLive(mode, true);
  };

  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', moveDraw);
  window.addEventListener('mouseup', endDraw);

  canvas.addEventListener('touchstart', startDraw, { passive: true });
  canvas.addEventListener('touchmove', moveDraw, { passive: false });
  canvas.addEventListener('touchend', endDraw);
}

function isQuickDrawVisible(mode) {
  const tab = document.getElementById(`tab-${mode}`);
  const stage = document.getElementById(`${mode}-quickdraw`);
  return !!(tab && tab.classList.contains('active') && stage && stage.classList.contains('active'));
}

function syncQuickDrawTimers() {
  ['u10', 'u16'].forEach(mode => {
    const st = QuickDrawState[mode];
    const visible = isQuickDrawVisible(mode);
    const list = QUICKDRAW_PROMPTS[mode];
    if (visible && !st.guessed && st.round < list.length && !st.timerId) {
      startQuickDrawTimer(mode);
    } else if (!visible && st.timerId) {
      clearInterval(st.timerId);
      st.timerId = null;
    }
  });
}

function startQuickDrawTimer(mode) {
  const st = QuickDrawState[mode];
  const list = QUICKDRAW_PROMPTS[mode];
  if (st.timerId) clearInterval(st.timerId);
  st.timerId = setInterval(() => {
    if (!isQuickDrawVisible(mode)) {
      clearInterval(st.timerId);
      st.timerId = null;
      return;
    }
    if (st.guessed) return;
    st.timeLeft -= 1;
    const tEl = document.getElementById(`qdTimer-${mode}`);
    if (tEl) tEl.textContent = `⏱️ ${st.timeLeft}s`;

    if (st.timeLeft <= 0) {
      clearInterval(st.timerId);
      st.timerId = null;
      const prompt = list[st.round];
      playSound('error');
      document.getElementById(`qdAiSpeech-${mode}`).innerHTML =
        `⏰ <strong>Tempo scaduto!</strong> Non sono riuscito a riconoscere ${prompt ? prompt.label : ''}. Passiamo al prossimo!`;
      setTimeout(() => {
        st.round += 1;
        startQuickDrawRound(mode);
      }, 1800);
    }
  }, 1000);
}

function startQuickDrawRound(mode) {
  const st = QuickDrawState[mode];
  const list = QUICKDRAW_PROMPTS[mode];
  if (st.timerId) {
    clearInterval(st.timerId);
    st.timerId = null;
  }

  if (st.round >= list.length) {
    document.getElementById(`qdPrompt-${mode}`).innerHTML =
      `🏆 <strong>SFIDA COMPLETATA!</strong> Punteggio totale: <strong>${st.score} pt</strong>`;
    document.getElementById(`qdAiSpeech-${mode}`).innerHTML =
      `🤖 <strong>IA Visione:</strong> "Ottimo lavoro! Premi Nuova Partita se vuoi disegnare ancora!"`;
    return;
  }

  const prompt = list[st.round];
  st.strokes = [];
  st.currentStroke = [];
  st.guessed = false;
  st.timeLeft = 25;

  document.getElementById(`qdPrompt-${mode}`).innerHTML =
    `✏️ Disegna ${st.round + 1}/${list.length}: <strong>${prompt.label}</strong> <small style="display:block; font-weight:700; opacity:0.9;">💡 Come disegnarlo: ${prompt.hint}</small>`;
  document.getElementById(`qdScore-${mode}`).textContent = `⭐ Punti: ${st.score}`;
  document.getElementById(`qdTimer-${mode}`).textContent = `⏱️ ${st.timeLeft}s`;
  document.getElementById(`qdAiSpeech-${mode}`).innerHTML =
    `🤖 <strong>Occhio IA:</strong> "Disegna con cura seguendo il suggerimento!"`;

  renderQuickDrawPad(mode);

  if (isQuickDrawVisible(mode)) {
    startQuickDrawTimer(mode);
  }
}

function clearQuickDrawPad(mode) {
  const st = QuickDrawState[mode];
  if (st.guessed) return;
  st.strokes = [];
  st.currentStroke = [];
  renderQuickDrawPad(mode);
  document.getElementById(`qdAiSpeech-${mode}`).innerHTML =
    `🤖 <strong>Occhio IA:</strong> "Lavagna cancellata! Disegna bene la forma richiesta!"`;
}

function skipQuickDrawRound(mode) {
  const st = QuickDrawState[mode];
  st.round += 1;
  startQuickDrawRound(mode);
}

function renderQuickDrawPad(mode) {
  const canvas = document.getElementById(`qdCanvas-${mode}`);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const st = QuickDrawState[mode];

  ctx.fillStyle = mode === 'u10' ? '#fffbeb' : '#090d24';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = mode === 'u10' ? 'rgba(203, 213, 225, 0.45)' : 'rgba(56, 189, 248, 0.12)';
  ctx.lineWidth = 1;
  for (let x = 30; x < canvas.width; x += 30) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
  }
  for (let y = 30; y < canvas.height; y += 30) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
  }

  ctx.strokeStyle = st.penColor;
  ctx.lineWidth = mode === 'u10' ? 7 : 5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  st.strokes.forEach(stroke => {
    if (stroke.length === 0) return;
    if (stroke.length === 1) {
      ctx.beginPath();
      ctx.arc(stroke[0].x, stroke[0].y, (mode === 'u10' ? 4 : 3), 0, Math.PI * 2);
      ctx.fillStyle = st.penColor;
      ctx.fill();
      return;
    }
    ctx.beginPath();
    ctx.moveTo(stroke[0].x, stroke[0].y);
    for (let i = 1; i < stroke.length; i++) {
      ctx.lineTo(stroke[i].x, stroke[i].y);
    }
    ctx.stroke();
  });

  updateAiVisionMatrix(mode, canvas);
}

// ============================================================================
// ESTRATTORE DI CARATTERISTICHE GEOMETRICHE E RILEVATORE DI SCARABOCCHI
// ============================================================================
function extractDrawingFeatures(strokes, width, height) {
  const validStrokes = strokes.filter(s => s.length >= 1);
  const pts = [];
  validStrokes.forEach(s => s.forEach(p => pts.push(p)));
  if (pts.length < 8) return null;

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  pts.forEach(p => {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  });

  const w = maxX - minX;
  const h = maxY - minY;

  // Rifiuta subito linee singole piatte o disegni minuscoli
  if (w < 28 || h < 28) {
    return { isScribble: true, reason: 'Troppo piccolo o solo una linea dritta!' };
  }

  const aspect = w / h;
  const coverage = (w * h) / (width * height);

  // Calcola lunghezza totale del percorso e cambi di direzione
  let totalLength = 0;
  let corners = 0;
  let sharpReversals = 0;
  let hasClosedLoop = false;

  validStrokes.forEach(s => {
    let sLen = 0;
    for (let i = 1; i < s.length; i++) {
      sLen += Math.hypot(s[i].x - s[i - 1].x, s[i].y - s[i - 1].y);
    }
    totalLength += sLen;

    // Verifica se il tratto forma un anello chiuso (cerchio/quadrato)
    if (s.length >= 6 && sLen > 70) {
      const startEndDist = Math.hypot(s[s.length - 1].x - s[0].x, s[s.length - 1].y - s[0].y);
      if (startEndDist < Math.max(w, h) * 0.42) {
        hasClosedLoop = true;
      }
    }

    for (let i = 2; i < s.length; i += 2) {
      const dx1 = s[i - 1].x - s[i - 2].x;
      const dy1 = s[i - 1].y - s[i - 2].y;
      const dx2 = s[i].x - s[i - 1].x;
      const dy2 = s[i].y - s[i - 1].y;
      const len1 = Math.hypot(dx1, dy1);
      const len2 = Math.hypot(dx2, dy2);
      if (len1 > 3 && len2 > 3) {
        const cosA = (dx1 * dx2 + dy1 * dy2) / (len1 * len2);
        if (cosA < 0.35) corners++;
        if (cosA < -0.75) sharpReversals++;
      }
    }
  });

  // Rilevamento scarabocchio casuale (permissivo con disegni ricchi come sole con molti raggi)
  const boxPerimeter = 2 * (w + h);
  const isScribble =
    aspect > 5.0 ||
    aspect < 0.18 ||
    sharpReversals > 15 ||
    totalLength > boxPerimeter * 8.5 ||
    (validStrokes.length === 1 && corners === 0 && !hasClosedLoop && totalLength < Math.max(w, h) * 1.4);

  // Distribuzione spaziale normalizzata
  let centerCount = 0, outerRingCount = 0;
  let topHalf = 0, bottomHalf = 0;
  let leftHalf = 0, rightHalf = 0;
  let leftThird = 0, midThird = 0, rightThird = 0;
  let diag1 = 0, diag2 = 0;
  const qHits = [0, 0, 0, 0];

  let topMinX = 1, topMaxX = 0, botMinX = 1, botMaxX = 0;

  pts.forEach(p => {
    const nx = (p.x - minX) / w;
    const ny = (p.y - minY) / h;

    if (nx > 0.28 && nx < 0.72 && ny > 0.28 && ny < 0.72) centerCount++;
    else outerRingCount++;

    if (ny < 0.5) topHalf++; else bottomHalf++;
    if (nx < 0.5) leftHalf++; else rightHalf++;

    if (nx < 0.33) leftThird++;
    else if (nx < 0.66) midThird++;
    else rightThird++;

    if (ny < 0.35) {
      if (nx < topMinX) topMinX = nx;
      if (nx > topMaxX) topMaxX = nx;
    }
    if (ny > 0.65) {
      if (nx < botMinX) botMinX = nx;
      if (nx > botMaxX) botMaxX = nx;
    }

    if ((nx < 0.5 && ny < 0.5) || (nx >= 0.5 && ny >= 0.5)) diag1++;
    else diag2++;

    const qIdx = (ny < 0.5 ? 0 : 2) + (nx < 0.5 ? 0 : 1);
    qHits[qIdx]++;
  });

  const n = pts.length;
  const topWidthRatio = topMaxX > topMinX ? (topMaxX - topMinX) : 0.5;
  const bottomWidthRatio = botMaxX > botMinX ? (botMaxX - botMinX) : 0.5;
  const quadrantsActive = qHits.filter(c => c >= Math.max(2, n * 0.08)).length;

  return {
    isScribble,
    reason: isScribble ? 'Linee casuali o scarabocchio rilevato!' : '',
    totalPoints: n,
    strokeCount: validStrokes.length,
    aspect,
    coverage,
    hasClosedLoop,
    corners,
    centerDensity: centerCount / n,
    outerRingDensity: outerRingCount / n,
    topHalfDensity: topHalf / n,
    bottomHalfDensity: bottomHalf / n,
    leftThirdDensity: leftThird / n,
    midThirdDensity: midThird / n,
    rightThirdDensity: rightThird / n,
    leftRightSymmetry: 1 - Math.abs(leftHalf - rightHalf) / n,
    topWidthRatio,
    bottomWidthRatio,
    diagonalBalance: Math.abs(diag1 - diag2) / n,
    quadrantsActive
  };
}

function updateAiVisionMatrix(mode, srcCanvas) {
  const aiCanvas = document.getElementById(`qdMatrix-${mode}`);
  if (!aiCanvas) return;
  const ctx = aiCanvas.getContext('2d');
  const gridN = 16;
  const cellW = aiCanvas.width / gridN;
  const cellH = aiCanvas.height / gridN;

  const tmp = document.createElement('canvas');
  tmp.width = gridN;
  tmp.height = gridN;
  const tctx = tmp.getContext('2d');
  tctx.drawImage(srcCanvas, 0, 0, gridN, gridN);
  const imgData = tctx.getImageData(0, 0, gridN, gridN).data;

  ctx.fillStyle = '#040814';
  ctx.fillRect(0, 0, aiCanvas.width, aiCanvas.height);

  for (let y = 0; y < gridN; y++) {
    for (let x = 0; x < gridN; x++) {
      const idx = (y * gridN + x) * 4;
      const r = imgData[idx], g = imgData[idx + 1], b = imgData[idx + 2];
      const isInk = mode === 'u10' ? (r < 220 || g < 210) : (g > 40 || b > 60);
      ctx.fillStyle = isInk ? '#22c55e' : '#0f172a';
      ctx.fillRect(x * cellW + 1, y * cellH + 1, cellW - 2, cellH - 2);
    }
  }
}

function evaluateQuickDrawLive(mode, strokeFinished = false) {
  const st = QuickDrawState[mode];
  if (st.guessed) return;
  const list = QUICKDRAW_PROMPTS[mode];
  const prompt = list[st.round];
  if (!prompt) return;

  const canvas = document.getElementById(`qdCanvas-${mode}`);
  const features = extractDrawingFeatures(st.strokes, canvas.width, canvas.height);
  const speechEl = document.getElementById(`qdAiSpeech-${mode}`);

  if (!features) {
    speechEl.innerHTML = `🤖 <strong>Occhio IA:</strong> "Continua a disegnare... il tratto è ancora troppo corto!"`;
    return;
  }

  if (features.isScribble) {
    speechEl.innerHTML =
      `⚠️ <strong>Occhio IA:</strong> "Queste sembrano linee a caso o uno scarabocchio! Premi <strong>Cancella</strong> e disegna: <em>${prompt.hint}</em>"`;
    return;
  }

  // Calcola il punteggio del disegno rispetto a TUTTE le classi della categoria
  const rankings = list.map(item => ({
    id: item.id,
    label: item.label,
    score: item.evaluate(features)
  })).sort((a, b) => b.score - a.score);

  const targetScore = prompt.evaluate(features);
  const bestMatch = rankings[0];

  // Accetta il disegno se il punteggio geometrico è >= 62 (o >= 75 in tempo reale)
  if ((strokeFinished && targetScore >= 62 && targetScore >= bestMatch.score - 12) || targetScore >= 78) {
    triggerQuickDrawSuccess(mode, targetScore);
  } else {
    const guessName = targetScore < 45
      ? prompt.wrongGuesses[features.strokeCount % prompt.wrongGuesses.length]
      : bestMatch.label;
    speechEl.innerHTML =
      `🤖 <strong>Analisi Forma IA:</strong> Somiglianza con ${prompt.label}: <strong>${targetScore}%</strong> (Sembra <em>${guessName}</em> — Aggiungi i dettagli richiesti: ${prompt.hint})`;
  }
}

function triggerQuickDrawSuccess(mode, confidence) {
  const st = QuickDrawState[mode];
  if (st.guessed) return;
  st.guessed = true;
  if (st.timerId) clearInterval(st.timerId);

  const prompt = QUICKDRAW_PROMPTS[mode][st.round];
  const bonus = 100 + st.timeLeft * 5;
  st.score += bonus;

  playSound('unlock');
  if (typeof launchConfetti === 'function') launchConfetti();

  document.getElementById(`qdScore-${mode}`).textContent = `⭐ Punti: ${st.score}`;
  document.getElementById(`qdAiSpeech-${mode}`).innerHTML =
    `🎉 <strong>RICONOSCIUTO (${confidence}% precisione)! È ${prompt.label}!</strong> (+${bonus} punti!)`;

  setTimeout(() => {
    st.round += 1;
    startQuickDrawRound(mode);
  }, 2200);
}

window.addEventListener('DOMContentLoaded', () => {
  initQuickDraw('u10');
  initQuickDraw('u16');
});
