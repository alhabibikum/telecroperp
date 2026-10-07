import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './registerServiceWorker';
import { setupGlobalAutoSelect } from './utils/keyboardNavigationUtils';
import { ToastProvider } from './components/common/ToastNotificationSystem';

// Initialize Global Auto-Select on Focus for rapid dealer keyboard operations
setupGlobalAutoSelect();

createRoot(document.getElementById('root')!).render(
  <ToastProvider>
    <App />
  </ToastProvider>
);

// Register Service Worker for offline PWA capabilities
registerServiceWorker();
