import { Card, Col, Flex, Rate, Row, Typography } from 'antd';
import { RATING_COLOR } from '~/constants/Colors';
import ReviewController, { type ReviewRecord } from '~/controllers/ReviewController';
import { StarFilled, HomeOutlined } from '@ant-design/icons';

export function SummaryCards({ reviews }: { reviews: ReviewRecord[] }) {
  const avg = ReviewController.averageRating(reviews);
  const featured = reviews.filter((r) => r.featured).length;
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length
      ? Math.round(
          (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
        )
      : 0,
  }));

  return (
    <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
      {/* Média */}
      <Col xs={24} sm={8}>
        <Card
          style={{ borderRadius: 12, border: '1px solid #F0E8E5', textAlign: 'center' }}
          styles={{ body: { padding: '20px 16px' } }}
        >
          <Typography.Text
            style={{ fontSize: 48, fontWeight: 800, color: '#E06D5B', lineHeight: 1 }}
          >
            {avg.toFixed(1)}
          </Typography.Text>
          <div style={{ marginTop: 8 }}>
            <Rate disabled allowHalf value={avg} style={{ fontSize: 16 }} />
          </div>
          <Typography.Text
            style={{ fontSize: 12, color: '#8C8C8C', display: 'block', marginTop: 4 }}
          >
            {reviews.length} avaliação{reviews.length !== 1 ? 'ões' : ''}
          </Typography.Text>
        </Card>
      </Col>

      {/* Distribuição */}
      <Col xs={24} sm={10}>
        <Card
          style={{ borderRadius: 12, border: '1px solid #F0E8E5' }}
          styles={{ body: { padding: '16px 20px' } }}
        >
          <Flex vertical gap={5}>
            {dist.map(({ star, count, pct }) => (
              <Flex key={star} align="center" gap={8}>
                <Typography.Text
                  style={{ fontSize: 12, width: 14, textAlign: 'right', flexShrink: 0 }}
                >
                  {star}
                </Typography.Text>
                <StarFilled
                  style={{ fontSize: 11, color: RATING_COLOR[star], flexShrink: 0 }}
                />
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    background: '#F5F5F5',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: RATING_COLOR[star],
                      borderRadius: 4,
                      transition: 'width 0.4s',
                    }}
                  />
                </div>
                <Typography.Text
                  style={{ fontSize: 11, color: '#8C8C8C', width: 24, flexShrink: 0 }}
                >
                  {count}
                </Typography.Text>
              </Flex>
            ))}
          </Flex>
        </Card>
      </Col>

      {/* Destaque homepage */}
      <Col xs={24} sm={6}>
        <Card
          style={{ borderRadius: 12, border: '1px solid #F0E8E5', textAlign: 'center' }}
          styles={{ body: { padding: '20px 16px' } }}
        >
          <HomeOutlined
            style={{ fontSize: 28, color: '#E06D5B', display: 'block', marginBottom: 8 }}
          />
          <Typography.Text
            style={{ fontSize: 32, fontWeight: 800, color: '#1A1A1A', lineHeight: 1 }}
          >
            {featured}
          </Typography.Text>
          <Typography.Text
            style={{ fontSize: 12, color: '#8C8C8C', display: 'block', marginTop: 4 }}
          >
            na homepage
          </Typography.Text>
        </Card>
      </Col>
    </Row>
  );
}
