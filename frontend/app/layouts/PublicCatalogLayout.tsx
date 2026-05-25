import { Layout, Menu, Flex, Button, Grid } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '~/hooks/useAuthStore';
import Sider from 'antd/es/layout/Sider';
import { Header } from 'antd/es/layout/layout';
import Text from 'antd/es/typography/Text';

const { Content } = Layout;

/**
 * PublicCatalogLayout
 *
 * Layout para páginas públicas do catálogo.
 * Exibe cabeçalho com logo e botão Login + sidebar com "Produtos" e "Quem somos".
 * Fiel ao design da Figura 25.
 */
export function PublicCatalogLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isLogged } = useAuthStore();
  const isMobile = !Grid.useBreakpoint().md;

  const selectedKey = pathname.startsWith('/catalogo') ? 'catalogo' : 'quem-somos';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <Header
        style={{
          background: '#fff',
          borderBottom: '1px solid #f0f0f0',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        }}
      >
        <Flex justify="space-between" align="center" style={{ height: '100%' }}>
          {/* Logo / Brand */}
          <Flex align="center" gap={8}>
            {/* Ícone simples de logo */}
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="13" stroke="#E06D5B" strokeWidth="2" />
              <path
                d="M8 18 Q14 8 20 18"
                stroke="#E06D5B"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M10 16 Q14 10 18 16"
                stroke="#E06D5B"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </svg>
            <Text style={{ fontWeight: 700, fontSize: 16, color: '#333' }}>
              Ateliê
            </Text>
          </Flex>

          {/* Botão de login */}
          {!isLogged() && (
            <Button
              type="primary"
              style={{ background: '#E06D5B', borderColor: '#E06D5B', fontWeight: 600 }}
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          )}
          {isLogged() && (
            <Button type="primary" onClick={() => navigate('/dashboard')}>
              Painel
            </Button>
          )}
        </Flex>
      </Header>

      <Layout>
        {/* ─── Sidebar ─────────────────────────────────────────────────── */}
        {!isMobile && (
          <Sider
            width={160}
            style={{
              background: '#fff',
              borderRight: '1px solid #f0f0f0',
              paddingTop: 8,
            }}
          >
            <Menu
              mode="inline"
              selectedKeys={[selectedKey]}
              style={{ border: 'none' }}
              items={[
                {
                  key: 'catalogo',
                  label: 'Produtos',
                  onClick: () => navigate('/catalogo'),
                  style: {
                    fontWeight: selectedKey === 'catalogo' ? 600 : 400,
                  },
                },
                {
                  key: 'quem-somos',
                  label: 'Quem somos',
                  onClick: () => navigate('/quem-somos'),
                },
              ]}
            />
          </Sider>
        )}

        {/* ─── Content ─────────────────────────────────────────────────── */}
        <Layout style={{ background: '#fff' }}>
          <Content>
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}