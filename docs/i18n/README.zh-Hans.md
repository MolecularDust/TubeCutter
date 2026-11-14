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
    <td align="center"><b>简体中文</b></td>
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
    <td align="center"><a href="README.tr.md">Türkçe</a></td>
    <td align="center"><a href="README.vi.md">Tiếng Việt</a></td>
  </tr>
</table>

</details>

</div>
<!-- languages:end -->

# TubeCutter

**别再下载整段视频了，只取你想要的那一刻。**

TubeCutter 是保存 YouTube 视频中所需片段的最快方式。粘贴链接、预览、拖动标记入点和出点，TubeCutter 就会把那一段剪成一个干净的文件。可以排入任意多个片段，随时暂停或取消，只保留你喜欢的。适用于 Windows 和 Mac。

<p align="center">
  <img src="../images/tubecutter-main.webp" alt="TubeCutter 主窗口：粘贴 YouTube 链接、预览视频、选择片段并添加到下载队列" width="420">
</p>

**当前发布状态：** Windows x64 安装程序已发布在 [v0.1.1 发布版](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1)。它没有代码签名，因此 Windows SmartScreen 在首次运行时可能会发出警告。适用于 Apple 芯片的 macOS `.app` 和 `.dmg` 是可正常使用的本地评估版本。已签名工具的元数据/下载测试以及签名和镜像完整性检查均已通过。用户批准的库验证例外只适用于 yt-dlp；主应用保持验证，Deno 在禁用 JIT 的情况下运行。参见[签名详情](../SIGNING_APPROVAL.md)。该版本为临时（ad hoc）签名，未使用 Developer ID 签名，也未经过公证。

## 下载

- **Windows：** [下载最新版本](https://github.com/MolecularDust/TubeCutter/releases/latest)。可选择常规安装或便携版。
- **macOS：** [下载最新版本](https://github.com/MolecularDust/TubeCutter/releases/latest)。

## 设置 YouTube 访问

1. 安装 TubeCutter 并打开**账户与设置**。
2. 在**身份验证**菜单中选择**应用的 YouTube 会话**。
3. 点按**登录 Google**并完成登录。

现在可以使用 TubeCutter 了。

如果想改用已登录的浏览器，请在**身份验证**下选择 Chrome、Firefox 或 Opera。在 Windows 上，开始前请先关闭该浏览器。只使用你自己的账户，不要导入或共享他人的 Cookie。

你也可以保持**匿名**，但匿名访问时 Google 的反机器人检查更严格。

## 使用

1. 用系统选择器选择目标文件夹。
2. 粘贴 YouTube 链接（watch、youtu.be 或 Shorts），然后点按分析。
3. 使用全宽的 YouTube 播放器，播放和音量由其自带的控件控制。
4. 分析完成后，时间线会自动启用。保持入点/出点不变即可下载整个视频；更改任一点则会选定一段剪辑。重置可恢复整个视频。拖动入点/出点、编辑 HH:MM:SS(.mmm)，或使用设置入点/设置出点。I/O 在输入框之外也可使用；空格键切换播放。拖动轨道上方的红色三角形，可独立于入点/出点移动播放头。方向键将选中的标记或播放头移动 0.1 秒，Shift+方向键移动 1 秒；Home/End 将播放头移到视频的起止处。
5. 余量默认为 00 秒，向两端延伸，但不会超出视频边界。时长显示加上余量后的时长。入点、出点、余量和时长都有以一秒为单位的上下按钮；时长的按钮调整出点。预览所选片段播放含余量的范围，播放时变为停止。可选择快速剪辑或精确剪辑。
6. 下载设置起初是展开的；点按标题可折叠或重新展开。选择容器、实际源分辨率、编码、音频、字幕和模式，然后添加到队列。
7. 可暂停（暂停/继续）或取消（取消）正在进行的下载。失败的可用重试重试，完成的文件可用在访达中显示显示。清除已结束项会移除已完成、已取消和失败的行，同时保留进行中的任务和已保存的文件。

**账户与设置**默认为匿名。**登录 Google** / **连接 YouTube**会在应用窗口中打开 Google 自己的页面，登录状态保存在应用的网页视图存储中；之后选择*应用的 YouTube 会话*，yt-dlp 会获得每个任务专用的私有 Cookie 快照（模式 0600，用完即删，启动时清理），无需访问浏览器或钥匙串。

选择浏览器即明确授权之后访问其 Cookie，并可能触发系统权限请求。不要导入或共享他人的 Cookie。应用的配置文件夹中只保存路径和偏好设置。身份验证是可选的。

## 语言

应用界面提供英语和另外 19 种语言：阿拉伯语、孟加拉语、简体中文、菲律宾语、法语、德语、印地语、印度尼西亚语、意大利语、日语、韩语、波斯语、葡萄牙语（巴西）、俄语、西班牙语、泰卢固语、泰语、土耳其语和越南语。默认跟随系统语言。要选择其他语言，请打开**账户与设置 → 语言**；所选语言立即生效并会被记住。阿拉伯语和波斯语从右向左排版。macOS 安装器的页面也会跟随你的 Mac 语言。

## 开发

构建说明仅提供英文：请参阅[英文 README](../../README.md#development)。
