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

    // Celular com 9 dígitos
    if (remaining.length > 8) {
      const firstPart = remaining.slice(0, 5);
      const secondPart = remaining.slice(5, 9);

      return `(${ddd}) ${firstPart}${secondPart ? `-${secondPart}` : ''}`;
    }

    // Telefone comum
    const firstPart = remaining.slice(0, 4);
    const secondPart = remaining.slice(4, 8);

    return `(${ddd}) ${firstPart}${secondPart ? `-${secondPart}` : ''}`;
  }

  unformatPhone(value: string) {
    return value.replace(/\D/g, '');
  }
}

export default new TextUtil();
