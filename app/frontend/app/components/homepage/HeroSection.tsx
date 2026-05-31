import { Button, Grid, Space, Tag, Typography } from 'antd';
import type { AppSettings } from '~/@types/app-settings';
import { HeartOutlined, CalendarOutlined } from '@ant-design/icons';

export function HeroSection({ settings }: { settings: AppSettings }) {
  const screens = Grid.useBreakpoint();

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #FFF7F5 0%, #FFF0EA 50%, #FDEEE9 100%)',
        padding: screens.md ? '80px 24px 72px' : '48px 20px 56px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid #F5E0D8',
        minHeight: 'fit-content',
      }}
    >
      {/* Decorative blobs */}
      <div
        style={{
          position: 'absolute',
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'rgba(224,109,91,0.07)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -40,
          left: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(224,109,91,0.05)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
        <Tag
          style={{
            background: 'rgba(224,109,91,0.12)',
            color: '#C05A48',
            border: 'none',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: 13,
            marginBottom: 20,
            fontWeight: 500,
          }}
          icon={<HeartOutlined />}
        >
          Feito artesanalmente
        </Tag>

        <Typography.Title
          level={1}
          style={{
            fontSize: screens.md ? 52 : 34,
            fontWeight: 700,
            color: '#1A1A1A',
            lineHeight: 1.15,
            marginBottom: 20,
            letterSpacing: '-0.5px',
          }}
        >
          {settings.siteName ?? 'Nossa Confeitaria'}
        </Typography.Title>

        <Typography.Paragraph
          style={{
            fontSize: screens.md ? 18 : 16,
            color: '#555',
            maxWidth: 520,
            margin: '0 auto 36px',
            lineHeight: 1.7,
          }}
        >
          Doces artesanais para tornar cada momento ainda mais especial. Encomendas
          personalizadas para qualquer ocasião.
        </Typography.Paragraph>

        <Space size={12} wrap style={{ justifyContent: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<CalendarOutlined />}
            href="#catalogo"
            style={{
              background: '#E06D5B',
              borderColor: '#E06D5B',
              borderRadius: 8,
              height: 48,
              paddingInline: 28,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Ver Cardápio
          </Button>
        </Space>
      </div>
    </section>
  );
}
