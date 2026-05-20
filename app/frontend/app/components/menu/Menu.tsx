import type { MenuProps } from 'antd';
import { Menu as MenuAntd } from 'antd';
import AppIcon from '../icon/AppIcon';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '~/hooks/useAuthStore';
import { UserRole } from '~/constants/Auth';

type MenuItem = Required<MenuProps>['items'][number];

const iconStyle: React.CSSProperties = {
  fontSize: 18,
  // paddingLeft: 24,
};

const menu = [
  {
    key: '/scheduler',
    label: 'Pedidos',
    IconComponent: AppIcon.DailyCalendar,
  },
  {
    key: '/dashboard',
    label: 'Dashboard',
    role: UserRole.ADMIN,
    IconComponent: AppIcon.DashboardMonitor,
  },
  {
    key: '/product',
    label: 'Produtos',
    role: UserRole.ADMIN,
    IconComponent: AppIcon.ApplePie,
  },
  {
    key: '/settings',
    label: 'Configurações',
    IconComponent: AppIcon.Settings,
  },
];

type Props = {
  onNavigate?: () => void;
};

export default function Menu({ onNavigate }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuthStore();

  const onClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    onNavigate?.();
  };

  const selectedKey = location.pathname;
  const filtredMenu = isAdmin()
    ? menu
    : menu.filter((currentMenu) => {
        return !currentMenu.role;
      });
  const items: MenuItem[] = filtredMenu.map((item) => {
    const { key, label, IconComponent } = item;
    const isSelected = selectedKey === key;

    return {
      key,
      label,
      icon: <IconComponent style={iconStyle} />,
      style: {
        display: 'flex',
        // alignItems: 'center',
        // borderRadius: 0,
        // margin: 0,
        // paddingLeft: isSelected ? 'calc(16px - 3px)' : '16px',
        backgroundColor: isSelected ? '#E06D5B' : 'transparent',
        color: isSelected ? '#fff' : undefined,
        fontWeight: isSelected ? 600 : 400,
        // transition: 'all 0.2s ease',
      },
    };
  });

  return (
    <MenuAntd
      onClick={onClick}
      selectedKeys={[selectedKey]}
      mode="vertical"
      items={items}
      style={{ border: 'none' }}
      theme="light"
    />
  );
}
