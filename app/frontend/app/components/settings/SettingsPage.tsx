import { TabbedPage } from '../tab/TabbedPage';
import { IntegrationsTab } from './IntegrationsTab';
import { ProfileTab } from './ProfileTab';
import { AppSettingsTab } from './AppSettingsTab';

export function SettingsPage() {
  return (
    <TabbedPage
      defaultTab="profile"
      items={[
        {
          key: 'profile',
          label: 'Perfil e Segurança',
          children: <ProfileTab />,
        },
        {
          key: 'integrations',
          label: 'Integrações',
          children: <IntegrationsTab />,
        },
        {
          key: 'app-settings',
          label: 'Configurações da Aplicação',
          children: <AppSettingsTab />,
        },
      ]}
    />
  );
}
