import type { MenuProps } from 'antd';
import { Menu as MenuAntd } from 'antd';
import AppIcon from '../icon/AppIcon';
import { useLocation, useNavigate } from 'react-router-dom';

type MenuItem = Required<MenuProps>['items'][number];

const iconStyle: React.CSSProperties = {
  fontSize: 18,
  // paddingLeft: 24,
};

const ExtraComponent = () => <div style={{ minWidth: 10 }}></div>;

const menu = [
  {
    key: '/dashboard',
    label: 'Dashboard',
    IconComponent: AppIcon.DashboardMonitor,
  },
  {
    key: '/scheduler',
    label: 'Pedidos',
    IconComponent: AppIcon.DailyCalendar,
  },
  {
    key: '/product',
    label: 'Produtos',
    IconComponent: AppIcon.ApplePie,
  },
  {
    key: '/settings',
    label: 'Configurações',
    IconComponent: AppIcon.Settings,
  },
  {
    key: '/about',
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

  const onClick: MenuProps['onClick'] = (e) => {
    navigate(e.key);
    onNavigate?.();
  };

  const selectedKey = location.pathname;

  const items: MenuItem[] = menu.map((item) => {
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
