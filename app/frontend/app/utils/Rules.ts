import type { Rule } from 'antd/es/form';

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
}

export default new Rules();
