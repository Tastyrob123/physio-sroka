// Mails der Physiotherapie Sylvia Sroka (09.11.2026, Bauart der Vorlage Gilles Varone): Schriftzug und Zeichen als PNG in Gold für die Mails (einmal) und der obere Teil
// jeder Mail als Bild für die Werkbank, doppelte Dichte.
// WB_PORT=9718 node mails/_src/aufnahme.js   (vorher python3 mails/_src/bau.py)  → mails/img/logo.png, mails/img/zeichen.png, _werkbank/ansichten/Mails/NN.jpg
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.env.HOME, 'Desktop/Apps & Tools/Tasty Website Builder/node_modules/playwright'));
const ROOT = path.join(__dirname, '..', '..'), B = 'http://127.0.0.1:' + (process.env.WB_PORT || 9726) + '/';
const liste = JSON.parse(fs.readFileSync(path.join(__dirname, 'werkbank.json'), 'utf8'));
const gold = s => s.replace(/<\?xml[^>]*>/, '').replace(/\sstyle="[^"]*"/g, '').replace(/<defs>[\s\S]*?<\/defs>/g, '').replace(/\sclass="[^"]*"/g, '')
  .replace(/<svg([^>]*)>/, '<svg$1 fill="url(#g)"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8c49c"/><stop offset=".55" stop-color="#b1996a"/><stop offset="1" stop-color="#9c8457"/></linearGradient></defs>');
(async () => {
  const b = await chromium.launch({ headless: true });
  fs.mkdirSync(path.join(ROOT, 'mails/img'), { recursive: true });
  for (const [datei, ziel, breite] of [['wortmarke-ss.svg', 'logo.png', 450], ['zeichen-ss.svg', 'zeichen.png', 348]]) {
    const z = await b.newPage({ viewport: { width: 600, height: 600 }, deviceScaleFactor: 1 });
    const svg = gold(fs.readFileSync(path.join(ROOT, '_werkbank/eigen', datei), 'utf8')).replace('<svg ', `<svg style="display:block;width:${breite}px;height:auto" `).replace(/\swidth="[\d.]+mm" height="[\d.]+mm"/, '');
    await z.setContent(`<body style="margin:0;background:transparent"><div id="z" style="width:${breite}px">${svg}</div></body>`);
    await (await z.$('#z')).screenshot({ path: path.join(ROOT, 'mails/img', ziel), omitBackground: true });
    await z.close();
  }
  const ziel = path.join(ROOT, '_werkbank/ansichten/Mails'); fs.mkdirSync(ziel, { recursive: true });
  for (const f of fs.readdirSync(ziel)) if (/^\d+\.jpg$/.test(f)) fs.unlinkSync(path.join(ziel, f));
  for (const [nr, ordner] of liste) {
    const p = await b.newPage({ viewport: { width: 640, height: 900 }, deviceScaleFactor: 2 });
    await p.goto(B + 'mails/' + ordner + '/index.html', { waitUntil: 'load' }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(900);
    await p.screenshot({ path: path.join(ziel, nr + '.jpg'), quality: 88, clip: { x: 0, y: 0, width: 640, height: 940 }, fullPage: true });
    console.log('Mail', nr, ordner); await p.close();
  }
  await b.close();
})();
