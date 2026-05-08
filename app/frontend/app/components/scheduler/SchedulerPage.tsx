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
  const ttl = 1000 * 60 * 60; // 1 hora
  const gmailUrlQuery = useQuery({
    queryKey: ['gmail-auth-url'],
    queryFn: () => {
      return Request.get<{ url: string }>('/gmail/auth-url').then((result) => {
        console.log('URL de autenticação do Gmail:', result.url);
        setGmailUrl(result.url);
        return result;
      });
    },
    staleTime: ttl,
  });

  const googleCalendarUrlQuery = useQuery({
    queryKey: ['google-calendar-auth-url'],
    queryFn: () =>
      Request.get<{ url: string }>('/scheduler/google-auth-url').then((result) => {
        console.log('URL de autenticação do Google Calendar:', result.url);
        setGoogleCalendarUrl(result.url);
        return result;
      }),
    staleTime: ttl,
  });

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log('Autenticado com sucesso!');
        // aqui você pode:
        // - atualizar estado
        // - buscar agenda
        // - mostrar toast
      } else if (event.data.type === 'GMAIL_AUTH_SUCCESS') {
        console.log('E-mail configurado com sucesso!');
        // aqui você pode:
        // - atualizar estado
        // - mostrar toast
      }
    }

    window.addEventListener('message', handleMessage);

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fb' }}>
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 24,
        }}
      >
        <Button
          loading={googleCalendarUrlQuery.isLoading}
          icon={<GoogleCalendar style={{ fontSize: 24, display: 'flex' }} />}
          onClick={() => openGoogleAuthPopup(googleCalendarUrl)}
        >
          Conectar agenda Google
        </Button>
        <Button
          loading={gmailUrlQuery.isLoading}
          icon={<Gmail style={{ fontSize: 24, display: 'flex' }} />}
          onClick={() => openGoogleAuthPopup(gmailUrl)}
        >
          Configurar E-mail
        </Button>
      </Header>
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
