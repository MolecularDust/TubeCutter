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
    <td align="center"><b>한국어</b></td>
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

**동영상을 통째로 다운로드하지 마세요. 원하는 장면만 가져가세요.**

TubeCutter는 필요한 YouTube 동영상 구간만 정확히 저장하는 가장 빠른 방법입니다. 링크를 붙여넣고 미리 본 다음, 드래그해서 시작과 종료 지점을 표시하면 TubeCutter가 그 구간만 깔끔한 파일로 잘라 줍니다. 원하는 만큼 클립을 대기열에 넣고, 언제든 일시 중지하거나 취소하고, 마음에 드는 것만 보관하세요. Windows와 Mac용으로 만들었습니다.

<p align="center">
  <img src="../images/tubecutter-main.webp" alt="TubeCutter 메인 윈도우: YouTube 링크를 붙여넣고, 동영상을 미리 보고, 구간을 선택해 다운로드 대기열에 추가" width="420">
</p>

**현재 릴리스 상태:** Windows x64 설치 프로그램은 [v0.1.1 릴리스](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1)에 게시되어 있습니다. 코드 서명이 되어 있지 않아 처음 실행할 때 Windows SmartScreen이 경고할 수 있습니다. Apple Silicon용 macOS `.app`과 `.dmg`는 동작하는 로컬 평가 빌드입니다. 서명된 도구의 메타데이터/다운로드 테스트와 서명 및 이미지 무결성 검사는 통과합니다. 사용자가 승인한 라이브러리 검증 예외는 yt-dlp에만 적용되며, 메인 앱은 검증을 유지하고 Deno는 JIT를 끈 채 실행됩니다. [서명 세부 정보](../SIGNING_APPROVAL.md)를 참고하세요. 이 빌드는 임시(ad hoc) 서명이며 Developer ID 서명이나 공증은 되어 있지 않습니다.

## 다운로드

- **Windows:** [최신 릴리스 다운로드](https://github.com/MolecularDust/TubeCutter/releases/latest). 일반 설치 또는 휴대용 복사본을 선택하세요.
- **macOS:** [최신 릴리스 다운로드](https://github.com/MolecularDust/TubeCutter/releases/latest).

## YouTube 접근 설정

1. TubeCutter를 설치하고 **계정 및 설정**을(를) 여세요.
2. **인증** 메뉴에서 **앱의 YouTube 세션**을(를) 선택하세요.
3. **Google에 로그인**을(를) 클릭하고 로그인을 완료하세요.

이제 TubeCutter를 사용할 준비가 되었습니다.

이미 로그인한 브라우저를 대신 사용하려면 **인증**에서 Chrome, Firefox 또는 Opera를 선택하세요. Windows에서는 시작하기 전에 그 브라우저를 닫으세요. 본인 계정만 사용하세요. 다른 사람의 쿠키를 가져오거나 공유하지 마세요.

**익명**을(를) 유지해도 되지만, 익명 접근에서는 Google의 봇 방지 검사가 더 엄격합니다.

## 사용법

1. 기본 선택 창으로 저장할 폴더를 고르세요.
2. YouTube 링크(watch, youtu.be 또는 Shorts)를 붙여넣고 분석을(를) 클릭하세요.
3. 전체 너비의 YouTube 플레이어를 사용하세요. 재생과 볼륨은 플레이어 자체 컨트롤로 조절합니다.
4. 분석이 끝나면 타임라인이 자동으로 활성화됩니다. 동영상 전체를 다운로드하려면 시작/종료을(를) 그대로 두세요. 두 지점 중 하나를 바꾸면 자르기가 선택됩니다. 재설정은(는) 전체 동영상으로 되돌립니다. 시작/종료을(를) 드래그하거나 HH:MM:SS(.mmm)를 편집하거나 시작 지점 설정/종료 지점 설정을(를) 사용하세요. I/O는 입력란 밖에서 동작하며, 스페이스바로 재생을 전환합니다. 트랙 위의 빨간 삼각형을 드래그하면 시작/종료과(와) 별개로 재생 헤드를 움직일 수 있습니다. 화살표 키는 선택한 마커나 재생 헤드를 0.1초, Shift+화살표는 1초 움직이고, Home/End는 재생 헤드를 동영상의 처음과 끝으로 보냅니다.
5. 여유은(는) 기본 00초이며 동영상의 처음과 끝을 넘지 않는 범위에서 양쪽 끝을 늘립니다. 길이은(는) 여유를 포함한 길이를 보여 줍니다. 시작, 종료, 여유, 길이에는 1초 단위 위/아래 버튼이 있으며 길이 버튼은 종료을(를) 조정합니다. 선택 구간 미리보기은(는) 여유를 포함한 범위를 재생하고 재생 중에는 중지이(가) 됩니다. 빠른 자르기 또는 정밀 자르기을(를) 선택하세요.
6. 다운로드 설정은(는) 처음에 펼쳐져 있으며 제목을 클릭해 접거나 다시 펼 수 있습니다. 컨테이너, 실제 원본 해상도, 코덱, 오디오, 자막, 모드를 선택하고 대기열에 추가하세요.
7. 진행 중인 다운로드는 일시 중지(일시 중지/재개)하거나 취소(취소)할 수 있습니다. 실패한 항목은 다시 시도로 다시 시도하고 완료된 파일은 Finder에서 보기으로 표시합니다. 완료된 항목 지우기은(는) 완료, 취소, 실패한 행을 지우고 진행 중인 작업과 저장된 파일은 그대로 둡니다.

**계정 및 설정**은(는) 기본적으로 익명입니다. **Google에 로그인** / **YouTube 연결**은(는) Google의 페이지를 앱 윈도우에서 열며, 그 로그인은 앱의 웹뷰 저장소에 유지됩니다. 이후 *앱의 YouTube 세션*을(를) 선택하면 yt-dlp에 작업별 비공개 쿠키 스냅숏(모드 0600, 이후 삭제되고 시작할 때 정리됨)이 전달되며 브라우저나 키체인에는 접근하지 않습니다.

브라우저를 선택하면 이후 그 쿠키에 접근하는 것을 명시적으로 허용하는 것이며 OS 권한 요청이 나타날 수 있습니다. 다른 사람의 쿠키를 가져오거나 공유하지 마세요. 앱 설정 폴더에는 경로와 환경설정만 저장됩니다. 인증은 선택 사항입니다.

## 언어

앱 인터페이스는 영어와 다른 19개 언어로 제공됩니다. 아랍어, 벵골어, 중국어(간체), 필리핀어, 프랑스어, 독일어, 힌디어, 인도네시아어, 이탈리아어, 일본어, 한국어, 페르시아어, 포르투갈어(브라질), 러시아어, 스페인어, 텔루구어, 태국어, 튀르키예어, 베트남어입니다. 기본적으로 시스템 언어를 따릅니다. 다른 언어를 선택하려면 **계정 및 설정 → 언어**을(를) 여세요. 선택은 즉시 적용되고 기억됩니다. 아랍어와 페르시아어는 오른쪽에서 왼쪽으로 표시됩니다. macOS 설치 프로그램의 페이지도 Mac의 언어를 따릅니다.

## 개발

빌드 메모는 영어로만 제공됩니다. [영어 README](../../README.md#development)를 참고하세요.
