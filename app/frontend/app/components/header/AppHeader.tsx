import { Button, Flex, Space, Typography, Avatar, Dropdown } from 'antd';

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ROUTES, useNavigation } from '~/hooks/useNavigation';
import { useAuthStore } from '~/hooks/useAuthStore';

import { CartPreview } from '../cart/CartPreview';

import {
  LogoutOutlined,
  SettingOutlined,
  ShoppingOutlined,
  UserOutlined,
} from '@ant-design/icons';

type AppSettings = {
  siteName?: string;
  logoUrl?: string;
  whatsapp?: string;
  contactEmail?: string;
  serviceHours?: string;
  address?: string;
  instagram?: string;
  primaryColor?: string;
};

const DEFAULT: { settings: AppSettings } = {
  settings: {
    siteName: 'Doce & Cia',
    whatsapp: '5531999999999',
    contactEmail: 'contato@doceatelier.com.br',
    serviceHours: 'Seg–Sex 8h–18h · Sáb 8h–14h',
    address: 'Belo Horizonte, MG',
    instagram: 'doceatelier',
  },
};
type HeaderProps = { settings?: AppSettings };
export default function AppHeader(props: HeaderProps = DEFAULT) {
  const { settings = DEFAULT.settings } = props;
  const [scrolled, setScrolled] = useState(false);
  const { isLogged, logout, user } = useAuthStore();
  const { pathname } = useLocation();
  const { goToLogin, goToSchedulers, goToSettings } = useNavigation();
  const menuItems = [
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: 'Meus pedidos',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      danger: true,
      label: 'Sair',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'orders':
        goToSchedulers();
        break;

      case 'settings':
        goToSettings();
        break;

      case 'logout':
        logout();
        // goToLogin();
        break;
    }
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.96)' : '#fff',
        borderBottom: '1px solid #F0E8E5',
        padding: '0 24px',
        backdropFilter: 'blur(8px)',
        transition: 'box-shadow 0.2s',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography.Title
          level={4}
          style={{ margin: 0, color: '#E06D5B', fontSize: 20, fontWeight: 700 }}
        >
          {settings.siteName ?? 'Confeitaria'}
        </Typography.Title>
        <nav>
          <Space size={0}>
            {['/'].includes(pathname) &&
              [
                { label: 'Cardápio', href: '#catalogo' },
                { label: 'Sobre', href: '#sobre' },
                { label: 'Contato', href: '#contato' },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '0 16px',
                    color: '#444',
                    fontSize: 14,
                    fontWeight: 500,
                    textDecoration: 'none',
                    display: 'inline-block',
                    lineHeight: '64px',
                    transition: 'color 0.15s',
                  }}
                >
                  {item.label}
                </a>
              ))}
            <Flex align="center" gap={12}>
              <CartPreview />

              {!isLogged() && pathname !== ROUTES.LOGIN && (
                <Button variant="solid" color="primary" onClick={() => goToLogin()}>
                  Entrar
                </Button>
              )}

              {isLogged() && (
                <Dropdown
                  menu={{
                    items: menuItems,
                    onClick: handleMenuClick,
                  }}
                  trigger={['click']}
                  placement="bottomRight"
                >
                  <Flex
                    align="center"
                    gap={8}
                    style={{
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: 8,
                    }}
                  >
                    <Avatar
                      style={{
                        backgroundColor: '#E06D5B',
                      }}
                    >
                      {user?.name
                        ?.split(' ')
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </Avatar>

                    <Typography.Text
                      strong
                      style={{
                        maxWidth: 140,
                      }}
                      ellipsis
                    >
                      {user?.name}
                    </Typography.Text>
                  </Flex>
                </Dropdown>
              )}
            </Flex>
          </Space>
        </nav>
      </div>
    </header>
  );
}

// export default function AppHeader({ onMenuClick }: Props) {
//   const { goToLogin, goTo: navigate } = useNavigation();

//   const { logout, isLogged, getUserShortname } = useAuthStore();

//   const { pathname } = useLocation();

//   const isMobile = !Grid.useBreakpoint().lg;

//   const queryClient = useQueryClient();

//   const { clearCart } = useCartStore();

//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const logoutConfirm = () => {
//     Modal.confirm({
//       icon: <ExclamationCircleOutlined />,
//       content: 'Deseja realmente sair do sistema?',
//       okButtonProps: {
//         danger: true,
//       },
//       okText: 'Sair',
//       cancelText: 'Cancelar',
//       onOk() {
//         queryClient.clear();
//         clearCart();
//         logout();
//         localStorage.clear();
//       },
//     });
//   };

//   const menuItems = [
//     {
//       key: '/',
//       icon: <HomeOutlined />,
//       label: 'Página Inicial',
//     },
//     {
//       key: '/quem-somos',
//       icon: <InfoCircleOutlined />,
//       label: 'Quem Somos',
//     },
//     {
//       key: '/contato',
//       icon: <PhoneOutlined />,
//       label: 'Contato',
//     },
//   ];

//   return (
//     <>
//       <Header
//         style={{
//           position: 'sticky',
//           top: 0,
//           zIndex: 1000,
//           padding: isMobile ? '0 12px' : '0 24px',
//           background: 'rgba(255,255,255,0.92)',
//           backdropFilter: 'blur(10px)',
//           borderBottom: '1px solid #f0f0f0',
//         }}
//       >
//         <Flex justify="space-between" align="center" style={{ height: '100%' }}>
//           {/* ESQUERDA */}
//           <Flex align="center" gap="middle">
//             {isMobile && (
//               <Button
//                 type="text"
//                 icon={<MenuOutlined />}
//                 onClick={() => setMobileMenuOpen(true)}
//               />
//             )}

//             {/* LOGO */}
//             <Flex
//               align="center"
//               gap="small"
//               style={{ cursor: 'pointer' }}
//               onClick={() => navigate('/')}
//             >
//               <div>
//                 {/* <Title
//                   level={1}
//                   style={{
//                     margin: 0,
//                     lineHeight: 1.1,
//                   }}
//                 >
//                   Doce & Cia
//                 </Title> */}

//                 {!isMobile && <Text style={{ fontSize: 12 }}>Doce & Cia</Text>}
//               </div>
//             </Flex>

//             {/* MENU DESKTOP */}
//             {!isMobile && (
//               <Menu
//                 mode="horizontal"
//                 selectedKeys={[pathname]}
//                 items={menuItems}
//                 style={{
//                   borderBottom: 'none',
//                   minWidth: 420,
//                   marginLeft: 24,
//                   background: 'transparent',
//                 }}
//                 onClick={({ key }) => navigate(key as any)}
//               />
//             )}
//           </Flex>

//           {/* DIREITA */}
//           <Flex align="center" gap="middle">
//             <CartPreview />

//             {!isLogged() ? (
//               pathname !== ROUTES.LOGIN && (
//                 <Button
//                   type="primary"
//                   icon={<LoginOutlined />}
//                   onClick={() => goToLogin()}
//                 >
//                   Entrar
//                 </Button>
//               )
//             ) : (
//               <Space>
//                 {!isMobile && (
//                   <Flex align="center" gap="small">
//                     <Avatar
//                       style={{
//                         backgroundColor: '#fde3cf',
//                         color: '#d46b08',
//                       }}
//                       icon={<UserOutlined />}
//                     />

//                     <Text>
//                       Olá, <strong>{getUserShortname()}</strong>
//                     </Text>
//                   </Flex>
//                 )}

//                 <Tooltip title="Sair">
//                   <Button
//                     danger
//                     type="primary"
//                     icon={<AppIcon.Logout color="white" />}
//                     onClick={logoutConfirm}
//                   />
//                 </Tooltip>
//               </Space>
//             )}
//           </Flex>
//         </Flex>
//       </Header>

//       {/* MENU MOBILE */}
//       <Drawer
//         title="Menu"
//         placement="left"
//         open={mobileMenuOpen}
//         onClose={() => setMobileMenuOpen(false)}
//       >
//         <Menu
//           mode="inline"
//           selectedKeys={[pathname]}
//           items={menuItems}
//           onClick={({ key }) => {
//             navigate(key as any);
//             setMobileMenuOpen(false);
//           }}
//         />
//       </Drawer>
//     </>
//   );
// }
