import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './styles/base.css';
import './styles/effects.css';
import './styles/animations.css';
import './styles/ui.css';
import './styles/world.css';
import { initProtection } from './utils/obfuscator.ts';

// Initialize protection in production
if (process.env.NODE_ENV === 'production') {
  initProtection();
}

// Render the application
const rootElement = document.getElementById('root');
if(!rootElement) throw new Error('Root element not found');
const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Add basic protection against copying
document.addEventListener('DOMContentLoaded', () => {
  // Disable right click global (except for inventory items)
  document.addEventListener('contextmenu', (e) => {
    if (!e.target || !(e.target as HTMLElement).closest('.inventory-item')) {
      e.preventDefault();
      return false;
    }
  });

  // Disable keyboard shortcuts for developer tools
  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, F12
    if (
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
      e.key === 'F12'
    ) {
      e.preventDefault();
      return false;
    }
  });

  // Add a watermark
  const watermark = document.createElement('div');
  watermark.style.position = 'fixed';
  watermark.style.bottom = '5px';
  watermark.style.right = '5px';
  watermark.style.fontSize = '8px';
  watermark.style.color = 'rgba(255,255,255,0.1)';
  watermark.style.pointerEvents = 'none';
  watermark.style.zIndex = '9999';
  watermark.textContent = 'MT2D © ' + new Date().getFullYear();
  document.body.appendChild(watermark);
});