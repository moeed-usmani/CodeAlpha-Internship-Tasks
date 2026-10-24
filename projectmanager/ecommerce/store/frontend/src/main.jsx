import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { StoreProvider } from './context/StoreContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './styles.css';

// Debug: koi bhi JS error ho to screen par laal box mein dikhao (black screen ki wajah pata chalegi)
const showError = (msg) => {
  let box = document.getElementById('debug-error');
  if (!box) {
    box = document.createElement('pre');
    box.id = 'debug-error';
    box.style.cssText = 'position:fixed;left:0;right:0;bottom:0;max-height:45vh;overflow:auto;margin:0;padding:14px;background:#300;color:#ffb4b4;font:12px/1.5 monospace;z-index:99999;white-space:pre-wrap';
    document.body.appendChild(box);
  }
  box.textContent += msg + '\n\n';
};
window.addEventListener('error', (e) => showError(`ERROR: ${e.message}\n${e.error?.stack || ''}`));
window.addEventListener('unhandledrejection', (e) => showError(`PROMISE: ${e.reason?.message || e.reason}\n${e.reason?.stack || ''}`));

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <BrowserRouter>
      <StoreProvider>
        <App />
      </StoreProvider>
    </BrowserRouter>
  </ErrorBoundary>
);
