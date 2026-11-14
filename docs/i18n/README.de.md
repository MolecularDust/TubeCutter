<!-- languages:start -->
<div align="center">

<details>
<summary><b>🌐 Language · Idioma · Langue · Sprache · Язык · 语言 · 言語 · 언어 · भाषा · لغة</b></summary>
<br>

<table>
  <tr>
    <td align="center"><a href="../../README.md">English</a></td>
    <td align="center"><a href="README.ar.md">العربية</a></td>
    <td align="center"><a href="README.bn.md">বাংলা</a></td>
    <td align="center"><a href="README.zh-Hans.md">简体中文</a></td>
    <td align="center"><a href="README.fil.md">Filipino</a></td>
  </tr>
  <tr>
    <td align="center"><a href="README.fr.md">Français</a></td>
    <td align="center"><b>Deutsch</b></td>
    <td align="center"><a href="README.hi.md">हिन्दी</a></td>
    <td align="center"><a href="README.id.md">Bahasa Indonesia</a></td>
    <td align="center"><a href="README.it.md">Italiano</a></td>
  </tr>
  <tr>
    <td align="center"><a href="README.ja.md">日本語</a></td>
    <td align="center"><a href="README.ko.md">한국어</a></td>
    <td align="center"><a href="README.fa.md">فارسی</a></td>
    <td align="center"><a href="README.pt-BR.md">Português (Brasil)</a></td>
    <td align="center"><a href="README.ru.md">Русский</a></td>
  </tr>
  <tr>
    <td align="center"><a href="README.es.md">Español</a></td>
    <td align="center"><a href="README.te.md">తెలుగు</a></td>
    <td align="center"><a href="README.th.md">ไทย</a></td>
    <td align="center"><a href="README.tr.md">Türkçe</a></td>
    <td align="center"><a href="README.vi.md">Tiếng Việt</a></td>
  </tr>
</table>

</details>

</div>
<!-- languages:end -->

# TubeCutter

**Laden Sie nicht mehr ganze Videos herunter. Holen Sie sich nur den Moment, den Sie wollen.**

TubeCutter ist der schnellste Weg, genau den Teil eines YouTube-Videos zu speichern, den Sie brauchen. Link einfügen, Vorschau ansehen, Anfang und Ende per Ziehen markieren – und TubeCutter schneidet genau diesen Abschnitt in eine saubere Datei. Legen Sie beliebig viele Clips in die Warteschlange, pausieren oder brechen Sie jederzeit ab und behalten Sie die, die Ihnen gefallen. Für Windows und Mac.

<p align="center">
  <img src="../images/tubecutter-main.webp" alt="TubeCutter-Hauptfenster: einen YouTube-Link einfügen, das Video ansehen, einen Abschnitt wählen und ihn zur Download-Warteschlange hinzufügen" width="420">
</p>

**Aktueller Stand der Veröffentlichung:** Das Windows-x64-Setup ist im [Release v0.1.1](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1) veröffentlicht. Es ist nicht code-signiert, daher kann Windows SmartScreen beim ersten Start warnen. Die macOS-Versionen für Apple Silicon (`.app` und `.dmg`) sind funktionsfähige lokale Testbuilds. Prüfungen der signierten Tools (Metadaten und Downloads) sowie der Signatur- und Image-Integrität bestehen. Die ausdrücklich genehmigte Ausnahme von der Bibliotheksvalidierung gilt nur für yt-dlp; die Haupt-App behält die Validierung, und Deno läuft ohne JIT. Siehe [Signaturdetails](../SIGNING_APPROVAL.md). Der Build ist ad hoc signiert, weder mit Developer ID signiert noch notarisiert.

## Herunterladen

- **Windows:** [Neueste Version herunterladen](https://github.com/MolecularDust/TubeCutter/releases/latest). Wählen Sie eine normale Installation oder eine portable Kopie.
- **macOS:** [Neueste Version herunterladen](https://github.com/MolecularDust/TubeCutter/releases/latest).

## YouTube-Zugriff einrichten

1. Installieren Sie TubeCutter und öffnen Sie **Konto & Einstellungen**.
2. Wählen Sie im Menü **Authentifizierung** die Option **YouTube-Sitzung der App**.
3. Klicken Sie auf **Bei Google anmelden** und schließen Sie die Anmeldung ab.

Jetzt können Sie TubeCutter nutzen.

Wenn Sie stattdessen einen Browser verwenden möchten, in dem Sie bereits angemeldet sind, wählen Sie unter **Authentifizierung** Chrome, Firefox oder Opera. Schließen Sie unter Windows vorher diesen Browser. Verwenden Sie nur Ihr eigenes Konto. Importieren oder teilen Sie keine Cookies anderer Personen.

Sie können auch **Anonym** beibehalten, aber Googles Anti-Bot-Prüfungen sind bei anonymem Zugriff strenger.

## Verwenden

1. Wählen Sie mit dem Systemdialog einen Zielordner.
2. Fügen Sie einen YouTube-Link (watch, youtu.be oder Shorts) ein und klicken Sie auf Analysieren.
3. Nutzen Sie den YouTube-Player in voller Breite. Wiedergabe und Lautstärke steuern Sie mit seinen eigenen Bedienelementen.
4. Die Zeitleiste wird nach der Analyse automatisch aktiv. Lassen Sie Anfang/Ende unverändert, um das ganze Video herunterzuladen; wird einer der Punkte geändert, ist ein Schnitt gewählt. Zurücksetzen stellt das ganze Video wieder her. Ziehen Sie Anfang/Ende, bearbeiten Sie HH:MM:SS(.mmm) oder nutzen Sie Anfang setzen/Ende setzen. I/O funktionieren außerhalb von Feldern; die Leertaste schaltet die Wiedergabe um. Ziehen Sie das rote Dreieck über der Spur, um den Abspielkopf unabhängig von Anfang/Ende zu bewegen. Pfeiltasten bewegen eine fokussierte Marke oder den Abspielkopf um 0,1 s, Umschalt+Pfeil um 1 s; Pos1/Ende springen an die Videogrenzen.
5. Puffer ist standardmäßig 00 Sekunden und erweitert beide Enden, bis zu den Videogrenzen. Länge zeigt die resultierende Dauer mit Puffer. Anfang, Ende, Puffer und Länge haben Auf-/Ab-Tasten für je eine Sekunde; die Tasten von Länge verändern Ende. Auswahl ansehen spielt den Bereich mit Puffer ab und wird während der Wiedergabe zu Stopp. Wählen Sie Schneller Schnitt oder Präziser Schnitt.
6. Download-Einstellungen ist zunächst aufgeklappt; ein Klick auf die Überschrift klappt es zu oder wieder auf. Wählen Sie Container, tatsächliche Quellauflösung, Codec, Audio, Untertitel und Modus und fügen Sie das Ergebnis der Warteschlange hinzu.
7. Laufende Downloads lassen sich pausieren (Pausieren/Fortsetzen) oder abbrechen (Abbrechen). Fehlgeschlagene Downloads wiederholen Sie mit Erneut versuchen, fertige Dateien zeigen Sie mit Im Finder zeigen. Fertige entfernen entfernt fertige, abgebrochene und fehlgeschlagene Zeilen, laufende Aufträge und gespeicherte Dateien bleiben erhalten.

**Konto & Einstellungen** ist standardmäßig anonym. **Bei Google anmelden** / **YouTube verbinden** öffnen Googles eigene Seiten in einem App-Fenster, dessen Anmeldung im Webview-Speicher der App erhalten bleibt; wenn Sie danach _YouTube-Sitzung der App_ wählen, erhält yt-dlp eine private Cookie-Momentaufnahme pro Auftrag (Modus 0600, danach gelöscht und beim Start aufgeräumt) – ohne Browser- oder Schlüsselbundzugriff.

Die Wahl eines Browsers erlaubt den späteren Zugriff auf dessen Cookies ausdrücklich und kann Systemabfragen auslösen. Importieren oder teilen Sie keine Cookies anderer Personen. Im Konfigurationsordner der App werden nur Pfade und Einstellungen gespeichert. Die Authentifizierung ist optional.

## Sprache

Die Oberfläche der App gibt es auf Englisch und in 19 weiteren Sprachen: Arabisch, Bengalisch, Chinesisch (vereinfacht), Filipino, Französisch, Deutsch, Hindi, Indonesisch, Italienisch, Japanisch, Koreanisch, Persisch, Portugiesisch (Brasilien), Russisch, Spanisch, Telugu, Thai, Türkisch und Vietnamesisch. Standardmäßig folgt sie der Systemsprache. Eine andere wählen Sie unter **Konto & Einstellungen → Sprache**; die Auswahl gilt sofort und wird gespeichert. Arabisch und Persisch werden von rechts nach links dargestellt. Auch die Seiten des macOS-Installers folgen der Sprache Ihres Macs.

## Entwicklung

Die Build-Hinweise sind nur auf Englisch: siehe [englisches README](../../README.md#development).
