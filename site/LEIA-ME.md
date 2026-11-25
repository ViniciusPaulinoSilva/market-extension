# Página pública da política de privacidade

`index.html` é a política completa (gerada por `npm run docs`). Para a Chrome Web Store ela precisa estar numa URL pública com HTTPS.

## Opção recomendada: GitHub Pages (grátis)
1. Crie um repositório público novo só da extensão, por exemplo `cotacoes-extensao`.
2. Coloque `site/index.html` na raiz do repositório (ou na pasta `docs/`).
3. No GitHub: Settings > Pages > Source: Deploy from a branch > main > / (root) ou /docs.
4. O endereço fica `https://SEU-USUARIO.github.io/cotacoes-extensao/`. Cole no campo "Privacy policy" do painel da loja.

## Alternativas
- Cloudflare Pages ou Netlify (arrastar a pasta `site/`): também grátis, com HTTPS.
- Google Sites: serve, mas é menos estável e mais difícil de manter igual ao texto da extensão.
- Um domínio próprio: melhor para a imagem do publicador, mas custa e não é necessário no começo.

Sempre que mudar `src/ui/legal.js`, rode `npm run docs` e publique o `index.html` de novo, para a política da página e a da aba Config ficarem iguais.
