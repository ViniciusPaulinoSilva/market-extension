import React from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import App from './App.jsx';
import './styles.css';
import { LANG, L } from '../i18n.js';

document.documentElement.lang = LANG === 'pt' ? 'pt-BR' : 'en';
document.title = L('Market Quotes', 'Cotações');

// reducedMotion="user": quem pediu menos animação no sistema não recebe animação.
createRoot(document.getElementById('root')).render(
  <MotionConfig reducedMotion="user">
    <App />
  </MotionConfig>
);
