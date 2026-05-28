import { Button, Form, Input, message } from 'antd';
import Text from 'antd/es/typography/Text';
import AuthController from '~/controllers/AuthController';
import StyleSheet from '~/utils/StyleSheet';

type ResetPasswordFields = {
  password: string;
  confirmPassword: string;
};

type ComponentProps = {
  token: string;
  onSuccess: () => void;
};

export function ResetPasswordForm({ token, onSuccess }: ComponentProps) {
  const onFinish = async (values: ResetPasswordFields) => {
    if (!token) {
      message.error('Token inválido ou expirado.');
      return;
    }

    if (values.password !== values.confirmPassword) {
      message.error('As senhas não coincidem.');
      return;
    }

    try {
      await AuthController.resetPassword(token, values.password);
      onSuccess();
    } catch (err: any) {
      message.error(err?.message || 'Erro ao redefinir senha.');
    }
  };
  return (
    <Form name="reset-password" layout="vertical" style={styles.form} onFinish={onFinish}>
      <Text style={styles.title}>Redefinir senha</Text>

      <Form.Item<ResetPasswordFields>
        label="Nova senha"
        name="password"
        rules={[{ required: true, message: 'Por favor insira a nova senha.' }]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>

      <Form.Item<ResetPasswordFields>
        label="Confirmar senha"
        name="confirmPassword"
        dependencies={['password']}
        rules={[
          { required: true, message: 'Por favor confirme a senha.' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('As senhas não coincidem.'));
            },
          }),
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>

      <Form.Item>
        <Button style={styles.submitButton} type="primary" htmlType="submit">
          Confirmar
        </Button>
      </Form.Item>
    </Form>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: 36,
    marginBottom: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    maxHeight: 'min(400px, 60vh)',
    padding: 24,
    margin: 'auto',
    overflowY: 'auto',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    width: '100%',
    marginBottom: '2rem',
    display: 'block',
  },
  submitButton: { width: '100%' },
});
