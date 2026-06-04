import { Modal, Button, Typography, Space, Segmented, Alert, message } from 'antd';
import { useMemo, useState } from 'react';
import { OTPInput } from './OTPInput';
import AuthController from '~/controllers/AuthController';

const { Text, Title } = Typography;

type Modal2FAResult = {
  code?: string;
  method?: 'otp' | 'recovery';
  codes?: string[];
};

export type Modal2FAType =
  | 'disable2FA'
  | 'recreateCodes'
  | 'deleteAccount'
  | 'changePassword';

type Modal2FAProps = {
  type: Modal2FAType;
  isOpened: boolean;
  data?: Record<string, any>;
  onClose: (reason: 'confirmed' | 'cancelled', result?: Modal2FAResult) => void;
};

export function Modal2FA({ isOpened, onClose, type, data }: Modal2FAProps) {
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

  const handleClose = (reason: 'confirmed' | 'cancelled', data?: Modal2FAResult) => {
    const result =
      reason === 'confirmed'
        ? {
            code: otp,
            method,
          }
        : {};

    resetState();
    onClose(reason, { ...result, ...(data || {}) });
  };

  const labels = {
    disable2FA: {
      title: 'Desativar autenticação em 2 fatores',
      successMsg: 'Autenticação de dois fatores desabilitada',
      preffixDescription: 'Para desativar o 2FA',
    },
    recreateCodes: {
      title: 'Recriar códigos reserva',
      successMsg: null,
      preffixDescription: 'Para regerar os códigos reservas',
    },
    deleteAccount: {
      title: 'Excluir conta',
      successMsg: 'Conta excluída com sucesso',
      preffixDescription: 'Para excluir sua conta',
    },
    changePassword: {
      title: 'Alterar senha',
      successMsg: 'Senha alterada com sucesso',
      preffixDescription: 'Para alterar sua senha',
    },
  };

  const labelData = labels[type] || { title: '', preffixDescription: '' };

  const handleConfirm = async () => {
    if (!isValid) return;

    try {
      setIsLoading(true);
      let codes: string[] = [];
      if (type === 'disable2FA') {
        await AuthController.disableTwoFactor({
          code: otp,
          isRecoveryCode: method === 'recovery',
        });
      } else if (type === 'recreateCodes') {
        const result = await AuthController.recreateCodes({
          code: otp,
          isRecoveryCode: method === 'recovery',
        });
        codes = result.codes;
      } else if (type === 'deleteAccount') {
        await AuthController.deleteAccount({
          code: otp,
          isRecoveryCode: method === 'recovery',
        });
      } else if (type === 'changePassword') {
        await AuthController.changePassword({
          currentPassword: data?.currentPassword,
          newPassword: data?.newPassword,
          code: otp,
          isRecoveryCode: method === 'recovery',
        });
      }
      if (labelData.successMsg) {
        message.success(labelData.successMsg);
      }

      handleClose('confirmed', { codes });
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
        <Title level={4}>{labelData.title}</Title>

        <Text>
          {labelData.preffixDescription}, informe um código válido do aplicativo
          autenticador ou um código de recuperação.
        </Text>

        <Segmented
          // block
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
          />
        )}

        <div style={{ marginTop: 8 }}>
          <OTPInput
            mode={method === 'otp' ? 'numeric' : 'alphanumeric'}
            length={inputLength}
            onSubmit={(value) => {
              setOtp(value);
              if (type === 'disable2FA') {
                AuthController.disableTwoFactor({
                  code: value,
                  isRecoveryCode: method === 'recovery',
                }).then(() => {
                  handleClose('confirmed');
                });
              } else if (type === 'recreateCodes') {
                AuthController.recreateCodes({
                  code: value,
                  isRecoveryCode: method === 'recovery',
                }).then((result) => {
                  handleClose('confirmed', result);
                });
              }
            }}
          />
        </div>

        <Text type="secondary">
          {method === 'otp'
            ? 'Digite o código de 6 dígitos gerado pelo aplicativo autenticador.'
            : 'Digite um código de recuperação de 8 caracteres.'}
        </Text>

        <Space style={{ marginTop: 16 }}>
          <Button onClick={() => handleClose('cancelled')} disabled={isLoading}>
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
