import { Button, Flex, Form, Input } from 'antd';
import Rules from '~/utils/Rules';

type FieldType = {
  username?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  postalCode?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
};

export function CreateUserForm() {
  return (
    <Form
      name="basic"
      layout="vertical"
      style={{
        paddingRight: 16,
        paddingLeft: 16,
        margin: 'auto',
        overflowY: 'auto',
        maxHeight: '80vh',
        width: '100%',
      }}
      initialValues={{ remember: true }}
      // onFinish={async (formData: Required<FieldType>) => {
      //   await AuthController.authenticate(formData.email, formData.password);
      //   navigation.goToHome();
      // }}
      // onFinishFailed={() => {
      //   console.log('onFinishFailed');
      // }}
      autoComplete="off"
    >
      {/* <div style={{ textAlign: 'center' }}>
        <Image
          src="/logo-removebg-preview.png"
          preview={false}
          style={{
            maxWidth: 200,
            width: '100%',
          }}
        ></Image>
      </div> */}
      <Form.Item<FieldType> label="Nome" name="username" rules={[Rules.required()]}>
        <Input autoComplete="name" />
      </Form.Item>
      <Form.Item<FieldType> label="Telefone" name="phone" rules={[Rules.required()]}>
        <Input autoComplete="tel-national" />
      </Form.Item>
      <Form.Item<FieldType>
        label="E-mail"
        name="email"
        rules={[Rules.required(), Rules.email()]}
      >
        <Input autoComplete="email" />
      </Form.Item>

      <Form.Item<FieldType> label="Senha" name="password" rules={[Rules.required()]}>
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Form.Item<FieldType>
        label="Confirmar Senha"
        name="confirmPassword"
        rules={[Rules.required()]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Form.Item<FieldType> label="CEP" name="postalCode" rules={[Rules.required()]}>
        <Input />
      </Form.Item>
      <Flex style={{ gap: 12 }}>
        <Form.Item<FieldType>
          style={{ flex: 1 }}
          label="Rua"
          name="street"
          rules={[Rules.required()]}
        >
          <Input />
        </Form.Item>
        <Form.Item<FieldType>
          label="Número"
          name="number"
          rules={[Rules.required()]}
          style={{ maxWidth: 100 }}
        >
          <Input />
        </Form.Item>
      </Flex>
      <Form.Item<FieldType> label="Complemento" name="complement">
        <Input />
      </Form.Item>
      <Form.Item<FieldType> label="Estado" name="state" rules={[Rules.required()]}>
        <Input />
      </Form.Item>
      <Form.Item<FieldType> label="Cidade" name="city" rules={[Rules.required()]}>
        <Input />
      </Form.Item>
      <Form.Item<FieldType> label="Bairro" name="neighborhood" rules={[Rules.required()]}>
        <Input />
      </Form.Item>
      <Form.Item>
        <Button style={{ width: '100%' }} type="primary" htmlType="submit">
          Cadastrar
        </Button>
      </Form.Item>
    </Form>
  );
}
