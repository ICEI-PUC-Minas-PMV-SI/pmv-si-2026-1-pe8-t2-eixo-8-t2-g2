import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  message,
  Row,
  Space,
  Switch,
  Typography,
} from 'antd';
import { CheckCircleOutlined, GoogleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { GoogleCalendar } from '../icon/components/GoogleCalendar';
import { Gmail } from '../icon/components';
import { useQuery } from '@tanstack/react-query';
import type { IntegrationsPayload } from '~/@types/integrations';
import { IntegrationsController } from '~/controllers/IntegrationsController';
import { Popup } from '~/utils/Popup';

const { Text } = Typography;

type IntegrationGoogleForm = {
  clientId: string;
  clientSecret: string;
  mailFrom: string;
  mailSenderName: string;
};

type IntegrationGmailForm = {
  clientId: string;
  clientSecret: string;
  mailFrom: string;
  mailSenderName: string;
};

type IntegrationCalendarForm = {
  clientId: string;
  clientSecret: string;
};

export function IntegrationsTab() {
  const [useSameGoogleAccount, setUseSameGoogleAccount] = useState(true);

  const [googleForm] = Form.useForm<IntegrationGoogleForm>();
  const [calendarForm] = Form.useForm<IntegrationCalendarForm>();
  const [mailForm] = Form.useForm<IntegrationGmailForm>();

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        const integration = event.data.integration as 'calendar' | 'gmail' | 'all';
        const preffix =
          integration === 'all'
            ? 'Google Calendar e Gmail'
            : integration === 'calendar'
              ? 'Google Calendar'
              : 'Gmail';
        message.success(`${preffix} configurado com sucesso!`);
      }
    }

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const integrationsQuery = useQuery<IntegrationsPayload>({
    queryKey: ['app-settings'],
    queryFn: () => IntegrationsController.find(),
    staleTime: 1000 * 60 * 5,
  });

  async function handleGoogleLogin(integration: 'all' | 'calendar' | 'gmail') {
    switch (integration) {
      case 'all':
        await googleForm.validateFields();
        break;
      case 'calendar':
        await calendarForm.validateFields();
        break;
      case 'gmail':
        await mailForm.validateFields();
        break;
    }
    const onFinish = (data: { url: string }) => {
      Popup.openGoogleAuth(data.url);
    };
    switch (integration) {
      case 'all':
        await IntegrationsController.save({
          google: googleForm.getFieldsValue(),
        }).then(onFinish);
        break;
      case 'calendar':
        await IntegrationsController.save({
          googleCalendar: calendarForm.getFieldsValue(),
        }).then(onFinish);
        break;
      case 'gmail':
        await IntegrationsController.save({
          gmail: mailForm.getFieldsValue(),
        }).then(onFinish);
        break;
    }
  }

  return (
    <Space orientation="vertical" size={16} style={{ width: '100%' }}>
      <Alert
        type="info"
        showIcon
        title="Integrações Google"
        description={
          <div>
            <p>
              <strong>Google Calendar:</strong> sincroniza automaticamente os pedidos
              cadastrados na plataforma com o Google Calendar.
            </p>

            <p>
              <strong>Gmail:</strong> permite que os e-mails enviados pela plataforma
              sejam disparados utilizando sua conta Google.
            </p>

            <p style={{ marginBottom: 0 }}>
              Você pode utilizar a mesma conta Google para ambas as integrações e realizar
              apenas um login.
            </p>
          </div>
        }
      />

      <Card>
        <Row align="middle" justify="space-between">
          <Col>
            <Space orientation="vertical" size={0}>
              <Text strong>Usar mesma conta Google</Text>
              <Text type="secondary">
                Utilize um único login e uma única configuração OAuth para Calendar e
                Gmail.
              </Text>
            </Space>
          </Col>

          <Col>
            <Switch checked={useSameGoogleAccount} onChange={setUseSameGoogleAccount} />
          </Col>
        </Row>
      </Card>

      {useSameGoogleAccount ? (
        <Card title="Integração Google Unificada" extra={<GoogleOutlined size={24} />}>
          <Form
            layout="vertical"
            form={googleForm}
            initialValues={{
              clientId: '',
              clientSecret: '',
              mailFrom: '',
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Google Client ID"
                  name="clientId"
                  rules={[{ required: true, message: 'Informe o Client ID' }]}
                >
                  <Input placeholder="Client ID da aplicação Google" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Google Client Secret"
                  name="clientSecret"
                  rules={[
                    {
                      required: true,
                      message: 'Informe o Client Secret',
                    },
                  ]}
                >
                  <Input.Password placeholder="Client Secret da aplicação Google" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Nome remetente"
                  name="mailSenderName"
                  extra="Este nome será utilizado como remetente padrão nos e-mails enviados pela plataforma."
                  rules={[
                    {
                      required: true,
                      message: 'Informe o nome do remetente',
                    },
                  ]}
                >
                  <Input placeholder="Nome do remetente" />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="E-mail remetente"
                  name="mailFrom"
                  extra="Este e-mail será utilizado como remetente padrão nos e-mails enviados pela plataforma."
                  rules={[
                    {
                      required: true,
                      type: 'email',
                      message: 'Informe um e-mail válido',
                    },
                  ]}
                >
                  <Input placeholder="contato@suaempresa.com" />
                </Form.Item>
              </Col>
            </Row>

            <Divider />

            <Space>
              <Button
                type="primary"
                icon={<GoogleOutlined />}
                onClick={() => handleGoogleLogin('all')}
              >
                Salvar
              </Button>

              <Button type="default" icon={<CheckCircleOutlined />}>
                Testar Configurações
              </Button>
            </Space>
          </Form>
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title="Google Calendar"
              extra={<GoogleCalendar style={{ fontSize: 24 }} />}
            >
              <Form
                layout="vertical"
                form={calendarForm}
                initialValues={{
                  clientId: '',
                  clientSecret: '',
                }}
              >
                <Form.Item
                  label="Google Client ID"
                  name="clientId"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Google Client Secret"
                  name="clientSecret"
                  rules={[{ required: true }]}
                >
                  <Input.Password />
                </Form.Item>

                <Space>
                  <Button
                    type="primary"
                    icon={<GoogleOutlined />}
                    onClick={() => handleGoogleLogin('calendar')}
                  >
                    Salvar
                  </Button>

                  {/* <Button icon={<CheckCircleOutlined />}>Salvar</Button> */}
                </Space>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Gmail" extra={<Gmail style={{ fontSize: 24 }} />}>
              <Form
                layout="vertical"
                form={mailForm}
                initialValues={{
                  clientId: '',
                  clientSecret: '',
                  mailFrom: '',
                }}
              >
                <Form.Item
                  label="Google Client ID"
                  name="clientId"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Google Client Secret"
                  name="clientSecret"
                  rules={[{ required: true }]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  label="Nome remetente"
                  name="mailSenderName"
                  extra="Este nome será utilizado como remetente padrão nos e-mails enviados pela plataforma."
                  rules={[
                    {
                      required: true,
                      message: 'Informe o nome do remetente',
                    },
                  ]}
                >
                  <Input placeholder="Nome do remetente" />
                </Form.Item>

                <Form.Item
                  label="E-mail remetente"
                  name="mailFrom"
                  rules={[
                    {
                      required: true,
                      type: 'email',
                    },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Space>
                  <Button
                    type="primary"
                    icon={<GoogleOutlined />}
                    onClick={() => handleGoogleLogin('gmail')}
                  >
                    Salvar
                  </Button>

                  {/* <Button icon={<CheckCircleOutlined />}>Salvar</Button> */}
                </Space>
              </Form>
            </Card>
          </Col>
        </Row>
      )}
    </Space>
  );
}
