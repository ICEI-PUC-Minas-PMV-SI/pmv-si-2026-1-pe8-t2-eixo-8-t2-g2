import { Button } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Text from 'antd/es/typography/Text';
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircleCheck } from '../icon/components';
import { CenteredOverlay } from './CenteredOverlay';
import StyleSheet from '~/utils/StyleSheet';
import { ResetPasswordForm } from './ResetPasswordForm';

export function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setToken(params.get('token') || location.state.token);
  }, [location.search]);

  return (
    <CenteredOverlay>
      {isSuccess ? (
        <Content style={styles.contentSuccess}>
          <CircleCheck style={styles.checkIcon} />
          <Text style={styles.successMessage}>Senha redefinida com sucesso!</Text>
          <Button type="primary" onClick={() => navigate('/login')}>
            Voltar ao login
          </Button>
        </Content>
      ) : (
        <ResetPasswordForm token={token || ''} onSuccess={() => setIsSuccess(true)} />
      )}
    </CenteredOverlay>
  );
}

const styles = StyleSheet.create({
  checkIcon: { fontSize: 48, color: 'var(--ant-color-primary)' },
  successMessage: { fontSize: '1.25rem', maxWidth: '80%', textAlign: 'center' },
  contentSuccess: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    maxHeight: 'max-content',
    padding: 24,
    width: '100%',
    borderRadius: 12,
    gap: 12,
  },
});
