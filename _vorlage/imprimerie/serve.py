#!/usr/bin/env python3
"""Drucksachen & Feed («Drucksachen & Feed») · Restaurant Gilles Varone, eigener Server:  python3 serve.py [port]   (Standard 9717) → http://127.0.0.1:9717/_werkzeuge/imprimerie/
Start im Hintergrund (HAUS-GV.md): nohup python3 _werkzeuge/imprimerie/serve.py 9717 > _werkzeuge/_server-logs/imprimerie.log 2>&1 &
Umgekleidet am 09.11.2026 aus der Vorlage Wirtschaft am Schlössli (dort serve.py). Bildet die Wege der Werkzeuge nach: das Markenbuch (Markenbuch)
liegt daneben unter /_werkzeuge/livre/, die gemeinsamen Dateien der Werkzeuge (_werkzeuge/assets/: Fotos, Schriften, Zeichen, Flechtmuster) unter /assets/…,
das Oberflächen-Paket (_werkzeuge/oberflaeche/) unter /assets/oberflaeche/. Alles nur lesend, nur diese Wege; die Website im Stamm wird nie geändert.

KI: keine. /api/entwurf antwortet immer mit einer Probe-Antwort aus den geprüften Vorlagen des Hauses (kostet nichts, Regel 54); KI ist fest aus (KI = False),
es wird kein Schlüssel gelesen, weder aus der Umgebung noch aus dem Vault.
Wache wie online (api/entwurf.py wache): fremde Herkunft 403, nur JSON 415, Grösse 413, 40 Entwürfe je Stunde und Absender 429.
Markenprüfung (POST /_werkzeuge/livre/api/pruefen) geht an den Server des Markenbuchs (LIVRE_SERVER, Standard http://127.0.0.1:9715, _werkzeuge/livre/server.py);
die Prüfung dort nutzt KI und wird hier nie von selbst ausgelöst."""
import glob, json, os, re, sys, time, urllib.error, urllib.request
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import unquote

HIER = os.path.dirname(os.path.abspath(__file__))
WZ = os.path.dirname(HIER)                                     # _werkzeuge (gemeinsame Dateien in assets/, Oberfläche in oberflaeche/)
DH = os.path.dirname(WZ)                                       # Gilles Varone Savièse (Projektordner, Website im Stamm, nur gelesen)
A = os.path.join(WZ, 'assets')
LIVRE = os.path.join(WZ, 'livre')
sys.path.insert(0, os.path.join(HIER, 'api'))
import entwurf as E  # noqa: E402

WEG = '/_werkzeuge/imprimerie/'
KI = False   # Restaurant Gilles Varone: keine KI (Auftrag 09.11.2026, HAUS-GV.md «Verboten»); der Entwurf «in einem Satz» kommt immer aus probe()
LIVRE_SERVER = os.environ.get('LIVRE_SERVER', 'http://127.0.0.1:9715')
NUR_LESEN = {   # Weg → Ordner, nur diese Dateiarten
    '/_werkzeuge/livre/livre.json': (os.path.join(LIVRE, 'livre.json'), None),
    '/_werkzeuge/livre/dateien/': (os.path.join(LIVRE, 'dateien'), r'\.(png|svg|webp|jpg|css|json|ase|zip|ttf|woff2?)$'),
    '/_werkzeuge/livre/fotos/': (os.path.join(LIVRE, 'fotos'), r'\.(webp|jpg|png)$'),
    '/assets/img/': (os.path.join(A, 'img'), r'\.(webp|jpg|png|svg)$'),
    '/assets/svg/': (os.path.join(A, 'svg'), r'\.(svg|png)$'),
    '/assets/logo/': (os.path.join(A, 'logo'), r'\.(svg|png)$'),
    # Werkzeug-Oberfläche «Die Bühne» des Hauses (_werkzeuge/oberflaeche/, Kleid kleid/varone.*)
    '/assets/oberflaeche/': (os.path.join(WZ, 'oberflaeche'), r'\.(css|js|svg)$'),
    '/assets/fonts/': (os.path.join(A, 'fonts'), r'\.(woff2?|ttf)$'),
}


# Wörter, an denen der Auftrag die Art erkennt (Schlüssel der Arten sind intern; «tisch» allein steht in «am Tisch»)
ART_WORT = {'tisch': 'tischaufsteller', 'zimmerkarte': 'willkommenskarte', 'menueeinleger': 'menükarte', 'speisekarte': 'expérience', 'getraenke': 'accords',
            'postkarte': 'ansichtskarte', 'tagungsmappe': 'gruppenmappe', 'stoerung': 'aushang', 'teamaushang': 'team', 'weinempfehlung': 'accords', 'beileger': 'beileger'}


def probe(daten):
    """Nachgestellte Antwort im Format der KI, gebaut aus den geprüften Vorlagen des Hauses (Wörter des Auftrags gegen Titel und Text)."""
    if str(daten.get('haus') or 'varone') != 'varone':
        raise ValueError('Unbekanntes Haus')
    if daten.get('bildtext'):   # Bildtext ohne KI: aus den Texten des Beitrags selbst (Titel, Satz, Zeile), im Wortlaut der Vorlage, dazu die Hashtags des Hauses
        bt = daten['bildtext']; teile = []
        for sd in (bt.get('seiten') or [])[:10]:
            if not isinstance(sd, dict):
                continue
            for k in ('titel', 'text', 'unter', 'aktion'):
                t = str(sd.get(k) or '').strip()
                if t and t not in teile and len(' '.join(teile)) < 600:
                    teile.append(t)
            for t in sd.get('texte') or []:
                t = str(t).strip()
                if t and t not in teile and len(' '.join(teile)) < 600:
                    teile.append(t)
        text = '\n\n'.join(teile[:3]) or 'Restaurant Gilles Varone · Saint-Germain, Savièse'
        return {'bildtext': {'text': text, 'hashtags': ['GillesVarone', 'Savièse', 'Valais', 'GaultMillau', 'GuideMichelin'],
                             'hinweise': ['Ohne KI: der Bildtext übernimmt Titel und Satz des Beitrags im Wortlaut des Hauses; frei bearbeiten, dann kopieren.'], 'sprache': 'fr'}, 'verbrauch': {}}
    if str(daten.get('haus') or 'varone') != 'varone':   # wie api/entwurf.py: nur das eigene Haus
        raise ValueError('Unbekanntes Haus')
    auftrag = str(daten.get('auftrag') or '').strip()[:1500]
    if len(auftrag) < 4:
        raise ValueError('Auftrag fehlt')
    woerter = {w for w in re.findall(r'[a-zäöüéèêàâçîôû]{4,}', auftrag.lower())}
    beste = []
    for f in glob.glob(os.path.join(HIER, 'haeuser', 'varone', 'vorlagen', '*.json')):
        if f.endswith('index.json'):
            continue
        d = json.load(open(f, encoding='utf-8'))
        if daten.get('format') and d['format'] != daten['format']:
            continue
        for v in d['vorlagen']:
            t = (v['titel'] + ' ' + json.dumps(v['inhalt'], ensure_ascii=False)).lower()
            art = os.path.basename(f)[:-5]   # nennt der Auftrag die Art («Flyer», «Plakat» …), geht diese vor
            wort = ART_WORT.get(art, art)
            beste.append((sum(w in t for w in woerter) + (3 if wort in auftrag.lower() else 0), d['format'], v))
    beste.sort(key=lambda x: -x[0])
    if not beste:
        raise ValueError('Keine passende Vorlage')
    _, fmt, v = beste[0]
    seite = lambda vorlage, ton: {'vorlage': vorlage, 'ton': ton, 'inhalt': v['inhalt']}
    hinweis = ['Beispiel: gewählt wurde die passendste fertige Vorlage «' + v['titel'] + '». Texte, Fotos, Format und Grund lassen sich danach direkt auf dem Blatt ändern (Entwurf ohne KI).']
    if daten.get('varianten'):
        andere = [('buehne', 'dunkel'), ('fenster', 'creme'), ('geteilt', 'hell'), ('aushang', 'dunkel'), ('deckel', 'creme')]
        varianten = [{'titel': 'Wie die Vorlage', 'seiten': [seite(v['vorlage'], v['ton'])]}]
        for a, t in andere:
            if len(varianten) == 5:
                break
            if (a, t) != (v['vorlage'], v['ton']) and (a not in ('buehne', 'fenster', 'geteilt') or v['inhalt'].get('bild')):
                varianten.append({'titel': {'buehne': 'Foto gross', 'fenster': 'Ruhig im Rahmen', 'geteilt': 'Foto und Text', 'aushang': 'Nur Schrift', 'deckel': 'Titelblatt'}[a] + ', ' + {'dunkel': 'Nuit', 'creme': 'Sable', 'hell': 'Papier'}[t], 'seiten': [seite(a, t)]})
        while len(varianten) < 5:
            varianten.append({'titel': 'Titelblatt, Papier', 'seiten': [seite('deckel', 'hell')]})
        return {'entwuerfe': {'name': v['titel'], 'format': fmt, 'varianten': varianten, 'hinweise': hinweis}, 'verbrauch': {}}
    return {'entwurf': {'name': v['titel'], 'format': fmt, 'seiten': [seite(v['vorlage'], v['ton'])], 'hinweise': hinweis}, 'verbrauch': {}}


def entwurf_antwort(kopf, ip, roh):
    """Für einen anderen Server des Hauses: POST /_werkzeuge/imprimerie/api/entwurf → (code, antwort). Gleiche Wache und Probe wie hier, ohne KI."""
    nein = E.wache({k.lower(): v for k, v in kopf.items()}, ip)
    if nein:
        return nein[0], {'fehler': nein[1]}
    try:
        daten = json.loads(roh or b'{}')
        return 200, (E.entwurf(daten) if KI else probe(daten))
    except ValueError as e:
        return 400, {'fehler': str(e)}
    except Exception as e:
        return 502, {'fehler': str(e)}


class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=HIER, **k)

    def _json(self, code, o):
        b = json.dumps(o, ensure_ascii=False).encode('utf-8')
        self.send_response(code); self.send_header('content-type', 'application/json; charset=utf-8'); self.send_header('content-length', str(len(b))); self.end_headers()
        self.wfile.write(b)

    def translate_path(self, path):
        p = unquote(path.split('?')[0].split('#')[0])
        for weg, (ziel, art) in NUR_LESEN.items():
            if p == weg or (weg.endswith('/') and p.startswith(weg)):
                f = os.path.normpath(os.path.join(ziel, p[len(weg):])) if weg.endswith('/') else ziel
                if (f == ziel or f.startswith(ziel + os.sep)) and (art is None or re.search(art, f)):
                    return f
                return os.path.join(HIER, '__gesperrt__')
        if p.startswith(WEG):
            return super().translate_path(path.replace(WEG, '/', 1))
        return os.path.join(HIER, '__gesperrt__')

    def send_head(self):
        """Nie ausliefern: Punkt-Dateien, Prüfordner, Quellen (Python, Markdown), Daten der KI. Online gehen sie gar nicht erst mit."""
        teile = [x for x in unquote(self.path.split('?')[0].split('#')[0]).split('/') if x]
        if teile[:2] == ['_werkzeuge', 'imprimerie']:
            innen = teile[2:]
            if any(x.startswith('.') or x == '__pycache__' for x in innen) or (innen and innen[0] in ('_qa', 'api')) or (innen and innen[-1].endswith(('.py', '.pyc', '.md'))):
                self.send_error(404); return None
        return super().send_head()

    def do_GET(self):
        p = self.path.split('?')[0]
        if p in ('/', '/_werkzeuge/imprimerie'):
            self.send_response(302); self.send_header('location', WEG); self.end_headers(); return
        if p == WEG + 'api/entwurf':   # Lebenszeichen wie online (pruefung.html), ohne KI-Aufruf
            return self._json(200, {'ok': True, 'modell': E.MODELL, 'schluessel': KI, 'probe': not KI})
        return super().do_GET()

    def end_headers(self):
        self.send_header('cache-control', 'no-store')
        super().end_headers()

    def do_POST(self):
        p = self.path.split('?')[0]
        marke = p == '/_werkzeuge/livre/api/pruefen'
        nein = E.wache({k.lower(): v for k, v in self.headers.items()}, self.client_address[0], groesse=25_000_000 if marke else E.GROESSE, zaehlen=not marke)
        if nein:
            return self._json(nein[0], {'fehler': nein[1]})
        n = int(self.headers.get('content-length') or 0)
        roh = self.rfile.read(n)
        if marke:   # Markenprüfung nutzt KI: in diesem Haus aus (keine KI, Auftrag 09.11.2026); nichts wird weitergereicht
            return self._json(503, {'fehler': 'KI aus · Die Markenprüfung nutzt KI und ist bei Drucksachen & Feed ausgeschaltet. Die Druckprüfung prüft ohne KI.'})
        if marke:   # (Vorlage) an den Server von «Markenbuch», unverändert
            req = urllib.request.Request(LIVRE_SERVER + p, data=roh, method='POST', headers={'content-type': 'application/json'})
            try:
                with urllib.request.urlopen(req, timeout=240) as r:
                    code, b = r.status, r.read()
            except urllib.error.HTTPError as e:
                code, b = e.code, e.read()
            except Exception as e:
                code, b = 502, json.dumps({'fehler': 'LIVRE · Markenbuch ist nicht erreichbar (' + str(e)[:80] + ')'}, ensure_ascii=False).encode('utf-8')
            self.send_response(code); self.send_header('content-type', 'application/json; charset=utf-8'); self.send_header('content-length', str(len(b))); self.end_headers()
            return self.wfile.write(b)
        if p != WEG + 'api/entwurf':
            return self.send_error(404)
        try:
            daten = json.loads(roh or b'{}')
            out, code = (E.entwurf(daten) if KI else probe(daten)), 200
        except ValueError as e:
            out, code = {'fehler': str(e)}, 400
        except Exception as e:
            out, code = {'fehler': str(e)}, 502
        if not KI:
            time.sleep(.4)
        self._json(code, out)

    def log_message(self, f, *a):
        if '/api/' in str(a[:1]):
            sys.stderr.write(f % a + '\n')


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 9717
    print(f'Drucksachen & Feed (Drucksachen & Feed) · Restaurant Gilles Varone: http://127.0.0.1:{port}{WEG}  (KI: {"echt" if KI else "Probe, ohne Kosten"})', flush=True)
    ThreadingHTTPServer(('127.0.0.1', port), H).serve_forever()
