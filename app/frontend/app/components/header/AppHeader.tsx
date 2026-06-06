import {
  Button,
  Flex,
  Space,
  Typography,
  Avatar,
  Dropdown,
  Drawer,
  Menu,
  Grid,
} from 'antd';

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ROUTES, useNavigation } from '~/hooks/useNavigation';
import { useAuthStore } from '~/hooks/useAuthStore';

import { CartPreview } from '../cart/CartPreview';

import {
  LogoutOutlined,
  SettingOutlined,
  ShoppingOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { iconStyle, menu, type MenuItem } from '../menu/Menu';
import { UserSession } from '~/utils/UserSession';
import { AppSettingsController } from '~/controllers/AppSettingsController';
import type { AppSettingsPayload } from '~/@types/app-settings';
import { useQuery } from '@tanstack/react-query';

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

type HeaderProps = { settings?: AppSettings };
export default function AppHeader(props: HeaderProps) {
  const settingsQuery = useQuery<AppSettingsPayload>({
    queryKey: ['app-settings'],
    queryFn: () => AppSettingsController.findInfo(),
    staleTime: 1000 * 60 * 5,
  });
  const { settings } = props;
  const [scrolled, setScrolled] = useState(false);
  const { isLogged, user, isAdmin } = useAuthStore();
  const { pathname } = useLocation();
  const selectedKey = location.pathname;
  const [mobileMenuIsOpen, setMobileMenuIsOpen] = useState(false);
  const isMobile = !Grid.useBreakpoint().lg;
  const { goToLogin, goToSchedulers, goToSettings, goToHome, goTo } = useNavigation();
  const filtredMenu = isAdmin()
    ? menu
    : menu.filter((currentMenu) => {
        return !currentMenu.role;
      });
  const sidebarMenu: MenuItem[] = isLogged()
    ? filtredMenu.map((item) => {
        const { key, label, IconComponent } = item;
        const isSelected = selectedKey === key;

        return {
          key,
          label,
          icon: <IconComponent style={iconStyle} />,
          style: {
            display: 'flex',
            backgroundColor: isSelected ? '#E06D5B' : 'transparent',
            color: isSelected ? '#fff' : undefined,
            fontWeight: isSelected ? 600 : 400,
          },
        };
      })
    : [];
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
        UserSession.clear();
        goToHome();
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
        padding: isMobile ? '0 12px' : '0 24px',
        backdropFilter: 'blur(8px)',
        transition: 'box-shadow 0.2s',
        justifyContent: 'space-between',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
      }}
    >
      <div
        style={{
          maxWidth: isMobile ? 1100 : 'unset',
          margin: isMobile ? '0 auto' : 'unset',
          height: isMobile ? 56 : 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {isMobile && isLogged() && (
          <Button
            size="large"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuIsOpen(true)}
          />
        )}
        <Typography.Text
          strong
          ellipsis
          style={{
            color: '#E06D5B',
            fontSize: isMobile ? 16 : 20,
            maxWidth: isMobile ? 140 : 250,
            cursor: 'pointer',
          }}
          onClick={goToHome}
        >
          {settingsQuery.data?.siteName ?? settings?.siteName ?? ''}
        </Typography.Text>
        <nav>
          <Space size={0}>
            {['/'].includes(pathname) &&
              !isMobile &&
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
                    {!isMobile && (
                      <Typography.Text
                        strong
                        style={{
                          maxWidth: 140,
                        }}
                        ellipsis
                      >
                        {user?.name}
                      </Typography.Text>
                    )}
                  </Flex>
                </Dropdown>
              )}
            </Flex>
          </Space>
        </nav>
      </div>
      <Drawer
        title="Menu"
        placement="left"
        open={mobileMenuIsOpen}
        onClose={() => setMobileMenuIsOpen(false)}
      >
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={sidebarMenu}
          onClick={({ key }) => {
            goTo(key as any);
            setMobileMenuIsOpen(false);
          }}
        />
      </Drawer>
    </header>
  );
}
