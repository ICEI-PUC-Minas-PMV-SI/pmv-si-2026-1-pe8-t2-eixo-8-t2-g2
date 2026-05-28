import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import { AppFooter } from '~/components/footer';
import AppHeader from '~/components/header/AppHeader';

export function AppLayout() {
  return (
    <Layout style={{ height: '100vh' }}>
      <AppHeader />

      <Layout.Content style={{ flex: 1, display: 'flex' }}>
        <Outlet />
      </Layout.Content>
      <AppFooter useFullFooter={true} />
    </Layout>
  );
}
