import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import type { ReactNode } from 'react';
import StyleSheet from '~/utils/StyleSheet';

type ComponentProps = {
  children: ReactNode;
};

export function CenteredOverlay({ children }: ComponentProps) {
  return (
    <Layout style={styles.container}>
      <Content style={styles.content}>{children}</Content>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundImage: 'url(/bg_signup.png)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 'auto',
    padding: 24,
    width: '40%',
  },
});
