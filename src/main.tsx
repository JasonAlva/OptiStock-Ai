import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { InventoryProvider } from './context/InventoryContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <InventoryProvider>
      <App />
    </InventoryProvider>
  </StrictMode>
);