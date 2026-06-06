import {
  Button,
  Card,
  Col,
  Form,
  Row,
  Space,
  Typography,
  Switch,
  Modal,
  message,
} from 'antd';
import { useEffect, useState } from 'react';
import type { ProfileFormValues } from '~/@types/profile';
import { LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '~/hooks/useAuthStore';
import { ModalQRCode2FA } from './ModalQRCode2FA';
import AuthController from '~/controllers/AuthController';
import { ModalRecoveryCode } from './ModalRecoveryCode';
import { Modal2FA, type Modal2FAType } from './Modal2FA';

export function SecurityTab() {
  const [settingsForm] = Form.useForm<ProfileFormValues>();
  const { user } = useAuthStore();

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [qrCodeModalState, setQrCodeModalState] = useState({
    isOpened: false,
    loading: false,
    url: '',
  });
  const [modal2FAState, setModal2FAState] = useState({
    type: '' as Modal2FAType,
    isOpened: false,
  });
  const [recoveryModalState, setRecoveryModalState] = useState({
    recoveryCodes: [] as string[],
    isOpened: false,
  });
  useEffect(() => {
    if (user) {
      settingsForm.setFieldsValue({
        name: user.name,
        email: user.email,
      });
      setTwoFactorEnabled(user.enabledTwoFactor);
    }
  }, [settingsForm, user]);

  return (
    <Row gutter={[16, 16]}>
      <ModalQRCode2FA
        isOpened={qrCodeModalState.isOpened}
        onClose={(reason, { recoveryCodes }) => {
          setQrCodeModalState({ ...qrCodeModalState, isOpened: false });
          if (reason === 'confirmed' && recoveryCodes) {
            setRecoveryModalState({
              recoveryCodes,
              isOpened: true,
            });
          }
        }}
        url={qrCodeModalState.url}
      />
      <Modal2FA
        type={modal2FAState.type}
        isOpened={modal2FAState.isOpened}
        onClose={(_, result) => {
          setModal2FAState((oldState) => ({ ...oldState, isOpened: false }));
          if (modal2FAState.type === 'recreateCodes') {
            setRecoveryModalState({
              recoveryCodes: result?.codes || [],
              isOpened: true,
            });
          }
        }}
      />
      <ModalRecoveryCode
        isOpened={recoveryModalState.isOpened}
        onClose={() => setRecoveryModalState({ recoveryCodes: [], isOpened: false })}
        recoveryCodes={recoveryModalState.recoveryCodes}
      />
      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        <Row gutter={[16, 16]}>
          <Col span={24} md={12}>
            <Card title="Segurança" style={{ height: '100%' }}>
              <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <Space align="start">
                  <LockOutlined style={{ fontSize: 18, marginTop: 4 }} />
                  <div>
                    <Typography.Text strong>Autenticação em 2 fatores</Typography.Text>
                    <div>
                      <Typography.Text type="secondary">
                        Proteja o acesso à conta com um segundo fator.
                      </Typography.Text>
                    </div>
                  </div>
                </Space>
                <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                  <Typography.Text>2FA ativado</Typography.Text>
                  <Switch
                    loading={qrCodeModalState.loading}
                    checked={twoFactorEnabled}
                    onChange={() => {
                      if (twoFactorEnabled) {
                        setModal2FAState({ type: 'disable2FA', isOpened: true });
                      } else {
                        if (!qrCodeModalState.url) {
                          setQrCodeModalState({ ...qrCodeModalState, loading: true });
                          AuthController.createTwoFactor().then((url) => {
                            setQrCodeModalState({
                              ...qrCodeModalState,
                              isOpened: true,
                              loading: false,
                              url,
                            });
                          });
                        } else {
                          setQrCodeModalState({ ...qrCodeModalState, isOpened: true });
                        }
                      }
                    }}
                  />
                </Space>
                {twoFactorEnabled && (
                  <Button
                    type="primary"
                    onClick={() => {
                      setModal2FAState({ type: 'recreateCodes', isOpened: true });
                    }}
                  >
                    Recriar códigos reserva
                  </Button>
                )}
              </Space>
            </Card>
          </Col>
          <Col span={24} md={12}>
            <Card
              title={<Typography.Text type="danger">Zona de perigo</Typography.Text>}
              styles={{
                body: {
                  borderTop: '1px solid #ffccc7',
                },
              }}
            >
              <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <Typography.Text type="secondary">
                  A exclusão da conta remove permanentemente seus dados, configurações e
                  acessos.
                </Typography.Text>

                <Typography.Text type="danger">
                  Esta ação não pode ser desfeita.
                </Typography.Text>

                <Button
                  danger
                  block
                  onClick={() => {
                    if (user?.enabledTwoFactor) {
                      setModal2FAState({ type: 'deleteAccount', isOpened: true });
                    } else {
                      Modal.confirm({
                        title: 'Excluir conta',
                        okText: 'Excluir permanentemente',
                        cancelText: 'Cancelar',
                        onOk: () => {
                          AuthController.deleteAccount();
                        },
                        okButtonProps: {
                          danger: true,
                        },
                        content: (
                          <>
                            <Typography.Paragraph>
                              Você está prestes a excluir sua conta permanentemente.
                            </Typography.Paragraph>

                            <Typography.Paragraph strong type="danger">
                              Esta ação é irreversível.
                            </Typography.Paragraph>

                            <Typography.Paragraph>
                              Todos os seus dados, configurações e acessos serão removidos
                              definitivamente.
                            </Typography.Paragraph>
                          </>
                        ),
                      });
                    }
                    // abrir modal de confirmação
                  }}
                >
                  Excluir conta
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </Row>
  );
}
