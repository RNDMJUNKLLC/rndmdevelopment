import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import { store } from '@store/index';
import AppShell from '@/AppShell';
import '@styles/globals.css';

interface MountPageOptions {
  Page: React.ComponentType;
}

/**
 * Shared bootstrap for all page entries.
 * Wraps the page in providers and the AppShell, then mounts to #root.
 */
export function mountPage({ Page }: MountPageOptions) {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <HelmetProvider>
        <Provider store={store}>
          <AppShell>
            <Page />
          </AppShell>
        </Provider>
      </HelmetProvider>
    </React.StrictMode>
  );
}
