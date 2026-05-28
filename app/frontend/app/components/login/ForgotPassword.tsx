import { Button, Form, Input, Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import Text from 'antd/es/typography/Text';
import AuthController from '~/controllers/AuthController';
import { useNavigation } from '~/hooks/useNavigation';
import Rules from '~/utils/Rules';
import { CircleCheck } from '../icon/components';
import { useState } from 'react';
import { CenteredOverlay } from './CenteredOverlay';

type FieldType = {
  email?: string;
};

export function ForgotPassword() {
  const [isShowForm, setIsShowForm] = useState(true);
  const navigation = useNavigation();
  return (
    <CenteredOverlay>
      <Form
        name="basic"
        layout="vertical"
        style={{
          marginTop: 36,
          marginBottom: 36,
          borderRadius: 8,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          maxHeight: 'min(300px, 50vh)',
          padding: 24,
          margin: 'auto',
          overflowY: 'auto',
          width: '100%',
        }}
        onFinish={async (formData: Required<FieldType>) => {
          const result = await AuthController.forgotPassword(formData.email);
          if (result.required2FACode) {
            navigation.goToValidate2FA({ email: formData.email });
          } else {
            setIsShowForm(false);
          }
        }}
      >
        {!isShowForm && (
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
              style={{ fontSize: 48, color: 'var(--ant-color-primary)' }}
            />
            <Text style={{ fontSize: '1.25rem', maxWidth: '80%', textAlign: 'center' }}>
              E-mail de redefinição de senha enviado com sucesso!
            </Text>
          </Content>
        )}
        {isShowForm && (
          <Content>
            <Text
              style={{
                textAlign: 'center',
                fontSize: 22,
                width: '100%',
                marginBottom: '2rem',
                display: 'block',
              }}
            >
              Redefinição de senha
            </Text>
            <Form.Item<FieldType>
              label="E-mail"
              name="email"
              rules={[Rules.required(), Rules.email()]}
            >
              <Input autoComplete="email" />
            </Form.Item>

            <Form.Item>
              <Button style={{ width: '100%' }} type="primary" htmlType="submit">
                Confirmar
              </Button>
            </Form.Item>
          </Content>
        )}
      </Form>
    </CenteredOverlay>
  );
}
