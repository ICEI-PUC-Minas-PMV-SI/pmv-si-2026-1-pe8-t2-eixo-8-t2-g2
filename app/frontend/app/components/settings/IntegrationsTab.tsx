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
  Modal,
  Typography,
} from 'antd';
import { CheckCircleOutlined, GoogleOutlined, LinkOutlined } from '@ant-design/icons';
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
  const [authUrl, setAuthUrl] = useState<string>();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [googleForm] = Form.useForm<IntegrationGoogleForm>();
  const [calendarForm] = Form.useForm<IntegrationCalendarForm>();
  const [mailForm] = Form.useForm<IntegrationGmailForm>();

  const integrationsQuery = useQuery<IntegrationsPayload>({
    queryKey: ['google-integrations'],
    queryFn: () =>
      IntegrationsController.list().then((data) => {
        if (data.google) {
          googleForm.setFieldsValue({ ...data.google, clientSecret: '**********' });
          setUseSameGoogleAccount(true);
        } else {
          if (data.googleCalendar) {
            calendarForm.setFieldsValue({
              ...data.googleCalendar,
              clientSecret: '**********',
            });
          }
          if (data.gmail) {
            mailForm.setFieldsValue({ ...data.gmail, clientSecret: '**********' });
          }
          setUseSameGoogleAccount(false);
        }
        return data;
      }),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (integrationsQuery.data?.google) {
      googleForm.setFieldsValue({
        ...integrationsQuery.data?.google,
        clientSecret: '**********',
      });
      setUseSameGoogleAccount(true);
    }
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

  async function handleGoogleLogin(integration: 'all' | 'calendar' | 'gmail') {
    // const popup = Popup.openGoogleAuth('about:blank');
    // if (!popup) {
    //   message.error('O navegador bloqueou a janela de autenticação.');
    //   return;
    // }
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
    let data: { url: string };
    try {
      switch (integration) {
        case 'all':
          data = await IntegrationsController.save({
            google: googleForm.getFieldsValue(),
          });
          break;
        case 'calendar':
          data = await IntegrationsController.save({
            googleCalendar: calendarForm.getFieldsValue(),
          });
          break;
        case 'gmail':
          data = await IntegrationsController.save({
            gmail: mailForm.getFieldsValue(),
          });
          break;
      }
      setAuthUrl(data.url);
      setAuthModalOpen(true);
      // popup.location.href = data.url;
    } catch (err) {
      // popup.close();
      throw err;
    }
  }

  return (
    <>
      <Modal
        open={authModalOpen}
        onCancel={() => setAuthModalOpen(false)}
        footer={null}
        centered
        title={
          <Space>
            <GoogleOutlined style={{ color: '#4285F4', fontSize: 20 }} />
            <span>Autenticação Google necessária</span>
          </Space>
        }
      >
        <Space orientation="vertical" size={16} style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            title="Próximo passo"
            description="Clique no botão abaixo para abrir a tela de login do Google em uma nova aba. Após autorizar, essa janela será atualizada automaticamente."
          />

          <Button
            type="primary"
            icon={<LinkOutlined />}
            size="large"
            block
            href={authUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAuthModalOpen(false)}
          >
            Abrir autenticação Google
          </Button>

          <Text type="secondary" style={{ fontSize: 12 }}>
            Após concluir o login, você pode fechar essa mensagem. A integração será
            confirmada automaticamente.
          </Text>
        </Space>
      </Modal>
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
                Você pode utilizar a mesma conta Google para ambas as integrações e
                realizar apenas um login.
              </p>
            </div>
          }
        />

        {/* <Card loading={integrationsQuery.isLoading}>
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
      </Card> */}

        {useSameGoogleAccount ? (
          <Card
            loading={integrationsQuery.isLoading}
            title="Integração Google Unificada"
            extra={<GoogleOutlined size={24} />}
          >
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

                <Button
                  type="default"
                  icon={<CheckCircleOutlined />}
                  onClick={() =>
                    IntegrationsController.test('all').then((res) => {
                      if (res.success) {
                        message.success('Sucesso ao testar credenciais');
                      } else {
                        message.error('Falha ao validar credenciais');
                      }
                    })
                  }
                >
                  Testar
                </Button>
              </Space>
            </Form>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card
                loading={integrationsQuery.isLoading}
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
              <Card
                title="Gmail"
                extra={<Gmail style={{ fontSize: 24 }} />}
                loading={integrationsQuery.isLoading}
              >
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
    </>
  );
}
