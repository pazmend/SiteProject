import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('Starting React app');
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error('Root element not found');
  } else {
    console.log('Root element found, rendering App');
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App rendered successfully');
  }
} catch (error) {
  console.error('Error rendering React app:', error);
}