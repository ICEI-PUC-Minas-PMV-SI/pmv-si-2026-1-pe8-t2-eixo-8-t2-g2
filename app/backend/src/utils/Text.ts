import { createHash } from 'node:crypto';

class Text {
  generateSlug(text: string) {
    return text
      .toLowerCase()
      .normalize('NFD') // separa acentos
      .replace(/[\u0300-\u036f]/g, '') // remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // espaço vira hífen
      .replace(/-+/g, '-'); // remove hífens duplicados
  }
  anonymizeCustomerTag(customerId: string) {
    return createHash('sha256')
      .update(customerId)
      .digest('hex')
      .slice(0, 8)
      .toUpperCase(); // ex: "A3F9C21B"
  }
}

const instance = new Text();
export { instance as Text };
