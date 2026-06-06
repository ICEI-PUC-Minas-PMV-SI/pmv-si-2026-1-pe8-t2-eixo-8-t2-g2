import { Avatar, Card, Flex, Rate, Switch, Tag, Typography } from 'antd';
import type { ReviewRecord } from '~/controllers/ReviewController';
import ReviewController from '~/controllers/ReviewController';
import DateUtil from '~/utils/DateUtil';
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
export function ReviewCard({
  review,
  onToggle,
  loading,
}: {
  review: ReviewRecord;
  loading: boolean;
  onToggle: (featured: boolean) => void;
}) {
  const items = review.scheduler.items;

  const orderLabel = items[0]
    ? `${items[0].quantity}× ${items[0].product.name}${
        items.length > 1 ? ` +${items.length - 1}` : ''
      }`
    : '—';

  return (
    <Card
      size="small"
      style={{
        borderRadius: 12,
        border: review.featured ? '1px solid #E06D5B' : '1px solid #F0F0F0',
      }}
    >
      <Flex vertical gap={12}>
        {/* Cliente */}
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={10}>
            <Avatar
              size={40}
              style={{
                background: '#E06D5B',
                fontWeight: 700,
              }}
            >
              {review.customer.name.charAt(0).toUpperCase()}
            </Avatar>

            <div>
              <Typography.Text strong>{review.customer.name}</Typography.Text>

              <br />

              <Typography.Text type="secondary">
                {DateUtil.format(review.createdAt)}
              </Typography.Text>
            </div>
          </Flex>

          {review.featured && (
            <Tag color="volcano" style={{ margin: 0 }}>
              Homepage
            </Tag>
          )}
        </Flex>

        {/* Nota */}
        <Flex align="center" gap={8}>
          <Rate disabled value={review.rating} />

          <Tag
            color={
              review.rating >= 4 ? 'success' : review.rating >= 3 ? 'warning' : 'error'
            }
          >
            {ReviewController.ratingLabel(review.rating)}
          </Tag>
        </Flex>

        {/* Comentário */}
        {review.comment && (
          <Typography.Paragraph
            style={{ marginBottom: 0 }}
            ellipsis={{
              rows: 3,
              expandable: true,
              symbol: 'Ver mais',
            }}
          >
            {review.comment}
          </Typography.Paragraph>
        )}

        {/* Pedido */}
        <div>
          <Typography.Text strong>Pedido</Typography.Text>

          <br />

          <Typography.Text>{orderLabel}</Typography.Text>

          <br />

          <Typography.Text type="secondary">
            #{review.scheduler.id.slice(-6).toUpperCase()} ·{' '}
            {DateUtil.format(review.scheduler.scheduledAt)}
          </Typography.Text>
        </div>

        {/* Ação */}
        <Flex justify="space-between" align="center">
          <Typography.Text>Exibir na homepage</Typography.Text>

          <Switch
            checked={review.featured}
            loading={loading}
            onChange={onToggle}
            checkedChildren={<EyeOutlined />}
            unCheckedChildren={<EyeInvisibleOutlined />}
          />
        </Flex>
      </Flex>
    </Card>
  );
}
