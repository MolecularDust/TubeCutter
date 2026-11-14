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
    <td align="center"><a href="README.de.md">Deutsch</a></td>
    <td align="center"><a href="README.hi.md">हिन्दी</a></td>
    <td align="center"><a href="README.id.md">Bahasa Indonesia</a></td>
    <td align="center"><b>Italiano</b></td>
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

**Smetti di scaricare video interi. Prendi solo il momento che vuoi.**

TubeCutter è il modo più veloce per salvare esattamente la parte di un video YouTube che ti serve. Incolla un link, guarda l’anteprima, trascina per segnare i punti di inizio e fine e TubeCutter ritaglia proprio quella sezione in un file pulito. Metti in coda quanti clip vuoi, metti in pausa o annulla quando vuoi e tieni quelli che ti piacciono. Pensato per Windows e Mac.

<p align="center">
  <img src="../images/tubecutter-main.webp" alt="Finestra principale di TubeCutter: incolla un link YouTube, guarda l’anteprima del video, scegli una sezione e aggiungila alla coda di download" width="420">
</p>

**Stato attuale della release:** il programma di installazione per Windows x64 è pubblicato nella [release v0.1.1](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1). Non è firmato con certificato di codice, quindi Windows SmartScreen può mostrare un avviso al primo avvio. I file `.app` e `.dmg` di macOS per Apple Silicon sono build locali di valutazione funzionanti. I test sui metadati e sul download degli strumenti firmati e i controlli di integrità di firme e immagini sono superati. L’eccezione alla convalida delle librerie approvata dall’utente riguarda solo yt-dlp; l’app principale mantiene la convalida e Deno gira con JIT disattivato. Vedi i [dettagli sulla firma](../SIGNING_APPROVAL.md). La build è firmata ad hoc, non con Developer ID né notarizzata.

## Download

- **Windows:** [Scarica l’ultima versione](https://github.com/MolecularDust/TubeCutter/releases/latest). Scegli un’installazione normale o una copia portatile.
- **macOS:** [Scarica l’ultima versione](https://github.com/MolecularDust/TubeCutter/releases/latest).

## Configurare l’accesso a YouTube

1. Installa TubeCutter e apri **Account e impostazioni**.
2. Nel menu **Autenticazione** scegli **Sessione YouTube dell’app**.
3. Fai clic su **Accedi a Google** e completa l’accesso.

Ora puoi usare TubeCutter.

Per usare invece un browser in cui hai già effettuato l’accesso, scegli Chrome, Firefox o Opera sotto **Autenticazione**. Su Windows chiudi prima quel browser. Usa solo il tuo account. Non importare né condividere i cookie di altre persone.

Puoi anche lasciare **Anonimo**, ma i controlli anti-bot di Google sono più severi per l’accesso anonimo.

## Uso

1. Scegli una cartella di destinazione con il selettore nativo.
2. Incolla un link YouTube (watch, youtu.be o Shorts) e fai clic su Analizza.
3. Usa il lettore YouTube a tutta larghezza. I suoi controlli nativi gestiscono riproduzione e volume.
4. La timeline si attiva da sola dopo l’analisi. Lascia Inizio/Fine invariati per scaricare l’intero video; cambiare uno dei due punti seleziona un taglio. Reimposta ripristina il video intero. Trascina Inizio/Fine, modifica HH:MM:SS(.mmm) o usa Imposta inizio/Imposta fine. I/O funzionano fuori dai campi; la barra spaziatrice avvia o ferma la riproduzione. Trascina il triangolo rosso sopra la traccia per spostare la testina indipendentemente da Inizio/Fine. Le frecce spostano un indicatore o la testina in primo piano di 0,1 s, Maiusc+freccia di 1 s; Home/Fine portano la testina ai limiti del video.
5. Margine è di 00 secondi per impostazione predefinita ed estende ogni estremo, fermandosi ai limiti del video. Durata mostra la durata risultante con il margine. Inizio, Fine, Margine e Durata hanno pulsanti su/giù di un secondo; quelli di Durata modificano Fine. Anteprima selezione riproduce l’intervallo con margine e durante la riproduzione diventa Stop. Scegli taglio rapido o Taglio preciso.
6. Impostazioni di download parte espanso; fai clic sul titolo per comprimerlo o riaprirlo. Seleziona contenitore, risoluzione reale della sorgente, codec, audio, sottotitoli e modalità, poi aggiungi il risultato alla coda.
7. Metti in pausa (Pausa/Riprendi) o annulla (Annulla) i download attivi. Riprova quelli falliti (Riprova) e mostra i file completati (Mostra nel Finder). Cancella completati rimuove le righe completate, annullate e fallite, mantenendo i lavori attivi e i file salvati.

**Account e impostazioni** è anonimo per impostazione predefinita. **Accedi a Google** / **Collega YouTube** aprono le pagine di Google in una finestra dell’app il cui accesso resta nell’archivio web dell’app; scegliendo poi _Sessione YouTube dell’app_, yt-dlp riceve un’istantanea privata dei cookie per ogni lavoro (modalità 0600, eliminata dopo e ripulita all’avvio), senza accesso al browser né al portachiavi.

Scegliere un browser autorizza espressamente l’accesso successivo ai suoi cookie e può far comparire richieste di autorizzazione del sistema. Non importare né condividere i cookie di altre persone. Nella cartella di configurazione dell’app vengono salvati solo percorsi e preferenze. L’autenticazione è facoltativa.

## Lingua

L’interfaccia dell’app è disponibile in inglese e in altre 19 lingue: arabo, bengalese, cinese (semplificato), filippino, francese, tedesco, hindi, indonesiano, italiano, giapponese, coreano, persiano, portoghese (Brasile), russo, spagnolo, telugu, thailandese, turco e vietnamita. Per impostazione predefinita segue la lingua del sistema. Per sceglierne un’altra apri **Account e impostazioni → Lingua**; la scelta si applica subito e viene ricordata. Arabo e persiano si leggono da destra a sinistra. Anche le pagine del programma di installazione macOS seguono la lingua del Mac.

## Sviluppo

Le note di compilazione sono solo in inglese: vedi il [README in inglese](../../README.md#development).
