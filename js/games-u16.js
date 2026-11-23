// ============================================================================
// GAMES-U16.JS - Giochi per Ragazzi Fino ai 16 Anni (10-16 anni)
// I.I.S. "G. Asproni - E. Fermi" Iglesias - Festival della Scienza
// ============================================================================

const U16State = {
  illusionRound: 0,
  illusionScore: 0,
  illusionRevealed: false,

  lensRound: 0,
  lensScore: 0,

  coneLevel: 1,
  coneScore: 0
};

window.getU16TotalScore = function () {
  return U16State.illusionScore + U16State.lensScore + U16State.coneScore;
};

// ============================================================================
// GIOCO 1 (10-16 ANNI): SFIDA DELLE ILLUSIONI OTTICHE (OCCHIO VS CERVELLO)
// ============================================================================
const ILLUSION_EXPERIMENTS = [
  {
    title: '🤯 Sfida 1/5: Le Frecce Ingannatrici (Müller-Lyer)',
    desc: 'Le punte delle frecce fanno sembrare una linea più lunga dell\'altra! Muovi il cursore finché la linea GIALLA sotto è lunga uguale a quella AZZURRA sopra!',
    targetVal: 210,
    min: 110,
    max: 310,
    startVal: 155,
    unit: 'pixel'
  },
  {
    title: '⚪ Sfida 2/5: I Cerchi Dispettosi (Ebbinghaus)',
    desc: 'Un cerchio circondato da palloni giganti sembra minuscolo! Ingrandisci o rimpicciolisci il cerchio arancione di DESTRA finché è identico a quello di SINISTRA!',
    targetVal: 36,
    min: 18,
    max: 62,
    startVal: 26,
    unit: 'pixel'
  },
  {
    title: '🛤️ Sfida 3/5: I Binari del Treno (Illusione di Ponzo)',
    desc: 'I binari che vanno lontano ingannano il cervello! Regola la barra GIALLA in basso finché ha la stessa identica lunghezza della barra AZZURRA in alto!',
    targetVal: 160,
    min: 90,
    max: 250,
    startVal: 205,
    unit: 'pixel'
  },
  {
    title: '📏 Sfida 4/5: La Torre Verticale',
    desc: 'Lo sapevi che le linee verticali sembrano sempre più lunghe di quelle orizzontali? Regola il palo GIALLO verticale finché è lungo quanto la base AZZURRA!',
    targetVal: 180,
    min: 100,
    max: 250,
    startVal: 140,
    unit: 'pixel'
  },
  {
    title: '🌓 Sfida 5/5: Il Trucco delle Ombre',
    desc: 'Lo sfondo scuro fa sembrare il quadratino più chiaro! Regola il quadratino di DESTRA finché ha lo stesso identico grigio di quello di SINISTRA!',
    targetVal: 130,
    min: 60,
    max: 210,
    startVal: 175,
    unit: 'grigio'
  }
];

function initIllusionGame() {
  U16State.illusionRound = 0;
  U16State.illusionScore = 0;
  loadIllusionRound();
}

function loadIllusionRound() {
  const exp = ILLUSION_EXPERIMENTS[U16State.illusionRound];
  U16State.illusionRevealed = false;
  document.getElementById('illusionTitle').textContent = exp.title;
  document.getElementById('illusionDesc').textContent = exp.desc;
  document.getElementById('u16IllusionScore').textContent = `Punti: ${U16State.illusionScore}`;

  const slider = document.getElementById('illusionSlider');
  slider.min = exp.min;
  slider.max = exp.max;
  slider.value = exp.startVal;
  document.getElementById('illusionSliderVal').textContent = '👁️ A occhio nudo';

  document.getElementById('verifyIllusionBtn').style.display = 'inline-flex';
  document.getElementById('nextIllusionBtn').style.display = 'none';
  document.getElementById('u16IllusionFeedback').innerHTML =
    'Regola a occhio nudo e poi premi <strong>Controlla col Righello Laser!</strong>';

  drawIllusionCanvas();
}

function onIllusionSliderChange() {
  if (U16State.illusionRevealed) return;
  document.getElementById('illusionSliderVal').textContent = '👁️ A occhio nudo';
  drawIllusionCanvas();
}

function drawIllusionCanvas() {
  const canvas = document.getElementById('illusionCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const idx = U16State.illusionRound;
  const exp = ILLUSION_EXPERIMENTS[idx];
  const userVal = Number(document.getElementById('illusionSlider').value);
  const revealed = U16State.illusionRevealed;

  if (idx === 0) {
    const xStart = 260;
    const yA = 95;
    const yB = 205;
    const lenA = exp.targetVal;
    const lenB = userVal;

    ctx.lineWidth = 4.5;
    ctx.strokeStyle = '#00f2fe';
    ctx.beginPath();
    ctx.moveTo(xStart, yA);
    ctx.lineTo(xStart + lenA, yA);
    ctx.moveTo(xStart - 22, yA - 20); ctx.lineTo(xStart, yA); ctx.lineTo(xStart - 22, yA + 20);
    ctx.moveTo(xStart + lenA + 22, yA - 20); ctx.lineTo(xStart + lenA, yA); ctx.lineTo(xStart + lenA + 22, yA + 20);
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(xStart, yB);
    ctx.lineTo(xStart + lenB, yB);
    ctx.moveTo(xStart + 22, yB - 20); ctx.lineTo(xStart, yB); ctx.lineTo(xStart + 22, yB + 20);
    ctx.moveTo(xStart + lenB - 22, yB - 20); ctx.lineTo(xStart + lenB, yB); ctx.lineTo(xStart + lenB - 22, yB + 20);
    ctx.stroke();

    if (revealed) {
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(xStart, 45); ctx.lineTo(xStart, 255);
      ctx.moveTo(xStart + lenA, 45); ctx.lineTo(xStart + lenA, 255);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  } else if (idx === 1) {
    const lx = 230, rx = 550, cy = 150;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(lx + Math.cos(a) * 65, cy + Math.sin(a) * 65, 14, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(lx, cy, exp.targetVal, 0, Math.PI * 2);
    ctx.fillStyle = '#f97316';
    ctx.fill();

    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.arc(rx + Math.cos(a) * 102, cy + Math.sin(a) * 102, 34, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(rx, cy, userVal, 0, Math.PI * 2);
    ctx.fillStyle = '#f97316';
    ctx.fill();

    if (revealed) {
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(lx, cy - exp.targetVal); ctx.lineTo(rx, cy - exp.targetVal);
      ctx.moveTo(lx, cy + exp.targetVal); ctx.lineTo(rx, cy + exp.targetVal);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  } else if (idx === 2) {
    const cx = canvas.width / 2;
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 65, 30); ctx.lineTo(cx - 230, 270);
    ctx.moveTo(cx + 65, 30); ctx.lineTo(cx + 230, 270);
    ctx.stroke();

    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(cx - exp.targetVal / 2, 95);
    ctx.lineTo(cx + exp.targetVal / 2, 95);
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(cx - userVal / 2, 215);
    ctx.lineTo(cx + userVal / 2, 215);
    ctx.stroke();

    if (revealed) {
      ctx.setLineDash([5, 5]);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - exp.targetVal / 2, 60); ctx.lineTo(cx - exp.targetVal / 2, 250);
      ctx.moveTo(cx + exp.targetVal / 2, 60); ctx.lineTo(cx + exp.targetVal / 2, 250);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  } else if (idx === 3) {
    const cx = canvas.width / 2;
    const baseY = 245;
    ctx.strokeStyle = '#00f2fe';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - exp.targetVal / 2, baseY);
    ctx.lineTo(cx + exp.targetVal / 2, baseY);
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(cx, baseY);
    ctx.lineTo(cx, baseY - userVal);
    ctx.stroke();

    if (revealed) {
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.8)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, baseY, exp.targetVal, -Math.PI, 0);
      ctx.stroke();
    }
  } else {
    ctx.fillStyle = '#111827';
    ctx.fillRect(110, 40, 250, 220);
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(420, 40, 250, 220);

    const g1 = exp.targetVal;
    ctx.fillStyle = `rgb(${g1},${g1},${g1})`;
    ctx.fillRect(195, 110, 80, 80);

    const g2 = userVal;
    ctx.fillStyle = `rgb(${g2},${g2},${g2})`;
    ctx.fillRect(505, 110, 80, 80);

    if (revealed) {
      ctx.fillStyle = `rgb(${g1},${g1},${g1})`;
      ctx.fillRect(195, 138, 390, 24);
    }
  }
}

function verifyIllusionMeasurement() {
  if (U16State.illusionRevealed) return;
  U16State.illusionRevealed = true;
  const exp = ILLUSION_EXPERIMENTS[U16State.illusionRound];
  const userVal = Number(document.getElementById('illusionSlider').value);
  const error = Math.abs(userVal - exp.targetVal);
  const points = Math.max(20, 100 - Math.round(error * 1.5));

  U16State.illusionScore += points;
  playSound('success');
  if (typeof unlockSticker === 'function') {
    unlockSticker('badge-illusions', '🤯 <strong>Incredibile!</strong> Hai sbloccato l\'Adesivo d\'Oro <strong>Re delle Illusioni</strong>!');
  }
  drawIllusionCanvas();

  document.getElementById('u16IllusionScore').textContent = `Punti: ${U16State.illusionScore}`;
  const comment = error <= 6 ? '🎯 INCREDIBILE! Occhio bionico perfetto!' : (error <= 18 ? '👏 Bravissimo! Ci sei andato vicinissimo!' : '😮 Visto come l\'illusione ha ingannato il cervello?');
  document.getElementById('u16IllusionFeedback').innerHTML =
    `📏 <strong>${comment}</strong> Misura vera: <strong>${exp.targetVal}</strong> | Tua scelta: <strong>${userVal}</strong> (Differenza: ${error} ${exp.unit}) → <strong>+${points} punti!</strong>`;

  document.getElementById('verifyIllusionBtn').style.display = 'none';
  if (U16State.illusionRound < ILLUSION_EXPERIMENTS.length - 1) {
    document.getElementById('nextIllusionBtn').style.display = 'inline-flex';
  } else {
    document.getElementById('u16IllusionFeedback').innerHTML +=
      ' 🏆 <strong>Hai completato tutte e 5 le illusioni ottiche!</strong>';
  }
}

function nextIllusionRound() {
  if (U16State.illusionRound < ILLUSION_EXPERIMENTS.length - 1) {
    U16State.illusionRound += 1;
    loadIllusionRound();
  }
}

// ============================================================================
// GIOCO 2 (10-16 ANNI): DOTTOR OCCHIALI (SFERA + ASSE ASTIGMATISMO)
// ============================================================================
const LENS_PATIENTS = [
  {
    name: 'Caso 1 di 5: Marco (12 anni) vede sfocata la lavagna da lontano!',
    defect: 'Sintomo: visione da lontano sfuocata e lettere leggermente sdoppiate. Capisci se l\'occhio converge troppo o troppo poco e allinea anche l\'asse!',
    requiredDiopters: -2.75,
    requiredAxis: 45,
    previewText: 'W LA SCIENZA!',
    hint: 'Nella miopia i raggi si incrociano PRIMA della retina: serve una lente divergente (−). Poi azzera lo sdoppiamento ruotando l\'asse!'
  },
  {
    name: 'Caso 2 di 5: Sofia (11 anni) fa fatica a leggere da vicino!',
    defect: 'Sintomo: affaticamento nella lettura ravvicinata e contorno delle lettere sfasato. Trova la diottria e l\'asse corretti!',
    requiredDiopters: 3.25,
    requiredAxis: 130,
    previewText: 'SUPER VISTA 10/10',
    hint: 'Nell\'ipermetropia il fuoco cade OLTRE la retina: serve una lente convergente (+). Poi allinea l\'asse per unire le lettere doppie!'
  },
  {
    name: 'Caso 3 di 5: Luca (14 anni) non distingue i cartelli stradali!',
    defect: 'Sintomo: forte difetto da lontano con astigmatismo obliquo accentuato.',
    requiredDiopters: -5.5,
    requiredAxis: 160,
    previewText: 'IGLESIAS 🚀',
    hint: 'Serve una lente divergente (−) molto più potente rispetto al Caso 1, oltre all\'allineamento dell\'asse!'
  },
  {
    name: 'Caso 4 di 5: Elena (13 anni) vede gli schermi sdoppiati e sfocati!',
    defect: 'Sintomo: i raggi convergono oltre la retina e l\'immagine ha un forte sdoppiamento orizzontale.',
    requiredDiopters: 4.75,
    requiredAxis: 20,
    previewText: 'ASPRONI FERMI 🏆',
    hint: 'Serve una lente convergente (+) potente e l\'asse vicino ai gradi bassi!'
  },
  {
    name: 'Caso 5 di 5: Matteo (15 anni) ha un difetto misto di precisione!',
    defect: 'Sintomo: leggero difetto di messa a fuoco ma forte astigmatismo verticale.',
    requiredDiopters: -1.5,
    requiredAxis: 95,
    previewText: 'OCCHIO PERFETTO!',
    hint: 'Piccola correzione negativa (−) sulle diottrie e attenzione millimetrica all\'asse!'
  }
];

function initLensGame() {
  U16State.lensRound = 0;
  U16State.lensScore = 0;
  U16State.lensErrors = 0;
  loadLensPatient();
}

function loadLensPatient() {
  const slider = document.getElementById('diopterSlider');
  const axisSlider = document.getElementById('astigmatismSlider');
  if (!slider) return;
  slider.value = 0;
  if (axisSlider) axisSlider.value = 90;
  U16State.lensErrors = 0;
  updateLensUI();
}

function onDiopterChange() {
  updateLensUI();
}

function updateLensUI() {
  const slider = document.getElementById('diopterSlider');
  const axisSlider = document.getElementById('astigmatismSlider');
  if (!slider) return;
  const d = Number(slider.value);
  const axis = axisSlider ? Number(axisSlider.value) : 90;

  document.getElementById('diopterDisplay').textContent = `${d > 0 ? '+' : ''}${d.toFixed(2)} D`;
  const axisDisp = document.getElementById('astigmatismDisplay');
  if (axisDisp) axisDisp.textContent = `${axis}°`;

  const scoreEl = document.getElementById('u16LensScore');
  scoreEl.textContent = `Pazienti Aiutati: ${U16State.lensRound} / ${LENS_PATIENTS.length} (${U16State.lensScore} pt)`;

  const banner = document.getElementById('lensPatientCase');
  if (U16State.lensRound >= LENS_PATIENTS.length) {
    banner.innerHTML = '🏆 <strong>SUPER OCULISTA DEL FESTIVAL!</strong> Hai fatto tornare una vista da 10 decimi a tutti e 5 i ragazzi!';
  } else {
    const p = LENS_PATIENTS[U16State.lensRound];
    banner.innerHTML = `🩺 <strong>${p.name}</strong><br/><span style="color:var(--card-muted);">${p.defect}</span>`;
  }

  drawLensCanvas(d, axis);
}

function drawLensCanvas(userDiopters, userAxis = 90) {
  const canvas = document.getElementById('lensCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const p = LENS_PATIENTS[Math.min(U16State.lensRound, LENS_PATIENTS.length - 1)];
  const retinaX = 485;
  const centerY = 155;

  const deltaD = userDiopters - p.requiredDiopters;
  const deltaAxis = Math.abs(userAxis - p.requiredAxis);
  const focalX = retinaX - deltaD * 22;
  const isSphereOk = Math.abs(deltaD) <= 0.25;
  const isAxisOk = deltaAxis <= 5;
  const isFocused = isSphereOk && isAxisOk;

  // Globo oculare (centro x=385, raggio=100 -> retina a x=485)
  ctx.beginPath();
  ctx.arc(385, centerY, 100, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#64748b';
  ctx.stroke();

  // Cristallino dell'occhio a x=300
  ctx.beginPath();
  ctx.ellipse(300, centerY, 13, 50, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Lente degli occhiali a x=165
  const lx = 165;
  ctx.save();
  ctx.strokeStyle = '#00f2fe';
  ctx.fillStyle = 'rgba(0, 242, 254, 0.22)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  if (userDiopters > 0) {
    ctx.ellipse(lx, centerY, 10 + userDiopters * 1.4, 64, 0, 0, Math.PI * 2);
  } else if (userDiopters < 0) {
    const w = 16;
    ctx.moveTo(lx - w, centerY - 64);
    ctx.lineTo(lx + w, centerY - 64);
    ctx.quadraticCurveTo(lx + 4, centerY, lx + w, centerY + 64);
    ctx.lineTo(lx - w, centerY + 64);
    ctx.quadraticCurveTo(lx - 4, centerY, lx - w, centerY - 64);
  } else {
    ctx.rect(lx - 4, centerY - 64, 8, 128);
  }
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Tracciamento dei 5 raggi
  const offsets = [-44, -22, 0, 22, 44];
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2.4;
  offsets.forEach(dy => {
    const yAtLens = centerY + dy;
    const yAtCrystal = dy * (1 - userDiopters * 0.04);
    const slope = (0 - yAtCrystal) / (focalX - 300);
    const endX = Math.max(retinaX, focalX + 30);
    const endY = centerY + yAtCrystal + slope * (endX - 300);

    ctx.beginPath();
    ctx.moveTo(20, yAtLens);
    ctx.lineTo(lx, yAtLens);
    ctx.lineTo(300, centerY + yAtCrystal);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  });

  // Bersaglio sul fondo dell'occhio (Retina)
  ctx.beginPath();
  ctx.arc(retinaX, centerY, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Pallino Rosso del Punto di Fuoco
  ctx.beginPath();
  ctx.arc(focalX, centerY, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();

  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('Occhiali', lx - 26, 245);
  ctx.fillText('Retina', retinaX - 20, 280);

  // RIQUADRO A DESTRA: SIMULAZIONE VISIVA (SFOCATURA + SDOPPIAMENTO ASTIGMATICO)
  ctx.save();
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(540, 35, 220, 240);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.strokeRect(540, 35, 220, 240);

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('👀 VISIONE DEL PAZIENTE:', 572, 62);

  const blurPx = Math.min(11, Math.abs(deltaD) * 2.4);
  const ghostShift = Math.min(22, deltaAxis * 0.35);
  const rad = (userAxis * Math.PI) / 180;
  const gx = Math.cos(rad) * ghostShift;
  const gy = Math.sin(rad) * ghostShift * 0.45;

  ctx.filter = `blur(${blurPx.toFixed(1)}px)`;
  ctx.font = 'bold 19px sans-serif';
  ctx.textAlign = 'center';

  if (ghostShift > 1.5) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.fillText(p.previewText, 650 + gx, 150 + gy);
    ctx.fillStyle = 'rgba(244, 114, 182, 0.45)';
    ctx.fillText(p.previewText, 650 - gx, 150 - gy);
  }
  ctx.fillStyle = '#f8fafc';
  ctx.fillText(p.previewText, 650, 150);
  ctx.filter = 'none';

  ctx.font = 'bold 12px sans-serif';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText(`Asse attuale: ${userAxis}°`, 650, 248);
  ctx.restore();
}

function verifyLensCorrection() {
  if (U16State.lensRound >= LENS_PATIENTS.length) return;
  const p = LENS_PATIENTS[U16State.lensRound];
  const d = Number(document.getElementById('diopterSlider').value);
  const axisSlider = document.getElementById('astigmatismSlider');
  const axis = axisSlider ? Number(axisSlider.value) : 90;
  const diffD = Math.abs(d - p.requiredDiopters);
  const diffAxis = Math.abs(axis - p.requiredAxis);
  const fb = document.getElementById('u16LensFeedback');

  if (diffD <= 0.25 && diffAxis <= 5) {
    playSound('success');
    if (typeof unlockSticker === 'function') {
      unlockSticker('badge-lenses', '👓 <strong>Mitico!</strong> Hai sbloccato l\'Adesivo d\'Oro <strong>Dottor Occhiali</strong>!');
    }
    const earned = Math.max(40, 120 - U16State.lensErrors * 20);
    U16State.lensScore += earned;
    U16State.lensRound += 1;
    fb.innerHTML = `🎉 <strong>VISTA 10/10!</strong> Diottrie e asse perfetti! (+${earned} punti)`;
    updateLensUI();
  } else {
    playSound('error');
    U16State.lensErrors = (U16State.lensErrors || 0) + 1;
    let msg = '';
    if (diffD > 0.25 && diffAxis > 5) {
      msg = 'Sia la potenza della lente (diottrie) sia l\'asse dell\'astigmatismo sono ancora fuori bersaglio!';
    } else if (diffD > 0.25) {
      msg = 'L\'asse è quasi perfetto, ma il punto rosso non è ancora sul bersaglio verde della retina!';
    } else {
      msg = 'Le diottrie sono giuste, ma la scritta è ancora sdoppiata: regola l\'Asse Astigmatismo!';
    }
    fb.innerHTML = `💡 <strong>${msg}</strong><br/><span style="font-size:0.9rem;">Aiuto fisico: ${p.hint}</span>`;
  }
}

// ============================================================================
// GIOCO 3 (10-16 ANNI): VISTA DA FALCO + MAGIA DEL PUNTO CIECO
// ============================================================================
function renderU16ConeGrid() {
  const grid = document.getElementById('u16ConeGrid');
  const scoreEl = document.getElementById('u16ConeScore');
  if (!grid) return;

  const size = Math.min(7, 3 + Math.floor((U16State.coneLevel - 1) / 2));
  grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
  scoreEl.textContent = `Livello: ${U16State.coneLevel} | Punti: ${U16State.coneScore}`;

  const total = size * size;
  const targetIdx = Math.floor(Math.random() * total);
  const hue = Math.floor(Math.random() * 360);
  const sat = 78;
  const delta = Math.max(4, 20 - U16State.coneLevel * 1.3);

  grid.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const cell = document.createElement('button');
    cell.className = 'color-cell';
    const l = i === targetIdx ? 46 + delta : 46;
    cell.style.backgroundColor = `hsl(${hue}, ${sat}%, ${l}%)`;
    cell.addEventListener('click', () => {
      const fb = document.getElementById('u16ConeFeedback');
      if (i === targetIdx) {
        playSound('success');
        U16State.coneScore += 50;
        U16State.coneLevel += 1;
        fb.innerHTML = `🦅 <strong>VISTA DA FALCO!</strong> Livello ${U16State.coneLevel} raggiunto! (+50 punti)`;
        renderU16ConeGrid();
      } else {
        playSound('error');
        fb.innerHTML = `👀 Quasi! Guarda bene tutta la griglia, ce n'è uno leggermente più chiaro!`;
      }
    });
    grid.appendChild(cell);
  }
}

function drawBlindSpotCanvas() {
  const canvas = document.getElementById('blindSpotCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const slider = document.getElementById('blindSpotSlider');
  const dotX = slider ? Number(slider.value) : 440;
  const cy = canvas.height / 2;

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(82, cy); ctx.lineTo(118, cy);
  ctx.moveTo(100, cy - 18); ctx.lineTo(100, cy + 18);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('FISSA QUI (+)', 60, cy + 40);

  ctx.beginPath();
  ctx.arc(dotX, cy, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#facc15';
  ctx.fill();
}

window.addEventListener('DOMContentLoaded', () => {
  initIllusionGame();
  initLensGame();
  renderU16ConeGrid();
  drawBlindSpotCanvas();
});
