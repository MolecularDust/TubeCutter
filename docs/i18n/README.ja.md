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
    <td align="center"><a href="README.it.md">Italiano</a></td>
  </tr>
  <tr>
    <td align="center"><b>日本語</b></td>
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

**動画まるごとのダウンロードはもう不要。欲しい場面だけを手に入れよう。**

TubeCutterは、必要なYouTube動画の部分をぴったり保存できる最速の方法です。リンクを貼り付けてプレビューし、ドラッグでインとアウトを決めるだけで、その区間だけをきれいなファイルに切り出します。クリップはいくつでもキューに入れられ、いつでも一時停止やキャンセルができ、気に入ったものは残せます。WindowsとMacに対応しています。

<p align="center">
  <img src="../images/tubecutter-main.webp" alt="TubeCutterのメインウインドウ：YouTubeのリンクを貼り付け、動画をプレビューし、区間を選んでダウンロードキューに追加" width="420">
</p>

**現在のリリース状況：** Windows x64用セットアップは[v0.1.1リリース](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1)で公開されています。コード署名はされていないため、初回起動時にWindows SmartScreenが警告を表示することがあります。Apple Silicon向けmacOSの`.app`と`.dmg`は、動作するローカル評価ビルドです。署名済みツールのメタデータ／ダウンロードテストと、署名およびイメージの整合性チェックに合格しています。ユーザーが承認したライブラリ検証の例外はyt-dlpにのみ適用され、メインアプリは検証を維持し、DenoはJITを無効にして動作します。[署名の詳細](../SIGNING_APPROVAL.md)を参照してください。このビルドはアドホック署名で、Developer ID署名も公証もされていません。

## ダウンロード

- **Windows：** [最新リリースをダウンロード](https://github.com/MolecularDust/TubeCutter/releases/latest)。通常のインストールか、ポータブル版を選びます。
- **macOS：** [最新リリースをダウンロード](https://github.com/MolecularDust/TubeCutter/releases/latest)。

## YouTubeアクセスの設定

1. TubeCutterをインストールして、**アカウントと設定**を開きます。
2. **認証**メニューで**アプリのYouTubeセッション**を選びます。
3. **Googleにサインイン**をクリックして、サインインを完了します。

これでTubeCutterを使えます。

すでにサインイン済みのブラウザを使うには、**認証**でChrome、Firefox、Operaのいずれかを選びます。Windowsでは、始める前にそのブラウザを閉じてください。ご自身のアカウントのみ使用してください。他人のCookieを読み込んだり共有したりしないでください。

**匿名**のままでも使えますが、匿名アクセスではGoogleのボット対策チェックがより厳しくなります。

## 使い方

1. ネイティブのピッカーで保存先フォルダを選びます。
2. YouTubeのリンク（watch、youtu.be、Shorts）を貼り付けて、分析をクリックします。
3. 全幅のYouTubeプレーヤーを使います。再生と音量はプレーヤー自身のコントロールで操作します。
4. 解析後、タイムラインは自動的に有効になります。動画全体をダウンロードするにはイン/アウトを変更しないでください。どちらかの点を変えると切り出しが選択されます。リセットで動画全体に戻ります。イン/アウトをドラッグするか、HH:MM:SS(.mmm)を編集するか、インを設定/アウトを設定を使います。I/Oは入力欄の外で使え、スペースキーで再生を切り替えます。トラックの上の赤い三角をドラッグすると、イン/アウトとは別に再生ヘッドを動かせます。矢印キーでフォーカス中のマーカーや再生ヘッドを0.1秒、Shift+矢印キーで1秒動かし、Home/Endで再生ヘッドを動画の端へ移します。
5. 余白は初期値が00秒で、動画の端を超えない範囲で両端を広げます。長さには余白を含めた長さが表示されます。イン、アウト、余白、長さには1秒ずつ増減するボタンがあり、長さのボタンはアウトを調整します。選択範囲をプレビューは余白を含む範囲を再生し、再生中は停止になります。高速カットか精密カットを選びます。
6. ダウンロード設定は最初は開いています。見出しをクリックすると閉じたり開いたりできます。コンテナ、実際のソース解像度、コーデック、オーディオ、字幕、モードを選んで、キューに追加します。
7. 実行中のダウンロードは一時停止（一時停止／再開）やキャンセル（キャンセル）ができます。失敗したものは再試行で再試行し、完了したファイルはFinderで表示で表示します。完了を消去は完了・キャンセル・失敗の行を取り除き、実行中のジョブと保存済みファイルはそのまま残します。

**アカウントと設定**は初期状態では匿名です。**Googleにサインイン**／**YouTubeを接続**は、Google自身のページをアプリのウインドウで開き、そのログインはアプリのWebビューのストレージに保持されます。その後*アプリのYouTubeセッション*を選ぶと、yt-dlpにジョブごとの非公開のCookieスナップショット（モード0600、終了後に削除、起動時に掃除）が渡され、ブラウザやキーチェーンへのアクセスは不要です。

ブラウザを選ぶと、そのCookieへの以後のアクセスを明示的に許可することになり、OSの許可を求められる場合があります。他人のCookieを読み込んだり共有したりしないでください。アプリの設定フォルダには、パスと設定だけが保存されます。認証は任意です。

## 言語

アプリの画面は、英語とほかの19言語で利用できます：アラビア語、ベンガル語、中国語（簡体字）、フィリピノ語、フランス語、ドイツ語、ヒンディー語、インドネシア語、イタリア語、日本語、韓国語、ペルシア語、ポルトガル語（ブラジル）、ロシア語、スペイン語、テルグ語、タイ語、トルコ語、ベトナム語。初期設定ではシステムの言語に従います。別の言語を選ぶには**アカウントと設定 → 言語**を開きます。選択はすぐに反映され、記憶されます。アラビア語とペルシア語は右から左に表示されます。macOSインストーラのページもMacの言語に従います。

## 開発

ビルドのメモは英語のみです：[英語のREADME](../../README.md#development)を参照してください。
