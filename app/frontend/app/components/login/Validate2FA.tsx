import { Alert, Button, Segmented, Space, Typography, message } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { useMemo, useState } from 'react';

// import AuthController from '~/controllers/AuthController';
import { CircleCheck } from '../icon/components';
import { OTPInput } from '../settings/OTPInput';
import { CenteredOverlay } from './CenteredOverlay';
import { useNavigation, type Validate2FAParams } from '~/hooks/useNavigation';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRoutes } from 'react-router';
import AuthController from '~/controllers/AuthController';

const { Text } = Typography;

type TwoFactorMethod = 'otp' | 'recovery';

export function Validate2FA() {
  const { state } = useLocation() as { state: Validate2FAParams };
  const navigation = useNavigation();

  const [method, setMethod] = useState<TwoFactorMethod>('otp');

  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidated, setIsValidated] = useState(false);

  const inputLength = useMemo(() => {
    return method === 'otp' ? 6 : 8;
  }, [method]);

  const isValid = code.length === inputLength;

  const handleValidate = async (value?: string) => {
    const currentCode = value ?? code;

    if (currentCode.length !== inputLength) {
      return;
    }

    try {
      setIsLoading(true);

      const { token } = await AuthController.validateTwoFactor({
        email: state.email,
        code: currentCode,
        isRecoveryCode: method === 'recovery',
        operation: 'RESET_PASSWORD',
      });

      setIsValidated(true);

      setTimeout(() => {
        navigation.goToResetPassword({ token });
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CenteredOverlay>
      <div
        style={{
          marginTop: 36,
          marginBottom: 36,
          borderRadius: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 24,
          margin: 'auto',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
        }}
      >
        {isValidated ? (
          <Content
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <CircleCheck
              color="danger"
              style={{
                fontSize: 48,
                color: 'var(--ant-color-primary)',
              }}
            />

            <Text
              style={{
                fontSize: '1.25rem',
                maxWidth: '80%',
                textAlign: 'center',
              }}
            >
              Código validado com sucesso!
            </Text>
          </Content>
        ) : (
          <>
            <Content
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <Text
                style={{
                  textAlign: 'center',
                  fontSize: 22,
                  width: '100%',
                  display: 'block',
                }}
              >
                Verificação em 2 fatores
              </Text>

              <Text
                type="secondary"
                style={{
                  textAlign: 'center',
                }}
              >
                Informe um código do aplicativo autenticador ou um código de recuperação
                para continuar.
              </Text>

              <Segmented
                value={method}
                onChange={(value) => setMethod(value as TwoFactorMethod)}
                options={[
                  {
                    label: 'Aplicativo autenticador',
                    value: 'otp',
                  },
                  {
                    label: 'Código de Recuperação',
                    value: 'recovery',
                  },
                ]}
              />

              {method === 'recovery' && (
                <Alert
                  type="warning"
                  showIcon
                  description="Códigos de recuperação podem ser usados apenas uma vez."
                  style={{ width: '100%' }}
                />
              )}

              <div style={{ marginTop: 8 }}>
                <OTPInput
                  mode={method === 'otp' ? 'numeric' : 'alphanumeric'}
                  length={inputLength}
                  onSubmit={(value: string) => {
                    setCode(value);

                    handleValidate(value);
                  }}
                />
              </div>

              <Text type="secondary">
                {method === 'otp'
                  ? 'Digite o código de 6 dígitos gerado pelo aplicativo autenticador.'
                  : 'Digite um código de recuperação de 8 caracteres.'}
              </Text>
            </Content>

            <Space
              style={{
                width: '100%',
              }}
              orientation="vertical"
            >
              <Button
                type="primary"
                style={{ width: '100%' }}
                disabled={!isValid}
                loading={isLoading}
                onClick={() => handleValidate()}
              >
                Confirmar
              </Button>
            </Space>
          </>
        )}
      </div>
    </CenteredOverlay>
  );
}
