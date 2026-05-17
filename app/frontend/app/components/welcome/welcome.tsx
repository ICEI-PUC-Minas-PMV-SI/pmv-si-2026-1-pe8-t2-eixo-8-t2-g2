import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { AppFooter } from '~/components/footer';

export function Welcome() {
  return (
    <Layout style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Content style={{ flex: 1 }}>home</Content>
      <AppFooter />
    </Layout>
  );
}
