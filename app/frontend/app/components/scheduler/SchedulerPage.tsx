import { useEffect, useState } from 'react';
import { Button, Layout } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { GoogleCalendar } from '../icon/components/GoogleCalendar';
import Request from '~/utils/Request';
import { Gmail } from '../icon/components';
import { TabbedPage } from '../tab/TabbedPage';
import { SchedulerTab } from './SchedulerTab';
import { useQuery } from '@tanstack/react-query';

dayjs.locale('pt-br');

const { Header } = Layout;

export function SchedulerPage() {
  const [googleCalendarUrl, setGoogleCalendarUrl] = useState<string>();
  const [gmailUrl, setGmailUrl] = useState<string>();

  function openGoogleAuthPopup(url?: string) {
    const width = 500;
    const height = 600;

    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;

    const popup = window.open(
      url,
      'googleAuth',
      `width=${width},height=${height},left=${left},top=${top}`,
    );

    return popup;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fb' }}>
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
