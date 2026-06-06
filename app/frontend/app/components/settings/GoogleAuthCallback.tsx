import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // ou next/navigation
import { Result, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export function GoogleAuthCallback() {
  const [searchParams] = useSearchParams();

  const integration = searchParams.get('integration') as 'calendar' | 'gmail' | 'all';
  const status = searchParams.get('status');
  const success = status === 'success';

  useEffect(() => {
    if (success) {
      window.opener?.postMessage(
        { type: 'GOOGLE_AUTH_SUCCESS', integration },
        window.location.origin,
      );
    }

    const timer = setTimeout(() => {
      window.close();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Result
        icon={
          success ? (
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
          ) : (
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
          )
        }
        title={success ? 'Autenticação concluída!' : 'Erro na autenticação'}
        subTitle={
          success
            ? 'Você já pode fechar essa aba e voltar para a plataforma.'
            : 'Ocorreu um erro ao autenticar com o Google. Tente novamente.'
        }
        extra={
          <Button type="primary" onClick={() => window.close()}>
            Fechar aba
          </Button>
        }
      />
    </div>
  );
}
