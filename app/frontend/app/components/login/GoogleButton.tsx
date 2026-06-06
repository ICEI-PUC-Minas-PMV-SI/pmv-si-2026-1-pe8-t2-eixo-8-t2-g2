import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import AuthController from '~/controllers/AuthController';
import { useNavigation } from '~/hooks/useNavigation';

export function GoogleButton() {
  const divRef = useRef<HTMLDivElement>(null);
  const { goToHome } = useNavigation();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!window.google || !divRef.current) return;
    window.google.accounts.id.initialize({
      client_id:
        '45213146734-5qcu99i8pqd5i2d58cm53e8hcto9tcl4.apps.googleusercontent.com',
      callback: (response: any) => {
        queryClient.clear();
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
