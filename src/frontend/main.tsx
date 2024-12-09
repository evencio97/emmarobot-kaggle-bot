import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SnackbarProvider } from 'notistack';
import { AppProvider } from './context/app/AppProvider';
import AppRouter from './AppRouter';
import './main.css';


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SnackbarProvider>
      <AppProvider>
        <AppRouter />
      </AppProvider>
    </SnackbarProvider>
  </StrictMode>
)
