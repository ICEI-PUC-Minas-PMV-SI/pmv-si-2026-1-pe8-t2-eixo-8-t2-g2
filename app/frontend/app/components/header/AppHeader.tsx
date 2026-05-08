import { Avatar, Button, Flex, Grid, Modal, Tooltip } from 'antd';
import { Header } from 'antd/es/layout/layout';
import Text from 'antd/es/typography/Text';
import AppIcon from '../icon/AppIcon';
import { ROUTES, useNavigation } from '~/hooks/useNavigation';
import { ExclamationCircleOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';
import { useAuthStore } from '~/hooks/useAuthStore';
import { useLocation } from 'react-router-dom';

type Props = {
  onMenuClick?: () => void; // 👈 botão mobile
};

export default function AppHeader({ onMenuClick }: Props) {
  const { goToLogin, goToDashboard } = useNavigation();
  const { logout, isLogged, getUserShortname } = useAuthStore();
  const { pathname } = useLocation();
  const isMobile = !Grid.useBreakpoint().lg;
  const logoutConfirm = () => {
    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      content: 'Deseja realmente sair do sistema?',
      okButtonProps: {
        variant: 'solid',
        color: 'danger',
      },
      okText: 'Sair',
      onOk() {
        logout();
      },
    });
  };
  return (
    <Header style={{ padding: isMobile ? '0 8px' : '0 16px' }}>
      <Flex justify="space-between" align="center" style={{ height: '100%' }}>
        {/* ESQUERDA */}
        <Flex align="center" gap="small">
          {isMobile && isLogged() && (
            <Button
              variant="solid"
              color="primary"
              type="text"
              icon={<MenuOutlined />}
              onClick={onMenuClick}
            />
          )}

          {/* opcional: logo */}
          <Text style={{ color: 'white', fontWeight: 600 }}>Meu App</Text>
        </Flex>

        {/* DIREITA */}
        <Flex gap="small" align="center">
          {!isLogged() && pathname !== ROUTES.LOGIN && (
            <Button variant="solid" color="primary" onClick={goToLogin}>
              Entrar
            </Button>
          )}

          {isLogged() && (
            <>
              {/* esconder nome no mobile */}
              {!isMobile && (
                <Text style={{ color: 'white' }}>Olá, {getUserShortname()}</Text>
              )}

              {/* <Avatar
                onClick={goToDashboard}
                style={{ backgroundColor: 'grey', cursor: 'pointer' }}
                icon={<UserOutlined />}
              ></Avatar> */}

              <Tooltip title="Sair">
                <Button
                  onClick={logoutConfirm}
                  shape="square"
                  color="danger"
                  variant="solid"
                  icon={<AppIcon.Logout color="red" />}
                />
              </Tooltip>
            </>
          )}
        </Flex>
      </Flex>
    </Header>
  );
}
