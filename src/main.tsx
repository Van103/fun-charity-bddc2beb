// Global error handlers - must be registered FIRST before any imports
const isWalletRelatedError = (message: string, code?: number, stack?: string) => {
  const walletPatterns = [
    'MetaMask',
    'Failed to connect',
    'User rejected',
    'eth_requestAccounts',
    'eth_accounts',
    'wallet_',
    'inpage.js',
    'chrome-extension',
    'moz-extension',
    'Already processing',
    'Request already pending',
    'disconnected',
    'Provider not available'
  ];
  
  const isWalletCode = code === 4001 || code === -32002 || code === -32603;
  const isWalletMessage = walletPatterns.some(pattern => message.toLowerCase().includes(pattern.toLowerCase()));
  const isWalletStack = stack ? walletPatterns.some(pattern => stack.toLowerCase().includes(pattern.toLowerCase())) : false;
  
  return isWalletCode || isWalletMessage || isWalletStack;
};

// Handle unhandled promise rejections (async errors)
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  const message = reason?.message || String(reason) || '';
  const stack = reason?.stack || '';
  const code = reason?.code;
  
  if (isWalletRelatedError(message, code, stack)) {
    console.warn('[Wallet] Connection error suppressed:', message);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    // Return without re-throwing to prevent blank screen
    return;
  }
  
  // Only log non-wallet errors, don't let them crash the app
  console.error('Unhandled promise rejection:', reason);
}, true);

// Handle synchronous errors
window.addEventListener('error', (event) => {
  const message = event.message || '';
  const filename = event.filename || '';
  const stack = (event.error?.stack) || '';
  
  if (isWalletRelatedError(message, undefined, stack) || 
      filename.includes('inpage.js') || 
      filename.includes('chrome-extension') ||
      filename.includes('moz-extension')) {
    console.warn('[Wallet] Error suppressed:', message);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }
}, true);

// Suppress MetaMask errors from console.error
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.map(arg => String(arg)).join(' ');
  if (isWalletRelatedError(message)) {
    console.warn('[Wallet] Console error suppressed:', message.substring(0, 100));
    return;
  }
  originalConsoleError.apply(console, args);
};

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
