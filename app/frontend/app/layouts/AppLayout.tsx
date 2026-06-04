import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import { AppFooter } from '~/components/footer';
import AppHeader from '~/components/header/AppHeader';

export function AppLayout() {
  const { pathname } = useLocation();
  return (
    <Layout style={{ height: '100vh' }}>
      <AppHeader />
      <Layout.Content style={{ flex: 1, display: 'flex' }}>
        <Outlet />
      </Layout.Content>
      {!['/'].includes(pathname) && <AppFooter useFullFooter={false} />}
    </Layout>
  );
}
