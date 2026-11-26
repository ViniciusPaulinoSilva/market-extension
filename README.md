# Market Quotes: Chrome extension (English UI)

Painel lateral (React, Vite e Motion) que acompanha até 5 moedas, cripto ou índices e avisa quando algum se move rápido.
Pesquisa, fontes e decisões: `docs/plano-extensao-cotacoes.md`.

## Como usar

```powershell
npm install
npm run build
```

No Chrome: `chrome://extensions` → ligar "Modo do desenvolvedor" → "Carregar sem compactação" → escolher a pasta `D:\Extension\dist`.
Clicar no ícone da extensão abre o painel lateral.

Prévia da interface sem carregar a extensão (usa `localStorage` no lugar do `chrome.storage`):

```powershell
npm run dev   # abrir http://localhost:5173/sidepanel/index.html
```

## Comandos

| Comando | O que faz |
|---|---|
| `npm run build` | Gera `dist/` (é a pasta que o Chrome carrega) |
| `npm test` | Testes de alertas, leitura das APIs e catálogo |
| `npm run smoke` | Consulta as APIs de verdade, com cotação e histórico de todos os ativos |
| `npm run icons` | Gera os ícones PNG em `public/icons` |

## Estrutura

- `src/catalog.js`: lista de ativos, fonte de cada um e limites de alerta.
- `src/api.js`: cotações e histórico (AwesomeAPI para moedas, Binance para cripto, Hyperliquid para os contratos que substituem os índices).
- `src/alerts.js`: detecção de movimento rápido (janela de 5 min, intervalo mínimo de 5 min, 2% e 5% na cripto).
- `src/background.js`: service worker. Consulta a cada 1 min só os ativos salvos e envia a notificação.
- `src/store.js`: `chrome.storage.sync` (ativos salvos e configuração) e `chrome.storage.local` (amostras e último aviso).
- `src/ui/`: painel em React com animações.

## Documentos

- `docs/plano-extensao-cotacoes.md`: pesquisa de fontes, termos de uso, decisões e catálogo (cópia do relatório feito em 2026-11-25).
- Design aprovado (canvas): https://claude.ai/artifact/Kd5UscBXpNCSvN1UA3sDpq

## Créditos
- Ícones de cripto: cryptocurrency-icons (CC0), https://github.com/spothq/cryptocurrency-icons. HYPE é um ícone simples nosso.
- Checklist de publicação: `docs/publicar-chrome-web-store.md`.

- Textos da loja: `docs/loja-textos.md`. Política de privacidade: `docs/politica-de-privacidade.md` (`npm run docs`). Capturas: `npm run shots` (com `npm run dev` ligado).
