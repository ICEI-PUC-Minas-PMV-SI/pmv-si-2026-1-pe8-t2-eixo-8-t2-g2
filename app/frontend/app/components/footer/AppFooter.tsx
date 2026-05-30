import { HeartOutlined } from '@ant-design/icons';
import { Divider, Flex, Layout, Row, Col, Space, Typography } from 'antd';

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
  phone: '(31) 92222-22222',
  phoneHref: 'https://wa.me/553122222222222',
  email: 'contato@doceecia.com.br',
  businessHours: 'Seg a Sáb: 8h às 18h',
  locationLabel: 'Feito em casa, com amor.',
  instagramHandle: '@doceecia',
  instagramUrl: 'https://www.instagram.com/doceecia',
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
  return (
    <Footer
      style={{
        padding: 0,
        background: '#F5EDE9',
        borderTop: '1px solid #E8D5CF',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          padding: useFullFooter ? '48px 24px 24px' : '6px 24px',
        }}
      >
        {useFullFooter && (
          <Row gutter={[40, 40]} style={{ marginBottom: 0 }}>
            {/* Logo + badge */}
            <Col xs={24} md={7}>
              <Flex vertical gap={20} align="flex-start">
                <img
                  src={logoIsabellaCaster}
                  alt="Doce & Cia"
                  style={{
                    width: 140,
                    height: 'auto',
                  }}
                />
                <Text
                  style={{
                    color: '#7A5C56',
                    fontSize: 14,
                    lineHeight: 1.7,
                    maxWidth: 240,
                  }}
                >
                  Confeitaria artesanal com ingredientes selecionados e muito carinho em
                  cada detalhe.
                </Text>
                <Flex
                  align="center"
                  gap={8}
                  style={{
                    border: '1px solid rgba(192,90,72,0.4)',
                    borderRadius: 999,
                    padding: '6px 14px',
                    display: 'inline-flex',
                  }}
                >
                  <HeartOutlined
                    style={{ fontSize: 13, lineHeight: 1, color: '#C05A48' }}
                  />
                  <Text style={{ color: '#C05A48', fontSize: 13 }}>{badgeText}</Text>
                </Flex>
              </Flex>
            </Col>

            {/* Divider vertical — só desktop */}
            <Col xs={0} md={1} style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: 1,
                  background: '#E0CECA',
                  margin: '0 auto',
                  height: '100%',
                }}
              />
            </Col>

            {/* Atendimento */}
            <Col xs={24} md={7}>
              <Flex vertical gap={16} align="flex-start">
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    color: '#C05A48',
                    fontSize: 11,
                  }}
                >
                  Atendimento
                </Title>

                <Flex vertical gap={12}>
                  <Link href={phoneHref} target="_blank" style={styles.link}>
                    <Space size={10} align="center" style={styles.iconContainer}>
                      <WhatsApp style={styles.icon} />
                      <Text style={{ color: '#5C3D38', fontSize: 14 }}>{phone}</Text>
                    </Space>
                  </Link>

                  <Link href={`mailto:${email}`} style={styles.link}>
                    <Space size={10} align="center" style={styles.iconContainer}>
                      <Envelope style={styles.icon} />
                      <Text style={{ color: '#5C3D38', fontSize: 14 }}>{email}</Text>
                    </Space>
                  </Link>

                  <Space size={10} align="center" style={styles.iconContainer}>
                    <Clock style={styles.icon} />
                    <Text style={{ color: '#5C3D38', fontSize: 14 }}>
                      {businessHours}
                    </Text>
                  </Space>

                  <Space size={10} align="center" style={styles.iconContainer}>
                    <Marker style={styles.icon} />
                    <Text style={{ color: '#5C3D38', fontSize: 14 }}>
                      {locationLabel}
                    </Text>
                  </Space>
                </Flex>
              </Flex>
            </Col>

            {/* Divider vertical — só desktop */}
            <Col xs={0} md={1} style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  width: 1,
                  background: '#E0CECA',
                  margin: '0 auto',
                  height: '100%',
                }}
              />
            </Col>

            {/* Redes sociais */}
            <Col xs={24} md={7}>
              <Flex vertical gap={16} align="flex-start">
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: 2,
                    color: '#C05A48',
                    fontSize: 11,
                  }}
                >
                  Siga-me
                </Title>

                <Link href={instagramUrl} target="_blank" style={styles.link}>
                  <Space size={10} align="center" style={styles.iconContainer}>
                    <Instagram style={styles.icon} />
                    <Text style={{ color: '#5C3D38', fontSize: 14 }}>
                      {instagramHandle}
                    </Text>
                  </Space>
                </Link>

                <Text
                  style={{
                    color: '#7A5C56',
                    fontSize: 13,
                    lineHeight: 1.6,
                    maxWidth: 200,
                  }}
                >
                  Acompanhe as novidades, bastidores e criações especiais no Instagram.
                </Text>
              </Flex>
            </Col>
          </Row>
        )}

        {useFullFooter && (
          <Divider style={{ borderColor: '#E0CECA', margin: '32px 0 20px' }} />
        )}

        {/* Copyright */}
        <Flex
          justify={useFullFooter ? 'space-between' : 'center'}
          align="center"
          wrap="wrap"
          gap={8}
        >
          <Text style={{ color: '#9C7A74', fontSize: 12 }}>
            © {copyrightYear} Doce & Cia. Todos os direitos reservados.
          </Text>
          {useFullFooter && (
            <Text style={{ color: '#B89990', fontSize: 12 }}>
              Confeitaria artesanal · Belo Horizonte, MG
            </Text>
          )}
        </Flex>
      </div>
    </Footer>
  );
}

const styles = StyleSheet.create({
  link: {
    color: 'inherit',
    transition: 'opacity 0.15s',
  },
  iconContainer: {
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    color: '#C05A48',
  },
});
