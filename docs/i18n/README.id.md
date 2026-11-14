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
    <td align="center"><b>Bahasa Indonesia</b></td>
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

**Berhenti mengunduh video utuh. Ambil hanya momen yang Anda inginkan.**

TubeCutter adalah cara tercepat untuk menyimpan tepat bagian video YouTube yang Anda butuhkan. Tempel tautan, lihat pratinjaunya, seret untuk menandai titik Masuk dan Keluar, lalu TubeCutter memotong bagian itu menjadi satu file yang rapi. Antrekan klip sebanyak yang Anda mau, jeda atau batalkan kapan saja, dan simpan yang Anda suka. Dibuat untuk Windows dan Mac.

<p align="center">
  <img src="../images/tubecutter-main.webp" alt="Jendela utama TubeCutter: tempel tautan YouTube, lihat pratinjau video, pilih satu bagian, dan tambahkan ke antrean unduhan" width="420">
</p>

**Status rilis saat ini:** penyetel Windows x64 sudah dipublikasikan di [rilis v0.1.1](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1). Penyetel ini belum ditandatangani kodenya, jadi Windows SmartScreen mungkin memberi peringatan saat pertama dijalankan. `.app` dan `.dmg` macOS untuk Apple Silicon adalah build evaluasi lokal yang berfungsi. Uji metadata/unduhan alat bertanda tangan serta pemeriksaan integritas tanda tangan dan citra lulus. Pengecualian validasi pustaka yang disetujui pengguna hanya berlaku untuk yt-dlp; aplikasi utama tetap menjalankan validasi dan Deno berjalan tanpa JIT. Lihat [detail penandatanganan](../SIGNING_APPROVAL.md). Build ini ditandatangani ad hoc, bukan dengan Developer ID dan tidak dinotarisasi.

## Unduh

- **Windows:** [Unduh rilis terbaru](https://github.com/MolecularDust/TubeCutter/releases/latest). Pilih instalasi biasa atau salinan portabel.
- **macOS:** [Unduh rilis terbaru](https://github.com/MolecularDust/TubeCutter/releases/latest).

## Menyiapkan akses YouTube

1. Instal TubeCutter dan buka **Akun & Pengaturan**.
2. Di menu **Autentikasi**, pilih **Sesi YouTube aplikasi**.
3. Klik **Masuk ke Google** dan selesaikan proses masuk.

TubeCutter siap digunakan.

Untuk memakai browser yang sudah Anda masuki, pilih Chrome, Firefox, atau Opera di bawah **Autentikasi**. Di Windows, tutup browser itu sebelum mulai. Gunakan hanya akun Anda sendiri. Jangan impor atau bagikan cookie milik orang lain.

Anda juga bisa tetap memakai **Anonim**, tetapi pemeriksaan anti-bot Google lebih ketat untuk akses anonim.

## Penggunaan

1. Pilih folder tujuan dengan pemilih bawaan.
2. Tempel tautan YouTube (watch, youtu.be, atau Shorts) lalu klik Analisis.
3. Gunakan pemutar YouTube selebar penuh. Kontrol bawaannya mengatur pemutaran dan volume.
4. Lini masa aktif otomatis setelah analisis. Biarkan Masuk/Keluar tidak berubah untuk mengunduh seluruh video; mengubah salah satu titik memilih sebuah potongan. Atur ulang mengembalikan seluruh video. Seret Masuk/Keluar, ubah HH:MM:SS(.mmm), atau gunakan Setel Masuk/Setel Keluar. I/O bekerja di luar kolom; Spasi mengalihkan pemutaran. Seret segitiga merah di atas trek untuk menggeser kepala putar secara terpisah dari Masuk/Keluar. Tombol panah menggeser penanda atau kepala putar yang terpilih sebesar 0,1 dtk, Shift+panah 1 dtk; Home/End memindahkan kepala putar ke batas video.
5. Bantalan bawaannya 00 detik dan memperluas tiap ujung, berhenti di batas video. Durasi menampilkan durasi hasil dengan bantalan. Masuk, Keluar, Bantalan, dan Durasi punya tombol naik/turun satu detik; tombol Durasi mengatur Keluar. Pratinjau pilihan memutar rentang dengan bantalan dan berubah menjadi Berhenti saat memutar. Pilih potong cepat atau Potong Presisi.
6. Pengaturan unduhan awalnya terbuka; klik judulnya untuk melipat atau membukanya lagi. Pilih kontainer, resolusi sumber sebenarnya, codec, audio, subjudul, dan mode, lalu tambahkan ke antrean.
7. Jeda (Jeda/Lanjutkan) atau batalkan (Batal) unduhan yang aktif. Coba lagi yang gagal (Coba lagi) dan tampilkan file yang selesai (Tampilkan di Finder). Bersihkan yang selesai menghapus baris yang selesai, dibatalkan, dan gagal, sementara tugas aktif dan file tersimpan tetap ada.

**Akun & Pengaturan** secara bawaan anonim. **Masuk ke Google** / **Hubungkan YouTube** membuka halaman Google sendiri di jendela aplikasi yang loginnya tersimpan di penyimpanan web aplikasi; memilih _Sesi YouTube aplikasi_ lalu memberi yt-dlp salinan cookie pribadi per tugas (mode 0600, dihapus sesudahnya dan dibersihkan saat startup) tanpa akses ke browser atau Rantai Kunci.

Memilih browser secara eksplisit mengizinkan akses selanjutnya ke cookie-nya dan dapat memicu izin sistem. Jangan impor atau bagikan cookie milik orang lain. Hanya jalur dan preferensi yang disimpan di folder konfigurasi aplikasi. Autentikasi bersifat opsional.

## Bahasa

Antarmuka aplikasi tersedia dalam bahasa Inggris dan 19 bahasa lain: Arab, Bengali, Tionghoa (Sederhana), Filipino, Prancis, Jerman, Hindi, Indonesia, Italia, Jepang, Korea, Persia, Portugis (Brasil), Rusia, Spanyol, Telugu, Thai, Turki, dan Vietnam. Secara bawaan mengikuti bahasa sistem. Untuk memilih bahasa lain, buka **Akun & Pengaturan → Bahasa**; pilihan berlaku seketika dan diingat. Bahasa Arab dan Persia ditampilkan dari kanan ke kiri. Halaman penginstal macOS juga mengikuti bahasa Mac Anda.

## Pengembangan

Catatan build hanya tersedia dalam bahasa Inggris: lihat [README bahasa Inggris](../../README.md#development).
