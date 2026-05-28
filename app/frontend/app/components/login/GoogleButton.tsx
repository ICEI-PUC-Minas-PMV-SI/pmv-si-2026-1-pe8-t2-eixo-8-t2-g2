import { useEffect, useRef } from 'react';
import AuthController from '~/controllers/AuthController';
import { useNavigation } from '~/hooks/useNavigation';

export function GoogleButton() {
  const divRef = useRef<HTMLDivElement>(null);
  const { goToHome } = useNavigation();
  useEffect(() => {
    if (!window.google || !divRef.current) return;

    window.google.accounts.id.initialize({
      client_id:
        '389422613020-vvv3g8sob8loefqovjg5vcb0kpnp0r2o.apps.googleusercontent.com',
      callback: (response: any) => {
        AuthController.authGoogle({ token: response.credential }).then(goToHome);
      },
      autoselect: true,
    });

    window.google.accounts.id.prompt();

    window.google.accounts.id.renderButton(divRef.current, {
      type: 'standard',
      shape: 'pill',
      theme: 'outline',
      text: 'signin_with',
      size: 'large',
      logo_alignment: 'left',
    });
  }, []);

  return (
    <div
      ref={divRef}
      style={{
        borderRadius: '999px',
        overflow: 'hidden',
      }}
    />
  );
}
