import { Button, Card, Col, Form, Input, Row, Space, message, Tooltip, Flex } from 'antd';
import { useEffect, useState } from 'react';
import type { ProfileFormValues } from '~/@types/profile';
import { CheckCircleOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '~/hooks/useAuthStore';
import { Modal2FA, type Modal2FAType } from './Modal2FA';
import PasswordUtil from '~/utils/PasswordUtil';
import Rules from '~/utils/Rules';
import { PasswordRuleItem } from '../user/PasswordRuleItem';
import AuthController from '~/controllers/AuthController';
import { useNavigation } from '~/hooks/useNavigation';
import { UserSession } from '~/utils/UserSession';

export function ProfileTab() {
  const [settingsForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<ProfileFormValues>();
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const { user } = useAuthStore();

  const password = Form.useWatch('newPassword', passwordForm) || '';
  const passwordHasMinLength = PasswordUtil.hasMinLength(password);

  const passwordHasUppercase = PasswordUtil.hasUppercase(password);

  const passwordHasLowercase = PasswordUtil.hasLowercase(password);

  const passwordHasNumber = PasswordUtil.hasNumber(password);

  const isGoogleUser = !!user?.onlyGoogle;
  const [modal2FAState, setModal2FAState] = useState({
    type: '' as Modal2FAType,
    isOpened: false,
    data: {} as Record<string, any>,
  });
  const { goToLogin } = useNavigation();
  useEffect(() => {
    if (user) {
      settingsForm.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  async function handleSaveProfile(values: ProfileFormValues) {
    setSavingProfile(true);
    try {
      // await AuthController.updateProfile({
      //   name: values.name,
      //   phone: values.phone,
      // });
      message.success('Perfil atualizado!');
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleChangePassword(values: ProfileFormValues) {
    if (user?.enabledTwoFactor) {
      setModal2FAState({
        type: 'changePassword',
        isOpened: true,
        data: {
          currentPassword: values.currentPassword!,
          newPassword: values.newPassword!,
        },
      });
    } else {
      setSavingPassword(true);
      try {
        await AuthController.changePassword({
          currentPassword: values.currentPassword!,
          newPassword: values.newPassword!,
        });
        passwordForm.resetFields();
        message.success('Senha alterada com sucesso! Redirecionando para login...');
        setTimeout(() => {
          UserSession.clear();
          setTimeout(() => {
            goToLogin();
          }, 0);
        }, 3500);
      } finally {
        setSavingPassword(false);
      }
    }
  }

  return (
    <Row gutter={[16, 16]}>
      <Modal2FA
        type={modal2FAState.type}
        isOpened={modal2FAState.isOpened}
        data={modal2FAState.data}
        onClose={(reason, result) => {
          setModal2FAState((oldState) => ({ ...oldState, isOpened: false }));
          if (reason === 'confirmed') {
            passwordForm.resetFields();
            message.success('Senha alterada com sucesso! Redirecionando para login...');
            setTimeout(() => {
              UserSession.clear();
              setTimeout(() => {
                goToLogin();
              }, 0);
            }, 3500);
          }
        }}
      />
      <Col xs={24}>
        <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
          {/* Card: dados pessoais */}
          <Card title="Dados do perfil">
            <Form layout="vertical" form={settingsForm} onFinish={handleSaveProfile}>
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Nome"
                    name="name"
                    rules={[{ required: true, message: 'Informe seu nome' }]}
                  >
                    <Input placeholder="Seu nome completo" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Telefone"
                    name="phone"
                    rules={[
                      {
                        pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
                        message: 'Formato inválido',
                      },
                    ]}
                  >
                    {/* Troque por qualquer lib de máscara que já usar no projeto */}
                    <Input placeholder="(11) 91234-5678" maxLength={15} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item label="E-mail">
                    <Input
                      value={user?.email}
                      disabled
                      suffix={
                        <Tooltip title="O e-mail não pode ser alterado pois é usado para identificação e login">
                          <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
                        </Tooltip>
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>
              <Button
                type="primary"
                htmlType="submit"
                icon={<CheckCircleOutlined />}
                loading={savingProfile}
              >
                Salvar perfil
              </Button>
            </Form>
          </Card>

          {/* Card: troca de senha — oculto para usuários Google */}
          {!isGoogleUser && (
            <Card title="Alterar senha">
              <Form layout="vertical" form={passwordForm} onFinish={handleChangePassword}>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Senha atual"
                      name="currentPassword"
                      rules={[{ required: true, message: 'Informe a senha atual' }]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} sm={12}>
                    <Flex vertical>
                      <Form.Item
                        label="Nova senha"
                        name="newPassword"
                        rules={[Rules.required(), Rules.password()]}
                      >
                        <Input.Password />
                      </Form.Item>
                      <div
                        style={{
                          marginTop: -12,
                          marginBottom: 16,
                        }}
                      >
                        <Flex vertical gap={4} style={{ paddingTop: 12 }}>
                          <PasswordRuleItem
                            valid={passwordHasMinLength}
                            text="Mínimo de 6 caracteres"
                          />

                          <PasswordRuleItem
                            valid={passwordHasUppercase && passwordHasLowercase}
                            text="Letras maiúsculas e minúsculas"
                          />

                          <PasswordRuleItem
                            valid={passwordHasNumber}
                            text="Ao menos um número"
                          />
                        </Flex>
                      </div>
                    </Flex>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      label="Confirmar nova senha"
                      name="confirmPassword"
                      dependencies={['newPassword']}
                      rules={[
                        { required: true, message: 'Confirme a nova senha' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value)
                              return Promise.resolve();
                            return Promise.reject('As senhas não coincidem');
                          },
                        }),
                      ]}
                    >
                      <Input.Password />
                    </Form.Item>
                  </Col>
                </Row>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<LockOutlined />}
                  loading={savingPassword}
                >
                  Alterar senha
                </Button>
              </Form>
            </Card>
          )}
        </Space>
      </Col>
    </Row>
  );
}
