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
    <td align="center"><b>Español</b></td>
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

**Deja de descargar vídeos enteros. Quédate solo con el momento que quieres.**

TubeCutter es la forma más rápida de guardar exactamente la parte de un vídeo de YouTube que necesitas. Pega un enlace, previsualízalo, arrastra para marcar los puntos de entrada y salida y TubeCutter recorta justo esa sección en un archivo limpio. Pon en cola todos los clips que quieras, pausa o cancela cuando quieras y conserva los que te gusten. Hecho para Windows y Mac.

<p align="center">
  <img src="../images/tubecutter-main.webp" alt="Ventana principal de TubeCutter: pega un enlace de YouTube, previsualiza el vídeo, elige una sección y añádela a la cola de descargas" width="420">
</p>

**Estado actual de la versión:** el instalador de Windows x64 está publicado en la [versión v0.1.1](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1). No está firmado con certificado de código, así que Windows SmartScreen puede mostrar un aviso la primera vez. Los `.app` y `.dmg` de macOS para Apple Silicon son compilaciones locales de evaluación que funcionan. Las pruebas de metadatos y descarga de las herramientas firmadas y las comprobaciones de integridad de firmas e imágenes se superan. La excepción de validación de bibliotecas aprobada por el usuario solo afecta a yt-dlp; la aplicación principal mantiene la validación y Deno se ejecuta con JIT desactivado. Consulta los [detalles de la firma](../SIGNING_APPROVAL.md). La compilación está firmada ad hoc, no con Developer ID ni notarizada.

## Descargar

- **Windows:** [Descarga la última versión](https://github.com/MolecularDust/TubeCutter/releases/latest). Elige una instalación normal o una copia portátil.
- **macOS:** [Descarga la última versión](https://github.com/MolecularDust/TubeCutter/releases/latest).

## Configurar el acceso a YouTube

1. Instala TubeCutter y abre **Cuenta y ajustes**.
2. En el menú **Autenticación**, elige **Sesión de YouTube de la app**.
3. Haz clic en **Iniciar sesión en Google** y completa el inicio de sesión.

Ya puedes usar TubeCutter.

Si prefieres usar un navegador en el que ya has iniciado sesión, elige Chrome, Firefox u Opera en **Autenticación**. En Windows, cierra ese navegador antes de empezar. Usa solo tu propia cuenta. No importes ni compartas las cookies de otras personas.

También puedes dejar **Anónimo**, pero las comprobaciones antibots de Google son más estrictas con el acceso anónimo.

## Uso

1. Elige una carpeta de destino con el selector nativo.
2. Pega un enlace de YouTube (watch, youtu.be o Shorts) y haz clic en Analizar.
3. Usa el reproductor de YouTube a todo el ancho. Sus controles nativos gestionan la reproducción y el volumen.
4. La línea de tiempo se activa sola tras el análisis. Deja Entrada/Salida sin cambios para descargar el vídeo entero; al cambiar cualquiera de los dos puntos se selecciona un corte. Restablecer restaura el vídeo completo. Arrastra Entrada/Salida, edita HH:MM:SS(.mmm) o usa Fijar entrada/Fijar salida. I/O funcionan fuera de los campos; la barra espaciadora alterna la reproducción. Arrastra el triángulo rojo sobre la pista para mover el cabezal con independencia de Entrada/Salida. Las flechas mueven un marcador o el cabezal enfocado 0,1 s, Mayús+flecha 1 s; Inicio/Fin llevan el cabezal a los límites del vídeo.
5. Margen es de 00 segundos por defecto y amplía cada extremo sin pasar de los límites del vídeo. Duración muestra la duración resultante con el margen. Entrada, Salida, Margen y Duración tienen botones de subir/bajar de un segundo; los de Duración ajustan Salida. Previsualizar selección reproduce el intervalo con margen y pasa a ser Detener durante la reproducción. Elige corte rápido o Corte preciso.
6. Ajustes de descarga aparece desplegado al inicio; haz clic en su título para plegarlo o abrirlo. Selecciona contenedor, resolución real de origen, códec, audio, subtítulos y modo, y añade el resultado a la cola.
7. Pausa (Pausar/Reanudar) o cancela (Cancelar) las descargas activas. Reintenta las fallidas (Reintentar) y muestra los archivos terminados (Mostrar en el Finder). Borrar finalizadas quita las filas completadas, canceladas y fallidas, y conserva los trabajos activos y los archivos guardados.

**Cuenta y ajustes** es anónimo por defecto. **Iniciar sesión en Google** / **Conectar YouTube** abren las páginas de Google en una ventana de la app cuyo inicio de sesión se conserva en el almacenamiento web de la app; al elegir después _Sesión de YouTube de la app_, yt-dlp recibe una copia privada de cookies por tarea (modo 0600, borrada después y limpiada al iniciar), sin acceso al navegador ni al llavero.

Elegir un navegador autoriza expresamente el acceso posterior a sus cookies y puede activar permisos del sistema. No importes ni compartas las cookies de otras personas. En la carpeta de configuración de la app solo se guardan rutas y preferencias. La autenticación es opcional.

## Idioma

La interfaz de la app está disponible en inglés y en otros 19 idiomas: árabe, bengalí, chino (simplificado), filipino, francés, alemán, hindi, indonesio, italiano, japonés, coreano, persa, portugués (Brasil), ruso, español, telugu, tailandés, turco y vietnamita. Por defecto sigue el idioma del sistema. Para elegir otro, abre **Cuenta y ajustes → Idioma**; la elección se aplica al instante y se recuerda. El árabe y el persa se muestran de derecha a izquierda. Las páginas del instalador de macOS también siguen el idioma de tu Mac.

## Desarrollo

Las notas de compilación solo están en inglés: consulta el [README en inglés](../../README.md#development).
