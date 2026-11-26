// Textos que o usuário lê na aba Config e que viram a política de privacidade (npm run docs).
// Dois idiomas: en e pt. legalFor(lang) devolve o conjunto de um idioma; as constantes abaixo seguem o idioma da interface.
import { LANG } from '../i18n.js';

// E-mail de contato do publicador (aparece na política só se estiver preenchido).
export const CONTACT = 'viniciussilvapaulino0@gmail.com';

function build_en(CONTACT) {
const APP_NAME = 'Market Quotes';
const UPDATED = 'November 26, 2026';


const SOURCES = [
  { name: 'AwesomeAPI', what: 'Currencies (US dollar, euro, pound, yen and yuan)', host: 'economia.awesomeapi.com.br' },
  { name: 'Binance (public data)', what: 'Cryptocurrencies, always in US dollars', host: 'data-api.binance.vision' },
  { name: 'Hyperliquid (public data)', what: '24-hour contracts that stand in for the indices', host: 'api.hyperliquid.xyz' }
];

const HOW = [
  'You save up to 5 assets. The panel shows the price and the 24-hour change.',
  'Every minute the extension checks only the assets you saved and keeps the latest readings.',
  'If an asset rises or falls more than your limit within the time window, you get a Chrome notification. After alerting, it alerts again only after the interval you chose.'
];

const DISCLAIMERS = [
  'This extension is independent. It is not affiliated with, endorsed by or approved by Binance, Hyperliquid, AwesomeAPI, Google or any currency, project or index mentioned.',
  'The values of the indices (S&P 500, Nasdaq-100, Nikkei 225, KOSPI 200) and of the EWZ ETF come from contracts traded 24 hours a day and are not the official index value. They show the direction and strength of the move.',
  'If a source stops updating, the asset shows “Stale for …” and the price may be out of date.',
  'The information is for general information only. It is not a recommendation to buy, sell or invest. Prices may be delayed or wrong.',
  'Cryptocurrency names and logos belong to their respective owners and appear only to identify each coin. The icons come from the cryptocurrency-icons package (CC0 license). HYPERLIQUID™ and HYPE™ are trademarks of Hyper Foundation, mentioned only to identify the coin and the data source; the HYPE icon is a simple symbol of our own, not the official logo.'
];

const PRIVACY = [
  {
    h: 'Summary',
    p: [
      'The Market Quotes extension has no server, account or sign-up. We do not collect, sell or share personal data. Everything you set up stays in your browser.'
    ]
  },
  {
    h: 'What is stored in your browser',
    p: [
      'The assets you saved (up to 5) and your alert settings. They are kept in chrome.storage.sync, and Chrome may sync them with your Google account if you have sync turned on. That is done by Chrome, not by us.',
      'The latest price readings of the saved assets (about 30 minutes) and the time of the last alert for each asset. They stay on this computer only (chrome.storage.local) and are erased when you remove the extension.'
    ]
  },
  {
    h: 'What is sent out',
    p: [
      'To show prices, your browser makes direct requests to public services: AwesomeAPI, Binance and Hyperliquid. These requests reveal which assets are being asked for and your IP address, like any internet access. Each service has its own privacy policy.',
      'We send nothing to ourselves or to third parties other than these price requests. We use no ads, trackers, usage statistics or cookies.'
    ]
  },
  {
    h: 'Chrome permissions and what they are for',
    p: [
      'storage: keep the saved assets, the settings and the recent readings.',
      'alarms: wake the extension every minute to check prices.',
      'notifications: show the fast-move alerts.',
      'sidePanel: open the side panel.',
      'Access to the three price addresses listed above, and to no other site. The extension does not read the pages you visit.'
    ]
  },
  {
    h: 'Your controls',
    p: [
      'You can remove assets at any time, turn alerts off in the Settings tab, or remove the extension to erase everything it stored.'
    ]
  },
  {
    h: 'Contact',
    p: [CONTACT ? `Questions about this policy: ${CONTACT}.` : 'Questions about this policy can be sent through the extension page on the Chrome Web Store.']
  },
  {
    h: 'Changes to this policy',
    p: ['If anything changes, this screen and the extension description on the Chrome Web Store will be updated.']
  }
];

return { APP_NAME, UPDATED, SOURCES, HOW, DISCLAIMERS, PRIVACY };
}

function build_pt(CONTACT) {
const APP_NAME = 'Cotações';
const UPDATED = '26 de novembro de 2026';


const SOURCES = [
  { name: 'AwesomeAPI', what: 'Moedas (dólar, euro, libra, iene e yuan)', host: 'economia.awesomeapi.com.br' },
  { name: 'Binance (dados públicos)', what: 'Criptomoedas, sempre em dólar', host: 'data-api.binance.vision' },
  { name: 'Hyperliquid (dados públicos)', what: 'Contratos de 24 horas que substituem os índices', host: 'api.hyperliquid.xyz' }
];

const HOW = [
  'Você salva até 5 ativos. O painel mostra o preço e a variação em 24 horas.',
  'A cada minuto a extensão consulta só os ativos que você salvou e guarda as últimas leituras.',
  'Se um ativo subir ou cair mais que o limite dentro da janela de análise, você recebe uma notificação do Chrome. Depois de avisar, ele só avisa de novo após o intervalo que você escolheu.'
];

const DISCLAIMERS = [
  'Esta extensão é independente. Não tem relação, apoio ou aprovação de Binance, Hyperliquid, AwesomeAPI, Google ou de qualquer moeda, projeto ou índice citado.',
  'Os valores dos índices (S&P 500, Nasdaq-100, Nikkei 225, KOSPI 200) e do ETF EWZ vêm de contratos negociados 24 horas e não são o valor oficial do índice. Eles indicam a direção e a força do movimento.',
  'Se uma fonte ficar sem atualizar, o ativo aparece como “Parado há …” e o preço pode estar desatualizado.',
  'As informações são apenas informativas. Não são recomendação de compra, venda ou investimento. Os preços podem ter atraso ou erro.',
  'Os nomes e logotipos das criptomoedas pertencem aos seus respectivos donos e aparecem só para identificar cada moeda. Os ícones vêm do pacote cryptocurrency-icons (licença CC0). HYPERLIQUID™ e HYPE™ são marcas da Hyper Foundation, citadas só para identificar a moeda e a fonte dos dados; o ícone do HYPE é um símbolo simples nosso, não o logotipo oficial.'
];

const PRIVACY = [
  {
    h: 'Resumo',
    p: [
      'A extensão Cotações não tem servidor, conta ou cadastro. Não coletamos, vendemos nem compartilhamos dados pessoais. Tudo o que você configura fica no seu navegador.'
    ]
  },
  {
    h: 'O que fica guardado no seu navegador',
    p: [
      'Os ativos que você salvou (até 5) e as suas configurações de alerta. Eles ficam em chrome.storage.sync, e o Chrome pode sincronizá-los com a sua conta Google se você tiver a sincronização ligada. Quem faz isso é o Chrome, não nós.',
      'As últimas leituras de preço dos ativos salvos (cerca de 30 minutos) e o horário do último aviso de cada ativo. Ficam só neste computador (chrome.storage.local) e são apagadas ao remover a extensão.'
    ]
  },
  {
    h: 'O que é enviado para fora',
    p: [
      'Para mostrar os preços, o seu navegador faz consultas diretas a serviços públicos: AwesomeAPI, Binance e Hyperliquid. Essas consultas informam quais ativos estão sendo pedidos e o seu endereço IP, como qualquer acesso à internet. Cada serviço tem a sua própria política de privacidade.',
      'Não enviamos nada para nós nem para terceiros além dessas consultas de preço. Não usamos anúncios, rastreadores, estatísticas de uso nem cookies.'
    ]
  },
  {
    h: 'Permissões do Chrome e para que servem',
    p: [
      'storage: guardar os ativos salvos, as configurações e as leituras recentes.',
      'alarms: acordar a extensão a cada minuto para consultar os preços.',
      'notifications: mostrar os avisos de variação rápida.',
      'sidePanel: abrir o painel lateral.',
      'Acesso aos três endereços de preço listados acima, e a nenhum outro site. A extensão não lê as páginas que você visita.'
    ]
  },
  {
    h: 'Seus controles',
    p: [
      'Você pode remover ativos a qualquer momento, desligar os alertas na aba Config ou remover a extensão para apagar tudo o que ela guardou.'
    ]
  },
  {
    h: 'Contato',
    p: [CONTACT ? `Dúvidas sobre esta política: ${CONTACT}.` : 'Dúvidas sobre esta política podem ser enviadas pela página da extensão na Chrome Web Store.']
  },
  {
    h: 'Mudanças nesta política',
    p: ['Se algo mudar, esta tela e a descrição da extensão na Chrome Web Store serão atualizadas.']
  }
];

return { APP_NAME, UPDATED, SOURCES, HOW, DISCLAIMERS, PRIVACY };
}

export function legalFor(lang) {
  return lang === 'pt' ? build_pt(CONTACT) : build_en(CONTACT);
}

const CURRENT = legalFor(LANG);
export const { APP_NAME, UPDATED, SOURCES, HOW, DISCLAIMERS, PRIVACY } = CURRENT;
