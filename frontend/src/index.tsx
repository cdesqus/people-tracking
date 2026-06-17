import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import store from './store/store';
import './styles/globals.css';
import { API_BASE_URL } from './utils/constants';

// Global fetch interceptor to resolve relative /api paths to correct API port in production
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  if (typeof input === 'string' && input.startsWith('/api/')) {
    input = `${API_BASE_URL}${input.substring(4)}`;
  }
  return originalFetch(input, init);
};

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
