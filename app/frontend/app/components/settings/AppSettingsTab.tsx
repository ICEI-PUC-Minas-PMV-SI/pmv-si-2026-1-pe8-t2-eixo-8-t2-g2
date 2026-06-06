import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Typography,
  message,
} from 'antd';
import {
  CheckCircleOutlined,
  InstagramOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import TextUtil from '~/utils/TextUtil';
import Rules from '~/utils/Rules';
import { AppSettingsController } from '~/controllers/AppSettingsController';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { AppSettingsPayload } from '~/@types/app-settings';

const { Text } = Typography;
const { TextArea } = Input;

type SiteInfoForm = {
  siteName: string;
  logo?: File;

  whatsapp: string;
  contactEmail: string;
  serviceHours: string;
  address: string;

  instagram: string;
};

export function AppSettingsTab() {
  const [form] = Form.useForm<SiteInfoForm>();

  async function handleSave(values: SiteInfoForm) {
    await AppSettingsController.save(values);
    message.success('Informações do site salvas com sucesso');
  }

  const onInputWhatsApp = (e: React.InputEvent<HTMLInputElement>) => {
    const input = e.currentTarget;

    const formatted = TextUtil.formatPhone(input.value);
    input.value = formatted;

    form.setFieldValue('whatsapp', formatted);
  };
  const settingsQuery = useQuery<AppSettingsPayload>({
    queryKey: ['app-settings'],
    queryFn: () => AppSettingsController.find(),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (settingsQuery.data) {
      form.setFieldsValue({
        whatsapp: settingsQuery.data.whatsapp,
        contactEmail: settingsQuery.data.contactEmail,
        serviceHours: settingsQuery.data.serviceHours,
        address: settingsQuery.data.address,
        instagram: settingsQuery.data.instagram,
      });
    }
  }, [settingsQuery.data, form]);

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
      initialValues={{
        whatsapp: '',
        contactEmail: '',
        serviceHours: '',
        address: '',
        instagram: '',
      }}
    >
      <Space orientation="vertical" size={16} style={{ width: '100%' }}>
        {/* INFORMAÇÕES GERAIS */}
        <Card title="Informações Gerais">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nome do Site"
                name="siteName"
                rules={[
                  {
                    required: true,
                    message: 'Informe o nome do site',
                  },
                ]}
              >
                <Input placeholder="Ex.: Confeitaria da Maria" />
              </Form.Item>
            </Col>

            {/* <Col xs={24} md={12}>
              <Form.Item label="Logo" name="logo" extra="PNG ou JPG até 2MB">
                <Upload beforeUpload={() => false} maxCount={1} listType="picture">
                  <Button icon={<UploadOutlined />}>Fazer upload da logo</Button>
                </Upload>
              </Form.Item>
            </Col> */}
          </Row>
        </Card>

        {/* ATENDIMENTO */}
        <Card title="Atendimento">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="WhatsApp"
                name="whatsapp"
                rules={[
                  {
                    required: true,
                    message: 'Informe o WhatsApp',
                  },
                  Rules.phone(),
                ]}
              >
                <Input
                  onInput={onInputWhatsApp}
                  placeholder="(31) 99999-9999"
                  prefix={<WhatsAppOutlined />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="E-mail para Contato"
                name="contactEmail"
                rules={[
                  {
                    required: true,
                    type: 'email',
                    message: 'Informe um e-mail válido',
                  },
                ]}
              >
                <Input placeholder="contato@confeitaria.com" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label="Dias e Horários de Atendimento"
                name="serviceHours"
                rules={[
                  {
                    required: true,
                    message: 'Informe os horários de atendimento',
                  },
                ]}
                extra="Exemplo: Seg a Sáb: 8h às 18h"
              >
                <Input placeholder="Seg a Sáb: 8h às 18h" />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item label="Endereço" name="address">
                <TextArea rows={3} placeholder="Rua Exemplo, 123 - Bairro - Cidade/UF" />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* REDES SOCIAIS */}
        <Card title="Redes Sociais">
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Instagram"
                name="instagram"
                extra="Pode ser o link completo ou apenas @usuario"
              >
                <Input placeholder="@confeitariadamaria" prefix={<InstagramOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Text type="secondary">
            As redes sociais poderão ser exibidas automaticamente no rodapé do site e em
            páginas públicas.
          </Text>
        </Card>

        {/* AÇÕES */}
        <Row justify="end">
          <Col>
            <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
              Salvar Informações
            </Button>
          </Col>
        </Row>
      </Space>
    </Form>
  );
}
