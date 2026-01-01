// Global error handlers - must be registered FIRST before any imports
const isWalletRelatedError = (message: string, code?: number) => {
  return message.includes('MetaMask') ||
    message.includes('Failed to connect') ||
    message.includes('User rejected') ||
    message.includes('eth_requestAccounts') ||
    message.includes('eth_accounts') ||
    message.includes('wallet_') ||
    message.includes('inpage.js') ||
    code === 4001 ||
    code === -32002 ||
    code === -32603;
};

window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason?.message || String(reason);
  const stack = reason?.stack || '';
  
  if (isWalletRelatedError(message, reason?.code) || stack.includes('inpage.js')) {
    console.warn('[Wallet] Connection error suppressed:', message);
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
  
  console.error('Unhandled promise rejection:', reason);
});

window.addEventListener('error', (event) => {
  const message = event.message || '';
  const filename = event.filename || '';
  
  if (isWalletRelatedError(message) || filename.includes('inpage.js') || filename.includes('chrome-extension')) {
    console.warn('[Wallet] Error suppressed:', message);
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "./contexts/LanguageContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </HelmetProvider>
);
