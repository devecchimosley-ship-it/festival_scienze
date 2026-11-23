const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Curiosità spiegate in modo semplice, divertente e adatto a bambini e ragazzini!
const SCIENCE_FACTS = [
  {
    id: 1,
    title: "🎨 Dentro l'occhio abbiamo 2 squadre di super-eroi!",
    badge: "Coni & Bastoncelli",
    summary: "Sul fondo dell'occhio (la Retina) ci sono i CONI, che si accendono di giorno per farci vedere tutti i colori, e i BASTONCELLI, che lavorano al buio come visori notturni!",
    formula: "💡 Rosso + Verde + Blu = Tutti i colori che vedi!"
  },
  {
    id: 2,
    title: "🙃 Lo sapevi che i tuoi occhi vedono tutto a testa in giù?",
    badge: "Il Segreto della Lente",
    summary: "La lente dentro l'occhio (il Cristallino) proietta le immagini CAPOVOLTE sul fondo dell'occhio, proprio come un cinema! È il nostro cervello che rimette tutto dritto in un lampo!",
    formula: "👁️ Occhio (Capovolto) ➔ 🧠 Cervello (Dritto!)"
  },
  {
    id: 3,
    title: "🌈 La Luce Bianca nasconde un Arcobaleno!",
    badge: "Magia dei Colori",
    summary: "La luce del Sole sembra bianca o trasparente, ma se attraversa un cristallo (Prisma) o le goccioline di pioggia si divide in 7 colori meravigliosi!",
    formula: "☀️ Luce Bianca = 🌈 Tutti i colori dell'arcobaleno"
  },
  {
    id: 4,
    title: "🕳️ Tutti abbiamo un 'Punto Invisibile' nell'occhio!",
    badge: "Trucco del Cervello",
    summary: "C'è un piccolo punto nell'occhio dove parte il cavo che va al cervello (Nervo Ottico): lì non possiamo vedere nulla, ma il cervello colora il buco usando la fantasia!",
    formula: "🪄 Provalo nel gioco n°3 dei Ragazzi!"
  }
];

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/api/info' && req.method === 'GET') {
    return sendJSON(res, 200, {
      school: 'I.I.S. "G. Asproni - E. Fermi"',
      city: 'Iglesias (SU)',
      event: 'Festival della Scienza',
      theme: 'La Visione: Giochi, Colori, Illusioni & Escape Room',
      serverTime: new Date().toISOString()
    });
  }

  if (pathname === '/api/facts' && req.method === 'GET') {
    return sendJSON(res, 200, SCIENCE_FACTS);
  }

  if (pathname === '/api/health' && req.method === 'GET') {
    return sendJSON(res, 200, { status: 'online', nodeVersion: process.version });
  }

  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('Accesso negato');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const indexFallback = path.join(PUBLIC_DIR, 'index.html');
      if (fs.existsSync(indexFallback)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return fs.createReadStream(indexFallback).pipe(res);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 - File non trovato');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('====================================================================');
  console.log(' 👁️  FESTIVAL DELLA SCIENZA - I.I.S. "G. ASPRONI - E. FERMI" IGLESIAS');
  console.log(' 🌈  Tema: LA VISIONE (Edizione Bambini & Ragazzi + Escape Room)');
  console.log(` 🚀  Server Node.js attivo su: http://localhost:${PORT}`);
  console.log('====================================================================');
});
