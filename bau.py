# Baut index.html, ueber-mich.html, impressum.html und datenschutz.html (setzt Zeichen und Inhalte ein)
from pathlib import Path
hier = Path(__file__).parent
zeichen = (hier / "media/zeichen.svg").read_text().strip()
PFEIL = '<span class="knauf"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 8h10M9 4l4 4-4 4"/></svg></span>'
PFEIL_RUNTER = '<span class="knauf"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 3v10M4 9l4 4 4-4"/></svg></span>'
for seite in ["index", "ueber-mich"]:
    (hier / f"{seite}.html").write_text((hier / f"{seite}.src.html").read_text().replace("{{ZEICHEN}}", zeichen).replace("{{PFEIL}}", PFEIL).replace("{{PFEIL_RUNTER}}", PFEIL_RUNTER))
vorlage = (hier / "recht.src.html").read_text()
for datei, titel in [("impressum", "Impressum"), ("datenschutz", "Datenschutz")]:
    inhalt = (hier / f"{datei}.inhalt.html").read_text()
    (hier / f"{datei}.html").write_text(vorlage.replace("{{ZEICHEN}}", zeichen).replace("{{TITEL}}", titel).replace("{{INHALT}}", inhalt))
print("gebaut")
