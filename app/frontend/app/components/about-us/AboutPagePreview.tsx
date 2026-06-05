import { PictureOutlined } from '@ant-design/icons';
import { Flex, Typography } from 'antd';
import type { About, AboutItem } from '~/@types/about';

type Props = {
  imageUrl?: string | null;
  about: Partial<About> & { items?: AboutItem[] };
};

export function AboutPagePreview({ imageUrl, about }: Props) {
  const subtitle = about.subtitle || 'Título da seção';
  const title = about.title || 'Título da página';
  const main = about.main || 'Texto principal aparecerá aqui...';
  const items = about.items ?? [];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 460,
        padding: 12,
        borderRadius: 12,
        border: '1.5px solid #F0E8E5',
        overflow: 'hidden',
        background: '#FDFAF9',
        boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
        flexShrink: 0,
        fontFamily: 'sans-serif',
      }}
    >
      {/* Label do preview */}
      <div
        style={{
          background: '#F5EDE9',
          padding: '6px 14px',
          borderBottom: '1px solid #F0E8E5',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: '#E06D5B',
          }}
        />
        <Typography.Text
          style={{
            fontSize: 10,
            color: '#A0685C',
            fontWeight: 500,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
          }}
        >
          Pré-visualização
        </Typography.Text>
      </div>

      {/* Seção Hero em miniatura */}
      <div style={{ background: '#F1EFEC' }}>
        <Flex>
          {/* Texto */}
          <div
            style={{
              width: '58%',
              padding: '16px 14px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                background: 'rgba(224,109,91,0.12)',
                color: '#C05A48',
                borderRadius: 20,
                padding: '2px 8px',
                fontSize: 9,
                fontWeight: 600,
                marginBottom: 8,
                letterSpacing: '0.4px',
              }}
            >
              {subtitle}
            </div>

            <Typography.Text
              strong
              style={{
                fontSize: 13,
                color: '#1A1A1A',
                lineHeight: 1.3,
                display: 'block',
                marginBottom: 6,
              }}
              ellipsis={{ tooltip: title }}
            >
              {title}
            </Typography.Text>

            <Typography.Text
              style={{
                fontSize: 10,
                color: '#666',
                lineHeight: 1.6,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {main}
            </Typography.Text>
          </div>

          {/* Imagem */}
          <div
            style={{
              width: '42%',
              flexShrink: 0,
              padding: 12,
            }}
          >
            <div
              style={{
                height: 120,
                borderRadius: 12,
                overflow: 'hidden',
                background: '#E7E1DB',
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Destaque"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Flex vertical align="center" gap={4} style={{ padding: 8 }}>
                  <PictureOutlined style={{ fontSize: 20, color: '#B0A49C' }} />
                  <Typography.Text
                    style={{ fontSize: 9, color: '#B0A49C', textAlign: 'center' }}
                  >
                    Imagem de destaque
                  </Typography.Text>
                </Flex>
              )}
            </div>
            <Typography.Text
              style={{
                fontSize: 9,
                color: '#E06D5B',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                display: 'block',
                padding: '12px 0',
              }}
            >
              Nossos diferenciais
            </Typography.Text>
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: '50%',
                    background: '#E06D5B',
                    marginTop: 5,
                    flexShrink: 0,
                  }}
                />

                <span
                  style={{
                    fontSize: 9,
                    color: '#444',
                    lineHeight: 1.4,
                  }}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </Flex>
      </div>
    </div>
  );
}
