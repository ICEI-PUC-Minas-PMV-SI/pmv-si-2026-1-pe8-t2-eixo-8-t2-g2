import { Modal, QRCode, Button, Typography, Space } from 'antd';
import { useState } from 'react';
import { OTPInput } from './OTPInput';
import AuthController from '~/controllers/AuthController';

const { Text, Title } = Typography;

type ResultData = {
  recoveryCodes?: string[];
  otp?: string;
};

type QRCode2FAProps = {
  isOpened: boolean;
  onClose: (reason: 'confirmed' | 'cancelled', result: ResultData) => void;
  url: string;
  size?: number;
  onSubmit?: (otp: string) => void;
};

export function ModalQRCode2FA({ isOpened, onClose, url, size = 6 }: QRCode2FAProps) {
  const [otp, setOtp] = useState('');

  const handleClose = (reason: 'confirmed' | 'cancelled', recoveryCodes?: string[]) => {
    setOtp('');
    onClose(reason, { otp, recoveryCodes });
  };

  const handleConfirm = async () => {
    if (otp.length === size) {
      const result = await AuthController.enableTwoFactor(otp);
      handleClose('confirmed', result.recoveryCodes);
    }
  };

  return (
    <Modal
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
        <Title level={4}>Ativar autenticação em 2 fatores</Title>

        <Text>
          Abra um aplicativo autenticador (Ex.: <b>Google Authenticator</b>, <b>Aegis</b>,
          etc) e escaneie o QR Code abaixo.
        </Text>

        <QRCode value={url} size={200} />

        <Text type="secondary">
          Depois, insira o código gerado pelo aplicativo para confirmar.
        </Text>

        <div style={{ marginTop: 12 }}>
          <OTPInput
            length={size}
            onSubmit={(otp) => {
              setOtp(otp);
              AuthController.enableTwoFactor(otp).then((result) => {
                handleClose('confirmed', result.recoveryCodes);
              });
            }}
          />
        </div>

        <Space style={{ marginTop: 16 }}>
          <Button onClick={() => handleClose('cancelled')}>Cancelar</Button>

          <Button type="primary" onClick={handleConfirm} disabled={otp.length !== size}>
            Confirmar
          </Button>
        </Space>
      </div>
    </Modal>
  );
}
