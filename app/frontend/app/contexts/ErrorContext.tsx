import React, { createContext, useContext, useState, useEffect } from 'react';
import { Modal } from 'antd';
import { errorService } from '~/services/ErrorService';
import type { ErrorPayload } from '~/services/ErrorService';

type ErrorContextValue = {
  showError: (p: ErrorPayload) => void;
};

const ErrorContext = createContext<ErrorContextValue | null>(null);

export const ErrorProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [error, setError] = useState<ErrorPayload | null>(null);

  useEffect(() => {
    const unsub = errorService.subscribe((p) => {
      setError(p);
    });
    return unsub;
  }, []);

  const showError = (p: ErrorPayload) => setError(p);

  useEffect(() => {
    if (!error) return;
    const title = error.title || (error.code ? `Erro (${error.code})` : 'Erro');
    Modal.error({
      title,
      content: error.message,
      okText: 'Fechar',
    });
    setError(null);
  }, [error]);

  return <ErrorContext.Provider value={{ showError }}>{children}</ErrorContext.Provider>;
};

export const useError = () => {
  const ctx = useContext(ErrorContext);
  if (!ctx) throw new Error('useError must be used within ErrorProvider');
  return ctx;
};
