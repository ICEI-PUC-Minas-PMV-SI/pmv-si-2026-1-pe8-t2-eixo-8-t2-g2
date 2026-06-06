import {
  Card,
  Table,
  Rate,
  Switch,
  Tag,
  Typography,
  Flex,
  Input,
  Avatar,
  Tooltip,
  message,
  Pagination,
} from 'antd';
import {
  EyeOutlined,
  EyeInvisibleOutlined,
  SearchOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ColumnsType } from 'antd/es/table';
import DateUtil from '~/utils/DateUtil';
import ReviewController, { type ReviewRecord } from '~/controllers/ReviewController';
import { RATING_COLOR } from '~/constants/Colors';
import { SummaryCards } from './SummaryCards';
import { ReviewCard } from './ReviewCard';
import { useBreakpoint } from '~/hooks/useBreakpoint';
import { useTableQuery } from '~/hooks/useTableQuery';

export function ReviewTab() {
  const queryClient = useQueryClient();
  const isMobile = useBreakpoint('md');

  const { tableProps, setPage, setSearch, params } = useTableQuery<ReviewRecord>(
    'admin-reviews',
    (params) => ReviewController.list<ReviewRecord>(params),
  );

  const toggleFeatured = useMutation({
    mutationFn: ({ id, featured }: { id: string; featured: boolean }) =>
      ReviewController.setFeatured(id, featured),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    },
    onError: () => message.error('Erro ao atualizar destaque.'),
  });

  // const filtered = reviews.filter((r) => {
  //   const q = search.toLowerCase();
  //   return (
  //     !q ||
  //     r.customer.name.toLowerCase().includes(q) ||
  //     r.comment?.toLowerCase().includes(q) ||
  //     r.scheduler.items.some((i) => i.product.name.toLowerCase().includes(q))
  //   );
  // });

  const columns: ColumnsType<ReviewRecord> = [
    {
      title: 'Cliente',
      key: 'customer',
      width: 180,
      render: (_, r) => (
        <Flex align="center" gap={10}>
          <Avatar
            size={34}
            style={{
              background: '#E06D5B',
              fontSize: 13,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {r.customer.name.charAt(0).toUpperCase()}
          </Avatar>
          <div>
            <Typography.Text strong style={{ fontSize: 13, display: 'block' }}>
              {r.customer.name}
            </Typography.Text>
            <Typography.Text style={{ fontSize: 11, color: '#8C8C8C' }}>
              {DateUtil.format(r.createdAt)}
            </Typography.Text>
          </div>
        </Flex>
      ),
    },
    {
      title: 'Avaliação',
      key: 'rating',
      width: 190,
      sorter: (a, b) => a.rating - b.rating,
      render: (_, r) => (
        <Flex vertical gap={4}>
          <Flex align="center" gap={8}>
            <Rate disabled value={r.rating} style={{ fontSize: 14 }} />
            <Tag
              style={{
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 600,
                color: RATING_COLOR[r.rating],
                borderColor: `${RATING_COLOR[r.rating]}40`,
                background: `${RATING_COLOR[r.rating]}12`,
                margin: 0,
              }}
            >
              {ReviewController.ratingLabel(r.rating)}
            </Tag>
          </Flex>
          {r.comment && (
            <Typography.Paragraph
              ellipsis={{
                rows: 2,
                expandable: true,
                symbol: 'Ver mais',
              }}
            >
              {r.comment}
            </Typography.Paragraph>
          )}
        </Flex>
      ),
    },
    {
      title: 'Pedido',
      key: 'order',
      render: (_, r) => {
        const items = r.scheduler.items;
        const label = items[0]
          ? `${items[0].quantity}× ${items[0].product.name}${items.length > 1 ? ` +${items.length - 1}` : ''}`
          : '—';
        return (
          <Flex vertical gap={2}>
            <Typography.Text style={{ fontSize: 13 }}>{label}</Typography.Text>
            <Typography.Text style={{ fontSize: 11, color: '#8C8C8C' }}>
              #{r.scheduler.id.slice(-6).toUpperCase()} ·{' '}
              {DateUtil.format(r.scheduler.scheduledAt)}
            </Typography.Text>
          </Flex>
        );
      },
    },
    {
      title: (
        <Flex align="center" gap={6}>
          <HomeOutlined style={{ color: '#E06D5B' }} />
          <span>Homepage</span>
        </Flex>
      ),
      key: 'featured',
      width: 110,
      align: 'center',
      render: (_, r) => (
        <Tooltip title={r.featured ? 'Remover da homepage' : 'Exibir na homepage'}>
          <Switch
            checked={r.featured}
            loading={toggleFeatured.isPending}
            onChange={(checked) => toggleFeatured.mutate({ id: r.id, featured: checked })}
            checkedChildren={<EyeOutlined />}
            unCheckedChildren={<EyeInvisibleOutlined />}
            style={r.featured ? { background: '#E06D5B' } : undefined}
          />
        </Tooltip>
      ),
    },
  ];
  return (
    <Flex vertical style={{ padding: '24px 0' }}>
      {/* Cards de resumo */}
      <SummaryCards reviews={tableProps.dataSource || []} />

      {/* Tabela */}
      <Card
        style={{ borderRadius: 12, border: '1px solid #F0E8E5' }}
        styles={{
          header: { borderBottom: '1px solid #F5F5F5', padding: '12px 16px' },
          body: { padding: 0 },
        }}
        title={
          <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
            <Typography.Text strong style={{ fontSize: 13 }}>
              Todas as avaliações
            </Typography.Text>
            <Input
              placeholder="Buscar por cliente, comentário ou produto..."
              prefix={<SearchOutlined style={{ color: '#8C8C8C' }} />}
              value={params.search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{ width: '100%', maxWidth: 320 }}
            />
          </Flex>
        }
      >
        {/* <Segmented
          // value={filter}
          // onChange={setFilter}
          options={[
            { label: 'Todas', value: 'all' },
            { label: '⭐ 5 estrelas', value: '5' },
            { label: 'Homepage', value: 'featured' },
            { label: 'Com comentário', value: 'comment' },
          ]}
        /> */}
        {isMobile ? (
          <Flex vertical gap={12} style={{ padding: 16 }}>
            {tableProps.dataSource?.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                loading={toggleFeatured.isPending}
                onToggle={(checked) =>
                  toggleFeatured.mutate({
                    id: review.id,
                    featured: checked,
                  })
                }
              />
            ))}
            {tableProps.pagination && (
              <Flex justify="center" style={{ paddingTop: 8 }}>
                <Pagination
                  {...tableProps.pagination}
                  simple
                  size="small"
                  onChange={setPage}
                />
              </Flex>
            )}
          </Flex>
        ) : (
          <Table<ReviewRecord>
            {...tableProps}
            // rowKey="id"
            // loading={isLoading}
            // dataSource={filtered}
            columns={columns}
            // pagination={{ pageSize: 10, showSizeChanger: false }}
            size="middle"
            // rowClassName={(r) => (r.featured ? 'review-row-featured' : '')}
            // style={{ '--featured-bg': '#FFFBF9' } as React.CSSProperties}
          />
        )}
      </Card>

      {/* Estilo inline para linha destacada */}
      <style>{`
        .review-row-featured > td {
          background: #FFFBF9 !important;
          border-left: 3px solid #E06D5B;
        }
      `}</style>
    </Flex>
  );
}
