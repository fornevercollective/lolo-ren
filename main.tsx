import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

// Terminal startup logging
console.log('%c tm %c render-neural v2.1.0', 
  'background: #25262b; color: #ffffff; padding: 2px 6px; font-family: monospace;',
  'color: #64748b; font-family: monospace;'
);
console.log('%c spatial intelligence & neural field processing', 
  'color: #64748b; font-family: monospace; font-size: 12px;'
);

// Enhanced error handling
window.addEventListener('error', (event) => {
  console.error('%c er %c system error detected:', 
    'background: #dc2626; color: #ffffff; padding: 2px 6px; font-family: monospace;',
    'color: #dc2626; font-family: monospace;',
    event.error
  );
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('%c wr %c unhandled promise rejection:', 
    'background: #f59e0b; color: #ffffff; padding: 2px 6px; font-family: monospace;',
    'color: #f59e0b; font-family: monospace;',
    event.reason
  );
});

// Hide loading screen function
function hideLoadingScreen() {
  document.body.classList.add('react-mounted');
  
  const loadingElement = document.getElementById('terminal-loading');
  if (loadingElement) {
    setTimeout(() => {
      loadingElement.style.display = 'none';
    }, 300);
  }
}

// Mount React application
const rootElement = document.getElementById('root')!;
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log('%c tm %c systems nominal - interface mounted', 
  'background: #25262b; color: #ffffff; padding: 2px 6px; font-family: monospace;',
  'color: #10b981; font-family: monospace; font-size: 12px;'
);

// Hide loading screen after mount
setTimeout(hideLoadingScreen, 1000);
