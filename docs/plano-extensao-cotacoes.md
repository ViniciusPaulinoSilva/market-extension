# Extensão Chrome: alertas de índices, moedas e cripto — levantamento

Data: 2026-11-24. Status: levantamento, nada implementado.
Observação: os limites das APIs abaixo vêm de buscas na web e do que sei delas. Vários são de blogs ou de uso não oficial. **Confirmar na documentação de cada provedor antes de construir.**

## 1. Resumo

É viável fazer sem pagar nada, com uma ressalva. Moedas e cripto têm fonte gratuita, oficial e quase em tempo real. Índices de bolsa não têm. O melhor caminho gratuito é um endpoint **não oficial** do Yahoo Finance, com atraso de até 15 min e risco de mudar sem aviso. Isso dá para um produto pessoal ou beta. Para publicar de forma estável na Chrome Web Store, é melhor ter um plano B (Stooq, Finnhub ou um proxy próprio).

Arquitetura: Manifest V3, um service worker que consulta as APIs a cada ~1 min (`chrome.alarms`), guarda um histórico curto de cotações e dispara `chrome.notifications` quando a variação passa de 2% na janela. Não precisa de backend.

## 2. Fontes de dados gratuitas

| Dado | Fonte | Chave? | Frescor | Observações |
|---|---|---|---|---|
| Moedas (USD, EUR, BRL, CNY, JPY, GBP) | **AwesomeAPI** (`economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL,...`) | Não (chave opcional) | ~30 s a 1 min | Foco no real. Também traz BTC, ETH em BRL. Não achei limites verificados, conferir a documentação |
| Moedas, par global | **Yahoo** (`USDJPY=X`, `EURUSD=X`, `GBPUSD=X`, `CNY=X`) | Não | atraso até ~15 min | Mesmo endpoint dos índices |
| Moedas, plano B | Frankfurter / ExchangeRate-API (grátis) | Não | **diário** | Diário não serve para alerta intradiário. Só como fallback ou histórico |
| Cripto (BTC, ETH, BNB, SOL) | **Binance** (`api.binance.com/api/v3/ticker/price` e `/ticker/24hr`) | Não | segundos | Limite por IP em "weight". Consulta de vários símbolos pesa 4 e a de um símbolo pesa 2. Excesso gera 429 e depois ban de IP, então fazer 1 chamada para os 4 símbolos. Há também WebSocket |
| Cripto, plano B | CoinGecko (grátis) ou Coinbase pública | Não / sim | ~1 min | Não confirmei os limites atuais do CoinGecko. Binance pode ser bloqueada em alguns países, então manter um fallback |
| Índices (S&P 500, Nasdaq, Dow, Ibovespa, DAX, FTSE, Nikkei, Hang Seng, CAC, Shanghai) | **Yahoo chart** (`query1.finance.yahoo.com/v8/finance/chart/%5EGSPC`) | Não | atraso até ~15 min | **Não oficial**, pode quebrar ou limitar. Símbolos: `^GSPC ^IXIC ^DJI ^BVSP ^GDAXI ^FTSE ^N225 ^HSI ^FCHI 000001.SS` |
| Índices, plano B | Stooq (CSV público) | Não | atrasado | Não verifiquei o estado atual do acesso. Testar antes |
| Índices, plano B pago ou com cadastro | Finnhub (plano grátis, cerca de 60 chamadas/min, índices podem ser restritos), Alpha Vantage (cerca de 25 chamadas/dia, inviável para polling) | Sim | variável | Alpha Vantage não serve para este caso |

Conclusões:
- **Atraso nos índices:** com dados gratuitos o "rápido" nos índices é de até 15 min. Alertas de 2% em minutos funcionam bem em moedas e cripto. Em índices, o alerta chega com atraso, e a interface deve avisar "dados com atraso".
- **Índices raramente mexem 2% em minutos.** Faz mais sentido uma janela maior para eles (ex.: 1 h ou variação no dia vs. fechamento anterior) do que para cripto.
- **Cripto mexe 2% com frequência.** Prever fadiga de alertas (ver cooldown abaixo).
- **Risco principal:** a dependência do Yahoo não oficial. Mitigar isolando cada fonte atrás de um adaptador (`getQuotes(symbols)`), para trocar de provedor sem mexer no resto.

## 3. Arquitetura da extensão (Manifest V3)

```
extensao/
  manifest.json        permissões: storage, alarms, notifications; host_permissions das APIs
  background.js        service worker: alarmes, coleta, detecção, notificação
  providers/           yahoo.js, awesomeapi.js, binance.js (mesma interface)
  catalog.js           lista fixa de ativos disponíveis (símbolo, nome, tipo, provedor)
  popup/               popup.html/js/css: abas Índices | Moedas | Cripto, lista dos 5 escolhidos
  options/             configurações: limite (%), janela, cooldown, sons
```

Pontos importantes do MV3:
- **Service worker não fica vivo.** Não dá para usar `setInterval`. Usar `chrome.alarms` (mínimo de 30 s nas versões atuais do Chrome; em versões antigas, 1 min). Todo estado fica no storage, nunca em variável global.
- **CORS:** declarar as APIs em `host_permissions` e o fetch do service worker passa sem CORS. Isso é o que permite usar Yahoo e AwesomeAPI sem proxy.
- **Conteúdo remoto:** sem scripts externos. Só dados (JSON) por fetch. Gráficos feitos localmente (canvas ou SVG).
- **Notificações:** permissão `notifications`; `chrome.notifications.create` com tipo `basic`, ícone e texto. O clique pode abrir o popup ou uma página do ativo.

## 4. Onde salvar os dados (no navegador)

| O quê | Onde | Motivo |
|---|---|---|
| Ativos escolhidos (até 5) e configurações | `chrome.storage.sync` | Sincroniza entre os Chrome do usuário. Limite ~100 KB total e 8 KB por item, sobra de sobra. Se o usuário não usa sync, funciona local |
| Histórico recente de cotações (para calcular variação) | `chrome.storage.local` (ou `session`) | Maior (cerca de 10 MB), não sincroniza. Guardar só os últimos ~60-120 min por ativo, com poda automática |
| Último alerta enviado por ativo (cooldown) | `chrome.storage.local` | Evitar spam |

Formato sugerido:
```json
{
  "selecionados": ["USDBRL", "^BVSP", "BTCUSDT"],
  "config": { "limitePct": 2, "janelaMin": 15, "cooldownMin": 30 },
  "historico": { "USDBRL": [[1732450000, 5.4210], [1732450060, 5.4222]] },
  "ultimoAlerta": { "USDBRL": 1732449000 }
}
```
Validar a escolha ao salvar (máximo 5; vem do catálogo; não duplicado) e tratar o `storage` com erro, pois ele pode falhar.

## 5. Lógica de alerta

A cada ciclo (alarme):
1. Buscar as cotações dos ativos escolhidos (agrupar por provedor: **uma chamada por provedor**, não uma por ativo).
2. Anexar ao histórico e podar o que passou da janela maior.
3. Para cada ativo, comparar o preço atual com o menor/maior preço na janela (ex.: 15 min): `variação = (atual - referência) / referência`.
4. Se `|variação| >= limite` e fora do cooldown, notificar: **"Dólar acabou de subir 2,75% nos últimos minutos"**. Formatação em pt-BR (vírgula decimal).
5. Registrar `ultimoAlerta`. Só alertar de novo após o cooldown ou se a variação crescer mais um degrau (ex.: +1 ponto).

Cuidados:
- **Mercado fechado:** índices não se mexem à noite e nos fins de semana, e o Yahoo informa o estado do mercado. Não alertar com dados parados. Câmbio fecha no fim de semana. Cripto roda 24 h.
- **Saltos na abertura:** a primeira cotação do dia pode "pular" em relação ao fechamento de ontem. Isso não é movimento rápido. Calcular só dentro de dados da mesma sessão.
- **Dados ruins:** descartar cotação zero, nula ou que varie mais de ~20% de uma vez (erro de API).
- **Inatividade do computador:** com o PC dormindo não há coleta. Ao voltar, o histórico tem uma lacuna: comparar só amostras com idade dentro da janela.
- **Frequência de coleta sugerida:** cripto e moedas a cada 1 min. Índices a cada 5 min (o dado já vem atrasado, não adianta mais rápido e reduz o risco de bloqueio).

## 6. Interface

- **Popup** com 3 abas (Índices, Moedas, Cripto). Cada linha: nome, preço, variação do dia (verde/vermelho), mini-gráfico.
- **Seleção:** busca no catálogo, botão de adicionar, contador "3/5". Ao tentar o 6º, avisar para remover um.
- **Badge** no ícone (ex.: ponto vermelho quando há alerta novo).
- **Opções:** limite (%), janela, cooldown, ligar/desligar por ativo.
- Mostrar "atualizado há X min" e um aviso de "dados com ~15 min de atraso" nos índices.

## 7. Trabalho necessário (estimativa)

| Etapa | Conteúdo | Esforço |
|---|---|---|
| 1. Prova de conceito das APIs | Testar Yahoo, AwesomeAPI e Binance de dentro de uma extensão; medir atraso e estabilidade por alguns dias | 1 dia |
| 2. Esqueleto MV3 | manifest, service worker, alarmes, adaptadores | 1-2 dias |
| 3. Storage e histórico | seleção, config, histórico podado | 1 dia |
| 4. Detecção e notificação | janela, cooldown, mercado fechado, texto pt-BR | 1-2 dias |
| 5. Popup e opções | abas, seleção de até 5, mini-gráficos | 2-3 dias |
| 6. Testes | simular quedas/altas com dados falsos, testar sono do PC, falhas de rede | 1-2 dias |
| 7. Publicação | ícones, textos, política de privacidade, taxa única de cadastro de desenvolvedor na Chrome Web Store (cerca de US$ 5), revisão | 1-2 dias |

Total aproximado: 8 a 12 dias de trabalho para uma versão completa.

## 8. Riscos e decisões em aberto

1. **Yahoo não oficial:** pode bloquear, mudar o formato ou violar termos de uso numa publicação ampla. Decidir: aceitar o risco (uso pessoal), ou publicar com plano B (Finnhub com chave do próprio usuário, ou proxy próprio).
2. **Atraso dos índices:** aceitável para o produto? A mensagem deve deixar claro.
3. **Privacidade:** a extensão não precisa de conta nem coleta nada. Todas as escolhas ficam no navegador. Dizer isso na loja.
4. **"Dólar":** definir se é USD/BRL (padrão para brasileiros) ou o índice DXY. Sugestão: USD/BRL, e o catálogo traz os outros pares.
5. **Moedas "base":** par fixo em relação ao real, ou o usuário escolhe a moeda base? Mais simples começar com tudo em BRL e USD.
6. **Escopo do idioma:** só português ou também inglês.
7. **Firefox/Edge:** Edge aceita a mesma extensão. Firefox exige pequenos ajustes.

## 9. Próximos passos sugeridos

1. Fazer a prova de conceito das 3 fontes (etapa 1) para confirmar atraso e estabilidade reais.
2. Fechar o catálogo inicial (lista exata de índices, moedas e cripto).
3. Decidir os pontos 1, 2 e 4 da seção 8.
4. Construir o esqueleto e o fluxo de alerta antes da interface.

## 10. Resultados dos testes (2026-11-25, ~02:35 UTC, testado com curl)

### O Google tem API pública?
**Não.** O Google Finance não tem API. Os números que aparecem na busca vêm de dados licenciados de bolsas, e a página só entrega o preço por JavaScript. Eu pedi a página do Google Finance e não veio preço nenhum no HTML, então raspar não funciona sem navegador. Além disso, o Google marca vários índices como atrasados e raspar viola os termos dele. Descartado.

### Atraso real medido nos índices
| Fonte | Resultado |
|---|---|
| **Yahoo `chart`** | Funciona sem chave. Nikkei, Hang Seng e Shanghai, com o mercado aberto, vieram com **~15 min de atraso** (900 s). O `v7/quote` retorna "Unauthorized", então só o `v8/chart` serve. Futuros (ES, NQ, YM) com ~10 min. Cripto e Euro/Dólar com 17 a 34 s |
| **TradingView scanner** (`scanner.tradingview.com/global/scan`) | Funciona sem chave, sem cookie e com qualquer `Origin` (testei com origem de extensão). Cada símbolo informa seu modo em `update_mode`. Nikkei veio **56.710** contra **56.560** do Yahoo, ou seja, o TradingView estava à frente. Atualiza o snapshot a cada **~20-25 s** (medi 18 leituras comparando com a Binance) |

**Conclusão:** a melhor fonte de índices ao vivo é o scanner do TradingView, mas ele **não é uma API oficial** (mesmo risco do Yahoo, e os termos do TradingView restringem uso automatizado).

### Quais índices vêm ao vivo no TradingView (`streaming`)
| Ao vivo (`streaming`) | Atrasado (`delayed_streaming_NNN`, em segundos) |
|---|---|
| `TVC:NI225` (Nikkei), `TVC:HSI` (Hang Seng), `TVC:UKX` (FTSE 100), `TVC:CAC40`, `TVC:DEU40` (DAX), `OANDA:US30USD` (Dow, CFD), `OANDA:DE30EUR`, `OANDA:HK33HKD`, `TVC:DXY` | `SP:SPX` (S&P 500) 10 min, `DJ:DJI` 10 min, `NASDAQ:NDX`/`IXIC` 15 min, `BMFBOVESPA:IBOV` **15 min**, `SSE:000001` 15 min, `XETR:DAX` 15 min, `CME_MINI:ES1!` 10 min |

Pontos:
- **Ibovespa e Shanghai: sem fonte ao vivo e gratuita.** O índice da B3 é licenciado, então fica com ~15 min em todas as fontes testadas. Alternativa a investigar: usar um substituto, como o mini-índice (`WIN1!`, também atrasado 15 min) ou a ação de um ETF (BOVA11), que pode ter dado melhor. Não testei.
- **S&P 500 e Nasdaq ao vivo:** o índice "de verdade" é atrasado. Existem CFDs de corretoras (Capital.com, FOREXCOM, Pepperstone `US500`, `NAS100`) que são em tempo real, mas **os símbolos que testei vieram vazios no scanner**. Só o Dow em CFD (`OANDA:US30USD`) respondeu ao vivo. Falta achar o símbolo certo, e talvez seja preciso o WebSocket do TradingView.
- **Moedas** (`FX_IDC:USDBRL`, `EURBRL`, `GBPBRL`, `JPYBRL`, `CNYBRL`, `EURUSD`, `USDJPY`, `GBPUSD`, `USDCNY`): todas `streaming`. O dólar do TradingView e da AwesomeAPI bateram (5,9053).
- **Cripto** (`BINANCE:BTCUSDT`, `ETHUSDT`, `BNBUSDT`, `SOLUSDT`): `streaming`.
- Os símbolos que o scanner não reconhece simplesmente somem da resposta, sem erro. O código precisa checar quais voltaram.

### Teste das demais APIs
| API | Resultado |
|---|---|
| **AwesomeAPI** (`/json/last/USD-BRL,EUR-BRL,CNY-BRL,JPY-BRL,GBP-BRL`) | OK, sem chave. Os `timestamp` variam por par (o EUR/BRL estava ~4 h à frente do USD/BRL, que parou às 19:44 locais), então **cada par tem seu próprio relógio e alguns ficam parados**. Usar o `timestamp` para detectar dados velhos |
| **Binance** (`api.binance.com/api/v3/ticker/price`) | OK. Preço atualizando a cada poucos segundos. Mostra `x-mbx-used-weight-1m`, útil para controlar o limite. Cuidado: em curl, o parâmetro `symbols=[...]` precisa de aspas e escape. Também responderam `data-api.binance.vision` e `api.binance.us` como reserva |
| **Coinbase** (`/v2/prices/BTC-USD/spot`) | OK, sem chave |
| **CoinGecko** (`/simple/price`, 4 moedas + variação 24 h) | OK, sem chave. Vale como reserva (limite não confirmado) |
| **Stooq** (CSV) | **Falhou**: o endereço testado devolveu "página não existe". Não testei outras variações. Descartado por ora |
| **Yahoo `v7/quote`** | Bloqueado (Unauthorized). Só o `v8/chart` funciona |

### Fonte recomendada por categoria (revisada)
- **Cripto:** Binance (reserva: Coinbase ou CoinGecko).
- **Moedas:** TradingView `FX_IDC:*` como principal e AwesomeAPI como reserva, que é mais simples e dá o real direto.
- **Índices:** TradingView como principal (ao vivo para Nikkei, Hang Seng, FTSE, CAC, DAX, Dow CFD), Yahoo como reserva (~15 min). Ibovespa, S&P, Nasdaq e Shanghai ficam com 10-15 min de atraso até acharmos outra fonte, e a interface deve marcar "atrasado".

### Pendências dos testes
1. Achar símbolo ao vivo (CFD) de S&P 500 e Nasdaq 100 no TradingView, e testar o BOVA11 como proxy do Ibovespa.
2. Testar o **WebSocket do TradingView** para streaming real (menos de 1 s), que seria o único caminho para "ao vivo de verdade". É não documentado e mais frágil, e no MV3 o service worker não mantém conexão aberta por muito tempo (talvez via documento offscreen).
3. Testar durante o pregão americano (hoje só havia Ásia aberta), para confirmar os atrasos dos índices dos EUA.
4. Ver os termos de uso do TradingView e do Yahoo antes de publicar na loja.

## 11. Segunda rodada: fontes ao vivo para S&P, Nasdaq e Brasil (2026-11-25)

### O que não funcionou
- **Scanner do TradingView, CFDs de corretoras:** testei 261 combinações (Capital.com, FOREXCOM, Pepperstone, IC Markets etc.) com nomes de S&P e Nasdaq. **Nenhuma** existe no scanner. Só os CFDs da OANDA de Dow, DAX e Hang Seng respondem.
- **Scanner, mercados `cfd` e `forex`:** vazios.
- **Futuros** (`ES1!`, `NQ1!`, `YM1!`) e **tudo da B3** (`IBOV`, `BOVA11`, `PETR4`, `WIN1!`, `DOL1!`, `WDO1!`): `delayed_streaming_600` e `delayed_streaming_900`.
- **ETFs americanos** (`SPY`, `QQQ`, `DIA`) no scanner: 15 min.
- **Conclusão:** no TradingView sem login, Ibovespa e tudo da B3 ficam com **15 min de atraso**, e S&P e Nasdaq oficiais com 10 a 15 min. Ibovespa ao vivo não existe de graça.

### O que funcionou: contratos perpétuos 24h de corretoras de cripto
São contratos que acompanham o índice ou o ETF, têm preço público e se atualizam em segundos, **inclusive fora do horário da bolsa**.

| Fonte | Ativos úteis | Frescor medido | Observações |
|---|---|---|---|
| **Hyperliquid, dex `xyz`** (`POST api.hyperliquid.xyz/info`, `{"type":"allMids","dex":"xyz"}`) | `xyz:SP500` (7.161,85), `xyz:XYZ100` (Nasdaq-100, 25.938,5), `xyz:JP225`, `xyz:KR200`, `xyz:DXY`, `xyz:EUR`, `xyz:GBP`, `xyz:JPY`, `xyz:EWZ` (Brasil, ETF em dólar), `xyz:EWJ`, `xyz:GOLD`, mais ~150 ativos | Sem chave, uma chamada traz todos. O WebSocket entregou a primeira mensagem em 1,6 s | **Preço no nível do índice** (S&P em ~7.160, não dividido por 10). Não achei Dow, DAX, FTSE, Hang Seng nem Ibovespa nesse dex |
| **Binance Futures** (`GET fapi.binance.com/fapi/v1/ticker/price`) | `SPYUSDT` (715,91), `QQQUSDT` (632,19), `EWZUSDT` (29,25), `XAUUSDT` e `USDBRLUSDT` | `SPYUSDT` e `QQQUSDT` com 7-8 s. `EWZUSDT` com 83 s (pouca liquidez) | Seguem o **ETF**, não o índice (SPY ≈ S&P ÷ 10). Serve para variação percentual, que é o que o alerta usa. WebSocket de futuros não respondeu no meu teste |
| **Binance Spot, WebSocket** (`wss://stream.binance.com:9443/stream?streams=btcusdt@miniTicker/...`) | cripto | Primeira mensagem em 3,4 s, 18 mensagens em 12 s | Funciona para cripto ao vivo de verdade |

Cuidados com esses contratos perpétuos:
- Fora do pregão eles continuam negociando, então refletem a **expectativa** do mercado (por isso o `SP500` do Hyperliquid, 7.161, está abaixo do fechamento oficial, 7.201). É informação mais atual que o índice oficial, mas **não é o valor oficial**. A interface deve rotular como "contrato 24h".
- Têm liquidez menor que o índice, então podem ter saltos curtos. O alerta deve exigir a variação confirmada em duas leituras seguidas.
- Não são APIs oficiais de índice, mas Hyperliquid e Binance têm APIs públicas documentadas para esses dados, e o risco de termos é menor que o de raspar o TradingView.

### Ibovespa
Não há fonte gratuita ao vivo do índice. Opções:
1. **Mostrar o Ibovespa com 15 min de atraso** (TradingView ou Yahoo) e marcar como atrasado. É a opção mais honesta.
2. **Proxy ao vivo:** `xyz:EWZ` (Hyperliquid) ou `EWZUSDT` (Binance) acompanham o ETF EWZ (Brasil em dólar). Ele mistura Ibovespa e câmbio, então **não é o Ibovespa**, mas dá um sinal de choque durante o pregão americano.
3. **Dólar/real ao vivo** já está resolvido (TradingView `FX_IDC:USDBRL`, AwesomeAPI e `USDBRLUSDT` na Binance).

### Mapa final de fontes por ativo

| Ativo | Fonte principal | Reserva | Atraso |
|---|---|---|---|
| Bitcoin, Ethereum, BNB, Solana | Binance Spot | Coinbase, CoinGecko | segundos |
| USD, EUR, GBP, JPY, CNY (contra BRL) | TradingView `FX_IDC:*` | AwesomeAPI | ~20-30 s |
| Dólar, euro, libra, iene (pares globais) | TradingView `FX_IDC:*` | Hyperliquid `xyz:EUR` etc. | ~20-30 s |
| Nikkei, Hang Seng, FTSE, CAC, DAX | TradingView `TVC:*` | Yahoo (15 min) | ~20-30 s |
| Dow | TradingView `OANDA:US30USD` | Yahoo (10 min) | ~20-30 s |
| S&P 500 | Hyperliquid `xyz:SP500` (24h) | TradingView `SP:SPX` (10 min) | segundos (contrato) |
| Nasdaq | Hyperliquid `xyz:XYZ100` (24h) | TradingView `NASDAQ:NDX` (15 min) | segundos (contrato) |
| Ibovespa | TradingView `BMFBOVESPA:IBOV` | Yahoo `^BVSP` | **15 min** |
| Shanghai | TradingView `SSE:000001` | Yahoo `000001.SS` | **15 min** (Shenzhen `SZSE:399001` está ao vivo) |

### Pendências
1. Repetir os testes com o pregão americano aberto, para ver se os atrasos dos índices oficiais mudam e comparar o preço do contrato com o do índice.
2. Decidir se o contrato perpétuo conta como "S&P 500" na interface ou se aparece com outro rótulo.
3. Ver os termos de uso de TradingView, Yahoo, Hyperliquid e Binance antes de publicar na loja.
4. Definir a janela e o limite de alerta por tipo de ativo (cripto e contratos mexem mais que índices).

## 12. Decisões do usuário e revisão para publicação (2026-11-25)

### Decisões
- Valor exibido dos índices = **índice oficial**, em pontos, na moeda de cada bolsa. Contrato 24h descartado como valor exibido.
- Cripto sempre em **dólar**: BTC, ETH, BNB, SOL. Alerta de cripto só com variação de **5%**.
- A extensão será **publicada** na Chrome Web Store.
- Moedas já citadas (dólar, euro, real, yuan, iene, libra). Índices já citados mais outros principais, incluindo um índice global, se possível.

### Risco legal das fontes atuais para uma extensão publicada
| Fonte | Termos | Veredito |
|---|---|---|
| **TradingView scanner** | Dados licenciados "exclusivamente para exibição"; proíbe criar produtos com seu conteúdo, e o suporte diz que scripts, APIs e raspagem são proibidos ("manual use only") | **Não usar** |
| **Yahoo `v8/chart`** | Não há API oficial; os termos de API do Yahoo limitam o uso a clientes Yahoo e proíbem ganhar receita sem permissão; a própria comunidade do yfinance diz que é "uso pessoal" | **Não usar na versão publicada** (só em protótipo) |
| **CNBC `restQuote`** | Endpoint do site, sem API pública. Não li os termos, mas são de site de mídia com dados licenciados | **Não usar** (tratar como o Yahoo) |
| **Binance API pública** | Um fórum de desenvolvedores diz que não há política específica para dados de mercado públicos (post de comunidade, não oficial). Os termos de `data.binance.vision` (arquivos históricos) excluem uso comercial, mas não cobrem os endpoints ao vivo | **Risco baixo a médio**; confirmar nos termos atuais da Binance, ou escrever para eles |
| **AwesomeAPI** | API pública pensada para uso por terceiros. Não li os termos | Provável OK; ler os termos e creditar |
| **Hyperliquid** | API pública documentada | Não é mais necessária |
| **Coinbase** | Tem página própria de termos de dados de mercado (`coinbase.com/legal/market_data`) | Ler antes de usar como reserva |
| **CoinGecko** | Não consegui consultar os termos | Verificar (o plano gratuito costuma exigir crédito) |

**Conclusão:** TradingView, Yahoo e CNBC servem para protótipo, mas não para publicar. Para os **índices**, a opção legítima é uma API com chave e plano gratuito (Finnhub, Twelve Data, FMP), em que **cada usuário coloca a própria chave** (BYOK). Isso evita estourar a cota de uma chave única e evita questões de redistribuição. Mesmo assim, os planos gratuitos costumam ser de uso não comercial e com cobertura de índices limitada, o que precisa ser confirmado. Isso não é aconselhamento jurídico.

### Chaves gratuitas (cadastro feito pelo próprio usuário)
| Provedor | Onde | Plano gratuito (não verificado) |
|---|---|---|
| Finnhub | finnhub.io/register | ~60 chamadas/min, ações dos EUA em tempo real, uso não comercial. Índices: a confirmar |
| Twelve Data | twelvedata.com (cadastro pelo site, plano Basic) | 8 chamadas/min, 800/dia. Índices: a confirmar |
| Financial Modeling Prep | site.financialmodelingprep.com (cadastro de desenvolvedor) | ~250 chamadas/dia. Índices: a confirmar |

### Regras de alerta (propostas, a confirmar)
| Tipo | Limite | Janela | Cooldown |
|---|---|---|---|
| Cripto | **5%** (decidido) | 60 min | 60 min |
| Moedas | 2% | 30 min | 60 min |
| Índices | 2% | variação sobre o fechamento anterior (dado atrasado 10-15 min) | 1 alerta por dia e por direção |
- Alerta de novo no mesmo ativo só com mais 1 ponto percentual além do anterior (cripto: mais 2,5 pontos).
- Índices só alertam com a bolsa aberta.

### Catálogo proposto
**Cripto (em dólar):** BTC/USD, ETH/USD, BNB/USD, SOL/USD. Principal: Binance Spot (`BTCUSDT`, `ETHUSDT`, `BNBUSDT`, `SOLUSDT`, tratando USDT como dólar). Reserva: Coinbase (BTC, ETH, SOL; o BNB não está na Coinbase) e CoinGecko.

**Moedas:**
| Par | Principal | Reserva |
|---|---|---|
| USD/BRL, EUR/BRL, GBP/BRL, JPY/BRL, CNY/BRL | AwesomeAPI | Twelve Data (forex) |
| EUR/USD, GBP/USD, USD/JPY, USD/CNY | AwesomeAPI | Twelve Data (forex) |

**Índices** (pontos oficiais; símbolos Yahoo só como referência de protótipo; a fonte de produção depende das chaves):
| Região | Índice | Símbolo de referência |
|---|---|---|
| EUA | S&P 500, Nasdaq Composite, Nasdaq-100, Dow Jones, Russell 2000 | `^GSPC`, `^IXIC`, `^NDX`, `^DJI`, `^RUT` |
| Brasil | Ibovespa | `^BVSP` |
| Europa | FTSE 100, DAX, CAC 40, Euro Stoxx 50 | `^FTSE`, `^GDAXI`, `^FCHI`, `^STOXX50E` |
| Ásia | Nikkei 225, Hang Seng, Shanghai Composite, Shenzhen Component, KOSPI, Nifty 50 | `^N225`, `^HSI`, `000001.SS`, `399001.SZ`, `^KS11`, `^NSEI` |
| Outros | S&P/TSX (Canadá), ASX 200 (Austrália), IPC (México) | `^GSPTSE`, `^AXJO`, `^MXX` |
| Global | MSCI World (o índice oficial só é gratuito com atraso de um dia; o ETF `URTH` serve de proxy, mas não é o índice) | a decidir |

### Pendências
1. Cadastrar as 3 chaves e testar quais índices cada plano gratuito entrega e com que atraso.
2. Ler os termos de AwesomeAPI, Binance, Coinbase e CoinGecko.
3. Confirmar o modelo BYOK (usuário coloca a própria chave) e o que a extensão mostra sem chave.
4. Confirmar as regras de alerta da tabela.
5. Repetir os testes de atraso com o pregão americano aberto.

## 13. Testes com as chaves e leitura dos termos (2026-11-25)

Decisão do usuário: **janela de 5 min e cooldown de 5 min para todos os tipos** (cripto continua com limite de 5%). Proxy aceito para o índice mundial.

### Financial Modeling Prep, plano gratuito (testado)
| Ativo | Resultado |
|---|---|
| Índices que funcionam | `^GSPC` (S&P 500), `^IXIC` (Nasdaq Composite), `^DJI`, `^RUT`, `^FTSE`, `^STOXX50E`, `^N225`, `^HSI` |
| Índices **bloqueados** (premium) | `^NDX`, **`^BVSP` (Ibovespa)**, `^GDAXI` (DAX), `^FCHI` (CAC), `000001.SS`, `^KS11`, `^NSEI`; também `BOVA11.SA`, `EWZ`, `URTH` |
| Cripto | `BTCUSD`, `ETHUSD`, `SOLUSD`, `BNBUSD` com 1 a 2 s de idade |
| Moedas | `EURUSD` OK (6 s). `USDBRL` bloqueado |
| Frescor dos índices | O campo `timestamp` do S&P veio no horário do fechamento americano. O atraso **durante o pregão não foi medido** |
| Limite | Uma chamada por símbolo (lote e vírgula bloqueados). 30 chamadas seguidas passaram. O limite diário de ~250 chamadas vem de buscas, não foi confirmado |

### Twelve Data, plano gratuito (testado)
| Ativo | Resultado |
|---|---|
| Moedas | EUR/USD, USD/BRL, USD/JPY, GBP/USD, USD/CNY OK, com 13 a 63 s de idade |
| Cripto | BTC/USD, BNB/USD, SOL/USD OK (6 a 178 s) |
| ETFs | SPY, EWZ, URTH OK (proxy do índice mundial: URTH). Valores do fechamento, pois o mercado estava fechado |
| Índices | S&P 500 (`SPX`) exige plano Pro, Nasdaq-100 e FTSE exigem Grow. Os demais símbolos testados não existem no plano. B3 (`BOVA11`, `IBOV`, `PETR4`) não encontrado |
| Créditos | 1 crédito por símbolo, inclusive em chamada em lote. O limite de 8 por minuto estourou durante os testes |

### Termos lidos (por um agente que buscou as páginas; não é aconselhamento jurídico)
| Fonte | O que dizem os termos | Efeito para a extensão publicada |
|---|---|---|
| **Twelve Data** (atualizados em 01/01/2026) | Licença só para **uso interno**. Mostrar dados a terceiros exige um plano ou add-on com direito de redistribuição. Dados do plano gratuito não podem ser usados com fins comerciais. Compartilhar credenciais é proibido | **Chave embutida na extensão: não pode.** Chave de cada usuário (BYOK): defensável, porque a extensão não redistribui dados e o licenciado é o próprio usuário, mas é uma interpretação, não um texto dos termos |
| **Finnhub** | Planos "estritamente pessoais"; compartilhar acesso ou resultados exige aprovação por escrito | Só com BYOK e, mesmo assim, é arriscado. Não testado |
| **CoinGecko** | Permite integrar a API em aplicativos distribuídos, mas exige "Powered by CoinGecko" visível, contrato e política de privacidade do usuário com cláusulas específicas, cache de no máximo 24 h e proíbe revenda. Demo: 100 chamadas/min e 10.000/mês. A licença comercial só consta nos planos pagos | Permitido com condições; o plano Demo gratuito é ambíguo para uso comercial |
| **AwesomeAPI** | A documentação não traz termos de uso. Sem chave os dados ficam em cache de 1 min. Chave gratuita citada para até 100.000 requisições | Sem restrição visível, mas também sem permissão expressa |
| **Binance** | Endpoints públicos de mercado (`data-api.binance.vision`) não pedem chave. Os termos de uso não foram legíveis | Indeterminado |
| **Coinbase** (lido no navegador, atualizado em 07/08/2026) | Licença só para uso pessoal ou de pesquisa do próprio usuário. **Proíbe criar aplicativo para outros usuários finais** e proíbe exibir ou redistribuir os dados a terceiros sem consentimento por escrito | **Não usar** na extensão publicada. Sai da lista de reservas |
| **FMP** (lido no navegador, vigente desde 17/11/2026) | Contrato individual, **só uso pessoal, não comercial**. "Uso comercial" inclui usar os dados para desenvolver ou operar qualquer aplicativo oferecido a outra pessoa. Proíbe exibir ou repassar os dados a terceiros e compartilhar a chave. Plano gratuito pode mudar ou acabar a qualquer momento. Limite de consultas definido por plano | **Chave embutida: não pode.** **BYOK (cada usuário com a própria chave): zona cinzenta.** Cada usuário usaria os dados para si, mas o texto proíbe usar o serviço para "desenvolver" aplicativo que outros usam, e vale também para os testes do desenvolvedor. Risco real de a conta ser suspensa. Contato para licença: info@financialmodelingprep.com |

### Conclusões
1. Dos índices da lista, **só 8 têm fonte gratuita testada** (FMP). **Ibovespa, DAX, CAC, Shanghai, KOSPI e Nifty não têm fonte gratuita e legítima.** Ou saem do catálogo, ou ficam como "indisponível sem plano pago".
2. O limite diário do FMP (~250 chamadas, não confirmado) é incompatível com consultar a cada 5 min: um único índice consultado a cada 5 min gastaria ~288 chamadas por dia. Como o dado de índice já é atrasado, a consulta pode ser mais espaçada (a cada 15 a 30 min, só com a bolsa aberta). O alerta de 5 min vale para moedas e cripto.
3. Moedas: AwesomeAPI e Twelve Data (BYOK) cobrem os 9 pares do catálogo. Cripto: Binance como principal, FMP e Twelve Data (BYOK) como reservas.
4. Modelo recomendado: sem chave, a extensão mostra moedas e cripto; com chave própria (FMP e/ou Twelve Data), libera os índices e o proxy mundial.

## 14. Substitutos dos índices e termos de Hyperliquid, trade.xyz e Binance (2026-11-25)

### Substitutos que existem (contratos 24h e ETFs, não o índice oficial)
| Índice | Substituto | Fonte | Observação |
|---|---|---|---|
| S&P 500 | `xyz:SP500` (pontos) e `SPYUSDT` (ETF) | Hyperliquid `xyz`, Binance Futures | 383 milhões de dólares negociados em 24 h no Hyperliquid |
| Nasdaq-100 | `xyz:XYZ100`, `QQQUSDT` | idem | É o Nasdaq-100, não o Composite |
| Nikkei 225 | `xyz:JP225` | Hyperliquid | 56.706 contra 56.710 do índice |
| KOSPI 200 | `xyz:KR200` | Hyperliquid | Pouca liquidez |
| Nifty 50 | `xyz:NIFTY` | Hyperliquid | Quase sem negociação, preço do contrato (25.860) diferente do oráculo (25.590) |
| Brasil | `xyz:EWZ`, `EWZUSDT` | Hyperliquid, Binance | ETF do Brasil em dólar, **não é o Ibovespa**. `xyz:IBOV` é mercado morto (preço fixo 175.000, sem volume) |
| Outros | `xyz:VIX`, `xyz:DXY`, `xyz:EUR/GBP/JPY/KRW`, `EWJ`, `EWY`, `EWT` | Hyperliquid | |

**Sem substituto:** Dow Jones, FTSE 100, DAX, CAC 40, Hang Seng, Shanghai, Euro Stoxx 50, Nasdaq Composite, Russell 2000, Ibovespa.

### Termos lidos no navegador
| Fonte | O que dizem | Efeito |
|---|---|---|
| **Hyperliquid, termos de uso** (15/06/2026) | Valem para a **interface web** `app.hyperliquid.xyz`. Bloqueiam residentes dos EUA e de Ontário, **na interface**. Proíbem bots que excedam uso razoável ou burlem limites. Nada sobre a API de dados | Não há permissão nem proibição expressa para ler dados públicos |
| **Hyperliquid, limites da API** | **Por IP**: 1.200 de peso por minuto. `allMids` pesa 2. WebSocket: 10 conexões, 30 novas por minuto. Documentação recomenda WebSocket para tempo real | Como cada usuário consulta do próprio IP, consultar a cada 5 min (peso 2) fica muito abaixo do limite |
| **trade.xyz, termos** (06/09/2026) | Valem para a interface `app.trade.xyz`. Proíbem raspar a interface e bloquear residentes de EUA, Canadá e Reino Unido na interface. A fonte dos dados é a blockchain, e os termos não tratam da API | Mesma conclusão: nada específico sobre ler os preços pela API pública |
| **Binance, termos de uso** (lido o PDF da entidade ADGM, rascunho de 27/10/2026) | Contrato para **titulares de conta**. APIs de negociação ficam sob "termos de API separados". Os preços de terceiros que a Binance exibe são só informativos. Nada sobre usar endpoints públicos de mercado em aplicativo de terceiros | Sem permissão nem proibição expressa. **Termos de API lidos** (`binance.com/legal/terms-binance-api`, versão 2.0 de 09/07/2026, rascunho da entidade ADGM): são os "API Key Terms", que valem para **chaves de API** ligadas a uma conta Binance. Os endpoints públicos de preço não usam chave, então esses termos não os cobrem, e não há cláusula sobre dados públicos de mercado. Binance Vision (arquivos históricos) tem termos próprios e proíbe uso comercial, mas não vamos usá-lo |

### Conclusão
- Nenhuma das três fontes dá **permissão expressa** para uso em extensão publicada, e nenhuma proíbe expressamente ler os dados públicos. O risco de licença de índice não existe, porque o valor não é do índice oficial.
- Hyperliquid e trade.xyz restringem **usuários dos EUA, Canadá e Reino Unido na interface**. Isso não vale para a API, mas é um risco de reputação se a extensão incentivar o uso dos mercados.
- Não é aconselhamento jurídico. Para segurança jurídica, perguntar por escrito à Binance e ao trade.xyz.

## 15. Outras opções para os índices que faltam (2026-11-25)

Testes feitos hoje:
- **Outras corretoras de cripto** (OKX, Bybit, Gate) e **outros mercados do Hyperliquid** (`km`, `mkts`, `vntl`...): só repetem S&P 500 (`US500`, `SPX500`), Nasdaq-100 (`US100`, `NAS100`), Nikkei (`JP225`), SPY, QQQ e EWZ. **Nenhum traz DAX, FTSE, Dow, Hang Seng, CAC, Shanghai ou Ibovespa.**
- **BCB (Banco Central) série 7, Ibovespa:** a série **parou em 30/09/2019**. Não serve.
- **BCB série 1, dólar PTAX:** funciona (24/11/2026: 5,8573), dado aberto, diário.
- **FRED (Fed de St. Louis), CSV público:** S&P 500, Nasdaq Composite, Dow Jones e Nikkei 225, com fechamento diário e atraso de 1 a 6 dias (o Nasdaq estava parado em 18/11). Termos não lidos; as séries de índices têm direitos autorais de terceiros.
- **Frankfurter (BCE):** pares de moedas diários, sem chave.

Ideias ainda não testadas:
1. **Widgets oficiais do TradingView** (gratuitos, feitos para serem embutidos em sites): mostrariam o valor do índice na tela com a licença do próprio TradingView. Só exibem e não dão o número para o alerta. Precisa checar se o Manifest V3 e a Chrome Web Store aceitam o iframe, e os termos dos widgets.
2. **Licença paga ou autorizada:** FMP, Twelve Data, Indices-API, Marketstack, EODHD. Pedir orçamento com a pergunta exata: "extensão gratuita, exibir valor de índice com atraso, quantos usuários".
3. **Fonte oficial da bolsa:** B3 (Ibovespa), Deutsche Börse (DAX) e outras publicam cotações atrasadas no próprio site, mas os termos normalmente proíbem uso por terceiros. Perguntar por escrito.

## 16. Escopo fechado para a primeira versão e design aprovado (2026-11-25)

Decisões do usuário:
- **Lançar com moedas, cripto e o grupo de substitutos** dos índices (contratos 24h, rotulados como "Contrato 24h", nunca como valor oficial). Os demais índices ficam para quando houver licença. Widgets do TradingView descartados.
- **Alertas:** janela de 5 min e intervalo mínimo de 5 min entre avisos do mesmo ativo; limite de 2% (moedas e índices) e de **5% na cripto**.
- **Design aprovado** (canvas "Extensão Cotações: design", `claude.ai/artifact/Kd5UscBXpNCSvN1UA3sDpq`): painel lateral do Chrome (`chrome.sidePanel`), tema escuro, verde para altas e vermelho para quedas conforme o período escolhido (24h, 7 dias, 30 dias), navegação por baixo (Home, Moedas, Cripto, Índices), até 5 ativos salvos com estrela, ícones (duas bandeiras nas moedas, ícone da cripto, sigla com bandeira nos índices), detalhe com gráfico, máxima e mínima do dia, fonte e regra de alerta.

Pendências para construir:
1. Escolher a pasta e criar o projeto da extensão (Manifest V3, sem backend).
2. Trocar os ícones de cripto por logos oficiais e confirmar o uso das marcas.
3. Criar a política de privacidade e o texto da loja, com a atribuição "Powered by CoinGecko" caso o CoinGecko seja usado como reserva.
4. Repetir os testes de atraso com o pregão americano aberto e confirmar nos termos que as fontes seguem iguais antes de publicar.

## Fontes consultadas

- [Free stock APIs 2026, setup, cost, rate limits tested](https://dev.to/tildalice/free-stock-apis-2026-setup-cost-rate-limits-tested-2o34)
- [yfinance alternatives 2026](https://dev.to/tildalice/yfinance-alternatives-2026-7-free-apis-compared-o4g)
- [Best free stock market APIs, comparação de desenvolvedores](https://dev.to/nexgendata/best-free-stock-market-apis-and-data-tools-in-2026-a-developers-honest-comparison-1926)
- [ExchangeRate-API, dados e frequência](https://www.exchangerate-api.com/product/our-exchange-rate-data)
- [Open Exchange Rates FAQ](https://openexchangerates.org/faq/)
- [Binance, documentação oficial de market data](https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints)

## 17. Testes com o pregão americano e a B3 abertos (2026-11-25, ~12:10 em Brasília)

Dia de queda forte (Nasdaq -4%, S&P -2,2%), bom para medir. Idade = agora menos o horário do último preço.

| Fonte | Ativos | Atraso medido |
|---|---|---|
| **Yahoo `v8/finance/chart`** | `^GSPC`, `^IXIC`, `^DJI`, `^NDX`, `SPY`, `EWZ` | **~65 a 145 s** (não os 10 a 15 min esperados) |
| Yahoo | `^BVSP`, `BOVA11.SA` | ~1.135 s (**~19 min**: 15 min da B3 + vela) |
| Yahoo | futuros `ES=F`, `NQ=F` | ~830 s (~14 min) |
| **FMP gratuito** (`^GSPC`, `^IXIC`, `^DJI`) | | **~65 a 135 s**, igual ao Yahoo (mesma origem provável) |
| Twelve Data gratuito | `SPY` | 27 s e `is_market_open=true`; `SPX` exige plano pago, `IXIC`/`DJI`/`IBOV` inválidos |
| TradingView scanner | `SP:SPX` 10 min, `NDX`/`IXIC`/`IBOV`/`BOVA11`/`SPY`/`QQQ` 15 min | confirmado `delayed_streaming_600/900`; só `OANDA:US30USD`, `TVC:UKX`, `TVC:NI225` e `FX_IDC:USDBRL` seguem `streaming` |
| Hyperliquid `xyz:SP500` / `XYZ100` | contrato 24h | segundos; ~0,1% abaixo do índice oficial |
| Binance Futures `SPYUSDT` / `QQQUSDT` | ETF 24h | 2 a 6 s |

Comparação em 8 leituras (a cada 20 s): o índice oficial (Yahoo/FMP) e o contrato caíram juntos de ~7.052 para ~7.033 e ~7.046 para ~7.039. O contrato se adiantava ao oficial por ~1 a 2 min e ficava num degrau de ~0,1% abaixo, então serve para o alerta de variação, e o oficial confirma depois.

### Conclusões
- **Revisão importante:** o S&P, o Nasdaq e o Dow oficiais têm só ~2 min de atraso no Yahoo e no FMP durante o pregão. O "10 a 15 min" valia só para o TradingView. Para o índice oficial dos EUA, Yahoo (não oficial) ou FMP (uso pessoal) são as fontes; para a versão publicada continua valendo o contrato 24h rotulado.
- **Ibovespa:** segue com ~15 a 19 min de atraso em todas as fontes grátis. O proxy ao vivo é `xyz:EWZ` / `EWZUSDT`.
- Smoke da extensão: sem erros; o par `USDCNY` veio com 71.287 s de idade (~20 h, dado parado na AwesomeAPI) e deve ganhar o aviso de dado velho na interface.
- `npm test`: 19 de 19 passando.

## 18. Feito em 2026-11-25 (tarde)
- Aviso de dado velho: moedas após 30 min, cripto após 5 min, índices após 15 min. Marca "Parado há X" na lista e faixa de alerta no detalhe. O USD/CNY da AwesomeAPI (parado há ~19 h) aparece com o aviso.
- Entrou o EWZ (Hyperliquid `xyz:EWZ`, ETF do Brasil em dólar) como substituto ao vivo do Ibovespa.
- Este relatório passou a viver só aqui; nada do projeto fica no repositório politidata.
