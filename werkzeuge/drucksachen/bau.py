#!/usr/bin/env python3
"""Drucksachen · Physiotherapie Sylvia Sroka: legt die Marke der Praxis für die Werkstatt an (nichts abgetippt, alles aus der Website gelesen).
   python3 werkzeuge/drucksachen/bau.py   → werkzeuge/drucksachen/haeuser/sroka/ (marke.json, schriften, tapete, bilder, mini, kopf)
Umgekleidet am 09.11.2026 aus der Vorlage _vorlage/imprimerie/bau.py (Aufbau gleich, Hausfunktion neu). Braucht: pip install fonttools brotli pillow qrcode
Quellen (alle aus der Website im Stamm, nur gelesen):
  Farben      seite.css :root (Nacht, Holz, Gold, helles Gold, Licht, Sand, Text, leise)
  Schriften   schrift/*.woff2: Cormorant Garamond und Manrope sind variable Schriften; für den Druck werden feste Schnitte daraus gerechnet
              (Cormorant 500 für Titel, Manrope 400 für Text; Fehlerbuch F165: keine variablen Schriften, kein Type 3)
  Zeichen     media/zeichen.svg: Pfad unverändert, nur in absolute Punkte im Nullpunkt umgerechnet (Höhe 140)
  Tapete      media/tapete-dunkel.png und tapete-hell.png: die Tapete aus dem Zeichen, wie auf der Website
  Fotos       media/<key>.jpg, nur Fotos, die auf der Website stehen; Beschreibung aus den alt-Texten der Seiten
  QR-Codes    Ziele wie in werkzeuge/erzeugen.py (Google Maps je Standort), lokal mit qrcode erzeugt, kein Dienst"""
import glob, html, json, os, re, io
from PIL import Image
import qrcode
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

HIER = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HIER))
Z = os.path.join(HIER, 'haeuser', 'sroka')

ROLLEN = ['Eigene Fotos', 'Behandlung', 'Ankommen und Gespräch', 'Übungen', 'Ruhe', 'Sylvia Sroka', 'Unternehmen', 'QR-Codes']
GRUPPE = {
    'echt-hero-a': 'Behandlung', 'echt-fenster-a': 'Behandlung', 'echt-fenster-b': 'Behandlung', 'echt-cranio': 'Behandlung', 'echt-bobath': 'Behandlung',
    'echt-neurologie': 'Behandlung', 'termin-behandeln': 'Behandlung', 'termin-untersuchen': 'Behandlung', 'echt-haende-warm': 'Behandlung',
    'echt-haende-halten': 'Ankommen und Gespräch', 'echt-gespraech': 'Ankommen und Gespräch', 'termin-ankommen': 'Ankommen und Gespräch',
    'echt-alltag': 'Ankommen und Gespräch', 'echt-angehoerige': 'Ankommen und Gespräch',
    'uebung-ruecken': 'Übungen', 'uebung-nacken': 'Übungen', 'uebung-atem': 'Übungen', 'uebung-gleichgewicht': 'Übungen', 'termin-ueben': 'Übungen',
    'echt-ruhe': 'Ruhe', 'echt-yoga': 'Ruhe',
    'sylvia': 'Sylvia Sroka', 'unternehmen': 'Unternehmen',
}
ALT_ERSATZ = {   # wo die Website kein alt nennt (angesehen 09.11.2026, nur was das Foto zeigt)
    'echt-fenster-b': 'Behandlung an der Schulter im Liegen', 'echt-haende-warm': 'Ältere Hände in warmem Licht',
    'termin-behandeln': 'Behandlung am Rücken mit beiden Händen', 'termin-untersuchen': 'Untersuchung am Knie',
    'termin-ueben': 'Übung auf der Matte mit dem Band', 'uebung-ruecken': 'Rückenübung im Liegen', 'uebung-nacken': 'Nackenübung im Sitzen',
    'uebung-gleichgewicht': 'Übung für das Gleichgewicht am Strand',
}
KOPF = ['echt-hero-a', 'echt-haende-halten', 'echt-gespraech', 'echt-fenster-a', 'echt-cranio', 'echt-ruhe', 'termin-ankommen', 'termin-behandeln',
        'uebung-atem', 'uebung-ruecken', 'echt-alltag', 'echt-yoga', 'echt-haende-warm', 'echt-neurologie', 'termin-ueben', 'echt-angehoerige']
QR = {
    'qr-hannover': ('https://www.google.com/maps/search/?api=1&query=Physiotherapie%20Sylvia%20Sroka%20Dieterichsstra%C3%9Fe%2025%20Hannover',
                    'QR-Code: Bewertung Hannover (Google Maps, Dieterichsstraße 25)'),
    'qr-hemmingen': ('https://www.google.com/maps/search/?api=1&query=Physio%20Rosenpark%20Berliner%20Stra%C3%9Fe%2016%20Hemmingen',
                     'QR-Code: Bewertung Hemmingen (Google Maps, Berliner Straße 16)'),
}


def pfad_absolut(d):
    """SVG-Pfad (M m L l H h V v C c S s Q q Z z) → Liste absoluter Befehle (M/L/C/Z). Aus der Vorlage."""
    tok = re.findall(r'[MmLlHhVvCcSsQqZz]|-?(?:\d+\.\d*|\.\d+|\d+)(?:e-?\d+)?', d)
    i, cmd, x, y, sx, sy, aus, lc = 0, None, 0.0, 0.0, 0.0, 0.0, [], None
    while i < len(tok):
        t = tok[i]
        if re.match(r'[A-Za-z]', t):
            cmd = t; i += 1
            if cmd in 'Zz':
                aus.append(('Z',)); x, y = sx, sy; lc = None
            continue
        n = {'M': 2, 'L': 2, 'H': 1, 'V': 1, 'C': 6, 'S': 4, 'Q': 4}[cmd.upper()]
        v = [float(q) for q in tok[i:i + n]]; i += n
        rel = cmd.islower(); C = cmd.upper()
        if C == 'M':
            x, y = (x + v[0], y + v[1]) if rel else (v[0], v[1]); sx, sy = x, y; aus.append(('M', x, y)); cmd = 'l' if rel else 'L'; lc = None
        elif C == 'L':
            x, y = (x + v[0], y + v[1]) if rel else (v[0], v[1]); aus.append(('L', x, y)); lc = None
        elif C == 'H':
            x = x + v[0] if rel else v[0]; aus.append(('L', x, y)); lc = None
        elif C == 'V':
            y = y + v[0] if rel else v[0]; aus.append(('L', x, y)); lc = None
        elif C == 'C':
            p = [(x + v[k], y + v[k + 1]) if rel else (v[k], v[k + 1]) for k in (0, 2, 4)]
            aus.append(('C', *p[0], *p[1], *p[2])); lc = p[1]; x, y = p[2]
        elif C == 'S':
            c1 = (2 * x - lc[0], 2 * y - lc[1]) if lc else (x, y)
            p = [(x + v[k], y + v[k + 1]) if rel else (v[k], v[k + 1]) for k in (0, 2)]
            aus.append(('C', *c1, *p[0], *p[1])); lc = p[0]; x, y = p[1]
        elif C == 'Q':
            q1 = (x + v[0], y + v[1]) if rel else (v[0], v[1]); e = (x + v[2], y + v[3]) if rel else (v[2], v[3])
            c1 = (x + 2 / 3 * (q1[0] - x), y + 2 / 3 * (q1[1] - y)); c2 = (e[0] + 2 / 3 * (q1[0] - e[0]), e[1] + 2 / 3 * (q1[1] - e[1]))
            aus.append(('C', *c1, *c2, *e)); lc = None; x, y = e
    return aus


def zeichen():
    """Das Zeichen der Praxis (media/zeichen.svg, mit transform translate(0,1200) scale(.1,-.1)), Höhe 140, Ursprung oben links (F210)."""
    svg = open(os.path.join(SITE, 'media', 'zeichen.svg'), encoding='utf-8').read()
    m = re.search(r'translate\(([-\d.]+),([-\d.]+)\)\s*scale\(([-\d.]+),([-\d.]+)\)', svg)
    tx, ty, kx, ky = (float(m.group(i)) for i in range(1, 5))
    ges = []
    for d in re.findall(r'\sd="([^"]+)"', svg):
        p = []
        for t in pfad_absolut(d):
            if t[0] == 'Z': p.append(t); continue
            p.append((t[0],) + tuple(tx + kx * t[j] if j % 2 == 1 else ty + ky * t[j] for j in range(1, len(t))))
        ges.append(p)
    pts = [(t[k], t[k + 1]) for p in ges for t in p if t[0] != 'Z' for k in range(1, len(t), 2)]
    x0, y0, x1, y1 = min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)
    k = 140 / (y1 - y0)
    f = lambda v: f'{v:.2f}'.rstrip('0').rstrip('.')
    aus = []
    for p in ges:
        s = []
        for t in p:
            if t[0] == 'Z': s.append('Z'); continue
            s.append(t[0] + ' '.join(f((t[j] - x0) * k) if j % 2 == 1 else f((t[j] - y0) * k) for j in range(1, len(t))))
        aus.append(''.join(s))
    return aus, [0, 0, round((x1 - x0) * k, 2), 140]


def schrift(woff2, wght, ziel):
    t = TTFont(woff2)
    if 'fvar' in t:
        t = instancer.instantiateVariableFont(t, {'wght': wght})
    t.flavor = None
    t.save(ziel)


def alt_texte():
    alt = {}
    for f in glob.glob(os.path.join(SITE, '*.html')):
        s = open(f, encoding='utf-8').read()
        for tag in re.findall(r'<img\b[^>]*>', s):
            m, a = re.search(r'src="(?:\./)?media/([a-z0-9-]+)\.jpg"', tag), re.search(r'alt="([^"]*)"', tag)
            if m and a and a.group(1).strip() and m.group(1) not in alt:
                alt[m.group(1)] = html.unescape(a.group(1).strip())
    return alt


def auf_website():
    s = ''
    for f in glob.glob(os.path.join(SITE, '*.html')) + glob.glob(os.path.join(SITE, 'daten', '*.json')):
        s += open(f, encoding='utf-8').read()
    return set(re.findall(r'media/([a-z0-9-]+)\.jpg', s))


def sroka():
    for u in ('schriften', 'bilder', 'mini', 'kopf'):
        os.makedirs(os.path.join(Z, u), exist_ok=True)
    css = open(os.path.join(SITE, 'seite.css'), encoding='utf-8').read()
    V = dict(re.findall(r'--([a-z0-9-]+):(#[0-9a-fA-F]{6})', css[css.index(':root{'):css.index('}', css.index(':root{'))]))
    F = dict(navy=V['nacht'], nacht='#080706', blau=V['nacht2'], tinte=V['text'], papier=V['licht'], creme=V['licht2'], weiss='#f8f4ec',
             gold=V['gold'], taupe='#8a7348', messing='#6b5a38', tanne=V['nacht2'], kander=V['gold-hell'], laden=V['leise'])
    N = dict(navy='Nacht', nacht='Tiefe Nacht', blau='Holz', tinte='Schrift', papier='Licht', creme='Sand', weiss='Weiß', gold='Gold',
             taupe='Gold dunkel', messing='Bronze', tanne='Holz', kander='Gold hell', laden='Leise')

    SD = os.path.join(SITE, 'schrift')
    corm = glob.glob(os.path.join(SD, 'CormorantGaramond-latin-[0-9a-f]*.woff2'))[0]
    manr = glob.glob(os.path.join(SD, 'Manrope-latin-[0-9a-f]*.woff2'))[0]
    schrift(corm, 500, os.path.join(Z, 'schriften', 'Cormorant-500.ttf'))
    schrift(manr, 400, os.path.join(Z, 'schriften', 'Manrope-400.ttf'))
    schrift(manr, 500, os.path.join(Z, 'schriften', 'Manrope-500.ttf'))
    SCHRIFTEN = {
        'titel': ('Cormorant Garamond', 'Cormorant-500.ttf', 'Titel, Cormorant Garamond 500 wie die Website; nie fett, nie kursiv'),
        'kapitale': ('Cormorant Garamond', 'Cormorant-500.ttf', 'Namen, ruhig gesetzt'),
        'text': ('Manrope', 'Manrope-400.ttf', 'Fließtext, wie auf der Website'),
        'kursiv': ('Manrope', 'Manrope-500.ttf', 'Betonung; die Praxis setzt nie kursiv'),
        'mono': ('Manrope', 'Manrope-400.ttf', 'kleine Zeilen, leicht gesperrt, in normaler Schreibung wie auf der Website'),
    }

    # Tapete: die Tapete der Website aus dem Zeichen
    Image.open(os.path.join(SITE, 'media', 'tapete-dunkel.png')).convert('RGBA').save(os.path.join(Z, 'tapete-dunkel.webp'), 'WEBP', lossless=True)
    Image.open(os.path.join(SITE, 'media', 'tapete-hell.png')).convert('RGBA').save(os.path.join(Z, 'tapete-hell.webp'), 'WEBP', lossless=True)
    for n in ('dunkel', 'hell'):
        Image.open(os.path.join(SITE, 'media', 'tapete-%s.png' % n)).convert('RGBA').save(os.path.join(Z, 'tapete-ui-%s.webp' % n), 'WEBP', lossless=True)

    ALT, DA = alt_texte(), auf_website()
    bilder = []
    for key in sorted(GRUPPE):
        if key not in DA:
            raise SystemExit('Foto steht nicht auf der Website: ' + key)
        q = os.path.join(SITE, 'media', key + '.jpg')
        alt = ALT.get(key) or ALT_ERSATZ.get(key)
        if not alt: raise SystemExit('Foto ohne Beschreibung: ' + key)
        im = Image.open(q).convert('RGB'); w, h = im.size
        im.save(os.path.join(Z, 'bilder', key + '.webp'), 'WEBP', quality=86, method=5)
        k = im.copy(); k.thumbnail((520, 520), Image.LANCZOS); k.save(os.path.join(Z, 'mini', key + '.webp'), 'WEBP', quality=76, method=5)
        if key in KOPF:
            k = im.copy(); k.thumbnail((1200, 1200), Image.LANCZOS); k.save(os.path.join(Z, 'kopf', key + '.webp'), 'WEBP', quality=80, method=5)
        bilder.append(dict(key=key, alt=alt, w=w, h=h, gruppe=GRUPPE[key]))
    for key, (ziel, alt) in QR.items():
        q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=24, border=2)
        q.add_data(ziel); q.make(fit=True)
        im = q.make_image(fill_color='#0e0d0b', back_color='#ffffff').convert('RGB')
        im.save(os.path.join(Z, 'bilder', key + '.webp'), 'WEBP', lossless=True)
        k = im.copy(); k.thumbnail((520, 520), Image.NEAREST); k.save(os.path.join(Z, 'mini', key + '.webp'), 'WEBP', lossless=True)
        bilder.append(dict(key=key, alt=alt, w=im.size[0], h=im.size[1], gruppe='QR-Codes', ziel=ziel))
    bilder.sort(key=lambda b: (ROLLEN.index(b['gruppe']), b['key']))
    pfade, vb = zeichen()

    marke = dict(
        key='sroka', name='Physiotherapie Sylvia Sroka', voll='Physiotherapie Sylvia Sroka', ort='Hannover', artikel='der Praxis Sylvia Sroka',
        zeile='Privatpraxis für Physio- und Körperpsychotherapie', satz='Erst untersuchen. Dann behandeln.',
        adr='Dieterichsstraße 25 · 30159 Hannover', tel='0511 260 74 14', mail='info@physio-sroka.de', web='',
        standorte=[dict(k='hannover', name='Privatpraxis Sylvia Sroka', strasse='Dieterichsstraße 25', ort='30159 Hannover', tel='0511 260 74 14', fax='0511 260 74 13'),
                   dict(k='hemmingen', name='Physio Rosenpark', strasse='Berliner Straße 16', ort='30966 Hemmingen', tel='0511 234 46 67', fax='0511 655 06 827')],
        farben=F, farbnamen=N,
        toene=dict(
            dunkel=dict(grund='navy', tapete='dunkel', titel='papier', text='papier', mono='kander', linie='gold', zeichen='gold', schild='gold', schild_text='navy'),
            hell=dict(grund='papier', tapete=None, titel='tinte', text='tinte', mono='taupe', linie='gold', zeichen='gold', schild='navy', schild_text='kander'),
            creme=dict(grund='creme', tapete='hell', titel='tinte', text='tinte', mono='messing', linie='gold', zeichen='taupe', schild='navy', schild_text='kander'),
        ),
        schriften={k: dict(familie=f, datei=d, wofuer=w) for k, (f, d, w) in SCHRIFTEN.items()},
        tapete=dict(dunkel='tapete-dunkel.webp', hell='tapete-hell.webp', rapport_mm=48),
        zeichen=dict(vb=vb, pfade=pfade, verh=vb[3] / vb[2], name='Das Zeichen der Praxis'),
        gutschein=dict(titel='Gutschein', felder=['Für', 'Von', 'Nr.']),
        betriebe=[('Neurologie', 'Physiotherapie bei Erkrankungen des Nervensystems, etwa nach einem Schlaganfall oder bei Parkinson.'),
                  ('Bobath', 'Ein Behandlungskonzept, das gestörte Bewegungsabläufe Schritt für Schritt neu anbahnt.'),
                  ('Craniosacral', 'Eine sanfte Behandlung mit den Händen, vor allem an Kopf, Nacken und Rücken.'),
                  ('Körper und Seele', 'Körperpsychotherapie und Gespräche, Stressmanagement und Entspannung, Achtsamkeitstraining.'),
                  ('Hausbesuche', 'Wenn der Weg in die Praxis schwerfällt, nach Absprache.'),
                  ('Für Angehörige', 'Begleitung und Entlastung, wenn Sie pflegen.')],
        regeln=['Alles, was Patientinnen und Patienten lesen, in der Sie-Form und im Wortlaut der Website.',
                'Keine Preise, keine Fristen, keine Heilversprechen; nur Angaben, die auf der Website stehen.',
                'Öffnungszeiten wie auf der Website: «Mo – Fr · 8 – 19 Uhr», «Termine nach Vereinbarung, Hausbesuche nach Absprache».',
                'Titel in Cormorant Garamond 500, Text in Manrope. Nichts fett, nichts kursiv, keine Versalien.',
                'Dunkle Flächen in Nacht mit der Tapete aus dem Zeichen; Gold für Zeichen, Linien und kleine Zeilen.',
                'Fotos nur von der Website; das Porträt nie angeschnitten und nie als Hintergrund.',
                'Zwei Standorte: Privatpraxis Sylvia Sroka, Dieterichsstraße 25, 30159 Hannover, und Physio Rosenpark, Berliner Straße 16, 30966 Hemmingen.'],
        bilder=bilder, raus=[],
    )
    json.dump(marke, open(os.path.join(Z, 'marke.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    json.dump({}, open(os.path.join(Z, 'druck.json'), 'w'))
    print('sroka:', len(bilder), 'Bilder,', len(pfade), 'Pfade im Zeichen', vb)


if __name__ == '__main__':
    sroka()
