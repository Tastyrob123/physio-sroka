#!/usr/bin/env python3
"""Drucksachen · Physiotherapie Sylvia Sroka: die EINE Quelle aller Texte der Werkstatt (Arten, Beispiele, Bereiche der Praxis, Aushänge, Vorlagen-Bibliothek).
   python3 werkzeuge/drucksachen/inhalte.py   → schreibt in start.js (ARTEN, INHALT, GRUPPEN, IN, WORTE), vorlagen.js (DS.BEISPIEL), katalog.js und haeuser/sroka/vorlagen/
Ersetzt die Restaurant-Inhalte der Vorlage (_vorlage/imprimerie, dort von _qa/vorlagen_varone.py geschrieben). Zweimal laufen = einmal laufen.
Jeder Satz steht so auf der Website (index.html, ueber-mich.html, daten/uebungen.json) oder setzt nur deren Angaben zusammen. Keine Preise, keine Fristen,
keine Heilversprechen. Alles, was Patientinnen und Patienten lesen, in der Sie-Form. Der Lauf bricht ab, wenn ein Satz Klammern, Preise oder Ausrufezeichen trägt."""
import json, os, re

HIER = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.dirname(os.path.dirname(HIER))
U = json.load(open(os.path.join(SITE, 'daten', 'uebungen.json'), encoding='utf-8'))
UE = {u['id']: u for g in U['gruppen'] for u in g['uebungen']}

TEL_H, TEL_R, MAIL, WEB = '0511 260 74 14', '0511 234 46 67', 'info@physio-sroka.de', 'physio-sroka.de'
ZEITEN, TERMINE = 'Mo – Fr · 8 – 19 Uhr', 'Termine nach Vereinbarung, Hausbesuche nach Absprache.'
HINWEIS = U['hinweis'].replace('mit mir', 'mit Sylvia Sroka')   # die Website spricht in der Ich-Form; auf dem Blatt ebenso möglich, hier neutral für jede Praxis-Hand


def uebung(k):
    u = UE[k]
    return {'name': u['name'], 'detail': u['menge'] + '. ' + ' '.join(u['schritte']), 'preis': ''}


STIL = lambda ausr='c', rahmen='einfach', titel=1, zeichen=1, bild=.56: {'ausr': ausr, 'rahmen': rahmen, 'titel': titel, 'zeichen': zeichen, 'ecke': 3, 'bild': bild}

# ---------- Beispiele je Aufbau (gelten, wo eine Art keinen eigenen Inhalt hat; Rückseiten kommen immer von hier) ----------
BEISPIEL = {
    'deckel': {'ueber': 'Hannover und Hemmingen', 'titel': 'Physiotherapie Sylvia Sroka', 'unter': 'Privatpraxis für Physio- und Körperpsychotherapie', 'text': 'Seit 1986 Physiotherapeutin.'},
    'buehne': {'bild': 'echt-hero-a', 'ueber': 'Physiotherapie', 'titel': 'Erst untersuchen. Dann behandeln.', 'text': 'Nach einer gründlichen Untersuchung besprechen wir gemeinsam, welche Behandlung Ihnen hilft. Ein unverbindliches Erstgespräch ist jederzeit möglich.', 'aktion': f'{ZEITEN} · {TEL_H}'},
    'ansicht': {'bild': 'echt-ruhe', 'titel': 'Ein Moment Ruhe', 'unter': 'Physiotherapie Sylvia Sroka'},
    'karte': {'ueber': 'Meine Schwerpunkte', 'titel': 'Bewegung und Funktion wiederherstellen', 'text': 'Dafür arbeite ich vor allem mit drei Verfahren.',
              'liste': [{'name': 'Neurologie', 'detail': 'Physiotherapie bei Erkrankungen des Nervensystems, etwa nach einem Schlaganfall oder bei Parkinson.', 'preis': ''},
                        {'name': 'Bobath', 'detail': 'Ein Behandlungskonzept, das gestörte Bewegungsabläufe Schritt für Schritt neu anbahnt.', 'preis': ''},
                        {'name': 'Craniosacral', 'detail': 'Eine sanfte Behandlung mit den Händen, vor allem an Kopf, Nacken und Rücken.', 'preis': ''}]},
    'einladung': {'ueber': 'Für Angehörige', 'titel': 'Begleitung und Entlastung', 'wann': 'Termine nach Vereinbarung', 'wo': 'Hannover und Hemmingen', 'text': 'Ich weiß aus eigener Erfahrung, was es heißt, einen Menschen zu pflegen.', 'aktion': TEL_H},
    'programm': {'ueber': 'Physiotherapie Sylvia Sroka', 'titel': 'So läuft eine Behandlung ab',
                 'termine': [{'wann': 'Ankommen', 'was': 'Sie erzählen, was Sie belastet und was Sie sich wünschen.', 'wo': ''}, {'wann': 'Untersuchen', 'was': 'Haltung und Bewegung genau ansehen.', 'wo': ''},
                             {'wann': 'Behandeln', 'was': 'Verspannungen lösen, Muskeln und Gelenke bewegen.', 'wo': ''}, {'wann': 'Weiter üben', 'was': 'Übungen für zu Hause.', 'wo': ''}]},
    'fenster': {'bild': 'echt-gespraech', 'ueber': 'Körper und Seele', 'titel': 'Stress zeigt sich oft zuerst im Körper', 'unter': 'Physiotherapie Sylvia Sroka', 'text': 'Deshalb verbinde ich Physiotherapie mit Entspannung, Achtsamkeit und Gesprächen.'},
    'geteilt': {'bild': 'echt-haende-halten', 'ueber': 'Für Angehörige', 'titel': 'Für Betroffene. Und für die, die sie pflegen.', 'text': 'Hausbesuche nach Absprache und Begleitung für Angehörige.', 'aktion': TEL_H},
    'gutschein': {'titel': 'Gutschein', 'unter': 'Physiotherapie Sylvia Sroka', 'wert': 'Eine Behandlung', 'text': 'Hannover und Hemmingen'},
    'aushang': {'ueber': 'Privatpraxis Sylvia Sroka', 'titel': 'Termine nach Vereinbarung', 'text': f'{ZEITEN}\nHausbesuche nach Absprache.\nRufen Sie an oder schreiben Sie mir. Ich behandle Privatpatienten.', 'aktion': f'{TEL_H} · {MAIL}'},
    'tuer': {'ueber': 'Physiotherapie', 'titel': 'Bitte klingeln', 'unter': 'Privatpraxis Sylvia Sroka', 'text': TERMINE, 'aktion': TEL_H},
    'rueckseite': {'text': TERMINE},
    'kartengruss': {'titel': 'Physiotherapie Sylvia Sroka', 'text': 'Hannover und Hemmingen'},
    'visite': {'titel': 'Sylvia Sroka', 'unter': 'Physiotherapie', 'text': 'Physiotherapeutin und Heilpraktikerin'},
    'kontakt': {'ueber': 'Hannover und Hemmingen', 'text': TERMINE},
    'termine': {'titel': 'Ihre nächsten Termine', 'text': f'Hannover {TEL_H} · Hemmingen {TEL_R}'},
    'brief': {},
    'umschlag': {'text': f'{WEB} · Hannover und Hemmingen'},
    'bewertung': {'ueber': 'Privatpraxis Sylvia Sroka · Hannover', 'titel': 'Wie war Ihre Behandlung?', 'text': 'Ihre Meinung hilft anderen, die eine Physiotherapie suchen. Der Code öffnet die Praxis in Google Maps, dort können Sie eine Rezension schreiben.', 'qr': 'qr-hannover', 'unter': 'Dieterichsstraße 25 · 30159 Hannover'},
}
BEW_HEM = dict(BEISPIEL['bewertung'], ueber='Physio Rosenpark · Hemmingen', qr='qr-hemmingen', unter='Berliner Straße 16 · 30966 Hemmingen')

UEBUNGSBLATT = {'ueber': 'Übungen für zu Hause', 'titel': 'Für Rücken und Nacken', 'text': 'Übungen für zu Hause helfen, dass das Erreichte im Alltag bleibt.',
                'liste': [uebung('katze-kuh'), uebung('becken-kippen') if 'becken-kippen' in UE else uebung('knie-zur-brust'), uebung('kinn-einziehen'), uebung('schulterkreisen') if 'schulterkreisen' in UE else uebung('kinn-einziehen')],
                'fuss': HINWEIS}
FALT_INNEN = [
    {'vorlage': 'programm', 'ton': 'hell', 'inhalt': {'ueber': 'Was in der Physiotherapie passiert', 'titel': 'So läuft eine Behandlung ab',
        'termine': [{'wann': 'Ankommen', 'was': 'Sie erzählen, was Sie belastet und was Sie sich wünschen. Das erste Gespräch ist unverbindlich.', 'wo': ''},
                    {'wann': 'Untersuchen', 'was': 'Ich sehe mir Haltung und Bewegung genau an und suche, woher die Beschwerden kommen.', 'wo': ''},
                    {'wann': 'Behandeln', 'was': 'Mit den Händen und gezielten Griffen werden Verspannungen gelöst.', 'wo': ''},
                    {'wann': 'Weiter üben', 'was': 'Übungen für zu Hause helfen, dass das Erreichte im Alltag bleibt.', 'wo': ''}]}},
    {'vorlage': 'karte', 'ton': 'hell', 'inhalt': BEISPIEL['karte']},
    {'vorlage': 'karte', 'ton': 'creme', 'inhalt': {'ueber': 'Wenn das Nervensystem betroffen ist', 'titel': 'Neurologie', 'text': 'Seit 1986 behandle ich vor allem neurologisch schwer und schwerst betroffene Menschen.',
        'liste': [{'name': 'Bewegung neu lernen', 'detail': 'Abläufe, die verloren gingen, werden Schritt für Schritt wieder angebahnt.', 'preis': ''},
                  {'name': 'Spannung regulieren', 'detail': 'Zu feste oder zu schwache Muskeln kommen wieder ins Gleichgewicht.', 'preis': ''},
                  {'name': 'Sicher stehen und gehen', 'detail': 'Gleichgewicht und Gehen werden gezielt geübt.', 'preis': ''},
                  {'name': 'Alltag zurückgewinnen', 'detail': 'Anziehen, Greifen, Aufstehen: das Ziel ist mehr Selbstständigkeit.', 'preis': ''}]}},
    {'vorlage': 'fenster', 'ton': 'dunkel', 'inhalt': BEISPIEL['fenster']},
]

# ---------- Arten (Start «Was möchtest du erstellen?») ----------
ARTEN = [
    dict(key='visitenkarte', name='Visitenkarte', satz='Vorne Zeichen und Name, hinten beide Standorte', format='visit', formate=['visit'],
         vorlagen=[['visite', 'dunkel'], ['visite', 'hell'], ['visite', 'creme']], beispiel='Eine Visitenkarte mit beiden Standorten', rueck='kontakt'),
    dict(key='terminkarte', name='Terminkarte', satz='Hinten Zeilen für die nächsten Termine', format='visit', formate=['visit'],
         vorlagen=[['visite', 'hell'], ['visite', 'dunkel'], ['visite', 'creme']], beispiel='Eine Terminkarte für die nächsten Termine', rueck='termine'),
    dict(key='uebungsblatt', name='Übungsblatt', satz='Übungen für zu Hause, mit Schritten und Menge', format='a4h', formate=['a4h', 'a5h'],
         vorlagen=[['karte', 'hell'], ['karte', 'creme'], ['buehne', 'hell']], beispiel='Ein Übungsblatt für Rücken und Nacken'),
    dict(key='aushang', name='Aushang an der Tür', satz='Öffnungszeiten, Termine, Hausbesuche', format='a4h', formate=['a4h', 'a5h', 'a3h'],
         vorlagen=[['aushang', 'hell'], ['aushang', 'dunkel'], ['aushang', 'creme'], ['buehne', 'dunkel']], beispiel='Ein Aushang mit den Öffnungszeiten'),
    dict(key='faltblatt', name='Faltblatt', satz='Sechs Seiten DIN lang: Behandlung, Schwerpunkte, Kontakt', format='dlh', formate=['dlh'],
         vorlagen=[['buehne', 'dunkel'], ['fenster', 'creme'], ['deckel', 'dunkel']], beispiel='Ein Faltblatt über die Praxis', rueck='kontakt', innen=FALT_INNEN),
    dict(key='briefpapier', name='Briefpapier', satz='A4 nach DIN 5008, beide Standorte im Fuß', format='a4h', formate=['a4h'],
         vorlagen=[['brief', 'hell'], ['brief', 'creme']], beispiel='Briefpapier der Praxis'),
    dict(key='umschlag', name='Umschlag', satz='DL für Briefe, mit Absender und Zeichen', format='dl', formate=['dl'],
         vorlagen=[['umschlag', 'hell'], ['umschlag', 'creme'], ['umschlag', 'dunkel']], beispiel='Ein Umschlag zum Briefpapier'),
    dict(key='bewertung', name='Karte für Bewertungen, Hannover', satz='Mit QR-Code zur Praxis in Google Maps', format='a6h', formate=['a6h', 'a6q'],
         vorlagen=[['bewertung', 'hell'], ['bewertung', 'dunkel'], ['bewertung', 'creme']], beispiel='Eine Karte für Bewertungen in Hannover'),
    dict(key='bewertung-hemmingen', name='Karte für Bewertungen, Hemmingen', satz='Mit QR-Code zum Physio Rosenpark in Google Maps', format='a6h', formate=['a6h', 'a6q'],
         vorlagen=[['bewertung', 'hell'], ['bewertung', 'dunkel'], ['bewertung', 'creme']], beispiel='Eine Karte für Bewertungen in Hemmingen'),
    dict(key='frei', name='Leeres Blatt', satz='Selbst gestalten, in jedem Format', format='a5h', formate=['a4h', 'a5h', 'a6h', 'a6q', 'dlh', 'visit', 'dl', 'a3h'], vorlagen=[], leer=True),
]
INHALT = {
    'visitenkarte': {'visite': BEISPIEL['visite']},
    'terminkarte': {'visite': {'titel': 'Ihr nächster Termin', 'unter': 'Physiotherapie Sylvia Sroka', 'text': 'Hannover und Hemmingen'}},
    'uebungsblatt': {'karte': UEBUNGSBLATT, 'buehne': {'bild': 'uebung-ruecken', 'ueber': 'Übungen für zu Hause', 'titel': UE['katze-kuh']['name'],
                     'text': ' '.join(UE['katze-kuh']['schritte']), 'aktion': UE['katze-kuh']['menge'], 'fuss': HINWEIS}},
    'aushang': {'aushang': BEISPIEL['aushang'], 'buehne': BEISPIEL['buehne']},
    'faltblatt': {'buehne': {'bild': 'echt-hero-a', 'ueber': 'Hannover und Hemmingen', 'titel': 'Physiotherapie Sylvia Sroka', 'text': 'Seit 1986 Physiotherapeutin. Meine Privatpraxis für Physio- und Körperpsychotherapie liegt in Hannover und Hemmingen.', 'aktion': TEL_H},
                  'fenster': {'bild': 'echt-hero-a', 'ueber': 'Hannover und Hemmingen', 'titel': 'Physiotherapie Sylvia Sroka', 'unter': 'Seit 1986', 'text': 'Erst untersuchen. Dann behandeln.'},
                  'deckel': BEISPIEL['deckel']},
    'briefpapier': {'brief': {}},
    'umschlag': {'umschlag': BEISPIEL['umschlag']},
    'bewertung': {'bewertung': BEISPIEL['bewertung']},
    'bewertung-hemmingen': {'bewertung': BEW_HEM},
}
GRUPPEN = [['alle', 'Alle'], ['karten', 'Karten'], ['blaetter', 'Blätter und Aushänge'], ['post', 'Briefe'], ['bewertung', 'Bewertungen']]
IN = {'visitenkarte': ['karten'], 'terminkarte': ['karten'], 'uebungsblatt': ['blaetter'], 'aushang': ['blaetter'], 'faltblatt': ['blaetter'], 'briefpapier': ['post'],
      'umschlag': ['post'], 'bewertung': ['bewertung', 'karten'], 'bewertung-hemmingen': ['bewertung', 'karten'], 'frei': []}
WORTE = {'visitenkarte': 'visitenkarte karte kontakt adresse telefon', 'terminkarte': 'terminkarte termin termine nächster karte',
         'uebungsblatt': 'übungsblatt übung übungen zuhause hause rücken nacken atem gleichgewicht plan', 'aushang': 'aushang tür öffnungszeiten zeiten schild hinweis praxis',
         'faltblatt': 'faltblatt flyer prospekt broschüre praxis schwerpunkte behandlung', 'briefpapier': 'briefpapier brief briefbogen a4',
         'umschlag': 'umschlag kuvert couvert brief dl', 'bewertung': 'bewertung bewertungen rezension google qr hannover karte', 'bewertung-hemmingen': 'bewertung bewertungen rezension google qr hemmingen rosenpark karte',
         'frei': 'leer leeres blatt eigenes frei format'}

# ---------- Katalog: Bereiche der Praxis und Aushänge ----------
def kv(n, wo, fmt, vorlage, ton, inhalt, rueck=None, innen=None, stil=None):
    x = {'n': n, 'wo': wo, 'format': fmt, 'vorlage': vorlage, 'ton': ton, 'inhalt': inhalt, 'rueck': rueck, 'stil': stil or STIL()}
    if innen: x['innen'] = innen
    return x
R_KONTAKT = {'vorlage': 'kontakt', 'inhalt': BEISPIEL['kontakt']}
R_TERMINE = {'vorlage': 'termine', 'inhalt': BEISPIEL['termine']}
ABTEILUNGEN = [
    {'k': 'empfang', 't': 'Empfang und Termine', 'satz': 'Was Patientinnen und Patienten mitnehmen: Visitenkarte, Terminkarte und die Zeiten an der Tür.', 'foto': 'termin-ankommen', 'vorlagen': [
        kv('Visitenkarte', 'zum Mitnehmen', 'visit', 'visite', 'dunkel', BEISPIEL['visite'], R_KONTAKT),
        kv('Terminkarte', 'nach jeder Behandlung', 'visit', 'visite', 'hell', INHALT['terminkarte']['visite'], R_TERMINE),
        kv('Öffnungszeiten an der Tür', 'an der Praxistür', 'a4h', 'aushang', 'hell', BEISPIEL['aushang']),
        kv('Zum ersten Termin', 'im Wartebereich', 'a5h', 'aushang', 'creme', {'ueber': 'Zum ersten Termin', 'titel': 'Bitte mitbringen', 'text': 'Bequeme Kleidung, ein großes Handtuch und, falls vorhanden, ärztliche Befunde oder eine Verordnung.', 'aktion': TEL_H})]},
    {'k': 'behandlung', 't': 'Behandlung und Übungen', 'satz': 'Was nach der Behandlung mit nach Hause geht: Übungsblatt und das Faltblatt über die Praxis.', 'foto': 'termin-behandeln', 'vorlagen': [
        kv('Übungsblatt Rücken und Nacken', 'zum Mitgeben', 'a4h', 'karte', 'hell', UEBUNGSBLATT),
        kv('Übungsblatt Atem', 'zum Mitgeben', 'a4h', 'karte', 'creme', {'ueber': 'Übungen für zu Hause', 'titel': 'Atem', 'text': 'Ruhiges Atmen entspannt Körper und Kopf und ist überall möglich.', 'liste': [uebung(k) for k in ('bauchatmung', 'lippenbremse', 'vier-sechs') if k in UE] or [uebung('bauchatmung')], 'fuss': HINWEIS}),
        kv('Faltblatt über die Praxis', 'am Empfang', 'dlh', 'buehne', 'dunkel', INHALT['faltblatt']['buehne'], R_KONTAKT, FALT_INNEN),
        kv('Schwerpunkte', 'im Behandlungsraum', 'a4h', 'karte', 'creme', BEISPIEL['karte'])]},
    {'k': 'zuhause', 't': 'Hausbesuche und Angehörige', 'satz': 'Für Menschen, denen der Weg in die Praxis schwerfällt, und für die, die sie pflegen.', 'foto': 'echt-angehoerige', 'vorlagen': [
        kv('Hausbesuche', 'zum Mitgeben', 'a5h', 'geteilt', 'hell', {'bild': 'echt-alltag', 'ueber': 'Zu Hause behandelt', 'titel': 'Hausbesuche', 'text': 'Wenn der Weg in die Praxis schwerfällt, komme ich nach Absprache zu Ihnen. Dort, wo der Alltag stattfindet, lässt er sich auch am besten üben.', 'aktion': TEL_H}),
        kv('Für Angehörige', 'im Wartebereich', 'a5h', 'buehne', 'dunkel', {'bild': 'echt-haende-halten', 'ueber': 'Für Angehörige', 'titel': 'Begleitung und Entlastung', 'text': 'Ich weiß aus eigener Erfahrung, was es heißt, einen Menschen zu pflegen. Auch Angehörige finden bei mir Begleitung und Entlastung.', 'aktion': TEL_H})]},
    {'k': 'post', 't': 'Briefe', 'satz': 'Briefpapier und Umschlag mit beiden Standorten, für Rechnungen und Schreiben.', 'foto': 'echt-gespraech', 'vorlagen': [
        kv('Briefpapier', 'für Schreiben und Rechnungen', 'a4h', 'brief', 'hell', {}),
        kv('Umschlag DL', 'zum Briefpapier', 'dl', 'umschlag', 'hell', BEISPIEL['umschlag'])]},
    {'k': 'bewertungen', 't': 'Bewertungen', 'satz': 'Karten mit dem QR-Code je Standort, zum Auslegen am Empfang.', 'foto': 'echt-haende-warm', 'vorlagen': [
        kv('Bewertungskarte Hannover', 'am Empfang in Hannover', 'a6h', 'bewertung', 'hell', BEISPIEL['bewertung']),
        kv('Bewertungskarte Hemmingen', 'am Empfang in Hemmingen', 'a6h', 'bewertung', 'hell', BEW_HEM)]},
]
HINWEISE = [
    kv('Öffnungszeiten', 'an der Praxistür', 'a4h', 'aushang', 'dunkel', BEISPIEL['aushang']),
    kv('Zum ersten Termin', 'im Wartebereich', 'a4h', 'aushang', 'hell', ABTEILUNGEN[0]['vorlagen'][3]['inhalt']),
    kv('Hausbesuche', 'an der Praxistür', 'a4h', 'aushang', 'creme', {'ueber': 'Zu Hause behandelt', 'titel': 'Hausbesuche nach Absprache', 'text': 'Wenn der Weg in die Praxis schwerfällt, komme ich nach Absprache zu Ihnen.', 'aktion': TEL_H}),
    kv('Fragebogen vorab', 'im Wartebereich', 'a4h', 'aushang', 'hell', {'ueber': 'Vor dem ersten Termin', 'titel': 'Fragebogen vorab', 'text': 'Den Fragebogen finden Sie auf der Website. Bringen Sie ihn ausgefüllt mit, dann bleibt mehr Zeit für Sie.', 'aktion': WEB}),
    kv('Zwei Orte, ein Anruf', 'an beiden Türen', 'a4h', 'aushang', 'dunkel', {'ueber': 'Hannover und Hemmingen', 'titel': 'Zwei Orte, ein Anruf', 'text': f'Hannover {TEL_H}\nHemmingen {TEL_R}\nRufen Sie an oder schreiben Sie mir.', 'aktion': MAIL}),
    kv('Ein Moment Ruhe', 'im Wartebereich', 'a4h', 'buehne', 'dunkel', {'bild': 'echt-ruhe', 'ueber': 'Ein Moment Ruhe', 'titel': 'Vier ein, sechs aus', 'text': 'Atmen Sie eine Minute lang mit, vier Sekunden ein, sechs Sekunden aus.', 'aktion': 'Physiotherapie Sylvia Sroka'}),
]
# Bibliothek: je Art die Kombinationen aus Aufbau, Grund und Stil (geprüft am Satz, siehe pruefen/werkzeuge.js)
def bibliothek():
    aus = {}
    for a in ARTEN:
        if a.get('leer'): continue
        L, n = [], 0
        for v, t in a['vorlagen']:
            for st in (STIL(), STIL('l', 'ohne', 1.04, .9), STIL('c', 'doppelt', .96, 1.1)):
                if v in ('brief', 'umschlag', 'kontakt', 'termine', 'karte') and st['ausr'] == 'l': continue
                n += 1
                x = {'id': f"{a['key']}-{n:03d}", 'titel': f"{a['name']}, {({'dunkel': 'Nacht', 'hell': 'Licht', 'creme': 'Sand'})[t]}" + ('' if n <= 3 else f' {n}'), 'bereich': a['name'],
                     'vorlage': v, 'ton': t, 'stil': st, 'inhalt': (INHALT.get(a['key'], {}).get(v)) or BEISPIEL[v]}
                if a.get('innen'): x['innen'] = a['innen']
                L.append(x)
        aus[a['key']] = {'art': a['key'], 'format': a['format'], 'vorlagen': L}
    return aus


def pruefe(o, weg=''):
    if isinstance(o, dict):
        for k, v in o.items(): pruefe(v, weg + '.' + str(k))
    elif isinstance(o, list):
        for i, v in enumerate(o): pruefe(v, weg + f'[{i}]')
    elif isinstance(o, str):
        if re.search(r'\[|\]|€|EUR\b|!', o): raise SystemExit('Unzulässig in ' + weg + ': ' + o)


def js(o): return json.dumps(o, ensure_ascii=False)


def ersetze(datei, muster, neu):
    p = os.path.join(HIER, datei); s = open(p, encoding='utf-8').read()
    s2, n = re.subn(muster, lambda m: neu, s, count=1, flags=re.S)
    if n != 1: raise SystemExit(f'nicht gefunden in {datei}: {muster[:40]}')
    open(p, 'w', encoding='utf-8').write(s2)


def main():
    B = bibliothek()
    for o in (BEISPIEL, ARTEN, INHALT, ABTEILUNGEN, HINWEISE, B): pruefe(o)
    arten_js = 'const ARTEN = [\n' + ',\n'.join('    ' + js(a) for a in ARTEN) + ',\n  ];'
    ersetze('start.js', r'const ARTEN = \[\n.*?\n  \];', arten_js)
    ersetze('start.js', r'const INHALT = \{.*?\};\n', 'const INHALT = ' + js(INHALT) + ';\n')
    ersetze('start.js', r'const GRUPPEN = \[.*?\];\n', 'const GRUPPEN = ' + js(GRUPPEN) + ';\n')
    ersetze('start.js', r'const IN = \{.*?\};\n', 'const IN = ' + js(IN) + ';\n')
    ersetze('start.js', r'const WORTE = \{.*?\};\n', 'const WORTE = ' + js(WORTE) + ';\n')
    ersetze('vorlagen.js', r'DS\.BEISPIEL = \{.*?\};\n', 'DS.BEISPIEL = ' + js(BEISPIEL) + ';\n')
    ersetze('katalog.js', r'const ABTEILUNGEN = .*?;\n', 'const ABTEILUNGEN = ' + js(ABTEILUNGEN) + ';\n')
    ersetze('katalog.js', r'const HINWEISE = .*?;\n', 'const HINWEISE = ' + js(HINWEISE) + ';\n')
    ersetze('katalog.js', r'const NEWSLETTER = .*?;\n', 'const NEWSLETTER = [];\n')
    ersetze('katalog.js', r'const ANLAESSE = .*?;\n', 'const ANLAESSE = [];\n')
    ersetze('katalog.js', r'const MOTIVE = .*?;\n', 'const MOTIVE = {};\n')
    VD = os.path.join(HIER, 'haeuser', 'sroka', 'vorlagen')
    for f in os.listdir(VD): os.remove(os.path.join(VD, f))
    ix = []
    for k, v in B.items():
        json.dump(v, open(os.path.join(VD, k + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
        ix.append({'art': k, 'format': v['format'], 'zahl': len(v['vorlagen'])})
    json.dump(ix, open(os.path.join(VD, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    print('Arten', len(ARTEN), '· Bereiche', len(ABTEILUNGEN), '· Aushänge', len(HINWEISE), '· Vorlagen', sum(x['zahl'] for x in ix))


if __name__ == '__main__':
    main()
