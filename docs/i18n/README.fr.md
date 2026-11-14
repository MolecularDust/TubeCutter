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
    <td align="center"><b>Français</b></td>
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

**Arrêtez de télécharger des vidéos entières. Gardez seulement le moment qui vous intéresse.**

TubeCutter est le moyen le plus rapide d’enregistrer exactement la partie d’une vidéo YouTube dont vous avez besoin. Collez un lien, prévisualisez-le, faites glisser pour marquer vos points d’entrée et de sortie, et TubeCutter découpe cette section dans un fichier propre. Mettez autant de clips que vous voulez en file d’attente, mettez en pause ou annulez à tout moment, et gardez ceux que vous aimez. Conçu pour Windows et Mac.

<p align="center">
  <img src="../images/tubecutter-main.webp" alt="Fenêtre principale de TubeCutter : coller un lien YouTube, prévisualiser la vidéo, choisir une section et l’ajouter à la file de téléchargement" width="420">
</p>

**État actuel de la version :** le programme d’installation Windows x64 est publié dans la [version v0.1.1](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1). Il n’est pas signé, donc Windows SmartScreen peut afficher un avertissement au premier lancement. Les `.app` et `.dmg` macOS pour Apple Silicon sont des versions locales d’évaluation fonctionnelles. Les tests de métadonnées et de téléchargement des outils signés ainsi que les contrôles d’intégrité des signatures et des images réussissent. L’exception de validation des bibliothèques approuvée par l’utilisateur ne concerne que yt-dlp ; l’app principale conserve la validation et Deno s’exécute sans JIT. Voir les [détails de la signature](../SIGNING_APPROVAL.md). La version est signée ad hoc, ni signée avec un Developer ID ni notariée.

## Télécharger

- **Windows :** [Téléchargez la dernière version](https://github.com/MolecularDust/TubeCutter/releases/latest). Choisissez une installation classique ou une copie portable.
- **macOS :** [Téléchargez la dernière version](https://github.com/MolecularDust/TubeCutter/releases/latest).

## Configurer l’accès à YouTube

1. Installez TubeCutter et ouvrez **Compte et réglages**.
2. Dans le menu **Authentification**, choisissez **Session YouTube de l’app**.
3. Cliquez sur **Se connecter à Google** et terminez la connexion.

Vous pouvez maintenant utiliser TubeCutter.

Pour utiliser plutôt un navigateur où vous êtes déjà connecté, choisissez Chrome, Firefox ou Opera sous **Authentification**. Sous Windows, fermez ce navigateur avant de commencer. N’utilisez que votre propre compte. N’importez ni ne partagez les cookies de quelqu’un d’autre.

Vous pouvez aussi garder **Anonyme**, mais les contrôles anti-robots de Google sont plus stricts en accès anonyme.

## Utilisation

1. Choisissez un dossier de destination avec le sélecteur natif.
2. Collez un lien YouTube (watch, youtu.be ou Shorts) et cliquez sur Analyser.
3. Utilisez le lecteur YouTube pleine largeur. Ses commandes natives gèrent la lecture et le volume.
4. La ligne de temps s’active automatiquement après l’analyse. Laissez Entrée/Sortie inchangés pour télécharger toute la vidéo ; modifier l’un des deux points sélectionne une coupe. Réinitialiser rétablit la vidéo entière. Faites glisser Entrée/Sortie, modifiez HH:MM:SS(.mmm) ou utilisez Définir l’entrée/Définir la sortie. I/O fonctionnent hors des champs ; la barre d’espace bascule la lecture. Faites glisser le triangle rouge au-dessus de la piste pour déplacer la tête de lecture indépendamment de Entrée/Sortie. Les flèches déplacent un repère ou la tête de lecture ciblés de 0,1 s, Maj+flèche de 1 s ; Début/Fin amènent la tête de lecture aux limites de la vidéo.
5. Marge vaut 00 seconde par défaut et prolonge chaque extrémité, sans dépasser les limites de la vidéo. Durée affiche la durée obtenue avec la marge. Entrée, Sortie, Marge et Durée ont des boutons haut/bas d’une seconde ; ceux de Durée ajustent Sortie. Prévisualiser la sélection lit la plage avec marge et devient Arrêter pendant la lecture. Choisissez la coupe rapide ou Coupe précise.
6. Réglages de téléchargement est d’abord déplié ; cliquez sur son titre pour le replier ou le rouvrir. Sélectionnez conteneur, résolution réelle de la source, codec, audio, sous-titres et mode, puis ajoutez le tout à la file.
7. Mettez en pause (Pause/Reprendre) ou annulez (Annuler) les téléchargements actifs. Relancez les échecs (Réessayer) et affichez les fichiers terminés (Afficher dans le Finder). Effacer les terminés retire les lignes terminées, annulées et en échec, en préservant les tâches actives et les fichiers enregistrés.

**Compte et réglages** est anonyme par défaut. **Se connecter à Google** / **Connecter YouTube** ouvrent les pages de Google dans une fenêtre de l’app dont la connexion est conservée dans le stockage web de l’app ; choisir ensuite _Session YouTube de l’app_ donne à yt-dlp un instantané privé des cookies par tâche (mode 0600, supprimé ensuite et nettoyé au démarrage), sans accès au navigateur ni au trousseau.

Choisir un navigateur autorise explicitement l’accès ultérieur à ses cookies et peut déclencher des autorisations du système. N’importez ni ne partagez les cookies de quelqu’un d’autre. Seuls les chemins et les préférences sont enregistrés dans le dossier de configuration de l’app. L’authentification est facultative.

## Langue

L’interface de l’app est disponible en anglais et en 19 autres langues : arabe, bengali, chinois (simplifié), filipino, français, allemand, hindi, indonésien, italien, japonais, coréen, persan, portugais (Brésil), russe, espagnol, télougou, thaï, turc et vietnamien. Elle suit par défaut la langue du système. Pour en choisir une autre, ouvrez **Compte et réglages → Langue** ; le choix s’applique aussitôt et est mémorisé. L’arabe et le persan s’affichent de droite à gauche. Les pages de l’installateur macOS suivent aussi la langue de votre Mac.

## Développement

Les notes de compilation sont uniquement en anglais : voir le [README en anglais](../../README.md#development).
