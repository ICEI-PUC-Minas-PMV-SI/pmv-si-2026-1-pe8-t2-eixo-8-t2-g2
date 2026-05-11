import { Card, Tabs } from 'antd';
import { Content } from 'antd/es/layout/layout';
import type { BaseTabsProps } from 'antd/es/tabs';
import { useState } from 'react';

export type Props = {
  items: BaseTabsProps['items'];
  defaultTab: string;
  extraContent?: React.ReactNode;
};

export function TabbedPage({ items, defaultTab, extraContent }: Props) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <Content style={{ padding: 24 }}>
      <Card style={{ borderRadius: 20 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={items}
          tabBarExtraContent={extraContent}
        />
      </Card>
    </Content>
  );
}
