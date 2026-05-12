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

export function SettingsPage() {
  const [settingsForm] = Form.useForm<ProfileFormValues>();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [recoveryModalState, setRecoveryModalState] = useState({
    recoveryCodes: [] as string[],
    isOpened: false,
  });
  const [twoFactorUrl, setTwoFactorUrl] = useState('');
  const { user } = useAuthStore();
  useEffect(() => {
    if (user) {
      settingsForm.setFieldsValue({
        name: user.name,
        email: user.email,
      });
      setTwoFactorEnabled(user.enabledTwoFactor);
      if (!user.enabledTwoFactor) {
        AuthController.createTwoFactor().then((url) => {
          setTwoFactorUrl(url);
        });
      }
    }
  }, [settingsForm, user]);

  return (
    <Row gutter={[16, 16]}>
      <ModalQRCode2FA
        isOpened={isQrModalOpen}
        onClose={(reason, { recoveryCodes }) => {
          setIsQrModalOpen(false);
          console.log('result', reason, recoveryCodes);
          if (reason === 'confirmed' && recoveryCodes) {
            setRecoveryModalState({
              recoveryCodes,
              isOpened: true,
            });
          }
        }}
        url={twoFactorUrl}
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
              {/* <Col span={8}>
                <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: '#f5f5f5',
                    }}
                  >
                    {profileImageFileList[0]?.url || profileImageFileList[0]?.thumbUrl ? (
                      <img
                        src={
                          (profileImageFileList[0].url ||
                            profileImageFileList[0].thumbUrl) as string
                        }
                        alt="Avatar"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <UserOutlined style={{ fontSize: 36 }} />
                      </div>
                    )}
                  </div>
                  <Upload
                    beforeUpload={() => false}
                    maxCount={1}
                    fileList={profileImageFileList}
                    onChange={({ fileList }) => setProfileImageFileList(fileList)}
                    showUploadList={false}
                  >
                    <Button icon={<PictureOutlined />}>Alterar foto</Button>
                  </Upload>
                </div>
              </Col> */}
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
        <Card title="Segurança">
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
                checked={twoFactorEnabled}
                onChange={() => {
                  if (twoFactorEnabled) {
                    console.log('modal de gerenciamento de 2FA');
                  } else {
                    setIsQrModalOpen(true);
                  }
                }}
              />
            </Space>
            <Progress
              percent={twoFactorEnabled ? 100 : 35}
              status={twoFactorEnabled ? 'success' : 'normal'}
            />
            <Button
              type={twoFactorEnabled ? 'default' : 'primary'}
              onClick={() => {
                if (twoFactorEnabled) {
                  console.log('modal de gerenciamento de 2FA');
                } else {
                  setIsQrModalOpen(true);
                }
              }}
            >
              {twoFactorEnabled ? 'Gerenciar 2FA' : 'Ativar 2FA'}
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
