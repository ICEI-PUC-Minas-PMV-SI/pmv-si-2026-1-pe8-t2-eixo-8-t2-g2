class TextUtil {
  createSlug(value: string) {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  formatPhone(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    if (digits.length <= 2) {
      return digits;
    }

    const ddd = digits.slice(0, 2);
    const remaining = digits.slice(2);

    if (remaining.length > 8) {
      const firstPart = remaining.slice(0, 5);
      const secondPart = remaining.slice(5, 9);

      return `(${ddd}) ${firstPart}${secondPart ? `-${secondPart}` : ''}`;
    }

    const firstPart = remaining.slice(0, 4);
    const secondPart = remaining.slice(4, 8);

    return `(${ddd}) ${firstPart}${secondPart ? `-${secondPart}` : ''}`;
  }

  unformatPhone(value: string) {
    return value.replace(/\D/g, '');
  }

  formatPostalCode(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8);

    if (digits.length <= 5) {
      return digits;
    }

    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }

  unformatPostalCode(value: string) {
    return value.replace(/\D/g, '');
  }

  whatsappLink(
    phone?: string,
    msg = 'Olá! Vim pelo site e gostaria de fazer um pedido.',
  ) {
    if (!phone) return '#';
    return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  }

  parseInstagram(value?: string): { handle: string; url: string } | undefined {
    if (!value) return undefined;
  
    const handle = value.startsWith('http')
      ? '@' + value.split('/').filter(Boolean).pop()!
      : value.startsWith('@') ? value : '@' + value;
  
    const username = handle.replace('@', '');
    const url = `https://www.instagram.com/${username}`;
  
    return { handle, url };
  }
}

export default new TextUtil();
