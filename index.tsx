// Overwrite matchMedia to ensure it always returns a valid MediaQueryList
if (typeof window !== 'undefined') {
  console.log('window.matchMedia type:', typeof window.matchMedia);
  const originalMatchMedia = window.matchMedia;
  window.matchMedia = (query: string): MediaQueryList => {
    console.log('matchMedia called with:', query);
    let result: any;
    if (typeof originalMatchMedia === 'function') {
      try {
        result = originalMatchMedia.call(window, query);
      } catch (e) {
        console.error('Error calling original matchMedia:', e);
      }
    }
    
    if (result && typeof result.addListener === 'function') return result;
    
    console.warn('matchMedia returned invalid result, returning polyfill:', result);
    
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as MediaQueryList;
  };
}

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);