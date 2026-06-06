import { Layout } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { TabbedPage } from '../tab/TabbedPage';
import { SchedulerTab } from './SchedulerTab';
import { useReviewPrompt } from '~/hooks/useReviewPrompt';
import { ReviewModal } from '../review/ReviewModal';

dayjs.locale('pt-br');

export function SchedulerPage() {
  const { pendingReview, schedulersPendingReview, clearPendingReview } =
    useReviewPrompt();

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: '#f5f7fb',
        padding: 'clamp(8px, 3vw, 24px)',
      }}
    >
      <ReviewModal
        mode="list"
        open={pendingReview}
        schedulers={schedulersPendingReview}
        onClose={clearPendingReview}
        onSubmitReview={async () => {}}
        onIgnore={async () => {}}
      />
      <TabbedPage
        defaultTab="schedules"
        items={[
          {
            key: 'schedules',
            label: 'Pedidos',
            children: <SchedulerTab />,
          },
        ]}
      />
    </Layout>
  );
}
