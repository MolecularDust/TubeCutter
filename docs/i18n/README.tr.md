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
    <td align="center"><b>Türkçe</b></td>
    <td align="center"><a href="README.vi.md">Tiếng Việt</a></td>
  </tr>
</table>

</details>

</div>
<!-- languages:end -->

# TubeCutter

**Videoların tamamını indirmeyi bırakın. Yalnızca istediğiniz anı alın.**

TubeCutter, bir YouTube videosunun ihtiyacınız olan bölümünü tam olarak kaydetmenin en hızlı yoludur. Bir bağlantı yapıştırın, önizleyin, Giriş ve Çıkış noktalarını sürükleyerek işaretleyin; TubeCutter yalnızca o bölümü temiz bir dosyaya keser. İstediğiniz kadar klibi sıraya alın, istediğiniz zaman duraklatın veya iptal edin, sevdiklerinizi saklayın. Windows ve Mac için yapıldı.

<p align="center">
  <img src="../images/tubecutter-main.webp" alt="TubeCutter ana penceresi: bir YouTube bağlantısı yapıştırın, videoyu önizleyin, bir bölüm seçin ve indirme sırasına ekleyin" width="420">
</p>

**Mevcut sürüm durumu:** Windows x64 kurulumu [v0.1.1 sürümünde](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1) yayımlanmıştır. Kod imzalı değildir, bu yüzden Windows SmartScreen ilk çalıştırmada uyarı verebilir. Apple Silicon için macOS `.app` ve `.dmg` dosyaları çalışan yerel değerlendirme derlemeleridir. İmzalı araçların meta veri/indirme testleri ile imza ve görüntü bütünlüğü denetimleri geçmektedir. Kullanıcı onaylı kitaplık doğrulama istisnası yalnızca yt-dlp için geçerlidir; ana uygulama doğrulamayı korur ve Deno, JIT kapalı çalışır. Bkz. [imza ayrıntıları](../SIGNING_APPROVAL.md). Derleme geçici (ad hoc) olarak imzalanmıştır; Developer ID ile imzalı veya noter onaylı değildir.

## İndirme

- **Windows:** [En son sürümü indirin](https://github.com/MolecularDust/TubeCutter/releases/latest). Normal kurulum veya taşınabilir kopya seçin.
- **macOS:** [En son sürümü indirin](https://github.com/MolecularDust/TubeCutter/releases/latest).

## YouTube erişimini ayarlama

1. TubeCutter’ı kurun ve **Hesap ve Ayarlar**’i açın.
2. **Kimlik doğrulama** menüsünde **Uygulamanın YouTube oturumu**’ı seçin.
3. **Google’da oturum aç**’a tıklayın ve oturum açmayı tamamlayın.

TubeCutter’ı kullanmaya hazırsınız.

Bunun yerine zaten oturum açtığınız bir tarayıcıyı kullanmak için **Kimlik doğrulama** altında Chrome, Firefox veya Opera’yı seçin. Windows’ta başlamadan önce o tarayıcıyı kapatın. Yalnızca kendi hesabınızı kullanın. Başkasının çerezlerini içe aktarmayın veya paylaşmayın.

**Anonim** olarak da bırakabilirsiniz, ancak Google’ın bot karşıtı denetimleri anonim erişimde daha sıkıdır.

## Kullanım

1. Yerel seçiciyle bir hedef klasör seçin.
2. Bir YouTube bağlantısı (watch, youtu.be veya Shorts) yapıştırın ve Analiz et’e tıklayın.
3. Tam genişlikteki YouTube oynatıcısını kullanın. Oynatma ve ses, kendi denetimleriyle yönetilir.
4. Zaman çizelgesi analizden sonra otomatik olarak etkinleşir. Videonun tamamını indirmek için Giriş/Çıkış değerlerine dokunmayın; noktalardan birini değiştirmek bir kesim seçer. Sıfırla videonun tamamını geri getirir. Giriş/Çıkış noktalarını sürükleyin, HH:MM:SS(.mmm) değerini düzenleyin veya Girişi Ayarla/Çıkışı Ayarla kullanın. I/O alanların dışında çalışır; Boşluk oynatmayı açıp kapatır. Oynatma imlecini Giriş/Çıkış’tan bağımsız kaydırmak için parçanın üstündeki kırmızı üçgeni sürükleyin. Ok tuşları odaklı işareti veya oynatma imlecini 0,1 sn, Shift+Ok 1 sn kaydırır; Home/End oynatma imlecini video sınırlarına götürür.
5. Pay varsayılan olarak 00 saniyedir ve her ucu video sınırlarında durarak uzatır. Uzunluk paylı sonuç süresini gösterir. Giriş, Çıkış, Pay ve Uzunluk için birer saniyelik yukarı/aşağı düğmeleri vardır; Uzunluk düğmeleri Çıkış’u ayarlar. Seçimi önizle paylı aralığı oynatır ve oynatma sırasında Durdur olur. Hızlı kesim veya Hassas Kesim seçin.
6. İndirme ayarları başlangıçta açıktır; daraltmak veya yeniden açmak için başlığa tıklayın. Kapsayıcı, gerçek kaynak çözünürlüğü, codec, ses, altyazı ve modu seçin; sıraya ekleyin.
7. Etkin indirmeleri duraklatın (Duraklat/Sürdür) veya iptal edin (İptal). Başarısız olanları yeniden deneyin (Yeniden dene) ve tamamlanan dosyaları gösterin (Finder’da Göster). Bitenleri Temizle, tamamlanan, iptal edilen ve başarısız satırları kaldırır; etkin işleri ve kaydedilen dosyaları korur.

**Hesap ve Ayarlar** varsayılan olarak anonimdir. **Google’da oturum aç** / **YouTube’u bağla**, Google’ın kendi sayfalarını, oturumu uygulamanın web depolamasında kalan bir uygulama penceresinde açar; ardından _Uygulamanın YouTube oturumu_ seçildiğinde yt-dlp’ye iş başına özel bir çerez anlık görüntüsü verilir (0600 modu, sonra silinir ve başlangıçta temizlenir); tarayıcıya veya Anahtar Zinciri’ne erişim olmaz.

Bir tarayıcı seçmek, sonraki çerez erişimine açıkça izin verir ve işletim sistemi izinlerini tetikleyebilir. Başkasının çerezlerini içe aktarmayın veya paylaşmayın. Uygulamanın yapılandırma klasöründe yalnızca yollar ve tercihler saklanır. Kimlik doğrulama isteğe bağlıdır.

## Dil

Uygulama arayüzü İngilizce ve 19 başka dilde sunulur: Arapça, Bengalce, Çince (Basitleştirilmiş), Filipince, Fransızca, Almanca, Hintçe, Endonezce, İtalyanca, Japonca, Korece, Farsça, Portekizce (Brezilya), Rusça, İspanyolca, Telugu, Tayca, Türkçe ve Vietnamca. Varsayılan olarak sistem dilini izler. Başka bir dil seçmek için **Hesap ve Ayarlar → Dil**’i açın; seçim hemen uygulanır ve hatırlanır. Arapça ve Farsça sağdan sola düzenlenir. macOS yükleyicisinin sayfaları da Mac’inizin dilini izler.

## Geliştirme

Derleme notları yalnızca İngilizcedir: bkz. [İngilizce README](../../README.md#development).
