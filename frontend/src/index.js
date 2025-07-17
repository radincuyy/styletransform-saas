import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import App from './App';
import * as serviceWorker from './utils/serviceWorker';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

// Register service worker for PWA functionality
serviceWorker.register({
  onSuccess: () => {
    // StyleTransform is now available offline
  },
  onUpdate: () => {
    // New version available! Please refresh to update.
  }
});