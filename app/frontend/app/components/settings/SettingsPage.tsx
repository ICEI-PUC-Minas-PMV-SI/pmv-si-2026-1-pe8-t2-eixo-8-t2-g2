import { TabbedPage } from '../tab/TabbedPage';
import { IntegrationsTab } from './IntegrationsTab';
import { ProfileTab } from './ProfileTab';
import { AppSettingsTab } from './AppSettingsTab';
import { useAuthStore } from '~/hooks/useAuthStore';
import { Space } from 'antd';

export function SettingsPage() {
  const { isAdmin } = useAuthStore();
  const tabs = [
    {
      key: 'profile',
      label: 'Perfil e Segurança',
      children: <ProfileTab />,
    },
    {
      key: 'integrations',
      label: 'Integrações',
      onlyAdmin: true,
      children: <IntegrationsTab />,
    },
    {
      key: 'app-settings',
      label: 'Configurações da Aplicação',
      onlyAdmin: true,
      children: <AppSettingsTab />,
    },
  ];
  const filtredTabs = tabs.filter((tab) => !tab.onlyAdmin || isAdmin());
  return (
    <Space orientation="vertical" size="large" style={{ width: '100%', padding: 16 }}>
      <TabbedPage defaultTab="profile" items={filtredTabs} />
    </Space>
  );
}
