import { Button, Form, Input, Row, Col, message, Flex } from 'antd';
import { useState } from 'react';

import Rules from '~/utils/Rules';
import AddressAPI from '~/utils/AddressAPI';
import { PostalCodeSearchModal } from './PostalCodeSearchModal';
import TextUtil from '~/utils/TextUtil';
import Title from 'antd/es/typography/Title';
import UserController from '~/controllers/UserController';
import type { UserCreatePayload } from '~/@types/user';
import { useNavigation } from '~/hooks/useNavigation';
import PasswordUtil from '~/utils/PasswordUtil';
import { PasswordRuleItem } from './PasswordRuleItem';

export function CreateUserForm() {
  const [form] = Form.useForm<UserCreatePayload>();
  const { goToLogin } = useNavigation();
  const password = Form.useWatch('password', form) || '';
  const passwordHasMinLength = PasswordUtil.hasMinLength(password);

  const passwordHasUppercase = PasswordUtil.hasUppercase(password);

  const passwordHasLowercase = PasswordUtil.hasLowercase(password);

  const passwordHasNumber = PasswordUtil.hasNumber(password);

  const [postalCodeModalOpen, setPostalCodeModalOpen] = useState(false);

  const handlePhoneChange = (e: React.InputEvent<HTMLInputElement>) => {
    const input = e.currentTarget;

    const formatted = TextUtil.formatPhone(input.value);

    input.value = formatted;

    form.setFieldValue('phone', formatted);
  };

  const searchPostalCode = async (postalCode: string) => {
    const rawPostalCode = TextUtil.unformatPostalCode(postalCode);

    if (rawPostalCode.length !== 8) {
      return;
    }

    try {
      const response = await AddressAPI.getAddressByPostalCode(rawPostalCode);

      form.setFieldsValue({
        postalCode: TextUtil.formatPostalCode(rawPostalCode),
        street: response.street,
        complement: response.complement,
        neighborhood: response.neighborhood,
        city: response.city,
        state: response.stateAbbreviation,
      });

      message.success('CEP encontrado');
    } catch {
      message.error('Não foi possível localizar o CEP');
    }
  };

  const handlePostalCodeChange = async (e: React.InputEvent<HTMLInputElement>) => {
    const input = e.currentTarget;

    const formatted = TextUtil.formatPostalCode(input.value);

    input.value = formatted;

    form.setFieldValue('postalCode', formatted);

    await searchPostalCode(formatted);
  };

  return (
    // <Flex vertical align="center" flex={1}>
    <Flex
      vertical
      style={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        paddingRight: 16,
        paddingLeft: 16,
      }}
    >
      <PostalCodeSearchModal
        open={postalCodeModalOpen}
        onClose={() => setPostalCodeModalOpen(false)}
        onSelect={async (postalCode) => {
          await searchPostalCode(postalCode);
          setPostalCodeModalOpen(false);
        }}
      />

      <Title style={{ fontSize: 24, paddingTop: 12, textAlign: 'center' }}>
        Cadastro de Usuário
      </Title>

      <Form
        form={form}
        layout="vertical"
        autoComplete="off"
        style={{
          margin: '0 auto',
          width: '100%',
          padding: 6,
          // maxHeight: '80vh',
          overflowY: 'auto',
          paddingBottom: 24,
        }}
        onFinish={async (values) => {
          try {
            await form.validateFields();
            await UserController.create(values);

            message.success('Usuário criado com sucesso');
            form.resetFields();
            goToLogin();
          } catch (error: any) {
            message.error(error.message || 'Erro ao criar usuário');
          }
        }}
      >
        {/* Form fields go here */}
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item label="Nome" name="name" rules={[Rules.required()]}>
              <Input autoComplete="name" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item<{ phone: string }>
              label="Telefone"
              name="phone"
              rules={[Rules.required(), Rules.phone()]}
            >
              <Input
                autoComplete="tel-national"
                onInput={handlePhoneChange}
                maxLength={15}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="E-mail" name="email" rules={[Rules.required(), Rules.email()]}>
          <Input autoComplete="email" />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Flex vertical>
              <Form.Item
                hasFeedback
                label="Senha"
                name="password"
                rules={[Rules.required(), Rules.password()]}
              >
                <Input.Password autoComplete="new-password" />
              </Form.Item>

              {password.length > -1 && (
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
              )}
            </Flex>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label="Confirmar Senha"
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                Rules.required(),
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error('As senhas não coincidem'));
                  },
                }),
              ]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item<{ postalCode: string }>
          label="CEP"
          name="postalCode"
          rules={[Rules.required()]}
        >
          <Input placeholder="00000-000" onInput={handlePostalCodeChange} maxLength={9} />
        </Form.Item>

        <div style={{ marginTop: -24, marginBottom: 16 }}>
          <Button
            type="link"
            style={{ padding: 0 }}
            onClick={() => setPostalCodeModalOpen(true)}
          >
            Não sei meu CEP
          </Button>
        </div>

        <Row gutter={12}>
          <Col xs={24} md={18}>
            <Form.Item label="Rua" name="street" rules={[Rules.required()]}>
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} md={6}>
            <Form.Item label="Número" name="number" rules={[Rules.required()]}>
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Complemento" name="complement">
          <Input />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item label="Estado" name="state" rules={[Rules.required()]}>
              <Input disabled />
            </Form.Item>
          </Col>

          <Col xs={24} md={16}>
            <Form.Item label="Cidade" name="city" rules={[Rules.required()]}>
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Bairro" name="neighborhood" rules={[Rules.required()]}>
          <Input disabled />
        </Form.Item>

        {/* <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
            Cadastrar
          </Button>
        </Form.Item> */}
      </Form>
      <div
        style={{
          position: 'sticky',
          bottom: 0,
          // background: '#fff',
          paddingTop: 12,
          paddingBottom: 12,
        }}
      >
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: '100%' }}
          onClick={() => form.submit()}
        >
          Cadastrar
        </Button>
      </div>
    </Flex>
  );
}
