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
    <td align="center"><b>Português (Brasil)</b></td>
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

**Pare de baixar vídeos inteiros. Pegue só o momento que você quer.**

O TubeCutter é a maneira mais rápida de salvar exatamente o trecho de um vídeo do YouTube de que você precisa. Cole um link, veja a prévia, arraste para marcar os pontos de entrada e saída e o TubeCutter corta só aquela parte em um arquivo limpo. Coloque quantos clipes quiser na fila, pause ou cancele quando quiser e fique com os que você gostar. Feito para Windows e Mac.

<p align="center">
  <img src="../images/tubecutter-main.webp" alt="Janela principal do TubeCutter: cole um link do YouTube, veja a prévia do vídeo, escolha um trecho e adicione-o à fila de downloads" width="420">
</p>

**Situação atual da versão:** o instalador do Windows x64 está publicado na [versão v0.1.1](https://github.com/MolecularDust/TubeCutter/releases/tag/v0.1.1). Ele não tem assinatura de código, então o Windows SmartScreen pode alertar na primeira execução. Os arquivos `.app` e `.dmg` do macOS para Apple Silicon são builds locais de avaliação funcionais. Os testes de metadados e de download das ferramentas assinadas e as verificações de integridade de assinaturas e imagens passam. A exceção de validação de bibliotecas aprovada pelo usuário vale apenas para o yt-dlp; o app principal mantém a validação e o Deno roda com JIT desativado. Veja os [detalhes da assinatura](../SIGNING_APPROVAL.md). O build tem assinatura ad hoc, sem Developer ID e sem notarização.

## Baixar

- **Windows:** [Baixe a versão mais recente](https://github.com/MolecularDust/TubeCutter/releases/latest). Escolha uma instalação normal ou uma cópia portátil.
- **macOS:** [Baixe a versão mais recente](https://github.com/MolecularDust/TubeCutter/releases/latest).

## Configurar o acesso ao YouTube

1. Instale o TubeCutter e abra **Conta e ajustes**.
2. No menu **Autenticação**, escolha **Sessão do YouTube do app**.
3. Clique em **Entrar no Google** e conclua o login.

Pronto, você já pode usar o TubeCutter.

Para usar um navegador em que você já está conectado, escolha Chrome, Firefox ou Opera em **Autenticação**. No Windows, feche esse navegador antes de começar. Use apenas a sua própria conta. Não importe nem compartilhe cookies de outras pessoas.

Você também pode manter **Anônimo**, mas as verificações antibot do Google são mais rígidas para acesso anônimo.

## Uso

1. Escolha uma pasta de destino com o seletor nativo.
2. Cole um link do YouTube (watch, youtu.be ou Shorts) e clique em Analisar.
3. Use o player do YouTube em largura total. Os controles nativos dele cuidam da reprodução e do volume.
4. A linha do tempo é ativada automaticamente após a análise. Deixe Entrada/Saída como estão para baixar o vídeo inteiro; mudar qualquer um dos pontos seleciona um corte. Redefinir restaura o vídeo completo. Arraste Entrada/Saída, edite HH:MM:SS(.mmm) ou use Definir entrada/Definir saída. I/O funcionam fora dos campos; a barra de espaço alterna a reprodução. Arraste o triângulo vermelho acima da faixa para mover o cabeçote independentemente de Entrada/Saída. As setas movem um marcador ou o cabeçote em foco em 0,1 s, Shift+seta em 1 s; Home/End levam o cabeçote aos limites do vídeo.
5. Margem começa em 00 segundo e estende cada ponta, parando nos limites do vídeo. Duração mostra a duração resultante com a margem. Entrada, Saída, Margem e Duração têm botões de subir/descer de um segundo; os de Duração ajustam Saída. Visualizar seleção reproduz o intervalo com margem e vira Parar durante a reprodução. Escolha corte rápido ou Corte preciso.
6. Ajustes de download começa expandido; clique no título para recolher ou reabrir. Selecione contêiner, resolução real da origem, codec, áudio, legendas e modo, e adicione o resultado à fila.
7. Pause (Pausar/Retomar) ou cancele (Cancelar) downloads ativos. Tente de novo os que falharam (Tentar novamente) e mostre os arquivos concluídos (Mostrar no Finder). Limpar concluídos remove as linhas concluídas, canceladas e com falha, preservando os trabalhos ativos e os arquivos salvos.

**Conta e ajustes** é anônimo por padrão. **Entrar no Google** / **Conectar o YouTube** abrem as páginas do próprio Google em uma janela do app cujo login fica no armazenamento web do app; ao escolher depois _Sessão do YouTube do app_, o yt-dlp recebe uma cópia privada dos cookies por tarefa (modo 0600, apagada depois e limpa na inicialização), sem acesso ao navegador nem ao Chaveiro.

Escolher um navegador autoriza explicitamente o acesso posterior aos cookies dele e pode acionar permissões do sistema. Não importe nem compartilhe cookies de outras pessoas. Só caminhos e preferências são guardados na pasta de configuração do app. A autenticação é opcional.

## Idioma

A interface do app está disponível em inglês e em outros 19 idiomas: árabe, bengali, chinês (simplificado), filipino, francês, alemão, híndi, indonésio, italiano, japonês, coreano, persa, português (Brasil), russo, espanhol, telugo, tailandês, turco e vietnamita. Por padrão, ela segue o idioma do sistema. Para escolher outro, abra **Conta e ajustes → Idioma**; a escolha vale na hora e fica salva. Árabe e persa são exibidos da direita para a esquerda. As páginas do instalador do macOS também seguem o idioma do seu Mac.

## Desenvolvimento

As notas de compilação estão apenas em inglês: veja o [README em inglês](../../README.md#development).
