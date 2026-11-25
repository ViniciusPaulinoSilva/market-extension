// Textos que o usuário lê na aba Config. Fonte única: docs/politica-de-privacidade.md é gerado daqui (npm run docs).
export const APP_NAME = 'Cotações';
export const UPDATED = '25 de novembro de 2026';

export const SOURCES = [
  { name: 'AwesomeAPI', what: 'Moedas (dólar, euro, libra, iene e yuan)', host: 'economia.awesomeapi.com.br' },
  { name: 'Binance (dados públicos)', what: 'Criptomoedas, sempre em dólar', host: 'data-api.binance.vision' },
  { name: 'Hyperliquid (dados públicos)', what: 'Contratos de 24 horas que substituem os índices', host: 'api.hyperliquid.xyz' }
];

export const HOW = [
  'Você salva até 5 ativos. O painel mostra o preço e a variação em 24 horas.',
  'A cada minuto a extensão consulta só os ativos que você salvou e guarda as últimas leituras.',
  'Se um ativo subir ou cair mais que o limite dentro da janela de análise, você recebe uma notificação do Chrome. Depois de avisar, ele só avisa de novo após o intervalo que você escolheu.'
];

export const DISCLAIMERS = [
  'Esta extensão é independente. Não tem relação, apoio ou aprovação de Binance, Hyperliquid, AwesomeAPI, Google ou de qualquer moeda, projeto ou índice citado.',
  'Os valores dos índices (S&P 500, Nasdaq-100, Nikkei 225, KOSPI 200) e do ETF EWZ vêm de contratos negociados 24 horas e não são o valor oficial do índice. Eles indicam a direção e a força do movimento.',
  'Se uma fonte ficar sem atualizar, o ativo aparece como “Parado há …” e o preço pode estar desatualizado.',
  'As informações são apenas informativas. Não são recomendação de compra, venda ou investimento. Os preços podem ter atraso ou erro.',
  'Os nomes e logotipos das criptomoedas pertencem aos seus respectivos donos e aparecem só para identificar cada moeda. Os ícones vêm do pacote cryptocurrency-icons (licença CC0).'
];

export const PRIVACY = [
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
    h: 'Mudanças nesta política',
    p: ['Se algo mudar, esta tela e a descrição da extensão na Chrome Web Store serão atualizadas.']
  }
];
