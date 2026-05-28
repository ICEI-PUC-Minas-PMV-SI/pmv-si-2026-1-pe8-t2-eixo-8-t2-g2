import type { Rule } from 'antd/es/form';
import PasswordUtil from './PasswordUtil';

class Rules {
  required(): Rule {
    return { required: true, message: 'Campo obrigatório!' };
  }
  email(): Rule {
    return { type: 'email', message: 'E-mail inválido!' };
  }
  phone(): Rule {
    return {
      pattern: /^(\(?\d{2}\)?\s?)?(\d{4,5}-\d{4})$/,
      message: 'Telefone inválido!',
    };
  }
  password() {
    return {
      validator(_: any, value: string) {
        if (!value || PasswordUtil.isValid(value)) {
          return Promise.resolve();
        }

        return Promise.reject(new Error('Senha inválida'));
      },
    };
  }
}

export default new Rules();
