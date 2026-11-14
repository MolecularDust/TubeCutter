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
    <td align="center"><b>Filipino</b></td>
  </tr>
  <tr>
    <td align="center"><a href="README.fr.md">Français</a></td>
    <td align="center"><a href="README.de.md">Deutsch</a></td>
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

**Huwag nang mag-download ng buong video. Kunin lang ang sandaling gusto mo.**

Ang TubeCutter ang pinakamabilis na paraan para i-save ang eksaktong bahagi ng YouTube video na kailangan mo. Mag-paste ng link, i-preview, i-drag para markahan ang In at Out, at puputulin ng TubeCutter ang bahaging iyon sa isang malinis na file. Magpila ng kahit ilang clip, i-pause o kanselahin anumang oras, at itago ang mga gusto mo. Ginawa para sa Windows at Mac.

<p align="center">
  <img src="../images/tubecutter-main.webp" alt="Pangunahing window ng TubeCutter: mag-paste ng YouTube link, i-preview ang video, pumili ng bahagi, at idagdag ito sa pila ng download" width="420">
</p>

**Kasalukuyang katayuan ng release:** nailathala na ang Windows x64 setup sa [v0.1.1 release](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1). Hindi ito code-signed, kaya maaaring magbabala ang Windows SmartScreen sa unang takbo. Gumaganang lokal na evaluation build ang mga `.app` at `.dmg` ng macOS para sa Apple Silicon. Pumapasa ang mga pagsubok sa metadata/download ng mga naka-sign na tool at ang mga pagsusuri sa integridad ng signature at image. Ang exception sa library validation na inaprubahan ng user ay para lang sa yt-dlp; napapanatili ng pangunahing app ang validation at tumatakbo ang Deno nang naka-disable ang JIT. Tingnan ang [mga detalye ng signing](../SIGNING_APPROVAL.md). Ad hoc ang pagkaka-sign ng build, hindi Developer ID at hindi notarized.

## I-download

- **Windows:** [I-download ang pinakabagong release](https://github.com/MolecularDust/TubeCutter/releases/latest). Pumili ng regular na install o portable na kopya.
- **macOS:** [I-download ang pinakabagong release](https://github.com/MolecularDust/TubeCutter/releases/latest).

## I-set up ang access sa YouTube

1. I-install ang TubeCutter at buksan ang **Account at Mga Setting**.
2. Sa menu na **Authentication**, piliin ang **YouTube session ng app**.
3. I-click ang **Mag-sign in sa Google** at kumpletuhin ang pag-sign in.

Handa ka nang gumamit ng TubeCutter.

Para gumamit na lang ng browser na naka-sign in ka na, piliin ang Chrome, Firefox, o Opera sa ilalim ng **Authentication**. Sa Windows, isara muna ang browser na iyon. Sarili mong account lang ang gamitin. Huwag mag-import o magbahagi ng cookie ng iba.

Puwede mo ring panatilihin ang **Anonymous**, pero mas mahigpit ang anti-bot checks ng Google sa anonymous na access.

## Paggamit

1. Pumili ng destination folder gamit ang native na picker.
2. Mag-paste ng YouTube link (watch, youtu.be, o Shorts) at i-click ang I-analyze.
3. Gamitin ang full-width na YouTube player. Ang sarili nitong mga kontrol ang bahala sa playback at volume.
4. Awtomatikong gumagana ang timeline pagkatapos ng pag-analyze. Huwag galawin ang In/Out para i-download ang buong video; ang pagbabago sa alinmang punto ay pipili ng putol. Ibinabalik ng I-reset ang buong video. I-drag ang In/Out, i-edit ang HH:MM:SS(.mmm), o gamitin ang Itakda ang In/Itakda ang Out. Gumagana ang I/O sa labas ng mga field; ang Space ang nagpapalit ng playback. I-drag ang pulang tatsulok sa itaas ng track para ilipat ang playhead nang hiwalay sa In/Out. Inililipat ng mga arrow key ang naka-focus na marker o playhead nang 0.1 s, ng Shift+Arrow nang 1 s; dinadala ng Home/End ang playhead sa mga hangganan ng video.
5. Ang Padding ay 00 segundo bilang default at pinahahaba ang bawat dulo, hanggang sa mga hangganan ng video. Ipinapakita ng Haba ang resultang haba na may padding. May pataas/pababang button na isang segundo ang In, Out, Padding, at Haba; inaayos ng mga button ng Haba ang Out. Pino-play ng I-preview ang napili ang saklaw na may padding at nagiging Ihinto habang nagpe-play. Piliin ang mabilis na putol o Tumpak na Putol.
6. Nakabukas ang Mga setting ng download sa simula; i-click ang heading para itiklop o buksan muli. Piliin ang container, aktwal na resolution ng pinagmulan, codec, audio, subtitle, at mode, at idagdag sa pila.
7. I-pause (I-pause/Ituloy) o kanselahin (Kanselahin) ang mga aktibong download. Subukang muli ang mga nabigo (Subukan ulit) at ipakita ang mga natapos na file (Ipakita sa Finder). Inaalis ng Alisin ang Tapos Na ang mga natapos, nakansela, at nabigong row habang pinapanatili ang mga aktibong trabaho at naka-save na file.

Anonymous bilang default ang **Account at Mga Setting**. Binubuksan ng **Mag-sign in sa Google** / **Ikonekta ang YouTube** ang sariling mga pahina ng Google sa isang window ng app na nananatili ang login sa web storage ng app; ang pagpili pagkatapos sa _YouTube session ng app_ ay nagbibigay sa yt-dlp ng pribadong cookie snapshot kada trabaho (mode 0600, binubura pagkatapos at nililinis sa pagsisimula) nang walang access sa browser o Keychain.

Tahasang pinapahintulutan ng pagpili ng browser ang kasunod na access sa mga cookie nito at maaaring mag-trigger ng mga pahintulot ng OS. Huwag mag-import o magbahagi ng cookie ng iba. Mga path at preference lang ang iniimbak sa config folder ng app. Opsyonal ang authentication.

## Wika

Available ang interface ng app sa Ingles at 19 pang wika: Arabic, Bengali, Chinese (Simplified), Filipino, French, German, Hindi, Indonesian, Italian, Japanese, Korean, Persian, Portuguese (Brazil), Russian, Spanish, Telugu, Thai, Turkish at Vietnamese. Sinusunod nito ang wika ng system bilang default. Para pumili ng iba, buksan ang **Account at Mga Setting → Wika**; agad na ipinapatupad ang pinili at naaalala ito. Mula kanan pakaliwa ang layout ng Arabic at Persian. Sinusunod din ng mga pahina ng macOS installer ang wika ng iyong Mac.

## Pag-develop

Sa Ingles lang ang mga tala sa pag-build: tingnan ang [README sa Ingles](../../README.md#development).
