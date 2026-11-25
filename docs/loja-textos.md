# Textos para a Chrome Web Store (pt-BR)

Tudo abaixo é para copiar e colar no painel do desenvolvedor. Os campos seguem as abas Store listing e Privacy practices.

## Nome (máx. 75 caracteres)
Cotações: alertas de moedas, cripto e índices

## Resumo (máx. 132 caracteres, vem do manifest)
Acompanhe até 5 moedas, cripto ou índices e receba um aviso quando algum se mover rápido.

## Descrição detalhada
Acompanhe as cotações que importam para você num painel lateral do Chrome e receba um aviso quando algum preço se mover rápido.

O que a extensão faz:
• Mostra preço e variação em 24 horas de até 5 ativos que você escolher.
• Moedas: dólar, euro, libra, iene e yuan contra o real, e os pares globais EUR/USD, GBP/USD, USD/JPY e USD/CNY.
• Cripto: Bitcoin, Ethereum, BNB, Solana, XRP, TRON, Hyperliquid, Zcash, Dogecoin e Chainlink, sempre em dólar.
• Índices: S&P 500, Nasdaq-100, Nikkei 225, KOSPI 200 e o ETF EWZ (Brasil), por contratos negociados 24 horas.
• Gráfico de 24 horas, 7 dias e 30 dias, com máxima, mínima e abertura.
• Alertas do Chrome quando um ativo salvo sobe ou cai mais que o limite que você definiu dentro da janela de tempo escolhida.
• Aviso “Parado há …” quando uma fonte deixa de atualizar.

Você controla os alertas na aba Config: variação mínima, janela de análise, intervalo entre avisos e liga/desliga.

Privacidade: não há conta, cadastro nem servidor. Seus ativos e configurações ficam no navegador. A extensão consulta apenas serviços públicos de preço (AwesomeAPI, Binance e Hyperliquid), sem anúncios nem rastreadores. A política completa está na aba Config.

Importante:
• Os índices (e o EWZ) vêm de contratos negociados 24 horas. Eles indicam a direção do mercado, mas não são o valor oficial do índice.
• Os preços podem ter atraso ou erro. As informações são apenas informativas e não são recomendação de investimento.
• Extensão independente, sem relação com Binance, Hyperliquid, AwesomeAPI, Google ou com as moedas e índices citados. Nomes e logotipos pertencem aos seus donos e servem só para identificar cada ativo.

## Categoria
Produtividade (alternativa: Notícias e clima). Recomendo Produtividade.

## Idioma
Português (Brasil)

## Finalidade única (Privacy practices)
Mostrar as cotações de até 5 moedas, criptomoedas ou índices escolhidos pelo usuário e avisá-lo quando um deles se mover rápido.

## Justificativa das permissões
- **storage:** guarda os ativos salvos, as configurações de alerta e as últimas leituras de preço no navegador.
- **alarms:** acorda o service worker a cada minuto para consultar os preços dos ativos salvos e detectar movimentos rápidos.
- **notifications:** exibe o aviso quando um ativo salvo se move mais que o limite definido pelo usuário.
- **sidePanel:** abre a interface da extensão no painel lateral do Chrome.
- **Acesso ao host economia.awesomeapi.com.br:** buscar cotações de moedas.
- **Acesso ao host data-api.binance.vision:** buscar cotações e histórico de criptomoedas.
- **Acesso ao host api.hyperliquid.xyz:** buscar cotações e histórico dos contratos de 24 horas que representam os índices.

## Código remoto
Não, a extensão não usa código remoto. Todo o código vai dentro do pacote.

## Uso de dados (caixas do painel)
- Tipos de dados coletados: **nenhum** (marcar nada). Os ativos escolhidos ficam só no navegador do usuário e não são enviados a nós.
- Certificar as três declarações: não vendemos dados a terceiros; não usamos nem transferimos dados para fins alheios à finalidade única; não usamos nem transferimos dados para avaliar crédito ou empréstimo.

## Política de privacidade (campo de URL)
O painel exige uma URL pública. O texto completo está em `docs/politica-de-privacidade.md` (gerado de `src/ui/legal.js`, o mesmo que a aba Config mostra). A página pronta está em `site/index.html` (passo a passo em `site/LEIA-ME.md`). Recomendado: GitHub Pages de um repositório só da extensão.

## Imagens
- Capturas 1280x800: `store/screenshots/` (home, moedas, cripto, detail, indices, config). A loja aceita até 5; sugestão: home, cripto, detail, indices, config.
- Ícone 128x128: `dist/icons/icon128.png` (96x96 de arte e 16 px de folga).
- Tile pequeno 440x280 e marquee 1400x560: `store/promo/` (npm run promo, com npm run dev ligado).

## Antes de enviar
- Versão 1.0.0 já está no manifest.
- Termos das fontes lidos em 2026-11-25 (ver docs/publicar-chrome-web-store.md); reler no dia do envio.
- Conferir o contato público do publicador e o status de “trader” no painel.
