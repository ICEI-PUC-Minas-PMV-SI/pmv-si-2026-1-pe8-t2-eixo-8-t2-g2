import { Modal, Button, Typography, Space, Segmented, Alert, message } from 'antd';
import { useMemo, useState } from 'react';
import { OTPInput } from './OTPInput';
import AuthController from '~/controllers/AuthController';

const { Text, Title } = Typography;

type Disable2FAResult = {
  code: string;
  method: 'otp' | 'recovery';
};

type ModalDisable2FAProps = {
  isOpened: boolean;
  onClose: (
    reason: 'confirmed' | 'cancelled',
    result?: Disable2FAResult,
  ) => void;
};

export function ModalDisable2FA({
  isOpened,
  onClose,
}: ModalDisable2FAProps) {
  const [method, setMethod] = useState<'otp' | 'recovery'>('otp');

  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const inputLength = useMemo(() => {
    return method === 'otp' ? 6 : 8;
  }, [method]);

  const isValid = otp.length === inputLength;

  const resetState = () => {
    setOtp('');
    setMethod('otp');
    setIsLoading(false);
  };

  const handleClose = (
    reason: 'confirmed' | 'cancelled',
  ) => {
    const result =
      reason === 'confirmed'
        ? {
            code: otp,
            method,
          }
        : undefined;

    resetState();
    onClose(reason, result);
  };

  const handleConfirm = async () => {
    if (!isValid) return;

    try {
      setIsLoading(true);

      await AuthController.disableTwoFactor({
        code: otp,
        isRecoveryCode: method === 'recovery',
      });

      message.success('Autenticação de dois fatores desabilitada')

      handleClose('confirmed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      destroyOnHidden
      open={isOpened}
      onCancel={() => handleClose('cancelled')}
      centered
      footer={null}
    >
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Title level={4}>
          Desativar autenticação em 2 fatores
        </Title>

        <Text>
          Para desativar o 2FA, informe um código válido do
          aplicativo autenticador ou um código de recuperação.
        </Text>

        <Segmented
          // block
          value={method}
          onChange={(value) =>
            setMethod(value as 'otp' | 'recovery')
          }
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
          />
        )}

        <div style={{ marginTop: 8 }}>
          <OTPInput
            mode={method === 'otp' ? 'numeric' : 'alphanumeric'}
            length={inputLength}
            onSubmit={(value) => {
              setOtp(value);

              AuthController.disableTwoFactor({
                code: value,
                isRecoveryCode: method === 'recovery',
              }).then(() => {
                handleClose('confirmed');
              });
            }}
          />
        </div>

        <Text type="secondary">
          {method === 'otp'
            ? 'Digite o código de 6 dígitos gerado pelo aplicativo autenticador.'
            : 'Digite um código de recuperação de 8 caracteres.'}
        </Text>

        <Space style={{ marginTop: 16 }}>
          <Button
            onClick={() => handleClose('cancelled')}
            disabled={isLoading}
          >
            Cancelar
          </Button>

          <Button
            type="primary"
            onClick={handleConfirm}
            disabled={!isValid}
            loading={isLoading}
          >
            Confirmar
          </Button>
        </Space>
      </div>
    </Modal>
  );
}