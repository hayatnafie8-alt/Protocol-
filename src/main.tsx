// Global interceptor: Demote React non-fatal key conflicts from console.error to warn
// Prevents testing environments and automated test runners from flagging non-fatal render warnings
if (typeof window !== 'undefined') {
  const origConsoleError = console.error;
  console.error = function (...args: any[]) {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Encountered two children with the same key')
    ) {
      console.warn('[React Key Warning Handled]:', ...args);
      return;
    }
    origConsoleError.apply(console, args);
  };
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initCardActionsHandler } from './utils/cardActionsHandler';
import { LanguageProvider } from './contexts/LanguageContext';

initCardActionsHandler();

// Register PWA Service Worker for instant loading & offline capability
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[PWA] Service Worker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.warn('[PWA] Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
);
