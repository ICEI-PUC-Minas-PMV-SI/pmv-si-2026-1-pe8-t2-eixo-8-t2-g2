import { Modal, QRCode, Button, Typography, Space } from 'antd';
import { useState } from 'react';
import { OTPInput } from './OTPInput';
import AuthController from '~/controllers/AuthController';

const { Text, Title } = Typography;

type QRCode2FAProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  qrCodeUrl: string;
  otpLength?: number;
  onSubmit?: (otp: string) => void;
};

export function ModalQRCode2FA({
  isOpen,
  setIsOpen,
  qrCodeUrl,
  otpLength = 6,
  onSubmit,
}: QRCode2FAProps) {
  const [otp, setOtp] = useState('');

  const handleClose = () => {
    setOtp('');
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (otp.length === otpLength) {
      onSubmit?.(otp);
      handleClose();
    }
  };

  return (
    <Modal open={isOpen} onCancel={handleClose} centered footer={null}>
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Title level={4}>Ativar autenticação em 2 fatores</Title>

        <Text>
          Abra um aplicativo autenticador (Ex.: <b>Google Authenticator</b>, <b>Aegis</b>,
          etc) e escaneie o QR Code abaixo.
        </Text>

        <QRCode value={qrCodeUrl} size={200} />

        <Text type="secondary">
          Depois, insira o código gerado pelo aplicativo para confirmar.
        </Text>

        <div style={{ marginTop: 12 }}>
          <OTPInput
            length={otpLength}
            onSubmit={(otp) => {
              setOtp(otp);
              AuthController.enableTwoFactor(otp).then(() => {
                handleClose();
              });
            }}
          />
        </div>

        <Space style={{ marginTop: 16 }}>
          <Button onClick={handleClose}>Cancelar</Button>

          <Button
            type="primary"
            onClick={handleConfirm}
            disabled={otp.length !== otpLength}
          >
            Confirmar
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
