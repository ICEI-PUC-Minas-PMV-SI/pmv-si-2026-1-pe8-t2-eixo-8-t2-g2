import type { MenuProps } from 'antd';
import { Menu as MenuAntd } from 'antd';
import AppIcon from '../icon/AppIcon';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '~/hooks/useAuthStore';
import { UserRole } from '~/constants/Auth';

export type MenuItem = Required<MenuProps>['items'][number];

export const iconStyle: React.CSSProperties = {
  fontSize: 18,
};

export const menu = [
  {
    key: '/app/scheduler',
    label: 'Pedidos',
    IconComponent: AppIcon.DailyCalendar,
  },
  {
    key: '/app/dashboard',
    label: 'Dashboard',
    role: UserRole.ADMIN,
    IconComponent: AppIcon.DashboardMonitor,
  },
  {
    key: '/app/product',
    label: 'Produtos',
    role: UserRole.ADMIN,
    IconComponent: AppIcon.ApplePie,
  },
  {
    key: '/app/users',
    label: 'Usuários',
    role: UserRole.ADMIN,
    IconComponent: AppIcon.UserShield,
  },
  {
    key: '/app/review',
    label: 'Avaliações',
    role: UserRole.ADMIN,
    IconComponent: AppIcon.CommentDots,
  },
  {
    key: '/app/settings',
    label: 'Configurações',
    IconComponent: AppIcon.Settings,
  },
  {
    key: '/app/about',
    label: 'Quem Somos',
    IconComponent: AppIcon.Interrogation,
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
        backgroundColor: isSelected ? '#E06D5B' : 'transparent',
        color: isSelected ? '#fff' : undefined,
        fontWeight: isSelected ? 600 : 400,
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
