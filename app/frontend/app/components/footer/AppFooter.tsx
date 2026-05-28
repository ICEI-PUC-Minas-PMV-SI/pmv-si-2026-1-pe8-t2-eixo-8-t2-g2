import { HeartOutlined } from '@ant-design/icons';

import { Divider, Flex, Layout, Row, Col, Space, Typography, theme } from 'antd';

import logoIsabellaCaster from './assets/logo-isabella-caster.png';
import { Clock, Envelope, Instagram, Marker, WhatsApp } from '../icon/components';
import StyleSheet from '~/utils/StyleSheet';

const { Footer } = Layout;
const { Text, Link, Title } = Typography;

export type AppFooterProps = {
  phone?: string;
  phoneHref?: string;
  email?: string;
  businessHours?: string;
  locationLabel?: string;
  instagramHandle?: string;
  instagramUrl?: string;
  badgeText?: string;
  copyrightYear?: number;
  useFullFooter?: boolean;
};

const DEFAULTS = {
  phone: '(31) 99822-6620',
  phoneHref: 'https://wa.me/5531998226620',
  email: 'contato@isabellacaster.com.br',
  businessHours: 'Seg a Sáb: 8h às 18h',
  locationLabel: 'Feito em casa, com amor.',
  instagramHandle: '@isabella_caster',
  instagramUrl: 'https://www.instagram.com/isabella_caster',
  badgeText: 'Feito com amor em cada detalhe.',
  copyrightYear: new Date().getFullYear(),
} as const;

export function AppFooter({
  phone = DEFAULTS.phone,
  phoneHref = DEFAULTS.phoneHref,
  email = DEFAULTS.email,
  businessHours = DEFAULTS.businessHours,
  locationLabel = DEFAULTS.locationLabel,
  instagramHandle = DEFAULTS.instagramHandle,
  instagramUrl = DEFAULTS.instagramUrl,
  badgeText = DEFAULTS.badgeText,
  copyrightYear = DEFAULTS.copyrightYear,
  useFullFooter = false,
}: AppFooterProps) {
  const { token } = theme.useToken();

  return (
    <Footer
      style={{
        padding: 6,
        background: '#e9e9e1',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
        }}
      >
        {useFullFooter && (
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8} style={{ margin: 'auto' }}>
              <Flex justify="center">
                <img
                  src={logoIsabellaCaster}
                  alt="Isabella Cáster Confeitaria"
                  style={{
                    width: 160,
                    height: 'auto',
                  }}
                />
              </Flex>
            </Col>

            <Col xs={24} md={8}>
              <Flex
                vertical
                gap={16}
                align="flex-start"
                style={{
                  width: 'fit-content',
                  margin: '0 auto',
                }}
              >
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#e06d5b',
                  }}
                >
                  Atendimento
                </Title>

                <Space orientation="vertical" size={6}>
                  <Link href={phoneHref} target="_blank">
                    <Space size={10} align="center" style={styles.iconContainer}>
                      <WhatsApp style={styles.icon} />
                      {phone}
                    </Space>
                  </Link>

                  <Link href={`mailto:${email}`}>
                    <Space size={10} align="center" style={styles.iconContainer}>
                      <Envelope style={styles.icon} />
                      {email}
                    </Space>
                  </Link>

                  <Space size={10} align="center" style={styles.iconContainer}>
                    <Clock style={styles.icon} />
                    <Text>{businessHours}</Text>
                  </Space>

                  <Space size={10} align="center" style={styles.iconContainer}>
                    <Marker style={styles.icon} />
                    <Text>{locationLabel}</Text>
                  </Space>
                </Space>
              </Flex>
            </Col>

            <Col xs={24} md={8}>
              <Flex
                vertical
                gap={16}
                align="flex-start"
                style={{
                  width: 'fit-content',
                  margin: '0 auto',
                }}
              >
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: 1.5,
                    color: '#e06d5b',
                  }}
                >
                  Siga-me
                </Title>

                <Link href={instagramUrl} target="_blank">
                  <Space size={10} align="center" style={styles.iconContainer}>
                    <Instagram style={styles.icon} />
                    {instagramHandle}
                  </Space>
                </Link>

                <Flex
                  align="center"
                  gap={8}
                  style={{
                    border: '1px solid #e06d5b',
                    borderRadius: 999,
                    padding: '8px 16px',
                    color: '#e06d5b',
                  }}
                >
                  <HeartOutlined
                    style={{
                      lineHeight: 1,
                    }}
                  />

                  <Text style={{ color: 'inherit' }}>{badgeText}</Text>
                </Flex>
              </Flex>
            </Col>
          </Row>
        )}

        {useFullFooter && (
          <Divider
            style={{
              borderColor: token.colorBorderSecondary,
              margin: '10px 0',
            }}
          />
        )}

        <Text
          type="secondary"
          style={{
            display: 'block',
            textAlign: 'center',
            fontSize: 12,
          }}
        >
          © {copyrightYear} Isabella Cáster Confeitaria. Todos os direitos reservados.
        </Text>
      </div>
    </Footer>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'normal',
  },
  icon: {
    fontSize: 22,
  },
});
