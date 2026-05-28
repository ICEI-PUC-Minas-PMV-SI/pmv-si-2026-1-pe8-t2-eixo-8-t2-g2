import { Button, Divider, Flex, Form, Image, Input } from 'antd';
import AuthController from '~/controllers/AuthController';
import { useNavigation } from '~/hooks/useNavigation';
import Rules from '~/utils/Rules';
import { GoogleButton } from './GoogleButton';
import Text from 'antd/es/typography/Text';

type FieldType = {
  email?: string;
  password?: string;
  remember?: string;
};

export default function LoginForm() {
  const navigation = useNavigation();
  return (
    <>
      <Form
        name="basic"
        layout="vertical"
        style={{
          maxWidth: 600,
          paddingRight: 16,
          paddingLeft: 16,
          margin: 'auto',
        }}
        initialValues={{ remember: true }}
        onFinish={async (formData: Required<FieldType>) => {
          const { token, required2FACode } = await AuthController.authenticate(
            formData.email,
            formData.password,
          );
          if (token) {
            navigation.goToHome();
          } else if (required2FACode) {
            navigation.goToLogin({ required2FA: true, email: formData.email });
          }
        }}
        onFinishFailed={() => {
          console.log('onFinishFailed');
        }}
        autoComplete="off"
      >
        <div style={{ textAlign: 'center' }}>
          <Image
            src="/logo-removebg-preview.png"
            preview={false}
            style={{
              maxWidth: 200,
              width: '100%',
            }}
          ></Image>
        </div>
        <Form.Item<FieldType>
          label="E-mail"
          name="email"
          rules={[Rules.required(), Rules.email()]}
        >
          <Input autoComplete="email" />
        </Form.Item>

        <Form.Item<FieldType> label="Senha" name="password" rules={[Rules.required()]}>
          <Input.Password />
        </Form.Item>
        <Flex justify="flex-end" style={{ paddingLeft: 6, paddingRight: 6 }}>
          <Button
            type="link"
            href="/forgot-password"
            style={{ marginBottom: 12, paddingBottom: 0, paddingRight: 0 }}
          >
            Esqueceu a senha?
          </Button>
        </Flex>

        <Form.Item>
          <Button style={{ width: '100%' }} type="primary" htmlType="submit">
            Entrar
          </Button>
        </Form.Item>

        <Flex justify="center" style={{ paddingLeft: 6, paddingRight: 6 }}>
          <Button
            type="link"
            style={{ paddingBottom: 0, paddingRight: 0 }}
            href="/sign-up"
          >
            <Text>Não possui uma conta?</Text>
            Cadastre-se
          </Button>
        </Flex>
      </Form>
      <Divider style={{ position: 'relative' }} plain>
        OU
      </Divider>
      <Flex justify="center">
        <GoogleButton />
      </Flex>
    </>
  );
}
