# Baut alle Seiten: setzt Zeichen, Knopf-Pfeile, Kopfleiste, Fuss und Übungen ein
import json, html
from pathlib import Path
hier = Path(__file__).parent
zeichen = (hier / "media/zeichen.svg").read_text().strip()
PFEIL = '<span class="knauf"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8h10M9 4l4 4-4 4"/></svg></span>'
PFEIL_RUNTER = '<span class="knauf"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3v10M4 9l4 4 4-4"/></svg></span>'

NAV = [("start", "index.html#ablauf", "Behandlung"), ("uebungen", "uebungen.html", "Übungen"), ("ueber", "ueber-mich.html", "Über mich"), ("kontakt", "index.html#kontakt", "Kontakt")]
def leiste(wo):
    links = "".join(f'<a{" class=\"hier\"" if k == wo else ""} href="{h}">{t}</a>' for k, h, t in NAV)
    return f'<header class="leiste" id="leiste">\n  <a class="marke" href="index.html">{zeichen}<span>Sylvia Sroka</span></a>\n  <nav>{links}<a class="ruf" href="tel:+495112607414">0511 260 74 14</a></nav>\n</header>'
FUSS = f'''<footer class="fuss">
  <a class="marke" href="index.html">{zeichen}Physiotherapie Sylvia Sroka</a>
  <nav><a href="ueber-mich.html">Über mich</a><a href="uebungen.html">Übungen</a><a href="angehoerige.html">Für Angehörige</a><a href="fragen.html">Fragen und Kosten</a><a href="unternehmen.html">Für Unternehmen</a><a href="en/index.html" lang="en">English</a><a href="es/index.html" lang="es">Español</a><a href="impressum.html">Impressum</a><a href="datenschutz.html">Datenschutz</a></nav>
</footer>'''

def uebungen_html():
    d = json.loads((hier / "daten/uebungen.json").read_text())
    teile = []
    for n, g in enumerate(d["gruppen"]):
        grund = "tapete-dunkel" if n % 2 else "hellgrund"
        karten = ""
        for u in g["uebungen"]:
            schritte = "".join(f"<li>{html.escape(x)}</li>" for x in u["schritte"])
            karten += f'<article class="uebung flieg" id="{u["id"]}"><h3>{html.escape(u["name"])}</h3><p class="menge">{html.escape(u["menge"])}</p><ul>{schritte}</ul></article>'
        teile.append(f'''  <section class="abschnitt {grund}" id="{g["id"]}">
    <div class="gruppe-kopf"><h2 class="schlitz"><span class="z"><span>{html.escape(g["name"])}</span></span></h2><p class="flieg">{html.escape(g["satz"])}</p></div>
    <div class="gruppe-raster"><div class="bild flieg"><img src="{g["bild"]}" alt="" loading="lazy"></div>{karten}</div>
  </section>''')
    return "\n".join(teile), d["hinweis"]

def fertig(text, wo=None):
    for w in ["start", "uebungen", "ueber", "kontakt", "angehoerige", "fragen", "unternehmen", "anamnese"]:
        text = text.replace("{{LEISTE:%s}}" % w, leiste(w))
    return text.replace("{{FUSS}}", FUSS).replace("{{ZEICHEN}}", zeichen).replace("{{PFEIL}}", PFEIL).replace("{{PFEIL_RUNTER}}", PFEIL_RUNTER)

for seite in ["index", "ueber-mich"]:
    (hier / f"{seite}.html").write_text(fertig((hier / f"{seite}.src.html").read_text()))

vorlage = (hier / "unterseite.vorlage.html").read_text()
gruppen, hinweis = uebungen_html()
for datei, titel, wo, beschreibung in [
    ("uebungen", "Übungen für zu Hause", "uebungen", "Übungen für Rücken, Nacken, Atem und Gleichgewicht von Physiotherapeutin Sylvia Sroka."),
    ("angehoerige", "Für Angehörige", "angehoerige", "Begleitung und Entlastung für Menschen, die einen Angehörigen pflegen."),
    ("fragen", "Fragen und Kosten", "fragen", "Antworten auf häufige Fragen: Termine, Kosten, Erstattung, Hausbesuche."),
    ("unternehmen", "Für Unternehmen", "unternehmen", "Seminare, Vorbeugung und Betreuung für Mitarbeiter: Stress, Entspannung, Achtsamkeit."),
    ("anamnese", "Fragebogen vor dem ersten Termin", "anamnese", "Fragebogen vor dem ersten Termin (Demo)."),
]:
    inhalt = (hier / f"seiten/{datei}.inhalt.html").read_text().replace("{{GRUPPEN}}", gruppen).replace("{{HINWEIS}}", html.escape(hinweis))
    seite = vorlage.replace("{{LEISTE:{{HIER}}}}", "{{LEISTE:%s}}" % wo).replace("{{TITEL}}", titel).replace("{{BESCHREIBUNG}}", beschreibung).replace("{{INHALT}}", inhalt)
    (hier / f"{datei}.html").write_text(fertig(seite))

# Sprachfassungen (Englisch, Spanisch) aus den deutschen Quellen
import sprachen
sprachen.baue(zeichen, PFEIL, PFEIL_RUNTER)

# Werkbank für Sylvia
wb = hier / "werkbank"
if wb.exists():
    import html as _h
    kopf = (wb / "kopf.vorlage.html").read_text()
    WBNAV = [("start", "index.html", "Überblick"), ("start#werkzeuge", "index.html#werkzeuge", "Werkzeuge"), ("sticker", "sticker.html", "Sticker"), ("mails", "mails.html", "E-Mails"), ("marke", "marke.html", "Markenblatt")]
    mails = json.loads((wb / "mails.json").read_text())
    MAILS = "".join(f'<article class="mail flieg"><h3>{_h.escape(m["titel"])}</h3><p class="anlass">{_h.escape(m["anlass"])}</p><p class="betreff">Betreff: <span>{_h.escape(m["betreff"])}</span></p><pre>{_h.escape(m["text"])}</pre><div class="knoepfe"><button type="button" class="knopf" data-kopieren>Text kopieren {PFEIL}</button></div></article>' for m in mails)
    for src in sorted(wb.glob("*.src.html")):
        t = src.read_text()
        import re as _re
        titel = _re.search(r"\{\{KOPF:(.*?)\}\}", t).group(1)
        t = _re.sub(r"\{\{KOPF:.*?\}\}", kopf.replace("{{TITEL}}", titel), t)
        wo = _re.search(r"\{\{WB_LEISTE:(\w+)\}\}", t).group(1)
        nav = "".join(f'<a{" class=\"hier\"" if k == wo else ""} href="{h}">{n}</a>' for k, h, n in WBNAV)
        t = _re.sub(r"\{\{WB_LEISTE:\w+\}\}", f'<header class="leiste" id="leiste">\n  <a class="marke" href="index.html">{zeichen}<span>Werkbank für Sylvia</span></a>\n  <nav>{nav}<a class="ruf" href="../index.html">Zur Website</a></nav>\n</header>', t)
        t = t.replace("{{WB_FUSS}}", f'<footer class="fuss">\n  <a class="marke" href="index.html">{zeichen}Werkbank für Sylvia Sroka</a>\n  <nav><a href="../index.html">Website</a><a href="../werkzeuge/index.html">Werkzeuge</a><a href="sticker.html">Sticker</a><a href="mails.html">E-Mails</a><a href="marke.html">Markenblatt</a></nav>\n</footer>')
        t = t.replace("{{MAILS}}", MAILS).replace("{{ZEICHEN}}", zeichen).replace("{{PFEIL}}", PFEIL).replace("{{PFEIL_RUNTER}}", PFEIL_RUNTER)
        (wb / src.name.replace(".src.html", ".html")).write_text(t)

rechts = (hier / "recht.src.html").read_text()
for datei, titel in [("impressum", "Impressum"), ("datenschutz", "Datenschutz")]:
    inhalt = (hier / f"{datei}.inhalt.html").read_text()
    (hier / f"{datei}.html").write_text(rechts.replace("{{ZEICHEN}}", zeichen).replace("{{TITEL}}", titel).replace("{{INHALT}}", inhalt))
print("gebaut")
