import { Content } from 'antd/es/layout/layout';
import { CircleCheck } from '../icon/components';
import Text from 'antd/es/typography/Text';
import { Alert, Button, Segmented, Space } from 'antd';
import { OTPInput } from '../settings/OTPInput';
import { useMemo, useState } from 'react';
import AuthController from '~/controllers/AuthController';
import { useNavigation } from '~/hooks/useNavigation';

export function Login2FA({ email }: { email: string }) {
  const navigation = useNavigation();
  const [method, setMethod] = useState<'otp' | 'recovery'>('otp');

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

      await AuthController.validateTwoFactor({
        email,
        code: currentCode,
        isRecoveryCode: method === 'recovery',
        operation: 'AUTH',
      });

      setIsValidated(true);

      setTimeout(() => {
        navigation.goToHome();
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        marginTop: 36,
        marginBottom: 36,
        borderRadius: 8,
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
              onChange={(value) => setMethod(value as 'otp' | 'recovery')}
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
  );
}
