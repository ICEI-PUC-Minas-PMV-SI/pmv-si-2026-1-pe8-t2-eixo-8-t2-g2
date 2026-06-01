import { Grid, Layout } from 'antd';

import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import { useLocation } from 'react-router-dom';
import LoginForm from '~/components/login/LoginForm';
import { Login2FA } from './Login2FA';
import { useAuthStore } from '~/hooks/useAuthStore';
import { Navigate } from 'react-router-dom';

export function WaveSvg() {
  return (
    <svg
      className="wave-svg"
      style={{
        position: 'absolute',
        width: 'min(45%, 860px)',
        height: '100%',
        right: 0,
        pointerEvents: 'none',
      }}
      viewBox="0 0 672 720"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="
M0 720L19.9441 689.917C39.7611 659.833 79.6492 599.667 101.626 539.5C123.602 479.333 127.921 419.167 117.124 359C106.326 298.833 80.4113 238.667 81.0465 178.5C81.6816 118.333 108.867 58.1667 122.332 28.0833L135.924 -2H672V28.0833C672 58.1667 672 118.333 672 178.5C672 238.667 672 298.833 672 359C672 419.167 672 479.333 672 539.5C672 599.667 672 659.833 672 689.917V720H0Z
      "
        fill="#f0ece6"
      ></path>
    </svg>
  );
}

export function LoginPage() {
  const { lg } = Grid.useBreakpoint();
  const { state } = useLocation();
  const { isLogged } = useAuthStore();
  if (isLogged()) {
    return <Navigate to="/" replace />;
  }
  return (
    <Layout
      style={{
        position: 'relative',
      }}
    >
      <Sider
        width={'68%'}
        hidden={!lg}
        style={{
          backgroundImage: 'url(/bg_login.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></Sider>
      {lg && <WaveSvg />}
      <Content style={{ position: 'relative' }}>
        {state?.required2FA && <Login2FA email={state?.email}></Login2FA>}
        {!state?.required2FA && <LoginForm />}
      </Content>
    </Layout>
  );
}
