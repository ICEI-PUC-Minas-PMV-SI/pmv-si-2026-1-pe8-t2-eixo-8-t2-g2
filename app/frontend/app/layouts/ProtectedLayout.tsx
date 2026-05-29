import { Drawer, Grid, Layout } from 'antd';
import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AppHeader from '~/components/header/AppHeader';
import Menu from '~/components/menu/Menu';
import { useAuthStore } from '~/hooks/useAuthStore';
import { ROUTES } from '~/hooks/useNavigation';

export function ProtectedLayout() {
  const user = useAuthStore((state) => state.user);
  const isMobile = !Grid.useBreakpoint().lg;
  const [open, setOpen] = useState(false);
  if (!user || !user.role) {
    return <Navigate to={ROUTES.HOME} />;
  }

  return (
    <Layout style={{ height: '100vh' }}>
      <AppHeader onMenuClick={() => setOpen(true)} />

      <Layout>
        {/* Desktop */}
        {!isMobile && (
          <Layout.Sider style={{ backgroundColor: 'white' }}>
            <Menu />
          </Layout.Sider>
        )}

        {/* Conteúdo */}
        <Layout.Content style={{ padding: 16, overflowY: 'scroll' }}>
          <Outlet />
        </Layout.Content>
      </Layout>

      {/* Mobile Drawer */}
      {isMobile && (
        <Drawer
          placement="left"
          open={open}
          onClose={() => setOpen(false)}
          styles={{ body: { padding: 0 } }}
        >
          <Menu onNavigate={() => setOpen(false)} />
        </Drawer>
      )}
    </Layout>
  );
}
