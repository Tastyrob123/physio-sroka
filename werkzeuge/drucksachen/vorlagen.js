/* Drucksachen-Studio · Vorlagen: elf Grundaufbauten im Hausstil. Jede Vorlage bekommt Format, Ton und Inhalt
   und setzt daraus frei verschiebbare Elemente. Alle Grössen wachsen mit dem Format, damit dieselbe Drucksache
   als A6-Karte und als A3-Plakat stimmt. Elemente tragen ihren «slot», damit Textänderungen beim Umsetzen bleiben. */
(function () {
  const DS = window.DS;
  let zaehler = 0;
  const neueId = () => 'e' + (Date.now() % 1e7).toString(36) + (zaehler++).toString(36);
  DS.neueId = neueId;

  const STIL = {
    titel: { zeile: 1.06, sperr: 0 },
    mono: { zeile: 1.55, sperr: .04 },        // Physio Sroka: keine Versalien (die Website setzt keine), leicht gesperrt
    kapitale: { zeile: 1.25, sperr: .01 },
    text: { zeile: 1.5, sperr: 0 },
    kursiv: { zeile: 1.5, sperr: 0 },
  };
  DS.STIL = STIL;

  /* stil (Vorlagen-Bibliothek, Robert 12.10.2026): rahmen 'ohne'|'einfach'|'doppelt', ausr 'c'|'l', titel 0.8–1.25, zeichen 0.6–1.5, bild 0.38–0.66 (Bildanteil) */
  function ctx(M, fmt, ton, stil) {
    const w = fmt.b, h = fmt.h, s = Math.sqrt(w * h / (105 * 148)), s8 = Math.pow(s, .8);
    const T = M.toene[ton] || M.toene.dunkel;
    const m = Math.max(7, 8 * s8);
    return { M, w, h, s, s8, T, m, ton, el: [], quer: w > h * 1.15, stil: stil || {}, rahmenZahl: 0 };
  }

  function tx(c, rolle, text, w, gr, farbe, o = {}) {
    const el = Object.assign({ id: neueId(), typ: 'text', rolle, text: String(text), x: o.x ?? (c.w - w) / 2, y: 0, w, gr: +gr.toFixed(2), farbe, ausr: 'c', deck: 1 }, STIL[rolle], o);
    el.h = DS.mess(el).h;
    return el;
  }
  /* Zierde des Hauses (marke.json → zierde; Praxis Sylvia Sroka, umgekleidet aus der Vorlage: die Zierde «xx» zwischen Titel und Text): der kurze waagrechte Trennstrich ohne eigene Stärke wird zur Zierde */
  const linie = (c, L, o = {}) => { const el = Object.assign({ id: neueId(), typ: 'linie', x: (c.w - L) / 2, y: 0, w: L, h: 0, staerke: .3, farbe: c.T.linie, deck: 1 }, o);
    if (c.M.zierde && !('staerke' in o) && !('h' in o) && L > 0 && L <= 16 * c.s8) { el.zierde = 1; el.w = +(L * 1.15).toFixed(2); el.x = o.x ?? (c.w - el.w) / 2; el.h = +(el.w * c.M.zierde.verh).toFixed(2); }
    return el; };
  const zeichen = (c, zw, o = {}) => { zw *= Math.min(1.6, Math.max(.5, c.stil.zeichen || 1)); return Object.assign({ id: neueId(), typ: 'zeichen', x: (c.w - zw) / 2, y: 0, w: zw, farbe: c.T.zeichen, deck: 1 }, o); };
  const hoehe = (c, el) => el.typ === 'zeichen' ? el.w * c.M.zeichen.verh : el.typ === 'linie' ? (el.zierde ? el.h : el.staerke) : el.h;

  /* Stapel: [element | zahl(abstand)] von oben nach unten setzen */
  function stapelHoehe(c, items) {
    let y = 0;
    for (const it of items) y += typeof it === 'number' ? it : hoehe(c, it);
    return y;
  }
  function stapel(c, items, y) {
    let lastGap = 0;
    for (const it of items) {
      if (typeof it === 'number') { y += it; lastGap = it; continue; }
      it.y = +y.toFixed(2); y += hoehe(c, it); c.el.push(it);
    }
    return y;
  }
  function stapelMitte(c, items, y0, y1) {
    let H = stapelHoehe(c, items);
    // Zu wenig Platz: Schrift und Abstände gemeinsam verkleinern, bis der Stapel passt (höchstens auf 60 %)
    for (let n = 0; n < 6 && H > (y1 - y0) + .05; n++) {
      const f = Math.max(.82, (y1 - y0) / H);
      items = items.map(it => {
        if (typeof it === 'number') return it * f;
        if (it.typ === 'text' && it.gr * f >= (it._gr0 || it.gr) * .6) { it._gr0 = it._gr0 || it.gr; it.gr = +(it.gr * f).toFixed(2); it.h = DS.mess(it).h; }
        return it;
      });
      H = stapelHoehe(c, items);
    }
    items.forEach(it => { if (it && it._gr0) delete it._gr0; });
    return stapel(c, items, Math.max(y0, y0 + (y1 - y0 - H) / 2));
  }
  /* Leere Felder und ihre Abstände aus einem Stapel entfernen */
  function sauber(items) {
    const out = [];
    for (const it of items) {
      if (it == null || it === false || it === '') { if (typeof out[out.length - 1] === 'number') out.pop(); continue; }
      out.push(it);
    }
    while (typeof out[0] === 'number') out.shift();
    while (typeof out[out.length - 1] === 'number') out.pop();
    return out;
  }

  function grund(c, seite, farbe, tapete) {
    seite.grund = farbe || c.T.grund;
    seite.tapete = tapete === undefined ? c.T.tapete : tapete;
  }
  function rahmen(c, inset, staerke = .25, deck = .75) {
    const r = inset ?? Math.max(4.5, 5 * c.s8);
    c.rahmenZahl++;
    if (c.stil.rahmen === 'ohne') return r;
    const ecke = c.stil.ecke ?? 2.2;
    c.el.push({ id: neueId(), typ: 'rahmen', x: r, y: r, w: c.w - 2 * r, h: c.h - 2 * r, staerke, r: ecke * c.s8, farbe: c.T.linie, deck });
    if (c.stil.rahmen === 'doppelt' && c.rahmenZahl === 1) { const r2 = r + 1.3 * c.s8; c.el.push({ id: neueId(), typ: 'rahmen', x: r2, y: r2, w: c.w - 2 * r2, h: c.h - 2 * r2, staerke: .15, r: Math.max(0, ecke - 1) * c.s8, farbe: c.T.linie, deck: deck * .8 }); }
    return r;
  }
  function foto(c, key, x, y, w, h, o = {}) {
    const el = Object.assign({ id: neueId(), typ: 'bild', bild: key, x, y, w, h, fx: .5, fy: .5, zoom: 1, slot: 'bild' }, o);
    c.el.push(el); return el;
  }
  function fuss(c, i, farbe, y1) {
    const t = i.fuss === undefined || i.fuss === null ? `${c.M.adr} · ${c.M.tel}` : i.fuss;
    if (!t) return y1 ?? c.h;
    const el = tx(c, 'mono', t, c.w - 2 * c.m - 6, 1.5 * c.s8, farbe || c.T.mono, { slot: 'fuss', deck: .85, sperr: .08 });
    el.y = +((y1 ?? c.h - c.m - 1.5 * c.s8) - el.h).toFixed(2);
    c.el.push(el);
    return el.y;
  }
  const titelGr = (c, t, faktor = 1, breite) => {
    let g = Math.min(9.4 * c.s * faktor * (c.stil.titel || 1), (breite || c.w) / 9.2 * Math.min(1.08, c.stil.titel || 1));
    const L = Math.max(...String(t || '').split('\n').map(z => z.length));
    if (L > 18) g *= .86; if (L > 26) g *= .86;
    return g;
  };

  /* ---------- die Vorlagen ---------- */
  const V = {};

  V.deckel = {
    name: 'Titelblatt', wofuer: 'Deckblatt, Einladung zum Anlass, Karte mit einem starken Titel',
    slots: ['ueber', 'titel*', 'unter', 'text', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const bw = c.w - 2 * (r + 6 * c.s8);
      const zh = Math.min(c.w * .3, 30 * c.s, c.h * .2);
      const items = sauber([
        zeichen(c, zh), 8 * c.s8,
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.9 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 3 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel), c.T.titel, { slot: 'titel' }), 5.5 * c.s8,
        linie(c, 14 * c.s8), 5 * c.s8,
        i.unter && tx(c, 'mono', i.unter, bw, 2.05 * c.s8, c.T.mono, { slot: 'unter' }), 6 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 80 * c.s8), 2.8 * c.s8, c.T.text, { slot: 'text' }),
      ]);
      const yF = fuss(c, i, null, c.h - r - 6 * c.s8);
      stapelMitte(c, items, r + 8 * c.s8, yF - 6 * c.s8);
    },
  };

  V.buehne = {
    name: 'Bild oben', wofuer: 'Flyer und Aushang mit großem Foto oben, Text darunter; das Zeichen sitzt auf der Naht',
    slots: ['bild*', 'ueber', 'titel*', 'text', 'aktion', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite);
      const ph = c.h * Math.min(.66, Math.max(.38, c.stil.bild || (c.quer ? .5 : .54))), B = DS.B;
      foto(c, i.bild, -B, -B, c.w + 2 * B, ph + B);
      const d = 15 * c.s8;
      c.el.push({ id: neueId(), typ: 'flaeche', x: (c.w - d) / 2, y: ph - d / 2, w: d, h: d, r: d / 2, farbe: seite.grund, tapete: seite.tapete, deck: 1 });
      const zw = d * .6, z = zeichen(c, zw); z.y = ph - zw * c.M.zeichen.verh / 2; c.el.push(z);
      const bw = c.w - 2 * c.m - 6;
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.9 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 2.6 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .82), c.T.titel, { slot: 'titel' }), 4.5 * c.s8,
        linie(c, 12 * c.s8), 4.5 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 86 * c.s8), 2.75 * c.s8, c.T.text, { slot: 'text' }), i.text && 4.5 * c.s8,
        i.aktion && tx(c, 'mono', i.aktion, bw, 2 * c.s8, c.T.mono, { slot: 'aktion' }),
      ]);
      const yF = fuss(c, i);
      stapelMitte(c, items, ph + d / 2 + 4 * c.s8, yF - 5 * c.s8);
    },
  };

  V.ansicht = {
    name: 'Ansichtskarte', wofuer: 'Postkarte: Foto randlos, kleines Schild mit dem Ort. Nur Haus von aussen oder Landschaft',
    slots: ['bild*', 'titel*', 'unter'],
    bau(c, i, seite) {
      grund(c, seite, 'navy', null);
      const B = DS.B;
      foto(c, i.bild, -B, -B, c.w + 2 * B, c.h + 2 * B);
      const dunkel = c.ton !== 'hell';
      const schild = dunkel ? 'papier' : 'navy', tf = dunkel ? 'navy' : 'papier', mf = dunkel ? 'taupe' : 'gold';
      const pad = 4.6 * c.s8, max = c.w * .62;
      const t = tx(c, 'titel', i.titel, max, Math.min(6.4 * c.s8, c.w / 15), tf, { ausr: 'l', slot: 'titel', x: pad });
      const u = i.unter ? tx(c, 'mono', i.unter, max, 1.55 * c.s8, mf, { ausr: 'l', slot: 'unter', x: pad }) : null;
      const bw = Math.max(DS.mess(t).bw, u ? DS.mess(u).bw : 0);
      const sh = pad * 2 + t.h + (u ? u.h + 1.2 * c.s8 : 0), R = 3 * c.s8;
      c.el.push({ id: neueId(), typ: 'flaeche', x: -B - R, y: c.h - sh, w: bw + 2 * pad + B + R + 1, h: sh + B + R, r: R, farbe: schild, tapete: dunkel ? null : 'dunkel', deck: 1 });
      t.w = u ? Math.max(bw + 1, 10) : bw + 1; if (u) u.w = t.w;
      stapel(c, sauber([t, u && 1.2 * c.s8, u]), c.h - sh + pad);
    },
  };

  V.karte = {
    name: 'Karte mit Liste', wofuer: 'Behandlungs-, Übungs- oder Preisliste: Einträge mit Name, Beschreibung, Preis',
    slots: ['ueber', 'titel*', 'text', 'liste*', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const x0 = r + 6 * c.s8, cw = c.w - 2 * x0;
      const kopf = sauber([
        zeichen(c, 10 * c.s8), 5 * c.s8,
        i.ueber && tx(c, 'mono', i.ueber, cw, 1.85 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 2.4 * c.s8,
        tx(c, 'titel', i.titel, cw, titelGr(c, i.titel, .74), c.T.titel, { slot: 'titel' }), 3.6 * c.s8,
        i.text && tx(c, 'kursiv', i.text, Math.min(cw, 80 * c.s8), 2.5 * c.s8, c.T.text, { slot: 'text', deck: .85 }),
      ]);
      const yK = stapel(c, kopf, r + 7 * c.s8) + 5 * c.s8;
      const yF = fuss(c, i, null, c.h - r - 5 * c.s8);
      const liste = (i.liste || []).filter(e => e && (e.name || e.preis));
      const verf = yF - 5 * c.s8 - yK;
      const sp = c.w / c.h > 1.6 && liste.length >= 3 ? 2 : 1, sg = 8 * c.s8, sw = (cw - (sp - 1) * sg) / sp;
      const baueListe = (k, luft) => {
        const els = []; let H = 0;
        const pw = Math.max(0, ...liste.map(e => e.preis ? DS.mess({ typ: 'text', rolle: 'mono', text: e.preis, w: 200, gr: 1.95 * c.s8 * k, ...STIL.mono, sperr: .08 }).bw : 0));
        const proSpalte = Math.ceil(liste.length / sp);
        for (let s0 = 0; s0 < sp; s0++) {
          const xs = x0 + s0 * (sw + sg), teil = liste.slice(s0 * proSpalte, (s0 + 1) * proSpalte);
          let y = 0;
          teil.forEach((e, j) => {
            const n = s0 * proSpalte + j, row = [];
            const nw = sw - (pw ? pw + 4 * c.s8 : 0);
            const nm = tx(c, 'titel', e.name || '', nw, 4.05 * c.s8 * k, c.T.titel, { ausr: 'l', x: xs, slot: `liste.${n}.name`, zeile: 1.12 });
            nm.y = y; row.push(nm);
            if (e.preis) {
              const p = tx(c, 'mono', e.preis, pw + 1, 1.95 * c.s8 * k, c.T.mono, { ausr: 'r', x: xs + sw - pw - 1, slot: `liste.${n}.preis`, sperr: .08 });
              p.y = y + (nm.gr * 1.12 - p.gr * 1.6) / 2 + .15 * c.s8 * k; row.push(p);
            }
            let yy = y + nm.h;
            if (e.detail) {
              const dt = tx(c, 'text', e.detail, nw, 2.3 * c.s8 * k, c.T.text, { ausr: 'l', x: xs, slot: `liste.${n}.detail`, deck: .78, zeile: 1.42 });
              dt.y = yy + .7 * c.s8 * k; row.push(dt); yy = dt.y + dt.h;
            }
            yy += 2.4 * c.s8 * k * luft;
            if (j < teil.length - 1) { row.push(linie(c, sw, { x: xs, y: yy, staerke: .15, deck: .4 })); yy += 2.4 * c.s8 * k * luft; }
            els.push(...row); y = yy;
          });
          H = Math.max(H, y);
        }
        return { els, H };
      };
      let k = 1, L = baueListe(k, 1);
      for (let n = 0; n < 8 && L.H > verf; n++) { k *= Math.max(.6, Math.sqrt(verf / L.H)) * .99; L = baueListe(k, 1); }
      if (L.H < verf * .7) { k = Math.min(1.35, Math.sqrt(verf * .8 / L.H)); L = baueListe(k, 1); if (L.H > verf) { k *= Math.sqrt(verf / L.H) * .98; L = baueListe(k, 1); } }
      if (L.H < verf * .85 && liste.length > sp) { const luft = Math.min(2.2, 1 + (verf * .92 - L.H) / (Math.ceil(liste.length / sp) * 4.8 * c.s8 * k)); L = baueListe(k, luft); }
      const dy = yK + Math.max(0, (verf - L.H) / 2) * .6;
      L.els.forEach(e => { e.y = +(e.y + dy).toFixed(2); c.el.push(e); });
    },
  };

  V.einladung = {
    name: 'Einladung', wofuer: 'Einladung zu Fest, Dinner, Anlass: wann, wo, Bitte um Antwort',
    slots: ['ueber', 'titel*', 'wann', 'wo', 'text', 'aktion'],
    bau(c, i, seite) {
      grund(c, seite);
      const r = rahmen(c, null, .35, .85); rahmen(c, r + 1.4 * c.s8, .15, .6);
      const bw = c.w - 2 * (r + 8 * c.s8);
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.9 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 5 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .95), c.T.titel, { slot: 'titel' }), 6 * c.s8,
        linie(c, 14 * c.s8), 6 * c.s8,
        i.wann && tx(c, 'mono', i.wann, bw, 2.45 * c.s8, c.T.titel, { slot: 'wann', sperr: .08 }), i.wann && 2 * c.s8,
        i.wo && tx(c, 'kursiv', i.wo, bw, 2.6 * c.s8, c.T.text, { slot: 'wo' }), 6 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 78 * c.s8), 2.7 * c.s8, c.T.text, { slot: 'text' }), i.text && 6 * c.s8,
        i.aktion && tx(c, 'mono', i.aktion, bw, 1.75 * c.s8, c.T.mono, { slot: 'aktion' }),
      ]);
      const z = zeichen(c, 9 * c.s8); z.y = c.h - r - 7 * c.s8 - hoehe(c, z); c.el.push(z);
      stapelMitte(c, items, r + 9 * c.s8, z.y - 6 * c.s8);
    },
  };

  V.programm = {
    name: 'Programm', wofuer: 'Termine, Veranstaltungen, Tagesablauf, Jahresprogramm: Datum, Titel, Ort',
    slots: ['ueber', 'titel*', 'termine*', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const x0 = r + 7 * c.s8, cw = c.w - 2 * x0;
      const kopf = sauber([
        i.ueber && tx(c, 'mono', i.ueber, cw, 1.85 * c.s8, c.T.mono, { slot: 'ueber', ausr: 'l', x: x0 }), i.ueber && 2.6 * c.s8,
        tx(c, 'titel', i.titel, cw, titelGr(c, i.titel, .8), c.T.titel, { slot: 'titel', ausr: 'l', x: x0 }), 4.4 * c.s8,
        linie(c, 14 * c.s8, { x: x0 }),
      ]);
      const yK = stapel(c, kopf, r + 9 * c.s8) + 7 * c.s8;
      const z = zeichen(c, 8 * c.s8, { x: c.w - x0 - 8 * c.s8 });
      const yF = fuss(c, Object.assign({}, i, {}), null, c.h - r - 5 * c.s8);
      const verf = yF - 6 * c.s8 - yK;
      const ter = (i.termine || []).filter(t => t && (t.was || t.wann));
      const sp = c.w / c.h > 1.6 && ter.length >= 3 ? 2 : 1, sg = 8 * c.s8, sw = (cw - (sp - 1) * sg) / sp, proSpalte = Math.ceil(ter.length / sp);
      const baue = (k, luft) => {
        const els = []; let H = 0;
        for (let s0 = 0; s0 < sp; s0++) {
          const xs = x0 + s0 * (sw + sg); let y = 0;
          ter.slice(s0 * proSpalte, (s0 + 1) * proSpalte).forEach((t, j) => {
            const n = s0 * proSpalte + j;
            if (t.wann) { const a = tx(c, 'mono', t.wann, sw, 1.8 * c.s8 * k, c.T.mono, { ausr: 'l', x: xs, slot: `termine.${n}.wann` }); a.y = y; els.push(a); y += a.h + .6 * c.s8 * k; }
            if (t.was) { const b = tx(c, 'titel', t.was, sw, 4.3 * c.s8 * k, c.T.titel, { ausr: 'l', x: xs, slot: `termine.${n}.was`, zeile: 1.12 }); b.y = y; els.push(b); y += b.h; }
            if (t.wo) { const d = tx(c, 'text', t.wo, sw, 2.3 * c.s8 * k, c.T.text, { ausr: 'l', x: xs, slot: `termine.${n}.wo`, deck: .75 }); d.y = y + .5 * c.s8 * k; els.push(d); y = d.y + d.h; }
            y += 4.6 * c.s8 * k * luft;
          });
          H = Math.max(H, y - 4.6 * c.s8 * k * luft);
        }
        return { els, H };
      };
      let k = 1, L = baue(k, 1);
      for (let n = 0; n < 8 && L.H > verf; n++) { k *= Math.max(.6, Math.sqrt(verf / L.H)) * .99; L = baue(k, 1); }
      if (L.H < verf * .7) { k = Math.min(1.35, Math.sqrt(verf * .8 / L.H)); L = baue(k, 1); if (L.H > verf) { k *= Math.sqrt(verf / L.H) * .98; L = baue(k, 1); } }
      if (L.H < verf * .85 && ter.length > sp) L = baue(k, Math.min(2, 1 + (verf * .92 - L.H) / (proSpalte * 4.6 * c.s8 * k)));
      L.els.forEach(e => { e.y = +(e.y + yK).toFixed(2); c.el.push(e); });
      void z;
    },
  };

  V.fenster = {
    name: 'Bild im Rahmen', wofuer: 'Foto mit Passepartout auf der Fläche, darunter Titel und Text; ruhig und edel',
    slots: ['bild*', 'ueber', 'titel*', 'unter', 'text', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite);
      const m = c.m + 1;
      if (c.quer) {
        const pw = c.w * .5 - m, ph = c.h - 2 * m;
        foto(c, i.bild, m, m, pw, ph);
        c.el.push({ id: neueId(), typ: 'rahmen', x: m - 1.6 * c.s8, y: m - 1.6 * c.s8, w: pw + 3.2 * c.s8, h: ph + 3.2 * c.s8, staerke: .25, r: 0, farbe: c.T.linie, deck: .8 });
        const x0 = c.w * .5 + 6 * c.s8, bw = c.w - x0 - m;
        const items = sauber([
          i.ueber && tx(c, 'mono', i.ueber, bw, 1.85 * c.s8, c.T.mono, { slot: 'ueber', x: x0 }), i.ueber && 2.6 * c.s8,
          tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .75, bw * 2), c.T.titel, { slot: 'titel', x: x0 }), 4.4 * c.s8,
          linie(c, 12 * c.s8, { x: x0 + (bw - 12 * c.s8) / 2 }), 4.4 * c.s8,
          i.unter && tx(c, 'mono', i.unter, bw, 1.9 * c.s8, c.T.mono, { slot: 'unter', x: x0 }), i.unter && 4 * c.s8,
          i.text && tx(c, 'text', i.text, bw, 2.6 * c.s8, c.T.text, { slot: 'text', x: x0 }),
        ]);
        stapelMitte(c, items, m, c.h - m);
        return;
      }
      const ph = c.h * Math.min(.56, Math.max(.36, (c.stil.bild || .54) * .87));
      foto(c, i.bild, m, m, c.w - 2 * m, ph);
      c.el.push({ id: neueId(), typ: 'rahmen', x: m - 1.6 * c.s8, y: m - 1.6 * c.s8, w: c.w - 2 * m + 3.2 * c.s8, h: ph + 3.2 * c.s8, staerke: .25, r: 0, farbe: c.T.linie, deck: .8 });
      const bw = c.w - 2 * m - 6;
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.85 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 2.6 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .85), c.T.titel, { slot: 'titel' }), 4.5 * c.s8,
        linie(c, 12 * c.s8), 4.5 * c.s8,
        i.unter && tx(c, 'mono', i.unter, bw, 1.95 * c.s8, c.T.mono, { slot: 'unter' }), i.unter && 4 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 84 * c.s8), 2.7 * c.s8, c.T.text, { slot: 'text' }),
      ]);
      const yF = fuss(c, i);
      stapelMitte(c, items, m + ph + 8 * c.s8, yF - 5 * c.s8);
    },
  };

  V.geteilt = {
    name: 'Bild und Text geteilt', wofuer: 'Halb Foto, halb Text; quer nebeneinander, hoch übereinander. Für Behandlung, Übung, Angebot',
    slots: ['bild*', 'ueber', 'titel*', 'text', 'aktion', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite);
      const B = DS.B;
      if (c.quer) {
        foto(c, i.bild, -B, -B, c.w * .5 + B, c.h + 2 * B);
        const x0 = c.w * .5 + c.m, bw = c.w - x0 - c.m;
        const items = sauber([
          zeichen(c, 9 * c.s8, { x: x0 + (bw - 9 * c.s8) / 2 }), 5 * c.s8,
          i.ueber && tx(c, 'mono', i.ueber, bw, 1.8 * c.s8, c.T.mono, { slot: 'ueber', x: x0 }), i.ueber && 2.6 * c.s8,
          tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .72, bw * 2), c.T.titel, { slot: 'titel', x: x0 }), 4.2 * c.s8,
          linie(c, 12 * c.s8, { x: x0 + (bw - 12 * c.s8) / 2 }), 4.2 * c.s8,
          i.text && tx(c, 'text', i.text, bw, 2.55 * c.s8, c.T.text, { slot: 'text', x: x0 }), i.text && 4 * c.s8,
          i.aktion && tx(c, 'mono', i.aktion, bw, 1.8 * c.s8, c.T.mono, { slot: 'aktion', x: x0 }),
        ]);
        stapelMitte(c, items, c.m, c.h - c.m);
        return;
      }
      const ph = c.h * Math.min(.62, Math.max(.4, c.stil.bild || .5));
      foto(c, i.bild, -B, c.h - ph, c.w + 2 * B, ph + B);
      const x0 = c.m + 2, bw = c.w - 2 * x0;
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.85 * c.s8, c.T.mono, { slot: 'ueber', ausr: 'l', x: x0 }), i.ueber && 2.8 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .9), c.T.titel, { slot: 'titel', ausr: 'l', x: x0 }), 4.6 * c.s8,
        linie(c, 14 * c.s8, { x: x0 }), 4.6 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 90 * c.s8), 2.75 * c.s8, c.T.text, { slot: 'text', ausr: 'l', x: x0 }), i.text && 4.4 * c.s8,
        i.aktion && tx(c, 'mono', i.aktion, bw, 1.95 * c.s8, c.T.mono, { slot: 'aktion', ausr: 'l', x: x0 }),
      ]);
      stapelMitte(c, items, c.m, c.h - ph - c.m);
    },
  };

  V.gutschein = {
    name: 'Gutschein', wofuer: 'Gutschein oder Geschenkkarte mit Wert und Feldern für Für, Von und Nummer',
    slots: ['titel', 'unter', 'wert', 'text', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const titel = i.titel || (c.M.gutschein && c.M.gutschein.titel) || 'Gutschein';
      const feld = (x, y, w, name, n) => {
        const l = tx(c, 'mono', name, 30, 1.55 * c.s8, c.T.mono, { ausr: 'l', x, slot: null }); l.y = y; c.el.push(l);
        c.el.push(linie(c, w - 12 * c.s8, { x: x + 12 * c.s8, y: y + l.h * .78, staerke: .15, deck: .6 }));
        void n;
      };
      if (c.quer) {
        const zw = Math.min(c.h * .42, c.w * .2);
        const z = zeichen(c, zw, { x: c.w * .17 - zw / 2 }); z.y = (c.h - hoehe(c, z)) / 2; c.el.push(z);
        c.el.push(linie(c, 0, { x: c.w * .33, y: r + 8 * c.s8, w: 0, h: c.h - 2 * r - 16 * c.s8, staerke: .2, deck: .7 }));
        const x0 = c.w * .38, bw = c.w - x0 - r - 8 * c.s8;
        const felder = 3 * 5.4 * c.s8;
        const items = sauber([
          tx(c, 'titel', titel, bw, Math.min(12 * c.s8, c.h / 6.5), c.T.titel, { slot: 'titel', ausr: 'l', x: x0 }), 3.5 * c.s8,
          i.unter && tx(c, 'mono', i.unter, bw, 1.9 * c.s8, c.T.mono, { slot: 'unter', ausr: 'l', x: x0 }), i.unter && 4 * c.s8,
          i.wert && tx(c, 'titel', i.wert, bw, Math.min(7 * c.s8, c.h / 11), c.ton === 'dunkel' ? 'gold' : c.T.titel, { slot: 'wert', ausr: 'l', x: x0 }), i.wert && 3 * c.s8,
          i.text && tx(c, 'text', i.text, bw * .9, 2.3 * c.s8, c.T.text, { slot: 'text', ausr: 'l', x: x0, deck: .85 }),
        ]);
        const yEnd = stapelMitte(c, items, r + 7 * c.s8, c.h - r - 8 * c.s8 - felder - 4 * c.s8);
        let y = Math.max(yEnd + 5 * c.s8, c.h - r - 7 * c.s8 - felder);
        for (const f of ((c.M.gutschein && c.M.gutschein.felder) || ['Für', 'Von', 'Nr.'])) { feld(x0, y, bw, f); y += 5.4 * c.s8; }
        return;
      }
      const bw = c.w - 2 * (r + 7 * c.s8), x0 = r + 7 * c.s8;
      const items = sauber([
        zeichen(c, Math.min(26 * c.s8, c.w * .26)), 7 * c.s8,
        tx(c, 'titel', titel, bw, titelGr(c, titel, 1.05), c.T.titel, { slot: 'titel' }), 4.5 * c.s8,
        linie(c, 14 * c.s8), 4.5 * c.s8,
        i.unter && tx(c, 'mono', i.unter, bw, 1.95 * c.s8, c.T.mono, { slot: 'unter' }), i.unter && 5 * c.s8,
        i.wert && tx(c, 'titel', i.wert, bw, 7 * c.s8, c.ton === 'dunkel' ? 'gold' : c.T.titel, { slot: 'wert' }), i.wert && 4 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 70 * c.s8), 2.5 * c.s8, c.T.text, { slot: 'text', deck: .85 }),
      ]);
      const felder = 3 * 6 * c.s8;
      stapelMitte(c, items, r + 8 * c.s8, c.h - r - 10 * c.s8 - felder);
      let y = c.h - r - 8 * c.s8 - felder;
      for (const f of ((c.M.gutschein && c.M.gutschein.felder) || ['Für', 'Von', 'Nr.'])) { feld(x0, y, bw, f); y += 6 * c.s8; }
    },
  };

  V.aushang = {
    name: 'Aushang', wofuer: 'Hinweis, Schild, Aufsteller, Info für Patienten: Titel und gut lesbarer Text',
    slots: ['ueber', 'titel*', 'text*', 'aktion', 'fuss'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const bw = c.w - 2 * (r + 7 * c.s8);
      const z = zeichen(c, Math.min(15 * c.s8, c.w * .16)); z.y = r + 8 * c.s8; c.el.push(z);
      const items = sauber([
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.95 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 3 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .9), c.T.titel, { slot: 'titel' }), 5 * c.s8,
        linie(c, 14 * c.s8), 5.5 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 96 * c.s8), 3.15 * c.s8, c.T.text, { slot: 'text', zeile: 1.55 }), i.text && 6 * c.s8,
        i.aktion && tx(c, 'mono', i.aktion, bw, 2.1 * c.s8, c.T.mono, { slot: 'aktion' }),
      ]);
      const yF = fuss(c, i, null, c.h - r - 5 * c.s8);
      stapelMitte(c, items, z.y + hoehe(c, z) + 7 * c.s8, yF - 7 * c.s8);
    },
  };

  /* Türhänger (12.10.2026): oben das Loch für die Klinke als Schnittlinie, darunter Zeichen, grosser Titel, Zeile in zweiter Sprache, kurzer Text */
  V.tuer = {
    name: 'Türhänger', wofuer: 'Türhänger mit Loch für die Klinke: großer Titel, Zeile in zweiter Sprache, kurzer Text',
    slots: ['ueber', 'titel*', 'unter', 'text', 'aktion'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const d = Math.min(36, c.w * .42), ly = r + 9;
      c.el.push({ id: neueId(), typ: 'rahmen', x: +((c.w - d) / 2).toFixed(2), y: ly, w: d, h: d, staerke: .25, r: d / 2, farbe: c.T.linie, deck: .9 });
      const bw = c.w - 2 * (r + 5 * c.s8);
      const items = sauber([
        zeichen(c, Math.min(17 * c.s8, c.w * .2)), 7 * c.s8,
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.9 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 3.5 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, 1.15, c.w * 1.25), c.T.titel, { slot: 'titel' }), 5.5 * c.s8,
        linie(c, 14 * c.s8), 5 * c.s8,
        i.unter && tx(c, 'mono', i.unter, bw, 2.05 * c.s8, c.T.mono, { slot: 'unter' }), i.unter && 6 * c.s8,
        i.text && tx(c, 'text', i.text, bw, 3 * c.s8, c.T.text, { slot: 'text', zeile: 1.55 }), i.text && 6 * c.s8,
        i.aktion && tx(c, 'mono', i.aktion, bw, 1.95 * c.s8, c.T.mono, { slot: 'aktion' }),
      ]);
      stapelMitte(c, items, ly + d + 10, c.h - r - 9 * c.s8);
    },
  };

  V.rueckseite = {
    name: 'Rückseite mit Adresse', wofuer: 'Rückseite eines Flyers oder einer Karte: Zeichen, Name, Adresse, Kontakt',
    slots: ['text'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const M = c.M, bw = c.w - 2 * (r + 7 * c.s8);
      const items = sauber([
        zeichen(c, Math.min(19 * c.s8, c.w * .2)), 6 * c.s8,
        tx(c, 'kapitale', M.name, bw, 3.1 * c.s8, c.T.titel, { sperr: .08 }), 2 * c.s8,
        tx(c, 'mono', M.zeile, bw, 1.6 * c.s8, c.T.mono), 5 * c.s8,
        linie(c, 12 * c.s8), 5 * c.s8,
        i.text && tx(c, 'kursiv', i.text, Math.min(bw, 74 * c.s8), 2.55 * c.s8, c.T.text, { slot: 'text', deck: .9 }), i.text && 5 * c.s8,
        tx(c, 'text', [M.adr.replace(' · ', '\n'), M.tel, M.mail, M.web].join('\n'), bw, 2.45 * c.s8, c.T.text, { zeile: 1.75, deck: .9 }),
      ]);
      stapelMitte(c, items, r + 8 * c.s8, c.h - r - 8 * c.s8);
    },
  };

  V.kartengruss = {
    name: 'Postkarten-Rückseite', wofuer: 'Rückseite einer Ansichtskarte: links Platz für den Gruß, rechts Markenfeld und Adresszeilen',
    slots: ['titel', 'text'],
    bau(c, i, seite) {
      grund(c, seite, c.ton === 'dunkel' ? 'papier' : c.T.grund, null);
      const T = c.M.toene.hell, m = Math.max(7, 7 * c.s8), mx = c.w / 2;
      c.el.push(linie(c, 0, { x: mx, y: m + 4, w: 0, h: c.h - 2 * m - 8, staerke: .2, farbe: T.linie, deck: .7 }));
      const lw = mx - m - 6 * c.s8;
      const z = zeichen(c, 9 * c.s8, { x: m, farbe: T.zeichen }); z.y = m; c.el.push(z);
      const kopf = sauber([
        tx(c, 'kapitale', c.M.name, lw, 2.1 * c.s8, T.titel, { ausr: 'l', x: m, sperr: .08 }), 1.2 * c.s8,
        tx(c, 'mono', i.titel || c.M.zeile, lw, 1.45 * c.s8, T.mono, { ausr: 'l', x: m, slot: 'titel' }),
        i.text && 4 * c.s8, i.text && tx(c, 'kursiv', i.text, lw, 2.25 * c.s8, T.text, { ausr: 'l', x: m, slot: 'text', deck: .85 }),
      ]);
      stapel(c, kopf, m + hoehe(c, z) + 4 * c.s8);
      const f = tx(c, 'mono', `${c.M.adr} · ${c.M.web}`, lw, 1.25 * c.s8, T.mono, { ausr: 'l', x: m, deck: .8, sperr: .08 }); f.y = c.h - m - f.h; c.el.push(f);
      const mb = 19 * c.s8, mh = 23 * c.s8;
      c.el.push({ id: neueId(), typ: 'rahmen', x: c.w - m - mb, y: m, w: mb, h: mh, staerke: .2, r: 0, farbe: T.linie, deck: .8 });
      const mz = zeichen(c, mb * .42, { x: c.w - m - mb / 2 - mb * .21, farbe: T.zeichen, deck: .35 }); mz.y = m + (mh - hoehe(c, mz)) / 2; c.el.push(mz);
      const ax = mx + 6 * c.s8, aw = c.w - m - ax, top = m + mh + 10 * c.s8, gap = Math.min(9 * c.s8, (c.h - m - 4 - top) / 4);
      for (let n = 0; n < 4; n++) c.el.push(linie(c, aw, { x: ax, y: top + gap * (n + 1) - 2, staerke: .15, farbe: T.linie, deck: .6 }));
    },
  };

  /* ---------- Aufbauten der Praxis (Physio Sroka 09.11.2026, gleiche Bauweise wie die Vorlagen oben) ---------- */
  const standorte = c => c.M.standorte || [];
  /* Visitenkarte und Terminkarte vorne: Zeichen, Name gross, Beruf, ruhige Linie */
  V.visite = {
    name: 'Karte mit Namen', wofuer: 'Vorderseite von Visiten- und Terminkarte: Zeichen, Name, Beruf',
    slots: ['titel*', 'unter', 'text'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c, Math.max(3.5, 3.6 * c.s8), .2, .7);
      const bw = c.w - 2 * (r + 4 * c.s8);
      const items = sauber([
        zeichen(c, Math.min(c.w * .26, 15 * c.s8)), 3.4 * c.s8,
        tx(c, 'titel', i.titel, bw, Math.min(7.2 * c.s8, bw / 7.5), c.T.titel, { slot: 'titel' }), 2.4 * c.s8,
        linie(c, 9 * c.s8), 2.6 * c.s8,
        i.unter && tx(c, 'mono', i.unter, bw, 2.25 * c.s8, c.T.mono, { slot: 'unter' }), i.unter && 1.2 * c.s8,
        i.text && tx(c, 'text', i.text, bw, 2.1 * c.s8, c.T.text, { slot: 'text', deck: .85 }),
      ]);
      stapelMitte(c, items, r + 3 * c.s8, c.h - r - 3 * c.s8);
    },
  };
  /* Rückseite mit beiden Standorten nebeneinander, darunter E-Mail, Website und Zeiten */
  V.kontakt = {
    name: 'Rückseite mit beiden Standorten', wofuer: 'Rückseite von Visitenkarte und Faltblatt: Hannover und Hemmingen mit Adresse und Telefon',
    slots: ['ueber', 'text'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c, Math.max(3.5, 3.6 * c.s8), .2, .7);
      const x0 = r + 4.5 * c.s8, cw = c.w - 2 * x0, quer = c.w > c.h, M = c.M;
      const S = standorte(c), gap = 5 * c.s8, sw = quer ? (cw - gap) / 2 : cw;
      const g = Math.min(2.15 * c.s8, sw / 17);
      const kopf = sauber([
        tx(c, 'kapitale', M.name, cw, Math.min(3.4 * c.s8, cw / 13), c.T.titel, { slot: 'name' }), 1 * c.s8,
        i.ueber && tx(c, 'mono', i.ueber, cw, g * .95, c.T.mono, { slot: 'ueber' }),
      ]);
      const spalten = S.map((o, n) => {
        const t = tx(c, 'mono', o.name, sw, g, c.T.mono, { ausr: quer ? 'l' : 'c', x: quer ? x0 + n * (sw + gap) : x0, slot: 'st' + n + 'n' });
        const a = tx(c, 'text', `${o.strasse}\n${o.ort}\nTelefon ${o.tel}`, sw, g, c.T.text, { ausr: quer ? 'l' : 'c', x: quer ? x0 + n * (sw + gap) : x0, zeile: 1.45, slot: 'st' + n + 'a' });
        return [t, a];
      });
      const fussT = tx(c, 'text', [M.mail + ' · ' + M.web, i.text].filter(Boolean).join('\n'), cw, g * .95, c.T.text, { slot: 'text', deck: .85, zeile: 1.45 });
      let H = stapelHoehe(c, kopf) + 3.2 * c.s8 + fussT.h + 3 * c.s8;
      const sh = spalten.map(([t, a]) => t.h + .6 * c.s8 + a.h);
      H += quer ? Math.max(...sh) : sh.reduce((x, y) => x + y, 0) + 3 * c.s8 * (sh.length - 1);
      let y = Math.max(r + 3 * c.s8, (c.h - H) / 2);
      y = stapel(c, kopf, y) + 3.2 * c.s8;
      let yMax = y;
      spalten.forEach(([t, a], n) => {
        const y0 = quer ? y : yMax;
        t.y = +y0.toFixed(2); a.y = +(y0 + t.h + .6 * c.s8).toFixed(2); c.el.push(t, a);
        yMax = Math.max(yMax, a.y + a.h + (quer ? 0 : 3 * c.s8));
      });
      if (quer && S.length === 2) c.el.push(linie(c, 0, { x: x0 + sw + gap / 2, y, w: 0, h: yMax - y, staerke: .15, deck: .5 }));
      fussT.y = +(yMax + (quer ? 3 : 0) * c.s8).toFixed(2); c.el.push(fussT);
    },
  };
  /* Rückseite der Terminkarte: Kopfzeile Tag, Datum, Uhrzeit und Linien zum Eintragen */
  V.termine = {
    name: 'Terminzeilen', wofuer: 'Rückseite der Terminkarte: Zeilen für die nächsten Termine',
    slots: ['titel*', 'text'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c, Math.max(3.5, 3.6 * c.s8), .2, .7);
      const x0 = r + 4 * c.s8, cw = c.w - 2 * x0;
      const t = tx(c, 'titel', i.titel, cw, Math.min(4.4 * c.s8, cw / 12), c.T.titel, { ausr: 'l', x: x0, slot: 'titel' }); t.y = r + 3 * c.s8; c.el.push(t);
      const f = i.text ? tx(c, 'text', i.text, cw, 1.75 * c.s8, c.T.text, { ausr: 'l', x: x0, slot: 'text', deck: .85 }) : null;
      const yF = f ? c.h - r - 2.6 * c.s8 - f.h : c.h - r - 2.6 * c.s8;
      if (f) { f.y = +yF.toFixed(2); c.el.push(f); }
      const kopfY = t.y + t.h + 2 * c.s8, sp = [0, .38, .7].map(k => x0 + k * cw), namen = ['Tag', 'Datum', 'Uhrzeit'];
      namen.forEach((n, k) => { const e = tx(c, 'mono', n, cw * .3, 1.75 * c.s8, c.T.mono, { ausr: 'l', x: sp[k], slot: 'kopf' + k }); e.y = +kopfY.toFixed(2); c.el.push(e); });
      const top = kopfY + 3.4 * c.s8, n = 4, gap = (yF - 2 * c.s8 - top) / n;
      for (let k = 1; k <= n; k++) c.el.push(linie(c, cw, { x: x0, y: +(top + gap * k).toFixed(2), staerke: .15, farbe: c.T.linie, deck: .7 }));
    },
  };
  /* Briefpapier A4 nach DIN 5008 Form B: Kopf mit Zeichen und Namen, Rücksendezeile über dem Anschriftfeld (45 mm), Falzmarken bei 105 und 210 mm,
     Lochmarke bei 148,5 mm, im Fuss beide Standorte in zwei Spalten */
  V.brief = {
    name: 'Briefpapier', wofuer: 'Briefbogen A4 mit Kopf, Rücksendezeile, Falz- und Lochmarken und beiden Standorten im Fuß',
    slots: ['text'],
    bau(c, i, seite) {
      grund(c, seite); const M = c.M, S = standorte(c), x0 = 25, rw = c.w - x0 - 20;
      const z = zeichen(c, 17, { x: c.w - 20 - 17 }); z.y = 14; c.el.push(z);
      const n = tx(c, 'titel', M.name, 110, 7.2, c.T.titel, { ausr: 'l', x: x0, slot: 'name' }); n.y = 15; c.el.push(n);
      const zl = tx(c, 'mono', M.zeile, 120, 2.6, c.T.mono, { ausr: 'l', x: x0, slot: 'zeile' }); zl.y = +(n.y + n.h + 1.2).toFixed(2); c.el.push(zl);
      const ab = tx(c, 'mono', `${S[0].name} · ${S[0].strasse} · ${S[0].ort}`, 85, 2.1, c.T.mono, { ausr: 'l', x: x0, slot: 'absender', deck: .85 }); ab.y = 45 - ab.h - .8; c.el.push(ab);
      c.el.push(linie(c, 85, { x: x0, y: 45, staerke: .12, deck: .45 }));
      [105, 210].forEach(y => c.el.push(linie(c, 5, { x: 4, y, staerke: .2, deck: .7 })));
      c.el.push(linie(c, 7, { x: 4, y: 148.5, staerke: .2, deck: .7 }));
      if (i.text) { const t = tx(c, 'text', i.text, rw, 3.9, c.T.text, { ausr: 'l', x: x0, slot: 'text', zeile: 1.5 }); t.y = 98.5; c.el.push(t); }
      const fy = c.h - 26, sw = (rw - 8) / 3;
      c.el.push(linie(c, rw, { x: x0, y: fy - 4, staerke: .15, deck: .5 }));
      S.forEach((o, k) => { const e = tx(c, 'text', `${o.name}\n${o.strasse}\n${o.ort}\nTelefon ${o.tel}\nFax ${o.fax}`, sw, 2.45, c.T.text, { ausr: 'l', x: x0 + k * (sw + 4), slot: 'fuss' + k, zeile: 1.45, deck: .9 }); e.y = fy; c.el.push(e); });
      const k3 = tx(c, 'text', `${M.mail}\n${M.web}\nMo – Fr · 8 – 19 Uhr\nTermine nach Vereinbarung`, sw, 2.45, c.T.text, { ausr: 'l', x: x0 + 2 * (sw + 4), slot: 'fuss2', zeile: 1.45, deck: .9 }); k3.y = fy; c.el.push(k3);
    },
  };
  /* Umschlag DL quer (220 × 110 mm): Absender oben links mit Zeichen, Website unten links; das Anschriftfeld bleibt frei */
  V.umschlag = {
    name: 'Umschlag', wofuer: 'Briefumschlag DL mit Absender und Zeichen, Anschriftfeld frei',
    slots: ['text'],
    bau(c, i, seite) {
      grund(c, seite); const M = c.M, S = standorte(c), x0 = 15;
      const z = zeichen(c, 15, { x: x0 }); z.y = 12; c.el.push(z);
      const n = tx(c, 'titel', M.name, 90, 5, c.T.titel, { ausr: 'l', x: x0 + 20, slot: 'name' }); n.y = 12.5; c.el.push(n);
      const a = tx(c, 'text', `${S[0].strasse} · ${S[0].ort}`, 90, 2.5, c.T.text, { ausr: 'l', x: x0 + 20, slot: 'absender', deck: .85 }); a.y = +(n.y + n.h + .8).toFixed(2); c.el.push(a);
      const w = tx(c, 'mono', i.text || `${M.web} · Hannover und Hemmingen`, 120, 2.3, c.T.mono, { ausr: 'l', x: x0, slot: 'text' }); w.y = c.h - 10 - w.h; c.el.push(w);
      c.el.push(linie(c, 30, { x: x0, y: +(w.y - 3).toFixed(2), staerke: .2, deck: .7 }));
    },
  };
  /* Karte für Bewertungen: Titel, Satz, QR-Code des Standorts gross in einer hellen Fassung, darunter der Standort */
  V.bewertung = {
    name: 'Karte mit QR-Code', wofuer: 'Bewertungskarte je Standort: Titel, kurzer Satz, QR-Code, Adresse',
    slots: ['ueber', 'titel*', 'text', 'qr*', 'unter'],
    bau(c, i, seite) {
      grund(c, seite); const r = rahmen(c);
      const bw = c.w - 2 * (r + 6 * c.s8);
      const q = Math.min(c.w * .44, c.h * .3), pad = 2.2 * c.s8;
      const items = sauber([
        zeichen(c, Math.min(13 * c.s8, c.w * .14)), 4 * c.s8,
        i.ueber && tx(c, 'mono', i.ueber, bw, 1.85 * c.s8, c.T.mono, { slot: 'ueber' }), i.ueber && 2.2 * c.s8,
        tx(c, 'titel', i.titel, bw, titelGr(c, i.titel, .74), c.T.titel, { slot: 'titel' }), 3 * c.s8,
        i.text && tx(c, 'text', i.text, Math.min(bw, 80 * c.s8), 2.35 * c.s8, c.T.text, { slot: 'text', zeile: 1.5 }),
      ]);
      const unter = i.unter ? tx(c, 'mono', i.unter, bw, 1.8 * c.s8, c.T.mono, { slot: 'unter' }) : null;
      const qy = c.h - r - 6 * c.s8 - (unter ? unter.h + 3 * c.s8 : 0) - q - 2 * pad;
      stapelMitte(c, items, r + 6 * c.s8, qy - 4 * c.s8);
      c.el.push({ id: neueId(), typ: 'flaeche', x: +((c.w - q) / 2 - pad).toFixed(2), y: +qy.toFixed(2), w: +(q + 2 * pad).toFixed(2), h: +(q + 2 * pad).toFixed(2), r: 2.5 * c.s8, farbe: '#ffffff', deck: 1 });
      foto(c, i.qr || 'qr-hannover', +((c.w - q) / 2).toFixed(2), +(qy + pad).toFixed(2), +q.toFixed(2), +q.toFixed(2), { slot: 'qr' });
      if (unter) { unter.y = +(qy + q + 2 * pad + 3 * c.s8).toFixed(2); c.el.push(unter); }
    },
  };

  DS.VORLAGEN = V;

  /* Eine Seite aus Vorlage + Inhalt setzen */
  DS.setze = function (M, formatKey, vorlage, ton, inhalt, stil) {
    const fmt = DS.FORMATE[formatKey];
    const c = ctx(M, fmt, ton, stil);
    const seite = { grund: 'navy', tapete: null, el: [], quelle: { vorlage, ton, inhalt: JSON.parse(JSON.stringify(inhalt || {})) } };
    if (stil && Object.keys(stil).length) seite.quelle.stil = Object.assign({}, stil);
    (V[vorlage] || V.deckel).bau(c, inhalt || {}, seite);
    if (c.stil.ausr === 'l' && LINKS_MOEGLICH.includes(vorlage) && !(vorlage === 'gutschein' && c.quer)) linksbuendig(c);
    seite.el = c.el;
    return seite;
  };
  /* Linksbündige Fassung: alles, was mittig auf der Achse steht, an den linken Satzrand (Fotos, Flächen, Rahmen bleiben) */
  const LINKS_MOEGLICH = ['deckel', 'buehne', 'fenster', 'aushang', 'einladung', 'gutschein'];
  function linksbuendig(c) {
    const rand = c.el.some(e => e.typ === 'rahmen') ? Math.max(4.5, 5 * c.s8) : 0;
    const L = Math.max(c.m + 2, rand + 7 * c.s8);
    const scheibe = c.el.find(e => e.typ === 'flaeche' && e.r && Math.abs(e.w - e.h) < .5);   // Zeichen auf der Naht (Bild oben) bleibt mittig
    const mittig = e => Math.abs(e.x + e.w / 2 - c.w / 2) < .8;
    for (const e of c.el) {
      if (e.typ === 'text' && e.ausr === 'c' && mittig(e) && !(e.slot === 'fuss')) { e.ausr = 'l'; e.w = Math.min(e.w, c.w - L - rand - 4 * c.s8); e.x = L; e.h = DS.mess(e).h; }
      else if (e.typ === 'linie' && mittig(e) && e.w < c.w * .5) e.x = L;
      else if (e.typ === 'zeichen' && mittig(e) && !scheibe) e.x = L;
    }
  }

  /* Ein ganzes Dokument aus einem Entwurf (der KI oder einer Vorlage) */
  DS.dokument = function (M, entwurf) {
    const fk = DS.FORMATE[entwurf.format] ? entwurf.format : 'a5h';
    return {
      id: 'd' + Date.now().toString(36),
      name: entwurf.name || 'Neue Drucksache',
      formatKey: fk, format: { b: DS.FORMATE[fk].b, h: DS.FORMATE[fk].h },
      seiten: entwurf.seiten.map(s => DS.setze(M, fk, s.vorlage, s.ton || 'dunkel', s.inhalt || {}, s.stil)),
      hinweise: entwurf.hinweise || [], auftrag: entwurf.auftrag || '', geaendert: Date.now(),
    };
  };

  /* Beispielinhalte im Wortlaut der Praxis Sylvia Sroka (umgekleidet aus der Vorlage, eingesetzt von inhalte.py) */
  DS.BEISPIEL = {"deckel": {"ueber": "Hannover und Hemmingen", "titel": "Physiotherapie Sylvia Sroka", "unter": "Privatpraxis für Physio- und Körperpsychotherapie", "text": "Seit 1986 Physiotherapeutin."}, "buehne": {"bild": "echt-hero-a", "ueber": "Physiotherapie", "titel": "Erst untersuchen. Dann behandeln.", "text": "Nach einer gründlichen Untersuchung besprechen wir gemeinsam, welche Behandlung Ihnen hilft. Ein unverbindliches Erstgespräch ist jederzeit möglich.", "aktion": "Mo – Fr · 8 – 19 Uhr · 0511 260 74 14"}, "ansicht": {"bild": "echt-ruhe", "titel": "Ein Moment Ruhe", "unter": "Physiotherapie Sylvia Sroka"}, "karte": {"ueber": "Meine Schwerpunkte", "titel": "Bewegung und Funktion wiederherstellen", "text": "Dafür arbeite ich vor allem mit drei Verfahren.", "liste": [{"name": "Neurologie", "detail": "Physiotherapie bei Erkrankungen des Nervensystems, etwa nach einem Schlaganfall oder bei Parkinson.", "preis": ""}, {"name": "Bobath", "detail": "Ein Behandlungskonzept, das gestörte Bewegungsabläufe Schritt für Schritt neu anbahnt.", "preis": ""}, {"name": "Craniosacral", "detail": "Eine sanfte Behandlung mit den Händen, vor allem an Kopf, Nacken und Rücken.", "preis": ""}]}, "einladung": {"ueber": "Für Angehörige", "titel": "Begleitung und Entlastung", "wann": "Termine nach Vereinbarung", "wo": "Hannover und Hemmingen", "text": "Ich weiß aus eigener Erfahrung, was es heißt, einen Menschen zu pflegen.", "aktion": "0511 260 74 14"}, "programm": {"ueber": "Physiotherapie Sylvia Sroka", "titel": "So läuft eine Behandlung ab", "termine": [{"wann": "Ankommen", "was": "Sie erzählen, was Sie belastet und was Sie sich wünschen.", "wo": ""}, {"wann": "Untersuchen", "was": "Haltung und Bewegung genau ansehen.", "wo": ""}, {"wann": "Behandeln", "was": "Verspannungen lösen, Muskeln und Gelenke bewegen.", "wo": ""}, {"wann": "Weiter üben", "was": "Übungen für zu Hause.", "wo": ""}]}, "fenster": {"bild": "echt-gespraech", "ueber": "Körper und Seele", "titel": "Stress zeigt sich oft zuerst im Körper", "unter": "Physiotherapie Sylvia Sroka", "text": "Deshalb verbinde ich Physiotherapie mit Entspannung, Achtsamkeit und Gesprächen."}, "geteilt": {"bild": "echt-haende-halten", "ueber": "Für Angehörige", "titel": "Für Betroffene. Und für die, die sie pflegen.", "text": "Hausbesuche nach Absprache und Begleitung für Angehörige.", "aktion": "0511 260 74 14"}, "gutschein": {"titel": "Gutschein", "unter": "Physiotherapie Sylvia Sroka", "wert": "Eine Behandlung", "text": "Hannover und Hemmingen"}, "aushang": {"ueber": "Privatpraxis Sylvia Sroka", "titel": "Termine nach Vereinbarung", "text": "Mo – Fr · 8 – 19 Uhr\nHausbesuche nach Absprache.\nRufen Sie an oder schreiben Sie mir. Ich behandle Privatpatienten.", "aktion": "0511 260 74 14 · info@physio-sroka.de"}, "tuer": {"ueber": "Physiotherapie", "titel": "Bitte klingeln", "unter": "Privatpraxis Sylvia Sroka", "text": "Termine nach Vereinbarung, Hausbesuche nach Absprache.", "aktion": "0511 260 74 14"}, "rueckseite": {"text": "Termine nach Vereinbarung, Hausbesuche nach Absprache."}, "kartengruss": {"titel": "Physiotherapie Sylvia Sroka", "text": "Hannover und Hemmingen"}, "visite": {"titel": "Sylvia Sroka", "unter": "Physiotherapie", "text": "Physiotherapeutin und Heilpraktikerin"}, "kontakt": {"ueber": "Hannover und Hemmingen", "text": "Termine nach Vereinbarung, Hausbesuche nach Absprache."}, "termine": {"titel": "Ihre nächsten Termine", "text": "Hannover 0511 260 74 14 · Hemmingen 0511 234 46 67"}, "brief": {}, "umschlag": {"text": "physio-sroka.de · Hannover und Hemmingen"}, "bewertung": {"ueber": "Privatpraxis Sylvia Sroka · Hannover", "titel": "Wie war Ihre Behandlung?", "text": "Ihre Meinung hilft anderen, die eine Physiotherapie suchen. Der Code öffnet die Praxis in Google Maps, dort können Sie eine Rezension schreiben.", "qr": "qr-hannover", "unter": "Dieterichsstraße 25 · 30159 Hannover"}};
})();
