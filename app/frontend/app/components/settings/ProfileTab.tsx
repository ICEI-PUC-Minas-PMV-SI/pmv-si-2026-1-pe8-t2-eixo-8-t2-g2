import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Progress,
  Space,
  Typography,
  Switch,
} from 'antd';
import { useEffect, useState } from 'react';
import type { ProfileFormValues } from '~/@types/profile';
import { CheckCircleOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '~/hooks/useAuthStore';
import { ModalQRCode2FA } from './ModalQRCode2FA';
import AuthController from '~/controllers/AuthController';
import { ModalRecoveryCode } from './ModalRecoveryCode';
import { Modal2FA, type Modal2FAType } from './Modal2FA';

export function ProfileTab() {
  const [settingsForm] = Form.useForm<ProfileFormValues>();
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
  const { user } = useAuthStore();
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
      <Col xs={24} lg={16}>
        <Card title="Dados do perfil">
          <Form
            layout="vertical"
            form={settingsForm}
            initialValues={{ name: '', email: '' }}
          >
            <Row gutter={16}>
              <Col span={16}>
                <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item
                  label="E-mail"
                  name="email"
                  rules={[{ required: true, type: 'email' }]}
                >
                  <Input disabled />
                </Form.Item>
                <Button type="primary" icon={<CheckCircleOutlined />}>
                  Salvar perfil
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </Col>

      <Col xs={24} lg={8}>
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
            <Progress
              percent={twoFactorEnabled ? 100 : 35}
              status={twoFactorEnabled ? 'success' : 'normal'}
            />
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
    </Row>
  );
}
