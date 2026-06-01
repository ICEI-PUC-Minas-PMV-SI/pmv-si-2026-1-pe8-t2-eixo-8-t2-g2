import {
  ShoppingCartOutlined,
  UserOutlined,
  EditOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { Button, Col, Flex, Grid, Row, Tag, Typography } from 'antd';
import type { AppSettings } from '~/@types/app-settings';
import TextUtil from '~/utils/TextUtil';

export function HowToOrderSection({ settings }: { settings: AppSettings }) {
  const screens = Grid.useBreakpoint();

  const steps = [
    {
      icon: <ShoppingCartOutlined style={{ fontSize: 28, color: '#E06D5B' }} />,
      title: 'Monte seu pedido',
      desc: 'Adicione os doces favoritos ao carrinho de forma rápida e prática.',
    },
    {
      icon: <UserOutlined style={{ fontSize: 28, color: '#E06D5B' }} />,
      title: 'Entre na sua conta',
      desc: 'Faça login ou crie sua conta para continuar o pedido.',
    },
    {
      icon: <EditOutlined style={{ fontSize: 28, color: '#E06D5B' }} />,
      title: 'Defina os detalhes',
      desc: 'Escolha a data, horário e adicione observações ou personalizações.',
    },
    {
      icon: <WhatsAppOutlined style={{ fontSize: 28, color: '#25D366' }} />,
      title: 'Receba nossa confirmação',
      desc: 'A confeitaria entra em contato pelo WhatsApp para confirmar tudo.',
    },
  ];

  return (
    <section
      style={{
        padding: screens.md ? '72px 24px' : '48px 20px',
        background: '#fff',
        borderBottom: '1px solid #F0E8E5',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Tag
            style={{
              background: 'rgba(224,109,91,0.1)',
              color: '#C05A48',
              border: 'none',
              borderRadius: 20,
              padding: '3px 12px',
              fontSize: 12,
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            Como funciona
          </Tag>

          <Typography.Title
            level={2}
            style={{
              fontSize: screens.md ? 34 : 24,
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: 8,
            }}
          >
            Peça seus doces em poucos passos
          </Typography.Title>

          <Typography.Text
            style={{
              color: '#777',
              fontSize: 15,
            }}
          >
            Um processo simples, rápido e personalizado
          </Typography.Text>
        </div>

        <Row gutter={[24, 24]}>
          {steps.map((step, idx) => (
            <Col key={idx} xs={24} sm={12} md={6}>
              <div
                style={{
                  background: '#FDFAF9',
                  borderRadius: 16,
                  padding: '28px 24px',
                  border: '1.5px solid #F0E8E5',
                  height: '100%',
                  position: 'relative',
                  transition: 'all .2s ease',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    background: 'rgba(224,109,91,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#E06D5B',
                  }}
                >
                  {idx + 1}
                </div>

                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: 'rgba(224,109,91,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 18,
                  }}
                >
                  {step.icon}
                </div>

                <Typography.Title
                  level={5}
                  style={{
                    marginBottom: 8,
                    color: '#1A1A1A',
                  }}
                >
                  {step.title}
                </Typography.Title>

                <Typography.Text
                  style={{
                    color: '#777',
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  {step.desc}
                </Typography.Text>
              </div>
            </Col>
          ))}
        </Row>

        <Flex justify="center" style={{ marginTop: 40 }}>
          <Button
            type="primary"
            size="large"
            icon={<WhatsAppOutlined />}
            href={TextUtil.whatsappLink(settings.whatsapp)}
            target="_blank"
            style={{
              background: '#25D366',
              borderColor: '#25D366',
              borderRadius: 10,
              height: 50,
              paddingInline: 34,
              fontWeight: 600,
              fontSize: 15,
              boxShadow: '0 8px 24px rgba(37,211,102,0.22)',
            }}
          >
            Falar com a confeitaria
          </Button>
        </Flex>
      </div>
    </section>
  );
}
