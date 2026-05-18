import { Layout } from 'antd';
import { Content } from 'antd/es/layout/layout';
import { CreateUserForm } from '../user/CreateUserForm';

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
          width: '40%',
          padding: 24,
          marginTop: 36,
          marginBottom: 36,
        }}
      >
        <CreateUserForm />
      </Content>
    </Layout>
  );
}
