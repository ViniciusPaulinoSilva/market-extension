# O que falta para publicar na Chrome Web Store (2026-11-25)

Fontes: políticas e páginas do painel em developer.chrome.com/docs/webstore (lidas hoje). Itens marcados "não confirmei" não apareceram nas páginas lidas.

## 1. Conta e pacote
- Conta de desenvolvedor com taxa única de **US$ 5**, exigida de todo novo desenvolvedor.
- O pacote é um ZIP da pasta `dist` (limite de 2 GB; o nosso é menos de 1 MB). Falta o passo de empacotar e subir.
- Verificação em duas etapas e declaração de "trader" (UE): não confirmei, ver no painel ao criar a conta.

## 2. Política de privacidade (obrigatória, mesmo sem coletar dados)
- Precisa estar numa **URL pública** ligada no painel. Hospedar fora do politidata (por exemplo, GitHub Pages de um repositório só da extensão).
- Conteúdo: não temos servidor nem conta de usuário. Guardamos no navegador (`storage.sync` e `storage.local`) os ativos salvos, os limites e o histórico curto de preços. Ao consultar preços, o navegador contata AwesomeAPI, Binance e Hyperliquid, que veem o IP do usuário e os ativos pedidos. Nada é enviado a nós.
- As caixas de "uso de dados" do painel precisam bater com esse texto.

## 3. Campos do painel
- **Finalidade única:** "Mostrar cotações de até 5 moedas, criptomoedas e índices escolhidos pelo usuário e avisar quando um deles se mover rápido."
- **Justificativa de cada permissão** (pedem o mínimo necessário):
  - `storage`: guardar ativos salvos e configuração.
  - `alarms`: consultar preços a cada minuto com o service worker dormindo.
  - `notifications`: avisar sobre movimento rápido.
  - `sidePanel`: mostrar o painel lateral.
  - Hosts `economia.awesomeapi.com.br`, `data-api.binance.vision`, `api.hyperliquid.xyz`: buscar as cotações.
- **Código remoto:** "Não" (Manifest V3, nada é carregado de fora).

## 4. Imagens
- Ícone 128x128 PNG com 96x96 de arte e 16 px de folga por lado (os nossos ícones ainda precisam ser conferidos nessa regra).
- Pelo menos 1 captura de tela de 1280x800 ou 640x400, até 5 (feitas do painel real dentro do Chrome).
- Opcionais: tile pequeno 440x280 e marquee 1400x560.

## 5. Texto da loja
- Descrição objetiva, sem lista de marcas ou palavras-chave repetidas (política de spam de palavras-chave).
- Não dizer que é oficial nem associado a Binance, Hyperliquid, nem a nenhuma moeda ou índice (política de personificação).
- Avisos honestos: índices são "contrato 24h", não o valor oficial; moedas e cripto não são recomendação de investimento.

## 6. Logos de cripto (propriedade intelectual)
- Entraram os ícones do pacote **cryptocurrency-icons** (licença CC0) para BTC, ETH, BNB, SOL, XRP, TRX, ZEC, DOGE e LINK. CC0 libera os direitos autorais do desenho, **mas não as marcas** de cada projeto. O uso aqui é para identificar a moeda, sem sugerir apoio.
- **HYPE (Hyperliquid) não existe no pacote**, e o ícone atual é um disco simples nosso. Para usar o logo oficial é preciso achar um kit de marca com permissão.
- Regras de marca que li: Zcash permite usar o logo para indicar suporte à moeda, com a nossa marca mais evidente, link para z.cash e sem sugerir endosso; BNB Chain pede aprovação prévia e proíbe alterar o logo ou sugerir endosso; Dogecoin trata o logo como marca protegida. Bitcoin, Ethereum, Solana, XRP, TRON e Chainlink: não confirmei os termos.
- A política da loja diz que o item pode perder visibilidade se houver suspeita de violação de marca. Risco baixo, não zero.

## 7. Termos das fontes de dados (reler antes de enviar)
- AwesomeAPI, Binance (`data-api.binance.vision`) e Hyperliquid: sem proibição expressa de uso na pesquisa de hoje, mas reler os termos na data da publicação. O CoinGecko só foi usado para escolher as 10 moedas, não está no código.
- O consumo é de 1 consulta por minuto por usuário, só dos ativos salvos.

## 8. Pendências técnicas
- Testar dentro do Chrome: painel lateral, notificações, service worker.
- Tela de configuração (limites, janela, ligar e desligar alertas).
- Nome público, e-mail de contato e site/URL oficial do publicador.
- Versão 1.0.0 no manifest ao enviar.
