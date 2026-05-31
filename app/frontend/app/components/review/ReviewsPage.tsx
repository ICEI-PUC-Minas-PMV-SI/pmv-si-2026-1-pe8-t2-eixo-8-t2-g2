import { Space } from 'antd';
import { TabbedPage } from '../tab/TabbedPage';
import { ReviewTab } from './ReviewTab';

// ─── ReviewsPage ──────────────────────────────────────────────────────────────

export function ReviewsPage() {
  const tabs = [
    {
      key: 'review',
      label: 'Avaliações dos Clientes',
      children: <ReviewTab />,
    },
  ];

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%', padding: 16 }}>
      <TabbedPage defaultTab="review" items={tabs} />
    </Space>
  );
}
