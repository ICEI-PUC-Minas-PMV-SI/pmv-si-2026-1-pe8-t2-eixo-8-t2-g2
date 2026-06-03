import { Button, Col, Flex, Grid, Row, Space, Tag, Typography } from 'antd';
import type { AppSettings } from '~/@types/app-settings';
import { ShoppingCartOutlined, InstagramOutlined } from '@ant-design/icons';
import TextUtil from '~/utils/TextUtil';

export function ContactSection({ settings }: { settings: AppSettings }) {
  const screens = Grid.useBreakpoint();

  const benefits = [
    'Escolha seus produtos online',
    'Defina data e personalizações',
    'Acompanhe tudo com praticidade',
    'Receba confirmação pelo WhatsApp',
  ];

  return (
    <section
      id="contato"
      style={{
        padding: screens.md ? '84px 24px' : '56px 20px',
        background: 'linear-gradient(180deg, #FFF7F5 0%, #FFF1EC 100%)',
        borderBottom: '1px solid #F0E8E5',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <Row gutter={[48, 40]} align="middle">
          <Col xs={24} md={14}>
            <Tag
              style={{
                background: 'rgba(224,109,91,0.1)',
                color: '#C05A48',
                border: 'none',
                borderRadius: 20,
                padding: '4px 14px',
                fontWeight: 600,
                marginBottom: 18,
              }}
            >
              Pedido online simples
            </Tag>

            <Typography.Title
              level={2}
              style={{
                fontSize: screens.md ? 40 : 28,
                lineHeight: 1.15,
                fontWeight: 700,
                color: '#1A1A1A',
                marginBottom: 16,
              }}
            >
              Monte seu pedido do seu jeito
            </Typography.Title>

            <Typography.Paragraph
              style={{
                color: '#666',
                fontSize: 16,
                lineHeight: 1.9,
                marginBottom: 32,
                maxWidth: 560,
              }}
            >
              Escolha seus doces favoritos, personalize os detalhes e envie seu pedido em
              poucos minutos. Nossa equipe entra em contato pelo WhatsApp para confirmar
              tudo com você.
            </Typography.Paragraph>

            <Space size={14} wrap>
              <Button
                type="primary"
                size="large"
                icon={<ShoppingCartOutlined />}
                style={{
                  background: '#E06D5B',
                  borderColor: '#E06D5B',
                  borderRadius: 10,
                  height: 50,
                  paddingInline: 28,
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: '0 10px 24px rgba(224,109,91,0.18)',
                }}
              >
                Começar pedido
              </Button>

              {settings.instagram && (
                <Button
                  size="large"
                  icon={<InstagramOutlined />}
                  href={`${TextUtil.parseInstagram(settings.instagram)?.url}`}
                  target="_blank"
                  style={{
                    borderColor: '#E06D5B',
                    color: '#E06D5B',
                    borderRadius: 10,
                    height: 50,
                    paddingInline: 24,
                    fontWeight: 600,
                    background: '#fff',
                  }}
                >
                  Ver Instagram
                </Button>
              )}
            </Space>
          </Col>

          <Col xs={24} md={10}>
            <div
              style={{
                background: '#fff',
                borderRadius: 22,
                padding: '30px',
                border: '1px solid #F3DFDA',
                boxShadow: '0 18px 40px rgba(0,0,0,0.04)',
              }}
            >
              <Typography.Title
                level={4}
                style={{
                  marginBottom: 24,
                  color: '#1A1A1A',
                }}
              >
                Como funciona seu pedido
              </Typography.Title>

              <Flex vertical gap={18}>
                {benefits.map((item, idx) => (
                  <Flex key={idx} gap={14} align="center">
                    <div
                      style={{
                        minWidth: 34,
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'rgba(224,109,91,0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#E06D5B',
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >
                      ✓
                    </div>

                    <Typography.Text
                      style={{
                        color: '#555',
                        fontSize: 15,
                      }}
                    >
                      {item}
                    </Typography.Text>
                  </Flex>
                ))}
              </Flex>

              <div
                style={{
                  marginTop: 28,
                  padding: '18px 20px',
                  borderRadius: 14,
                  background: '#FFF6F3',
                  border: '1px solid #F5DFD9',
                }}
              >
                <Typography.Text
                  style={{
                    color: '#7A5A54',
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  Após o envio do pedido, nossa equipe confirma disponibilidade, detalhes
                  e pagamento diretamente com você.
                </Typography.Text>
              </div>
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
}
