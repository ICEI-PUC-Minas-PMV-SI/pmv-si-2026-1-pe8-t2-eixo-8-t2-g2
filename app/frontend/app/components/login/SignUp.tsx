import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { CreateUserForm } from '../user/CreateUserForm';
import Title from 'antd/es/typography/Title';

export function SignUp() {
  return (
    <Layout
      style={{
        backgroundImage: 'url(/bg_signup.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Content
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'auto',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 8,
          maxWidth: 'max(60%, 700px)',
          width: '100%',
          paddingLeft: 16,
          paddingRight: 16,
          marginTop: 12,
          marginBottom: 12,
        }}
      >
        <CreateUserForm />
      </Content>
    </Layout>
  );
}
