#!/usr/bin/env python3
"""Drucksachen & Feed («Drucksachen & Feed») · Restaurant Gilles Varone, Savièse: legt die Marke des Hauses für das Studio an (nichts abgetippt, alles aus dem Projekt gelesen).
   python3 bau.py   → haeuser/varone/ (marke.json, schriften, tapete, bilder, mini, kopf, mail) + api/_daten/varone.json
                      (das Wissen dazu baut _qa/wissen_bau.py → api/_daten/varone-wissen.txt)
Umgekleidet am 09.11.2026 aus der Vorlage Wirtschaft am Schlössli (Aufbau dieses Skripts gleich, Hausfunktion neu).
Quellen (alle im Projekt des Hauses, nur gelesen; die Website im Stamm wird nie geändert):
  Farben      assets/gv.css :root (Nacht, Gold, Papier, Sand, Bronze) — dieselben Werte trägt die Website und _werkzeuge/HAUS-GV.md «Kleid»
  Schriften   schrift/*.ttf: Gill Sans Nova Book (Titel und Text, aus der Wortmarke), Gill Sans Nova Medium (Betonung, nie kursiv),
              Caviar Dreams (kleine Zeilen in gesperrten Versalien); statische Schnitte, keine variablen Schriften (Fehlerbuch Type 3)
  Zeichen     _werkzeuge/assets/svg/zeichen.svg: das Monogramm GV, Pfad unverändert, nur in absolute Punkte im Nullpunkt umgerechnet
  Zierde      _werkzeuge/assets/svg/zierde.svg: die Zierde «xx» des Hauses (zwei gekreuzte Goldlinien), ersetzt im Satz den kurzen Trennstrich
  Tapete      _werkzeuge/assets/img/geflecht.png: das Flechtmuster des Hauses (Gold auf durchsichtig), je Grund in eigener Deckkraft
  Fotos       bilder/<key>.webp (grösste Fassung der Website), Beschreibung aus den alt-Texten der fünf Seiten. Nur echte Fotos des Hauses.
Die Schlüssel der Farben (navy, papier, creme, weiss, gold, taupe, messing …) sind die Rollen, die der Kern des Studios kennt;
die Werte und Namen sind die des Hauses (navy = Nuit, gold = Or, taupe = Or foncé, messing = Bronze, creme = Sable)."""
import glob, html, json, os, re, shutil
from PIL import Image

HIER = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(os.path.dirname(HIER))          # Gilles Varone Savièse (Website im Stamm)
WZ = os.path.dirname(HIER)                             # _werkzeuge
Z = os.path.join(HIER, 'haeuser', 'varone')

ROLLEN = ['Eigene Fotos', 'Saal & Küche', 'Teller', 'Am Tisch', 'Desserts', 'Team', 'Auszeichnungen', 'Savièse']
GRUPPE = {
    'saal-kueche': 'Saal & Küche', 'salle-gv': 'Saal & Küche', 'salle-jour': 'Saal & Küche', 'cuisine': 'Saal & Küche', 'cuisine-2': 'Saal & Küche',
    'comptoir': 'Saal & Küche', 'comptoir-2': 'Saal & Küche',
    'teller-gross': 'Teller', 'noir-1': 'Teller', 'noir-2': 'Teller', 'jus': 'Teller', 'poisson': 'Teller', 'soupe': 'Teller', 'assiette-table': 'Teller',
    'teller-1': 'Teller', 'teller-2': 'Teller', 'teller-3': 'Teller', 'teller-4': 'Teller', 'teller-5': 'Teller', 'teller-6': 'Teller', 'teller-7': 'Teller',
    'teller-8': 'Teller', 'teller-9': 'Teller',
    'mains': 'Am Tisch', 'verse-1': 'Am Tisch', 'verse-2': 'Am Tisch', 'verse-3': 'Am Tisch', 'verse-4': 'Am Tisch', 'bougie-1': 'Am Tisch', 'bougie-2': 'Am Tisch',
    'dessert-cuillere': 'Desserts', 'dessert-holz': 'Desserts',
    'chef-anrichten': 'Team', 'chef-dunkel': 'Team', 'chef-fenster': 'Team', 'chef-glas': 'Team', 'chef-herd': 'Team', 'chef-lachen': 'Team', 'chef-pass': 'Team',
    'chef-saal': 'Team', 'chef-schuerze': 'Team', 'chef-schwarz': 'Team', 'chef-weiss': 'Team', 'brigade': 'Team', 'couple': 'Team', 'gilles-letizia': 'Team',
    'letizia-saal': 'Team', 'p-gilles': 'Team', 'p-letizia': 'Team', 'p-andrea': 'Team', 'p-wesley': 'Team', 'p-lise': 'Team', 'p-ana': 'Team',
    'award-zu-dritt': 'Auszeichnungen', 'buehne-team': 'Auszeichnungen',
    'plan-saviese': 'Savièse',
}
# Fotos, die die Werkstatt nicht zeigt (Grund steht dabei)
RAUS = {
    'saal-alpen': 'Alpenblick, unscharf (Robert: nicht gross zeigen); im Druck würde er gross',
    'haus': 'Doppel von saal-kueche (Hausbild der Werkzeuge), eine Aussenansicht hat das Haus nicht',
    'teller-gross-xl': 'Doppel von teller-gross',
    'chef-fenster': 'erstes Lokal in Chandolin (Holz, Bogenfenster), nicht der heutige Raum (CHARAKTER.md 5)',
    'chef-schuerze': 'erstes Lokal in Chandolin (Holz, Bogenfenster), nicht der heutige Raum (CHARAKTER.md 5)',
    'chef-weiss': 'erstes Lokal in Chandolin (Holz, Bogenfenster), nicht der heutige Raum (CHARAKTER.md 5)',
}
# Beschreibung, wo die Website kein alt nennt (französisch wie die alt-Texte der Website, nur was das Foto zeigt; angesehen 09.11.2026)
ALT_ERSATZ = {
    'teller-gross': 'Assiette signature du chef', 'plan-saviese': 'Plan d’accès du restaurant à Saint Germain, Savièse',
    'saal-kueche': 'La salle du restaurant et la cuisine ouverte, le soir', 'salle-gv': 'La salle du restaurant et le monogramme GV',
    'salle-jour': 'La salle du restaurant', 'cuisine': 'La cuisine ouverte', 'cuisine-2': 'La cuisine ouverte',
    'comptoir': 'Le comptoir face à la cuisine ouverte, le soir', 'gilles-letizia': 'Gilles et Letizia Varone',
    'teller-9': 'Assiette de saison aux herbes', 'verse-4': 'La sauce versée sur la betterave',
}
# Ansichten des Studios: Foto im Kopf (1200 px, haeuser/varone/kopf/; buehne.js). Nur Raum- und Tellerfotos, keine Porträts (HAUS-GV «Bilder»)
KOPF = ['saal-kueche', 'salle-gv', 'salle-jour', 'cuisine', 'comptoir', 'comptoir-2', 'teller-gross', 'noir-1', 'jus', 'poisson', 'mains', 'verse-1', 'verse-2', 'verse-3',
        'bougie-1', 'bougie-2', 'dessert-holz', 'dessert-cuillere', 'assiette-table', 'soupe']


def zahlen(d):
    return [float(x) for x in re.findall(r'-?(?:\d+\.\d*|\.\d+|\d+)(?:e-?\d+)?', d)]


def pfad_absolut(d):
    """SVG-Pfad (M m L l H h V v C c S s Q q Z z, auch Kurzschreibweise «-.31-.56») → Liste absoluter Befehle (M/L/C/Z)."""
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
    """Das Monogramm GV (_werkzeuge/assets/svg/zeichen.svg), Höhe 140 Einheiten, Ursprung oben links (Fehlerbuch: Ursprung der viewBox)."""
    svg = open(os.path.join(WZ, 'assets', 'svg', 'zeichen.svg'), encoding='utf-8').read()
    ges = [pfad_absolut(d) for d in re.findall(r'\sd="([^"]+)"', svg)]
    pts = [(t[k], t[k + 1]) for p in ges for t in p if t[0] != 'Z' for k in range(1, len(t), 2)]
    x0, y0, x1, y1 = min(p[0] for p in pts), min(p[1] for p in pts), max(p[0] for p in pts), max(p[1] for p in pts)
    k = 140 / (y1 - y0)
    f = lambda v: f'{v:.2f}'.rstrip('0').rstrip('.')
    aus = []
    for p in ges:
        s = []
        for t in p:
            if t[0] == 'Z':
                s.append('Z'); continue
            s.append(t[0] + ' '.join(f((t[j] - x0) * k) if j % 2 == 1 else f((t[j] - y0) * k) for j in range(1, len(t))))
        aus.append(''.join(s))
    return aus, [0, 0, round((x1 - x0) * k, 2), 140]


def zierde():
    """Die Zierde «xx»: zwei gekreuzte Linien (polyline, Strich 1.5 in der viewBox 62.87 × 13.02). Als Linienzug mit Strichbreite, Ursprung oben links."""
    svg = open(os.path.join(WZ, 'assets', 'svg', 'zierde.svg'), encoding='utf-8').read()
    vb = [float(x) for x in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    strich = float(re.search(r'stroke-width:([\d.]+)', svg).group(1))
    pfade = []
    for pts in re.findall(r'points="([^"]+)"', svg):
        z = zahlen(pts)
        pfade.append('M' + ' L'.join(f'{z[i] - vb[0]:.2f} {z[i + 1] - vb[1]:.2f}' for i in range(0, len(z), 2)))
    return dict(vb=[0, 0, vb[2], vb[3]], pfade=pfade, strich=strich, verh=round(vb[3] / vb[2], 4), name='La zierde «xx»')


def tapete(farbe, deckung, ziel):
    """Flechtmuster (262 × 314 px, Gold mit Deckkraft bis 100/255) in eigener Farbe und Deckkraft als WebP mit Alpha."""
    g = Image.open(os.path.join(WZ, 'assets', 'img', 'geflecht.png')).convert('RGBA')
    r, gg, b = (int(farbe[i:i + 2], 16) for i in (1, 3, 5))
    a = g.getchannel('A').point(lambda v: min(255, round(v * deckung)))
    neu = Image.new('RGBA', g.size, (r, gg, b, 0)); neu.putalpha(a)
    neu.save(ziel, 'WEBP', lossless=True)


def alt_texte():
    """alt-Texte der fünf Seiten der Website je Foto (erste nicht leere Nennung)."""
    alt = {}
    for f in ('index.html', 'restaurant.html', 'experiences.html', 'equipe.html', 'infos.html'):
        s = open(os.path.join(PROJ, f), encoding='utf-8').read()
        for tag in re.findall(r'<img\b[^>]*>', s):
            m, a = re.search(r'src="(?:\./)?bilder/([a-z0-9-]+?)(?:-m)?\.(?:webp|jpg|png)', tag), re.search(r'alt="([^"]*)"', tag)
            if m and a and a.group(1).strip() and m.group(1) not in alt:
                alt[m.group(1)] = html.unescape(a.group(1).strip())
    return alt


def varone():
    for u in ('schriften', 'bilder', 'mini', 'kopf', 'mail'):
        os.makedirs(os.path.join(Z, u), exist_ok=True)

    css = open(os.path.join(PROJ, 'assets', 'gv.css'), encoding='utf-8').read()
    V = {k: v.lower() for k, v in re.findall(r'--([a-z0-9-]+):(#[0-9a-fA-F]{6})', css[css.index(':root{'):css.index('}', css.index(':root{'))])}
    F = dict(navy=V['nuit'], nacht=V['nuit3'], blau=V['nuit2'], tinte=V['encre'], papier=V['papier'], creme=V['sable'], weiss=V['creme'],
             gold=V['or'], taupe=V['or2'], messing=V['bronze'], tanne=V['nuit2'], kander=V['or-hell'], laden=V['or2'])
    N = dict(navy='Nuit', nacht='Nuit profonde', blau='Nuit claire', tinte='Encre', papier='Papier', creme='Sable', weiss='Crème', gold='Or',
             taupe='Or foncé', messing='Bronze', tanne='Nuit claire', kander='Or clair', laden='Or foncé')

    pfade, vb = zeichen()

    SD = os.path.join(PROJ, 'schrift')
    SCHRIFTEN = {
        'titel': ('Gill Sans Nova', 'GillSansNova-Book.ttf', 'Titel, Gill Sans Nova Book 400 wie die Wortmarke GILLES VARONE; nie fett, nie kursiv'),
        'kapitale': ('Gill Sans Nova', 'GillSansNova-Book.ttf', 'Namen in Versalien, gesperrt wie die Wortmarke'),
        'text': ('Gill Sans Nova', 'GillSansNova-Book.ttf', 'Fliesstext, wie auf der Website'),
        'kursiv': ('Gill Sans Nova Medium', 'GillSansNova-Medium.ttf', 'Betonung; das Haus setzt nie kursiv'),
        'mono': ('Caviar Dreams', 'CaviarDreams.ttf', 'kleine Zeilen in gesperrten Versalien, wie Leiste und Knöpfe der Website'),
    }
    for _, (_, datei, _) in SCHRIFTEN.items():
        shutil.copy2(os.path.join(SD, datei), os.path.join(Z, 'schriften', datei))
    for alt in glob.glob(os.path.join(Z, 'schriften', '*.ttf')):
        if os.path.basename(alt) not in {d for _, d, _ in SCHRIFTEN.values()}:
            os.remove(alt)

    # Tapete: das Flechtmuster. Auf der Website Gold Ton in Ton auf Nacht; im Druck etwas kräftiger, auf hellen Flächen in Bronze. In der Oberfläche leiser.
    tapete(F['gold'], .62, os.path.join(Z, 'tapete-dunkel.webp'))
    tapete(F['messing'], .42, os.path.join(Z, 'tapete-hell.webp'))
    tapete(F['gold'], .4, os.path.join(Z, 'tapete-ui-dunkel.webp'))
    tapete(F['messing'], .26, os.path.join(Z, 'tapete-ui-hell.webp'))

    # Grund der Newsletter-Mails: Nacht mit dem Flechtmuster, als JPG
    tapete(F['gold'], .34, os.path.join(Z, 'mail', '_tapete.webp'))   # leiser als im Druck: in der Mail Ton in Ton wie auf der Website
    t = Image.open(os.path.join(Z, 'mail', '_tapete.webp')).convert('RGBA'); g = Image.new('RGBA', t.size, F['navy']); g.alpha_composite(t); os.remove(os.path.join(Z, 'mail', '_tapete.webp'))
    g.convert('RGB').save(os.path.join(Z, 'mail', '_tapete.jpg'), 'JPEG', quality=88)

    # Fotos
    ALT = alt_texte()
    LIVRE = os.path.join(WZ, 'livre')
    LJ = os.path.join(LIVRE, 'livre.json')
    LV = {}
    if os.path.exists(LJ):
        L = json.load(open(LJ, encoding='utf-8'))
        if 'Varone' in str(L.get('haus') or ''):   # I18: «Markenbuch» gilt nur, wenn es dieses Haus nennt
            LV = {f['k']: f for f in L.get('fotos', [])}
    bilder, neu, raus = [], 0, []
    for key in RAUS:
        for u, e in (('bilder', '.webp'), ('mini', '.webp'), ('mail', '.jpg'), ('kopf', '.webp')):
            if os.path.exists(os.path.join(Z, u, key + e)): os.remove(os.path.join(Z, u, key + e))
    for key in sorted(k for k in GRUPPE if k not in RAUS):
        q = os.path.join(PROJ, 'bilder', key + '.webp')
        if not os.path.exists(q):
            raus.append(key); continue
        alt = ALT.get(key) or ALT_ERSATZ.get(key)
        if not alt:
            raise SystemExit('Foto ohne Beschreibung: ' + key)
        ziel, mini = os.path.join(Z, 'bilder', key + '.webp'), os.path.join(Z, 'mini', key + '.webp')
        im = Image.open(q); w, h = im.size
        if not os.path.exists(ziel) or os.path.getmtime(ziel) < os.path.getmtime(q) or Image.open(ziel).size != (w, h):
            shutil.copy2(q, ziel); neu += 1
            for a in (mini, os.path.join(Z, 'mail', key + '.jpg'), os.path.join(Z, 'kopf', key + '.webp')):
                if os.path.exists(a): os.remove(a)
        if not os.path.exists(mini):
            k = im.convert('RGB'); k.thumbnail((520, 520), Image.LANCZOS); k.save(mini, 'WEBP', quality=76, method=5)
        mail = os.path.join(Z, 'mail', key + '.jpg')
        if not os.path.exists(mail):
            k = im.convert('RGB'); k.thumbnail((1200, 1200), Image.LANCZOS); k.save(mail, 'JPEG', quality=78, optimize=True, progressive=True)
        if key in KOPF and not os.path.exists(os.path.join(Z, 'kopf', key + '.webp')):
            k = im.convert('RGB'); k.thumbnail((1200, 1200), Image.LANCZOS); k.save(os.path.join(Z, 'kopf', key + '.webp'), 'WEBP', quality=80, method=5)
        bilder.append(dict(key=key, alt=alt, w=w, h=h, gruppe=GRUPPE[key]))
    bilder.sort(key=lambda b: (ROLLEN.index(b['gruppe']), b['key']))

    marke = dict(
        key='varone', name='Restaurant Gilles Varone', voll='Restaurant Gilles Varone', ort='Savièse', artikel='des Restaurants Gilles Varone',
        zeile='Saint-Germain, Savièse', satz='Une expérience fine, remarquable et différente.',
        adr='Rue du Stade 5B · 1965 Savièse', tel='027 565 89 20', mail='info@gillesvarone.ch', web='www.gillesvarone.ch',
        farben=F, farbnamen=N,
        toene=dict(
            dunkel=dict(grund='navy', tapete='dunkel', titel='weiss', text='papier', mono='gold', linie='gold', zeichen='gold', schild='gold', schild_text='navy'),
            hell=dict(grund='papier', tapete=None, titel='navy', text='tinte', mono='taupe', linie='taupe', zeichen='taupe', schild='navy', schild_text='gold'),
            creme=dict(grund='creme', tapete='hell', titel='navy', text='tinte', mono='messing', linie='taupe', zeichen='taupe', schild='navy', schild_text='gold'),
        ),
        schriften={k: dict(familie=f, datei=d, wofuer=w) for k, (f, d, w) in SCHRIFTEN.items()},
        tapete=dict(dunkel='tapete-dunkel.webp', hell='tapete-hell.webp', rapport_mm=12),
        zeichen=dict(vb=vb, pfade=pfade, verh=vb[3] / vb[2], name='Le monogramme GV'),
        zierde=zierde(),
        gutschein=dict(titel='Bon cadeau', felder=['Pour', 'De', 'N°']),   # Felder des Gutscheins in der Sprache des Hauses (vorlagen.js V.gutschein)
        betriebe=[('L’expérience en 5 services', 'Amuse-Bouche – Première Entrée – Deuxième Entrée – Plat Principal – Dessert'),
                  ('L’expérience en 6 services', 'Amuse-Bouche – Entrée – Poisson – Plat Principal – Pré-Dessert – Dessert'),
                  ('L’expérience en 7 services', 'Amuse-Bouche – Première Entrée – Deuxième Entrée – Poisson – Plat Principal – Pré-Dessert – Dessert'),
                  ('L’expérience chasse locale', 'Uniquement durant le mois d’octobre, selon les disponibilités'),
                  ('Les expériences végétariennes', 'Sur demande préalable uniquement'),
                  ('Pour les groupes', 'plus de 8 personnes, par le biais de demandes spéciales'),
                  ('Les accords', 'accords mets et vins et accords mets et créations sans alcool'),
                  ('Bons cadeaux', 'personnalisés, montants à choix')],
        regeln=['Das Haus spricht Französisch: alles, was ein Gast liest, auf Französisch, im Wortlaut der Website (vous, warm, präzise).',
                'Immer Wertigkeit: der einzelne Gast, der einzelne Teller, Sorgfalt und Handarbeit. Nie Menge, Abfertigung, Stückzahlen als Pointe.',
                'Keine Preise auf Drucksachen der Werkstatt; die Weinkarte ist nicht veröffentlicht, keine Weine nennen.',
                'Zeiten wie auf der Website: «Jeudi 18h30 – 00h00», «Vendredi & Samedi 12h00 – 16h00 · 19h00 – 00h00», «Dimanche 12h00 – 16h00», «Lundi – Mercredi fermé».',
                'Titel kurz, in Gill Sans Nova Book 400, nie fett, nie kursiv. Kleine Zeilen in Caviar Dreams, gesperrte Versalien.',
                'Dunkle Flächen in Nuit mit dem Flechtmuster in Gold; Gold für Zeichen, Zierde «xx», Linien und kleine Zeilen. Rot nur im Zeichen des Guide Michelin.',
                'Zwischen Titel und Text steht die Zierde «xx», nie ein Ausrufezeichen im Titel.',
                'Fotos nur echte Fotos des Hauses; Porträts nie angeschnitten, keine Porträts als Hintergrund.',
                'Das Haus heisst «Restaurant Gilles Varone», Rue du Stade 5B, 1965 Savièse (Saint-Germain). Kein Hotel, keine Zimmer.'],
        bilder=bilder,
        raus=sorted(set(raus) | set(RAUS)),
    )
    json.dump(marke, open(os.path.join(Z, 'marke.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    json.dump({}, open(os.path.join(Z, 'druck.json'), 'w'))   # gedruckt wird die grösste Fassung der Website (I03)

    D = os.path.join(HIER, 'api', '_daten')
    os.makedirs(D, exist_ok=True)
    ki = {k: v for k, v in marke.items() if k not in ('zeichen', 'zierde', 'bilder')}
    ki['bilder'] = [f"{b['key']} | {'quer' if b['w'] > b['h'] * 1.1 else 'hoch' if b['h'] > b['w'] * 1.1 else 'quadratisch'} | {b['alt']}" for b in bilder]
    json.dump(ki, open(os.path.join(D, 'varone.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print('varone:', len(bilder), 'Fotos,', neu, 'neu kopiert,', len(marke['raus']), 'nicht übernommen,', len(pfade), 'Pfade im Zeichen', vb, ',',
          len(os.listdir(os.path.join(Z, 'kopf'))), 'Köpfe', '· Markenbuch', 'gelesen' if LV else 'noch nicht für dieses Haus (eigene Kopie)')


if __name__ == '__main__':
    varone()
