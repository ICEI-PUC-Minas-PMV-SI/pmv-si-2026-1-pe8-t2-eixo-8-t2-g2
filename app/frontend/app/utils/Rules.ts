import type { Rule } from 'antd/es/form';

class Rules {
  required(): Rule {
    return { required: true, message: 'Campo obrigatório!' };
  }
  email(): Rule {
    return { type: 'email', message: 'E-mail inválido!' };
  }
}

export default new Rules();
