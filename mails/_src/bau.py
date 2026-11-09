#!/usr/bin/env python3
"""Physiotherapie Sylvia Sroka: zwölf Mails an Patienten, als Idee zum Entwurf (09.11.2026).
Umgekleidet aus der Vorlage Gilles Varone (mails/_src/bau.py dort): gleiche Teile, gleiche Übersicht.

Jede Mail folgt einem Schritt, den die Praxis wirklich kennt (Terminanfrage über die Website, Bestätigung, Erinnerung, Übungsplan, Verschieben,
Absage, Rechnung für Privatpatienten, Bewertung, Hausbesuch, Unternehmen, Schliesszeit, Englisch). Deutsch in Sie-Form, im Ton der Website.
Keine Preise, keine Fristen. Ein Zeichen je Mail, Gruss von Sylvia Sroka. Namen und Daten sind Beispielwerte und so beschriftet. Gebaut, nie verschickt.

Aufruf:  python3 mails/_src/bau.py  → mails/NN-<fall>/index.html, mails/index.html, mails/img/;  danach WB_PORT=9726 node mails/_src/aufnahme.js"""
import html, json, os, shutil

HIER = os.path.dirname(os.path.abspath(__file__)); MAILS = os.path.dirname(HIER); ROOT = os.path.dirname(MAILS)
from PIL import Image  # noqa: E402

e = html.escape
NACHT, TIEF, PAPIER, BLATT, SAND, TINTE, GOLD, HELL, DUNKEL = '#0e0d0b', '#080706', '#e9e1d4', '#f3eee5', '#e9e1d4', '#1b1915', '#b1996a', '#cdb78b', '#8a7650'
SERIF = "'Cormorant Garamond',Georgia,'Times New Roman',serif"
SANS = "Manrope,'Helvetica Neue',Arial,sans-serif"
KLEIN = SANS
ADRESSE = 'Dieterichsstraße 25 · 30159 Hannover'
TEL = '0511 260 74 14'
MAIL = 'info@physio-sroka.de'
GRUSS = 'Sylvia Sroka'
STAND = '09.11.2026'
ZEITEN = 'Montag bis Freitag, 8 bis 19 Uhr. Termine nach Vereinbarung, Hausbesuche nach Absprache.'
MITBRINGEN = 'Bringen Sie gern bequeme Kleidung, ein großes Handtuch und, falls vorhanden, ärztliche Befunde oder eine Verordnung mit.'
HANNOVER, HEMMINGEN = 'Hannover, Dieterichsstraße 25', 'Hemmingen, Physio Rosenpark, Berliner Straße 16'

FAELLE = [
    dict(nr='01', wann='Wenn jemand über die Website anfragt', ordner='01-anfrage', name='Antwort auf eine Terminanfrage', satz='Kommt nach einer Anfrage über die Website: ein erster Termin zum Bestätigen, dazu, was man mitbringt.',
         betreff='Ihre Terminanfrage', titel=('Ihr erster', 'Termin.'), foto=('termin-ankommen', 'Ankommen in der Praxis'),
         text=['Liebe Frau Beispiel,', 'vielen Dank für Ihre Anfrage. Gern biete ich Ihnen einen ersten Termin an.',
               'Bitte geben Sie mir kurz Bescheid, ob der Termin für Sie passt.', MITBRINGEN],
         karte=('Ihr Termin', [('Tag', 'Dienstag, 17. November 2026'), ('Uhrzeit', '10:30 Uhr'), ('Ort', HANNOVER)]),
         knopf=('So läuft eine Behandlung ab', 'index.html#ablauf'), dazu=ZEITEN),
    dict(nr='02', wann='Nach einer telefonischen Vereinbarung', ordner='02-bestaetigung', name='Terminbestätigung', satz='Bestätigt den vereinbarten Termin und lädt ein, den Fragebogen vorher auszufüllen.',
         betreff='Ihr Termin am 17. November', titel=('Ihr Termin', 'steht.'), foto=('termin-untersuchen', 'Die Untersuchung'),
         text=['Liebe Frau Beispiel,', 'hiermit bestätige ich Ihren Termin.',
               'Wenn Sie möchten, können Sie den Fragebogen auf meiner Website schon vorher ausfüllen. Dann haben wir beim ersten Termin mehr Zeit für Sie.',
               'Ich freue mich auf Sie.'],
         karte=('Ihr Termin', [('Tag', 'Dienstag, 17. November 2026'), ('Uhrzeit', '10:30 Uhr'), ('Ort', HANNOVER)]),
         knopf=('Fragebogen ausfüllen', 'anamnese.html'), dazu=MITBRINGEN),
    dict(nr='03', wann='Einen Tag vor dem Termin', ordner='03-erinnerung', name='Erinnerung am Vortag', satz='Eine kurze Erinnerung am Tag davor, mit der Nummer für den Fall, dass etwas dazwischenkommt.',
         betreff='Erinnerung: Ihr Termin morgen', titel=('Bis morgen', 'in der Praxis.'), foto=('echt-haende-warm', 'Hände in warmem Licht'),
         text=['Lieber Herr Muster,', 'nur eine kurze Erinnerung: Wir sehen uns morgen.',
               f'Falls etwas dazwischenkommt, rufen Sie mich bitte kurz an: {TEL}.', 'Bis morgen'],
         karte=('Ihr Termin', [('Tag', 'Mittwoch, 18. November 2026'), ('Uhrzeit', '16:00 Uhr'), ('Ort', HEMMINGEN)]),
         knopf=('Anfahrt und Kontakt', 'index.html#kontakt'), dazu=ZEITEN),
    dict(nr='04', wann='Nach dem ersten Termin', ordner='04-uebungen', name='Ihre Übungen für zu Hause', satz='Kommt nach dem ersten Termin, mit dem Übungsplan im Anhang und dem Weg zu den Übungen auf der Website.',
         betreff='Ihre Übungen für zu Hause', titel=('Ihre Übungen', 'für zu Hause.'), foto=('uebung-nacken', 'Eine Übung für Nacken und Schultern'),
         text=['Liebe Frau Beispiel,', 'schön, dass Sie heute da waren. Im Anhang finden Sie Ihren Übungsplan.',
               'Die Übungen können Sie auch jederzeit auf meiner Website nachlesen, unter «Übungen».', 'Bitte üben Sie in Ruhe und hören Sie auf, wenn etwas schmerzt.'],
         karte=('Ihr Plan', [('Rücken', 'Katze und Kuh, 10 Mal langsam'), ('Nacken', 'Kinn einziehen, 10 Mal, je 5 Sekunden'), ('Atem', 'Vier ein, sechs aus, 1 Minute')]),
         knopf=('Alle Übungen ansehen', 'uebungen.html'), dazu='Bis zum nächsten Mal.'),
    dict(nr='05', wann='Wenn Sie einen Termin verschieben müssen', ordner='05-verschieben', name='Termin verschieben', satz='Wenn Du einen Termin verschieben musst: ein neuer Vorschlag, freundlich und kurz.',
         betreff='Ihr Termin am 24. November', titel=('Ein neuer', 'Termin.'), foto=('echt-ruhe', 'Ein ruhiger Raum'),
         text=['Lieber Herr Muster,', 'leider muss ich Ihren Termin am 24. November um 9:00 Uhr verschieben. Das tut mir leid.',
               'Ich kann Ihnen stattdessen den unten genannten Termin anbieten. Passt Ihnen das? Sonst finden wir gern einen anderen.'],
         karte=('Neuer Vorschlag', [('Tag', 'Donnerstag, 26. November 2026'), ('Uhrzeit', '9:00 Uhr'), ('Ort', HANNOVER)]),
         knopf=('Kontakt', 'index.html#kontakt'), dazu=f'Telefon {TEL}.'),
    dict(nr='06', wann='Wenn ein Patient absagt', ordner='06-absage', name='Absage bestätigen', satz='Wenn ein Patient absagt: kurz bestätigt, mit dem Weg zu einem neuen Termin.',
         betreff='Ihre Absage', titel=('Danke', 'für Ihre Nachricht.'), foto=('echt-alltag', 'Bewegung im Alltag'),
         text=['Liebe Frau Beispiel,', 'vielen Dank für Ihre Nachricht, ich habe Ihren Termin gestrichen.',
               f'Wenn Sie einen neuen Termin möchten, melden Sie sich gern, telefonisch unter {TEL} oder über meine Website.', 'Gute Besserung'],
         karte=('Gestrichen', [('Tag', 'Freitag, 20. November 2026'), ('Uhrzeit', '11:00 Uhr'), ('Ort', HANNOVER)]),
         knopf=('Termin anfragen', 'index.html#terminanfrage'), dazu=ZEITEN),
    dict(nr='07', wann='Mit der Rechnung im Anhang', ordner='07-rechnung', name='Rechnung', satz='Die Rechnung für Privatpatienten im Anhang, mit dem Hinweis zur Krankenversicherung und Beihilfe.',
         betreff='Ihre Rechnung 2026-014', titel=('Ihre', 'Rechnung.'), foto=('echt-gespraech', 'Ein ruhiges Gespräch'),
         text=['Liebe Frau Beispiel,', 'im Anhang erhalten Sie die Rechnung für Ihre Behandlungen.',
               'Sie können sie bei Ihrer privaten Krankenversicherung oder der Beihilfe einreichen.', 'Bei Fragen melden Sie sich gern.'],
         karte=('Rechnung', [('Nummer', '2026-014'), ('Zeitraum', 'Oktober bis November 2026'), ('Praxis', HANNOVER)]),
         knopf=('Fragen und Kosten', 'fragen.html'), dazu=ZEITEN),
    dict(nr='08', wann='Nach einer abgeschlossenen Behandlung', ordner='08-bewertung', name='Bitte um eine Bewertung', satz='Nach einer abgeschlossenen Behandlung: eine leise Bitte um ein paar Worte bei Google.',
         betreff='Eine kleine Bitte', titel=('Eine kleine', 'Bitte.'), foto=('echt-yoga', 'Ruhe nach der Bewegung'),
         text=['Lieber Herr Muster,', 'ich hoffe, es geht Ihnen gut.',
               'Wenn Sie mit meiner Behandlung zufrieden waren, würde ich mich über eine kurze Bewertung bei Google sehr freuen. So finden auch andere Menschen leichter zu mir.',
               'Vielen Dank und alles Gute'],
         karte=('Ihre Behandlung', [('Praxis', HEMMINGEN), ('Zeitraum', 'September bis November 2026')]),
         knopf=('Zur Website', 'index.html'), dazu='Vielen Dank.'),
    dict(nr='09', wann='Wenn Sie zu jemandem nach Hause kommen', ordner='09-hausbesuch', name='Hausbesuch bestätigen', satz='Bestätigt einen Hausbesuch mit Tag, Uhrzeit und Adresse.',
         betreff='Ihr Hausbesuch am 19. November', titel=('Ich komme', 'zu Ihnen.'), foto=('echt-haende-halten', 'Hände, die einander halten'),
         text=['Liebe Frau Beispiel,', 'ich komme zu dem unten genannten Termin zu Ihnen nach Hause.',
               'Bitte halten Sie, wenn möglich, etwas Platz frei, damit wir uns gut bewegen können.', f'Wenn sich etwas ändert, erreichen Sie mich unter {TEL}.'],
         karte=('Ihr Hausbesuch', [('Tag', 'Donnerstag, 19. November 2026'), ('Uhrzeit', 'gegen 14:00 Uhr'), ('Adresse', 'Musterweg 3, 30159 Hannover')]),
         knopf=('Für Angehörige', 'angehoerige.html'), dazu='Hausbesuche nach Absprache.'),
    dict(nr='10', wann='Antwort auf eine Seminaranfrage', ordner='10-unternehmen', name='Anfrage eines Unternehmens', satz='Antwort an eine Firma, die ein Seminar zu Stressbewältigung möchte: drei Fragen und die Bitte um ein Telefonat.',
         betreff='Ihre Anfrage für ein Seminar', titel=('Ihr Team,', 'in Ruhe.'), foto=('unternehmen', 'Ein Arbeitsplatz'),
         text=['Sehr geehrte Frau Beispiel,', 'vielen Dank für Ihr Interesse. Gern biete ich für Ihr Team ein Seminar zu Stressbewältigung, Entspannung und Achtsamkeit an.',
               'Damit ich Ihnen ein Angebot machen kann, würde ich gern kurz mit Ihnen sprechen: Wie viele Mitarbeiter, welcher Rahmen und welches Ziel? Wann passt Ihnen ein Telefonat?'],
         karte=('Ihre Anfrage', [('Firma', 'Beispiel GmbH, Hannover'), ('Thema', 'Stressbewältigung'), ('Mitarbeiter', 'etwa 12')]),
         knopf=('Für Unternehmen', 'unternehmen.html'), dazu=f'Telefon {TEL}.'),
    dict(nr='11', wann='Vor Urlaub oder Feiertagen', ordner='11-geschlossen', name='Praxis geschlossen', satz='Vor Urlaub oder Feiertagen an alle Patienten: wann die Praxis zu ist und wie man trotzdem anfragt.',
         betreff='Meine Praxis ist vom 23. Dezember bis 3. Januar geschlossen', titel=('Eine kleine', 'Pause.'), foto=('echt-seele', 'Ein ruhiger Moment'),
         text=['Liebe Patientinnen und Patienten,', 'meine Praxis bleibt über die Feiertage geschlossen. Ab dem 4. Januar bin ich wieder für Sie da.',
               'Termine können Sie schon jetzt über meine Website anfragen, ich melde mich nach meiner Rückkehr.'],
         karte=('Geschlossen', [('Von', 'Mittwoch, 23. Dezember 2026'), ('Bis', 'Sonntag, 3. Januar 2027'), ('Wieder da', 'Montag, 4. Januar 2027')]),
         knopf=('Termin anfragen', 'index.html#terminanfrage'), dazu='Beispieldaten.'),
    dict(nr='12', wann='Für internationale Patienten', ordner='12-englisch', name='Antwort auf Englisch', satz='Die Antwort auf eine Anfrage auf Englisch, mit dem Weg zur englischen Seite.',
         betreff='Your appointment request', titel=('Your first', 'appointment.'), foto=('termin-behandeln', 'A treatment'),
         text=['Dear Ms Example,', 'Thank you for your request. I would be happy to offer you a first appointment.',
               'Please let me know if this suits you. Comfortable clothes and a large towel are all you need to bring.'],
         karte=('Your appointment', [('Day', 'Tuesday, 17 November 2026'), ('Time', '10:30'), ('Place', 'Hanover, Dieterichsstraße 25')]),
         knopf=('English website', 'en/index.html'), dazu='Monday to Friday, 8 am to 7 pm.'),
]
SIGNATUR = ('sylvia', 'Sylvia Sroka')


def _quelle(key):
    for s in (1800, 1200, 600):
        p = os.path.join(ROOT, '_werkzeuge', 'assets', 'img', f'{key}-{s}.webp')
        if os.path.exists(p):
            return p
    raise SystemExit('Foto fehlt: ' + key)


def bilder():
    """Fotos 1000 px, unter 100 KB (Qualität sinkt, bis es passt); alte Bilder der Vorlage weg."""
    z0 = os.path.join(MAILS, 'img'); os.makedirs(z0, exist_ok=True)
    behalten = {f['foto'][0] + '.jpg' for f in FAELLE} | {SIGNATUR[0] + '.jpg', 'logo.png', 'zeichen.png'}
    for n in os.listdir(z0):
        if n not in behalten:
            os.remove(os.path.join(z0, n))
    for key in [f['foto'][0] for f in FAELLE] + [SIGNATUR[0]]:
        im = Image.open(_quelle(key)).convert('RGB'); w, h = im.size; nh = round(w * 9 / 16)
        if nh < h:
            y = round((h - nh) * (.22 if key == 'sylvia' else .5)); im = im.crop((0, y, w, y + nh))
        if im.width > 1000:
            im = im.resize((1000, round(im.height * 1000 / im.width)), Image.LANCZOS)
        z = os.path.join(z0, key + '.jpg')
        for br, qu in ((1000, 80), (1000, 72), (1000, 64), (900, 66), (820, 64), (760, 62)):
            k = im.resize((br, round(im.height * br / im.width)), Image.LANCZOS) if br < im.width else im
            k.save(z, quality=qu, optimize=True, progressive=True)
            if os.path.getsize(z) < 100_000:
                break


def mail(f, basis):
    """basis: Adresse der Website, relativ aus dem Ordner der Mail (Vorschau) oder voll (Versand)."""
    zeilen = ''.join(f'<tr><td style="padding:12px 0;border-top:1px solid rgba(177,153,106,.3);font:400 10.5px/1.3 {KLEIN};letter-spacing:.2em;text-transform:uppercase;color:{GOLD};width:38%;vertical-align:top">{e(k)}</td>'
                     f'<td style="padding:11px 0;border-top:1px solid rgba(177,153,106,.3);font:400 16px/1.4 {SANS};color:{BLATT}">{e(v)}</td></tr>' for k, v in f['karte'][1])
    absaetze = f'<p style="margin:0 0 14px;font:500 22px/1.3 {SERIF};color:{TINTE}">{e(f["text"][0])}</p>' + ''.join(
        f'<p style="margin:0 0 14px;font:400 16.5px/1.62 {SANS};color:#2e2b25">{e(t)}</p>' for t in f['text'][1:])
    return f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>{e(f['betreff'])} · Physiotherapie Sylvia Sroka</title>
<style>@font-face{{font-family:'Cormorant Garamond';font-weight:300 700;src:url('../../_werkzeuge/assets/fonts/CormorantGaramond.woff2') format('woff2')}}@font-face{{font-family:'Manrope';font-weight:200 800;src:url('../../_werkzeuge/assets/fonts/Manrope.woff2') format('woff2')}}</style></head>
<body style="margin:0;padding:0;background:{NACHT}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{NACHT}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background:{BLATT};border-radius:18px;overflow:hidden;box-shadow:0 0 0 1px rgba(177,153,106,.35),0 30px 60px -30px rgba(0,0,0,.9)">
  <tr><td align="center" style="background:{NACHT};padding:36px 30px 32px;border-bottom:1px solid {GOLD}">
    <img src="../img/logo.png" width="150" alt="Sylvia Sroka" style="display:block;border:0;width:150px;height:auto;margin:0 auto 12px">
    <div style="font:400 10.5px/1.2 {KLEIN};letter-spacing:.3em;text-transform:uppercase;color:{HELL}">Physiotherapie · Hannover und Hemmingen</div>
    <h1 style="margin:28px 0 0;font:500 clamp(30px,8vw,40px)/1.1 {SERIF};color:{BLATT}">{e(f['titel'][0])}<br><span style="color:{GOLD}">{e(f['titel'][1])}</span></h1>
  </td></tr>
  <tr><td style="padding:34px clamp(22px,6vw,40px) 8px">{absaetze}</td></tr>
  <tr><td style="padding:6px 28px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{SAND};border-radius:6px"><tr><td style="padding:8px">
    <img src="../img/{f['foto'][0]}.jpg" width="528" alt="{e(f['foto'][1])}" style="display:block;border:0;width:100%;height:auto;border-radius:4px;box-shadow:0 0 0 1px {GOLD}"></td></tr></table></td></tr>
  <tr><td style="padding:14px 28px 6px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{NACHT};border-radius:10px;box-shadow:inset 0 1px 0 rgba(205,183,139,.35)">
    <tr><td style="padding:22px 26px 12px"><div style="font:400 10.5px/1.2 {KLEIN};letter-spacing:.24em;text-transform:uppercase;color:{HELL};padding-bottom:12px">{e(f['karte'][0])} · Beispiel</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">{zeilen}</table></td></tr></table></td></tr>
  <tr><td align="center" style="padding:26px 30px 8px"><a href="{basis}{f['knopf'][1]}" style="display:inline-block;padding:8px 8px 8px 26px;border-radius:999px;background:{GOLD};background-image:linear-gradient(180deg,#d8c49c,{GOLD} 55%,#9c8457);font:500 12px/30px {KLEIN};letter-spacing:.14em;text-transform:uppercase;color:{TINTE};text-decoration:none">{e(f['knopf'][0])}&nbsp;&nbsp;&nbsp;<span style="display:inline-block;width:30px;height:30px;border-radius:50%;background:{NACHT};color:{GOLD};text-align:center;font:400 14px/30px Arial,sans-serif;vertical-align:middle">→</span></a></td></tr>
  <tr><td style="padding:16px 40px 30px"><p style="margin:0;font:400 15px/1.6 {SANS};color:#55504a;text-align:center">{e(f['dazu'])}</p>
    <img src="../img/{SIGNATUR[0]}.jpg" width="520" alt="{e(SIGNATUR[1])}" style="display:block;border:0;width:100%;max-width:520px;height:auto;margin:26px auto 0;border-radius:4px">
    <p style="margin:16px 0 0;font:400 17px/1.45 {SERIF};color:{TINTE};text-align:center">Herzliche Grüße<br>{e(GRUSS)}</p></td></tr>
  <tr><td style="padding:0 16px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:{NACHT};border-radius:12px"><tr><td align="center" style="padding:24px 24px">
    <div style="font:500 20px/1.3 {SERIF};color:{BLATT}">Physiotherapie Sylvia Sroka</div>
    <div style="margin-top:8px;font:400 13.5px/1.6 {SANS};color:{HELL}">{e(ADRESSE)} · Telefon 0511 260 74 14<br>Physio Rosenpark · Berliner Straße 16 · 30966 Hemmingen · Telefon 0511 234 46 67<br>{e(MAIL)}</div></td></tr></table></td></tr>
</table>
</td></tr></table>
</body></html>
'''


def eingebettet(f):
    """Die Mail steht direkt in der Übersicht (wie in der Vorlage), nur die Bildwege von hier aus."""
    t = mail(f, '../')
    t = t[t.index('<body'):]; t = t[t.index('>') + 1:t.rindex('</body>')]
    return t.replace('src="../img/', 'src="img/')


def uebersicht():
    pf = lambda d: f'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="{d}"/></svg>'
    karten = ''.join(f'''<article class="mb">
  <div class="mb-ueber"><span class="mb-nr">{f['nr']}</span><span class="mb-ueber__t"><b>{e(f['name'])}</b><small><span>Von</span> Sylvia Sroka · {e(MAIL)}</small><small><span>Wann</span> {e(f['wann'])}</small><small><span>Betreff</span> {e(f['betreff'])}</small></span></div>
  <div class="mb-blatt"><div class="mb-in">{eingebettet(f)}</div></div>
  <p class="mb-ganz auf-x"><button type="button" class="mb-kn" aria-expanded="false"><span class="a">Ganze Mail</span><span class="z">Weniger zeigen</span><i>{pf('M4 6l4 4 4-4')}</i></button></p>
</article>''' for f in FAELLE)
    return f'''<!doctype html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow">
<title>Zwölf Mails · Sylvia Sroka</title>
<link rel="icon" href="img/zeichen.png">
<style>
@font-face{{font-family:'Cormorant Garamond';font-weight:300 700;font-display:swap;src:url('../_werkzeuge/assets/fonts/CormorantGaramond.woff2') format('woff2')}}
@font-face{{font-family:'Manrope';font-weight:200 800;font-display:swap;src:url('../_werkzeuge/assets/fonts/Manrope.woff2') format('woff2')}}
*{{box-sizing:border-box}}html{{-webkit-text-size-adjust:100%}}
body{{margin:0;background:{NACHT};color:{BLATT};font:400 17px/1.6 Manrope,system-ui,sans-serif;--rand:clamp(20px,4.6vw,76px)}}
body::before{{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:url(../_werkzeuge/assets/img/tapete-dunkel.png) 0 0/360px 360px repeat;opacity:.6}}
header.kopf{{padding:clamp(56px,8vw,120px) var(--rand) clamp(30px,4vw,60px);text-align:center}}
header.kopf img{{width:clamp(50px,5.9vw,84px);height:auto}}
h1{{margin:clamp(14px,1.6vw,24px) 0 0;font:500 clamp(2.4rem,6vw,5.6rem)/1.05 'Cormorant Garamond',Georgia,serif}}h1 em{{font-style:normal;color:{GOLD}}}
header.kopf p{{max-width:60ch;margin:clamp(18px,2.1vw,32px) auto 0;color:rgba(243,238,229,.86)}}
main{{padding:0 0 clamp(60px,8vw,120px)}}
.band{{display:flex;gap:clamp(20px,2.4vw,40px);align-items:flex-start;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-padding-inline:var(--rand);padding:4px var(--rand) 34px;scrollbar-width:none;-webkit-overflow-scrolling:touch}}
.band::-webkit-scrollbar{{display:none}}
.band:focus-visible{{outline:2px solid {GOLD};outline-offset:-2px}}
.mb{{flex:0 0 clamp(300px,34vw,520px);scroll-snap-align:start}}
.mb:last-child{{margin-inline-end:var(--rand)}}
.mb-ueber{{display:flex;gap:16px;align-items:flex-start;margin:0 0 18px;padding:16px 18px;border-radius:14px;background:rgba(25,23,20,.94);box-shadow:inset 0 1px 0 rgba(205,183,139,.18),0 0 0 1px rgba(177,153,106,.24)}}
.mb-nr{{font:500 2.6rem/.9 'Cormorant Garamond',Georgia,serif;color:{GOLD}}}
.mb-ueber__t{{display:flex;flex-direction:column;gap:5px;min-width:0}}
.mb-ueber__t b{{font:500 1.4rem/1.2 'Cormorant Garamond',Georgia,serif}}
.mb-ueber__t small{{font-size:.86rem;line-height:1.4;color:rgba(243,238,229,.74)}}
.mb-ueber__t small span{{display:inline-block;min-width:5.4em;font:500 10px/1.4 Manrope,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:{GOLD}}}
.mb-blatt{{position:relative;height:640px;border-radius:20px;overflow:hidden;background:{NACHT};box-shadow:0 0 0 1px rgba(177,153,106,.3),0 40px 50px -30px rgba(0,0,0,.9);-webkit-mask-image:linear-gradient(#000 68%,transparent);mask-image:linear-gradient(#000 68%,transparent)}}
.mb.auf .mb-blatt{{-webkit-mask-image:none;mask-image:none}}
.mb-in{{position:relative}}.mb-in table{{max-width:100%}}
.mb-ganz{{position:relative;margin:-30px 0 0;text-align:center}}
.mb.auf .mb-ganz{{margin-top:22px}}
.mb-kn{{display:inline-flex;align-items:center;gap:12px;padding:8px 8px 8px 22px;border:0;border-radius:999px;cursor:pointer;font:500 11.5px/1 Manrope,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:{TINTE};
  background:linear-gradient(180deg,#d8c49c,{GOLD} 55%,#9c8457);box-shadow:inset 0 1px 0 rgba(255,255,255,.4),0 14px 22px -12px rgba(0,0,0,.8)}}
.mb-kn i{{display:grid;place-items:center;width:30px;height:30px;flex:none;border-radius:50%;color:{GOLD};background:{NACHT};box-shadow:inset 0 1px 0 rgba(255,255,255,.12)}}
.mb-kn svg{{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}}
.mb-kn .z,.mb.auf .mb-kn .a{{display:none}}.mb.auf .mb-kn .z{{display:inline}}.mb.auf .mb-kn svg{{transform:rotate(180deg)}}
.mb-kn:focus-visible{{outline:2px solid {HELL};outline-offset:3px}}
.pfeile{{display:flex;justify-content:center;gap:14px;margin-top:4px}}
.pf{{width:52px;height:52px;flex:none;border:0;border-radius:50%;cursor:pointer;display:grid;place-items:center;color:{TINTE};background:linear-gradient(180deg,#d8c49c,{GOLD} 55%,#9c8457);box-shadow:inset 0 1px 0 rgba(255,255,255,.5),0 12px 20px -10px rgba(0,0,0,.7)}}
.pf svg{{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}}
.pf:disabled{{opacity:.35;cursor:default}}
footer{{padding:26px var(--rand) 40px;text-align:center;font-size:.92rem;color:rgba(243,238,229,.6);border-top:1px solid rgba(177,153,106,.2)}}
footer a{{color:{HELL}}}
.js .auf-x{{transform:translateY(40px);transition:transform .9s cubic-bezier(.16,1,.3,1)}}.js .auf-x.da{{transform:none}}
@media (prefers-reduced-motion:reduce){{.js .auf-x{{transform:none;transition:none}}}}
@media (max-width:760px){{.mb{{flex-basis:calc(100vw - 2 * var(--rand))}}.pfeile{{display:none}}}}
@media (hover:none){{.pfeile{{display:none}}}}
</style></head>
<body>
<header class="kopf"><img src="img/zeichen.png" alt="" width="84"><h1>Zwölf Mails,<br><em>in Deinem Ton.</em></h1>
<p>Was ein Patient nach einer Anfrage von Dir bekommt, sieht aus wie die neue Seite und klingt wie Du. Zwölf Fälle als Idee, von der Terminanfrage bis zur Bitte um eine Bewertung. Namen und Daten in den Mails sind Beispielwerte, Telefon, Adressen und Zeiten sind Deine.</p></header>
<main><div class="band" id="mband" tabindex="0" aria-label="Die zwölf Mails, zum Blättern">{karten}</div>
<div class="pfeile auf-x"><button type="button" class="pf" data-r="-1" aria-label="Vorige Mail">{pf('M10 3 5 8l5 5')}</button><button type="button" class="pf" data-r="1" aria-label="Nächste Mail">{pf('m6 3 5 5-5 5')}</button></div></main>
<footer class="auf-x">Entwurf von Robert Reff, Tasty Studios. Stand {STAND}. <a href="../werkbank/index.html#papier">Zurück zu «Alles auf einen Blick»</a></footer>
<script>
(function () {{
  /* Auftritte beim Scrollen: was unter dem ersten Bildschirm steht, schwebt 40 px herein (nur transform, deckend) */
  document.documentElement.classList.add('js');
  if ('IntersectionObserver' in window) {{ var io = new IntersectionObserver(function (es) {{ es.forEach(function (x) {{ if (x.isIntersecting) {{ x.target.classList.add('da'); io.unobserve(x.target); }} }}); }}, {{ rootMargin: '0px 0px -8% 0px' }});
    [].forEach.call(document.querySelectorAll('.auf-x'), function (x) {{ io.observe(x); }}); }} else [].forEach.call(document.querySelectorAll('.auf-x'), function (x) {{ x.classList.add('da'); }});
  var ms = [].slice.call(document.querySelectorAll('.mb'));
  function lage(m) {{ var bl = m.querySelector('.mb-blatt'), i = bl.querySelector('.mb-in'); bl.style.height = (m.classList.contains('auf') ? i.scrollHeight : Math.min(640, i.scrollHeight)) + 'px'; }}
  ms.forEach(function (m) {{
    var k = m.querySelector('.mb-kn');
    [].forEach.call(m.querySelectorAll('img'), function (im) {{ if (!im.complete) im.addEventListener('load', function () {{ lage(m); }}, {{ once: true }}); }});
    lage(m);
    k.addEventListener('click', function () {{ var auf = m.classList.toggle('auf'); k.setAttribute('aria-expanded', auf); lage(m); if (!auf) m.scrollIntoView({{ block: 'nearest' }}); }});
  }});
  var rt = 0; addEventListener('resize', function () {{ clearTimeout(rt); rt = setTimeout(function () {{ ms.forEach(lage); kl(); }}, 120); }});
  var b = document.getElementById('mband'), p = document.querySelectorAll('.pf');
  function schritt() {{ return ms[0].getBoundingClientRect().width + parseFloat(getComputedStyle(b).columnGap || 0); }}
  function kl() {{ p[0].disabled = b.scrollLeft < 4; p[1].disabled = b.scrollLeft > b.scrollWidth - b.clientWidth - 4; }}
  [].forEach.call(p, function (x) {{ x.addEventListener('click', function () {{ b.scrollBy({{ left: +x.dataset.r * schritt(), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }}); }}); }});
  b.addEventListener('scroll', kl, {{ passive: true }}); kl();
}})();
</script>
</body></html>
'''


def main():
    bilder()
    neu = {f['ordner'] for f in FAELLE}
    for n in os.listdir(MAILS):   # Ordner der Vorlage weg
        if n[:2].isdigit() and n not in neu and os.path.isdir(os.path.join(MAILS, n)):
            shutil.rmtree(os.path.join(MAILS, n))
    for f in FAELLE:
        z = os.path.join(MAILS, f['ordner']); os.makedirs(z, exist_ok=True)
        open(os.path.join(z, 'index.html'), 'w', encoding='utf-8').write(mail(f, '../../'))
    open(os.path.join(MAILS, 'index.html'), 'w', encoding='utf-8').write(uebersicht())
    json.dump([[f['nr'], f['ordner'], f['name'], f['satz']] for f in FAELLE], open(os.path.join(HIER, 'werkbank.json'), 'w'), ensure_ascii=False, indent=1)
    print(len(FAELLE), 'Mails gebaut:', ', '.join(f['ordner'] for f in FAELLE))


if __name__ == '__main__':
    main()
