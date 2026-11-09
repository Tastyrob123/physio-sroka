/* Drucksachen-Studio · Hilfe: Begrüssung beim ersten Besuch, Führung Schritt für Schritt am echten Studio,
   Demo-Video mit Kapiteln, Tastenkürzel. Alles jederzeit über «Hilfe» oben wieder aufrufbar. */
(function () {
  const $ = s => document.querySelector(s);
  const HAUS = new URLSearchParams(location.search).get('haus') || 'sroka';
  const GESEHEN = `ds-${HAUS}-willkommen`;
  const merk = () => { try { localStorage.setItem(GESEHEN, '1'); } catch (e) { } };
  const gesehen = () => { try { return localStorage.getItem(GESEHEN) === '1'; } catch (e) { return true; } };
  const tab = t => { const b = document.querySelector(`.reiter [data-tab="${t}"]`); if (b) b.click(); };
  const PFEIL = '<i><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></i>';
  const PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" stroke="none"/></svg>';

  /* ---------- Schritte der Führung ---------- */
  /* Physio Sroka: Wortlaut in der Du-Form (Sylvia nutzt die Werkstatt selbst), ohne KI. Filme je Schritt nur, wenn sie in hilfe/ liegen (FILME), sonst ohne. */
  /* 09.11.2026: hilfe/demo.webm (27 s, 1280 × 800, VP9) mit Playwright an der eigenen Werkstatt aufgenommen: Übersicht → «Visitenkarte» → Vorlage → Text ändern → PDF.
     Filme je Schritt (hilfe/schritt-*.webm) gibt es noch nicht; ein Eintrag hier schaltet sie frei. */
  window.DS_FILME = window.DS_FILME || { demo: true, kapitel: [
    { t: 0, titel: 'Die Übersicht' }, { t: 6, titel: 'Passende Vorlagen' }, { t: 10, titel: 'Die Visitenkarte' }, { t: 16, titel: 'Text ändern' }, { t: 22, titel: 'PDF speichern' }] };
  const FILME = window.DS_FILME;
  const SCHRITTE = [
    { ziel: '#btnNeu', film: 'schritt-neu', titel: 'Übersicht und neue Drucksache',
      text: 'Über «Übersicht» kommst du zur Startseite. Dort liegen alle deine Drucksachen zum Öffnen, Umbenennen, Kopieren oder als PDF, dazu alle Arten: Visitenkarte, Terminkarte, Übungsblatt, Aushang, Faltblatt, Briefpapier, Umschlag und die Karten für Bewertungen.' },
    { ziel: '#auftrag', film: 'schritt-1', vor: () => tab('entwerfen'), titel: 'Sagen, was du brauchst',
      text: 'Schreib hier in einem Satz, welche Drucksache entstehen soll, zum Beispiel «ein Übungsblatt für Rücken und Nacken». Eine KI läuft hier nicht: die Werkstatt sucht dazu die passenden fertigen Vorlagen im Stil der Praxis.',
      extra: { t: 'Beispiel einsetzen', tu: () => { $('#auftrag').value = 'Ein Übungsblatt für Rücken und Nacken'; } } },
    { ziel: '#btnEntwerfen', film: 'schritt-2', titel: 'Vorlagen zur Wahl',
      text: 'Ein Klick, und die passenden Vorlagen stehen nebeneinander: gleiche Angaben, verschiedene Gestaltung. Du klickst die schönste an und arbeitest darin weiter.' },
    { ziel: '#wirt', film: 'schritt-3', titel: 'Das Blatt',
      text: 'Hier liegt deine Drucksache. Einmal klicken wählt einen Teil aus, mit gedrückter Maus verschiebst du ihn, er rastet an Mitte und Kanten ein. Doppelklick auf einen Text, und du schreibst direkt hinein. Der dunkle Rand ist der Beschnitt: Was dort liegt, schneidet die Druckerei ab.' },
    { ziel: '#rechts', film: 'schritt-4', titel: 'Anpassen',
      text: 'Rechts änderst du, was du ausgewählt hast: Schrift, Größe, Farbe oder das Foto. Ist nichts ausgewählt, stellst du hier Format, Aufbau und Grund der ganzen Seite um. Es gibt nur die Farben und Schriften der Website, so bleibt alles im Stil.' },
    { ziel: '#werkzeug', film: 'schritt-5', titel: 'Etwas hinzufügen',
      text: 'Ein neuer Titel, ein Text, ein Foto, das Zeichen der Praxis oder eine Linie: ein Klick, und es liegt auf dem Blatt. Oben rechts in dieser Leiste wechselst du zwischen den Seiten.' },
    { ziel: '.reiter', film: 'schritt-6', titel: 'Vorlagen, Fotos und Ablage',
      text: 'Unter «Fotos» liegen die Bilder der Website und die QR-Codes, dazu deine eigenen: hochladen oder einfach aufs Blatt ziehen, sie bleiben nur in diesem Browser. Unter «Vorlagen» findest du fertige Aufbauten, in der «Ablage» alles, was du gemacht hast. Gespeichert wird von selbst.' },
    { ziel: '#btnZurueck', film: 'schritt-7', titel: 'Ein Schritt zurück',
      text: 'Etwas verrutscht oder gelöscht? Dieser Pfeil macht den letzten Schritt rückgängig, der daneben holt ihn zurück. Auf der Tastatur geht das mit ⌘ Z.' },
    { ziel: '#btnPruefen', film: 'schritt-8', titel: 'Die Druckprüfung',
      text: 'Die Werkstatt prüft für dich, ob alles druckbereit ist: Text zu nah am Rand, Fotos, die zu unscharf würden, Flächen ohne Beschnitt. Steht hier eine Null, ist alles in Ordnung. Ein Klick zeigt, was noch fehlt.' },
    { ziel: '#btnSpeichern', film: 'schritt-9', titel: 'Druckfertig speichern',
      text: 'Zum Schluss speicherst du die Drucksache als PDF für die Druckerei, auf Wunsch mit Schnittmarken. Beschnitt, Schriften und Fotos sind schon richtig eingestellt. Als Arbeitsdatei kannst du sie sichern und später weiterbearbeiten.' },
  ];

  /* ---------- Begrüssung ---------- */
  function willkommen() {
    const M = window.DS && DS.M;
    schicht(`<div class="hk hk--gross" role="dialog" aria-modal="true" aria-label="Willkommen">
      <div class="hk__zeichen">${M ? DS.zeichenSvg(M, 'currentColor') : ''}</div>
      <h2>Willkommen in den Drucksachen</h2>
      <p class="hk__unter">Karten, Blätter, Aushänge und Briefe im Stil ${M ? (M.artikel || 'der ' + M.name) : 'der Praxis'}, ganz ohne Grafikprogramm.</p>
      <div class="hk__drei">
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><path d="M10 34h28M10 26h20M10 18h28"/><path d="m33 30 7-7 3 3-7 7-4 1z"/></svg></span><b>Sagen</b><p>In einem Satz beschreiben, was du brauchst.</p></div>
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><rect x="6" y="14" width="10" height="14" rx="1.5"/><rect x="19" y="10" width="10" height="14" rx="1.5"/><rect x="32" y="14" width="10" height="14" rx="1.5"/><path d="m20 33 4 4 7-8"/></svg></span><b>Wählen</b><p>Fertige Vorlagen im Stil der Praxis, du nimmst die schönste.</p></div>
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><rect x="11" y="8" width="26" height="34" rx="2"/><path d="M17 16h14M17 22h10"/><path d="m27 30 9 3-4 1.5-1.5 4z"/></svg></span><b>Anpassen</b><p>Texte, Fotos und Format direkt auf dem Blatt ändern.</p></div>
        <div><span class="hk__bild"><svg viewBox="0 0 48 48"><path d="M14 18V8h20v10"/><rect x="8" y="18" width="32" height="14" rx="3"/><path d="M14 28h20v12H14z"/><path d="M19 33h10M19 37h6"/></svg></span><b>Drucken</b><p>Als PDF speichern und der Druckerei geben.</p></div>
      </div>
      <div class="hk__knoepfe">
        <button class="knopf knopf--voll" data-hk="fuehrung">Kurze Führung starten${PFEIL}</button>
        ${FILME.demo ? `<button class="hk__video" data-hk="video">${PLAY}<span>Demo-Video ansehen</span></button>` : ''}
      </div>
      <button class="hk__leise" data-hk="los">Gleich loslegen</button>
    </div>`, true);
    merk();
  }

  /* ---------- Schicht (Hintergrund + Karte) ---------- */
  let ebene;
  function schicht(html, dunkel) {
    zu();
    ebene = document.createElement('div');
    ebene.className = 'hs' + (dunkel ? ' hs--dunkel' : '');
    ebene.innerHTML = html;
    document.body.appendChild(ebene);
    ebene.addEventListener('click', klick);
    requestAnimationFrame(() => ebene && ebene.classList.add('an'));
    return ebene;
  }
  function zu() {
    if (ebene) { ebene.remove(); ebene = null; }
    removeEventListener('resize', setze); document.removeEventListener('keydown', taste);
  }
  function klick(e) {
    const b = e.target.closest('[data-hk]'); if (!b) return;
    const a = b.dataset.hk;
    if (a === 'fuehrung') { if (window.DSStart) DSStart.zu(); starte(0); }
    else if (a === 'video') video();
    else if (a === 'los' || a === 'zu') {
      zu(); tab('entwerfen');
      if (window.DSStart && !DSStart.offen() && window.DSStudio && DSStudio.doc().platzhalter) DSStart.zeige();   // noch nichts begonnen: zur Auswahl
    }
    else if (a === 'weiter') starte(nr + 1);
    else if (a === 'zurueck') starte(nr - 1);
    else if (a === 'extra') { SCHRITTE[nr].extra.tu(); b.textContent = 'Eingesetzt'; b.disabled = true; }
    else if (a === 'kapitel') { const v = ebene.querySelector('video'); v.currentTime = +b.dataset.t; v.play(); }
  }

  /* ---------- Führung ---------- */
  let nr = 0;
  function starte(i) {
    if (i >= SCHRITTE.length) return ende();
    nr = Math.max(0, i);
    const s = SCHRITTE[nr];
    if (s.vor) s.vor();
    if (!ebene || !ebene.classList.contains('hs--tour')) {
      schicht(`<div class="hs__loch"></div><div class="hk hk--tour" role="dialog" aria-live="polite"></div>`);
      ebene.classList.add('hs--tour');
      addEventListener('resize', setze); document.addEventListener('keydown', taste);
    }
    const k = ebene.querySelector('.hk--tour');
    const film = FILME[s.film] ? `hilfe/${s.film}` : '';
    k.innerHTML = `${film ? `<div class="hk__film"><video src="${film}.webm" autoplay muted loop playsinline preload="auto"></video></div>` : ''}
      <div class="hk__fort"><span style="width:${(nr + 1) / SCHRITTE.length * 100}%"></span></div>
      <small>Schritt ${nr + 1} von ${SCHRITTE.length}</small>
      <h3>${s.titel}</h3><p>${s.text}</p>
      ${s.extra ? `<button class="leicht hk__extra" data-hk="extra">${s.extra.t}</button>` : ''}
      <div class="hk__nav">
        <button class="hk__leise" data-hk="zu">Beenden</button>
        <span></span>
        ${nr ? '<button class="leicht" data-hk="zurueck">Zurück</button>' : ''}
        <button class="knopf" data-hk="weiter">${nr === SCHRITTE.length - 1 ? 'Fertig' : 'Weiter'}${PFEIL}</button>
      </div>`;
    const v = k.querySelector('video');
    if (v) {
      v.addEventListener('error', () => k.querySelector('.hk__film').remove());
      v.addEventListener('loadedmetadata', setze);
      v.play().catch(() => { });
      k.querySelector('.hk__film').addEventListener('click', () => v.paused ? v.play() : v.pause());
    }
    setze();
    k.querySelector('[data-hk="weiter"]').focus({ preventScroll: true });
  }
  function setze() {
    if (!ebene || !ebene.classList.contains('hs--tour')) return;
    const s = SCHRITTE[nr], z = document.querySelector(s.ziel);
    const loch = ebene.querySelector('.hs__loch'), k = ebene.querySelector('.hk--tour');
    if (!z) { loch.style.cssText = 'left:50%;top:50%;width:0;height:0'; return; }
    z.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    const r = z.getBoundingClientRect(), p = 8, vw = innerWidth, vh = innerHeight;
    const L = Math.max(4, r.left - p), T = Math.max(4, r.top - p), W = Math.min(vw - 8, r.width + 2 * p), H = Math.min(vh - 8, r.height + 2 * p);
    Object.assign(loch.style, { left: L + 'px', top: T + 'px', width: W + 'px', height: H + 'px' });
    const kw = Math.min(460, vw - 32), kh = k.offsetHeight, g = 18;
    let x, y;
    if (r.top < 90 && vh - (T + H) > kh + g + 16) { x = L + W - kw; y = T + H + g; }   // Knöpfe oben: darunter
    else if (vw - (L + W) > kw + g + 16) { x = L + W + g; y = T; }         // rechts daneben
    else if (L > kw + g + 16) { x = L - kw - g; y = T; }                  // links daneben
    else if (vh - (T + H) > kh + g + 16) { x = L; y = T + H + g; }        // darunter
    else { x = L; y = T - kh - g; }                                       // darüber
    x = Math.min(Math.max(16, x), vw - kw - 16); y = Math.min(Math.max(16, y), vh - kh - 16);
    Object.assign(k.style, { left: x + 'px', top: y + 'px', width: kw + 'px' });
  }
  function taste(e) {
    if (e.key === 'Escape') { zu(); return; }
    if (!ebene || !ebene.classList.contains('hs--tour')) return;
    if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); starte(nr + 1); }
    if (e.key === 'ArrowLeft') starte(nr - 1);
  }
  function ende() {
    schicht(`<div class="hk hk--gross" role="dialog" aria-modal="true">
      <div class="hk__zeichen">${DS.zeichenSvg(DS.M, 'currentColor')}</div>
      <h2>Mehr braucht es nicht</h2>
      <p class="hk__unter">Sagen, wählen, anpassen, drucken. Alle deine Drucksachen findest du oben unter «Übersicht», die Führung jederzeit unter «Hilfe».</p>
      <div class="hk__knoepfe">
        <button class="knopf knopf--voll" data-hk="los">Loslegen${PFEIL}</button>
        ${FILME.demo ? `<button class="hk__video" data-hk="video">${PLAY}<span>Demo-Video ansehen</span></button>` : ''}
      </div>
    </div>`, true);
  }

  /* ---------- Video ---------- */
  async function video() {
    let kapitel = [];
    kapitel = FILME.kapitel || [];
    const fmt = t => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    schicht(`<div class="hk hk--video" role="dialog" aria-modal="true" aria-label="Demo-Video">
      <div class="hk__kopf"><h2>So arbeitet die Werkstatt</h2><button class="hk__x" data-hk="los" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      <video src="hilfe/demo.webm" controls playsinline preload="metadata"></video>
      ${kapitel.length ? `<div class="hk__kapitel">${kapitel.map(k => `<button data-hk="kapitel" data-t="${k.t}"><b>${k.titel}</b><span>${fmt(k.t)}</span></button>`).join('')}</div>` : ''}
      <div class="hk__knoepfe hk__knoepfe--zeile"><button class="leicht" data-hk="fuehrung">Führung starten</button><button class="knopf" data-hk="los">Selbst ausprobieren${PFEIL}</button></div>
    </div>`, true);
    const v = ebene.querySelector('video');
    v.addEventListener('error', () => { v.replaceWith(Object.assign(document.createElement('p'), { className: 'hk__unter', textContent: 'Das Video konnte nicht geladen werden. Die Führung zeigt dasselbe Schritt für Schritt.' })); });
    v.play().catch(() => { });
    document.addEventListener('keydown', taste);
  }

  /* ---------- Hilfe-Menü ---------- */
  function hilfeMenue() {
    schicht(`<div class="hk hk--menue" role="dialog" aria-modal="true" aria-label="Hilfe">
      <div class="hk__kopf"><h2>Hilfe</h2><button class="hk__x" data-hk="los" aria-label="Schließen"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>
      ${FILME.demo ? `<button class="hk__zeile" data-hk="video"><span class="hk__ic">${PLAY}</span><span><b>Demo-Video ansehen</b><small>Eine Visitenkarte vom Öffnen bis zum PDF</small></span></button>` : ''}
      <button class="hk__zeile" data-hk="fuehrung"><span class="hk__ic"><svg viewBox="0 0 24 24"><path d="M5 12h14m-6-6 6 6-6 6"/></svg></span><span><b>Führung in der Werkstatt</b><small>Zehn kurze Schritte, direkt an den Knöpfen</small></span></button>
      <h3>Auf der Tastatur</h3>
      <dl class="hk__tasten">
        <dt>Doppelklick</dt><dd>Text schreiben oder Foto-Ausschnitt schieben</dd>
        <dt>Pfeiltasten</dt><dd>Gewähltes um einen halben Millimeter schieben, mit ⇧ um fünf</dd>
        <dt>⌘ Z · ⇧ ⌘ Z</dt><dd>Rückgängig · Wiederholen</dd>
        <dt>⌘ D</dt><dd>Gewähltes verdoppeln</dd>
        <dt>⌫</dt><dd>Gewähltes löschen</dd>
        <dt>Esc</dt><dd>Auswahl aufheben, Schreiben beenden</dd>
        <dt>Alt beim Ziehen</dt><dd>ohne Einrasten an Kanten und Mitte</dd>
      </dl>
    </div>`, true);
    document.addEventListener('keydown', taste);
  }

  function los() {
    $('#btnHilfe').addEventListener('click', hilfeMenue);
    const q = new URLSearchParams(location.search);
    if (q.get('hilfe') === 'video' && FILME.demo) video();
    else if (q.get('hilfe') === 'fuehrung') starte(0);
    /* Station 12, 8.11.2026 (Fehlerbuch 218): die Begrüssung öffnet nur auf Klick («Hilfe»), nie von selbst */
  }
  if (window.__ST) los(); else document.addEventListener('ds:bereit', los, { once: true });
  window.DSHilfe = { willkommen, starte, video, hilfeMenue, zu };
})();
