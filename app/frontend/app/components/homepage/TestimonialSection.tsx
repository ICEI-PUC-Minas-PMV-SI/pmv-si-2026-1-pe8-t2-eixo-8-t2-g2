import { Col, Flex, Grid, Row, Tag, Typography } from 'antd';
import ReviewController, { type ReviewRecord } from '~/controllers/ReviewController';
import { useState, useEffect } from 'react';
import { StarFilled } from '@ant-design/icons';

export function TestimonialsSection() {
  const screens = Grid.useBreakpoint();
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);

  useEffect(() => {
    ReviewController.listFeatured().then(setReviews);
  }, []);

  return (
    <section
      hidden={reviews.length === 0}
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
            Depoimentos
          </Tag>
          <Typography.Title
            level={2}
            style={{
              fontSize: screens.md ? 34 : 24,
              fontWeight: 700,
              color: '#1A1A1A',
              marginBottom: 4,
            }}
          >
            O que nossos clientes dizem
          </Typography.Title>
        </div>

        <Row gutter={[24, 24]}>
          {reviews.slice(0, 3).map((t) => (
            <Col key={t.id} xs={24} md={8}>
              <div
                style={{
                  background: '#FDFAF9',
                  borderRadius: 14,
                  padding: '28px',
                  border: '1.5px solid #F0E8E5',
                  height: '100%',
                }}
              >
                <Flex gap={4} style={{ marginBottom: 16 }}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <StarFilled key={i} style={{ color: '#E06D5B', fontSize: 14 }} />
                  ))}
                </Flex>
                <Typography.Paragraph
                  style={{
                    color: '#444',
                    fontSize: 14,
                    lineHeight: 1.75,
                    fontStyle: 'italic',
                    marginBottom: 20,
                  }}
                >
                  "{t.comment}"
                </Typography.Paragraph>
                <Flex gap={10} align="center">
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'rgba(224,109,91,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      color: '#C05A48',
                      flexShrink: 0,
                    }}
                  >
                    {t.customer.name[0]}
                  </div>
                  <div>
                    <Typography.Text
                      strong
                      style={{ fontSize: 14, display: 'block', color: '#1A1A1A' }}
                    >
                      {t.customer.name}
                    </Typography.Text>
                    <Typography.Text style={{ fontSize: 12, color: '#888' }}>
                      {t.scheduler.items.length}{' '}
                      {t.scheduler.items.length > 1 ? 'Itens' : 'Item'}
                    </Typography.Text>
                  </div>
                </Flex>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </section>
  );
}
