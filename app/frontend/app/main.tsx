import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './app.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ConfigProvider } from 'antd';
// import './googlebtn.css';
import ptBR from 'antd/locale/pt_BR';
import { theme } from './theme';
import { ErrorProvider } from './contexts/ErrorContext';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 min — evita refetch desnecessário ao trocar de aba
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={ptBR} theme={theme}>
      <QueryClientProvider client={queryClient}>
        <ErrorProvider>
          <App />
        </ErrorProvider>
        {/* Devtools aparecem apenas em desenvolvimento */}
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConfigProvider>
  </React.StrictMode>,
);
