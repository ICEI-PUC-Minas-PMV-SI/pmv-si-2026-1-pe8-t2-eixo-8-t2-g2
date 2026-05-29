import {
  Avatar,
  Button,
  Drawer,
  Flex,
  Grid,
  Layout,
  Menu,
  Modal,
  Space,
  Tooltip,
} from 'antd';
import Text from 'antd/es/typography/Text';
import Title from 'antd/es/typography/Title';

import {
  ExclamationCircleOutlined,
  HomeOutlined,
  InfoCircleOutlined,
  LoginOutlined,
  MenuOutlined,
  PhoneOutlined,
  ShoppingCartOutlined,
  UserOutlined,
} from '@ant-design/icons';

import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useQueryClient } from '@tanstack/react-query';

import AppIcon from '../icon/AppIcon';

import { ROUTES, useNavigation } from '~/hooks/useNavigation';
import { useAuthStore } from '~/hooks/useAuthStore';
import { useCartStore } from '~/hooks/useCartStore';

import { CartPreview } from '../cart/CartPreview';

const { Header } = Layout;

type Props = {
  onMenuClick?: () => void;
};

export default function AppHeader({ onMenuClick }: Props) {
  const { goToLogin, goTo: navigate } = useNavigation();

  const { logout, isLogged, getUserShortname } = useAuthStore();

  const { pathname } = useLocation();

  const isMobile = !Grid.useBreakpoint().lg;

  const queryClient = useQueryClient();

  const { clearCart } = useCartStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutConfirm = () => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: 'Deseja realmente sair do sistema?',
      okButtonProps: {
        danger: true,
      },
      okText: 'Sair',
      cancelText: 'Cancelar',
      onOk() {
        queryClient.clear();
        clearCart();
        logout();
        localStorage.clear();
      },
    });
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Página Inicial',
    },
    {
      key: '/quem-somos',
      icon: <InfoCircleOutlined />,
      label: 'Quem Somos',
    },
    {
      key: '/contato',
      icon: <PhoneOutlined />,
      label: 'Contato',
    },
  ];

  return (
    <>
      <Header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          padding: isMobile ? '0 12px' : '0 24px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #f0f0f0',
        }}
      >
        <Flex justify="space-between" align="center" style={{ height: '100%' }}>
          {/* ESQUERDA */}
          <Flex align="center" gap="middle">
            {isMobile && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuOpen(true)}
              />
            )}

            {/* LOGO */}
            <Flex
              align="center"
              gap="small"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <div>
                {/* <Title
                  level={1}
                  style={{
                    margin: 0,
                    lineHeight: 1.1,
                  }}
                >
                  Doce & Cia
                </Title> */}

                {!isMobile && <Text style={{ fontSize: 12 }}>Doce & Cia</Text>}
              </div>
            </Flex>

            {/* MENU DESKTOP */}
            {!isMobile && (
              <Menu
                mode="horizontal"
                selectedKeys={[pathname]}
                items={menuItems}
                style={{
                  borderBottom: 'none',
                  minWidth: 420,
                  marginLeft: 24,
                  background: 'transparent',
                }}
                onClick={({ key }) => navigate(key as any)}
              />
            )}
          </Flex>

          {/* DIREITA */}
          <Flex align="center" gap="middle">
            <CartPreview />

            {!isLogged() ? (
              pathname !== ROUTES.LOGIN && (
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  onClick={() => goToLogin()}
                >
                  Entrar
                </Button>
              )
            ) : (
              <Space>
                {!isMobile && (
                  <Flex align="center" gap="small">
                    <Avatar
                      style={{
                        backgroundColor: '#fde3cf',
                        color: '#d46b08',
                      }}
                      icon={<UserOutlined />}
                    />

                    <Text>
                      Olá, <strong>{getUserShortname()}</strong>
                    </Text>
                  </Flex>
                )}

                <Tooltip title="Sair">
                  <Button
                    danger
                    type="primary"
                    icon={<AppIcon.Logout color="white" />}
                    onClick={logoutConfirm}
                  />
                </Tooltip>
              </Space>
            )}
          </Flex>
        </Flex>
      </Header>

      {/* MENU MOBILE */}
      <Drawer
        title="Menu"
        placement="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
          onClick={({ key }) => {
            navigate(key as any);
            setMobileMenuOpen(false);
          }}
        />
      </Drawer>
    </>
  );
}
