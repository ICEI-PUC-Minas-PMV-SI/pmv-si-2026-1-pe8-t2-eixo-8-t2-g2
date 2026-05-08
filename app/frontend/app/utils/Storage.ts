class Storage {
  safeJson(value: string | null) {
    if (value === null) return null;
    try {
      const json = JSON.parse(value);
      return json;
    } catch (err) {
      return null;
    }
  }
  get(key: string) {
    const value = localStorage.getItem(key);
    return this.safeJson(value) || value;
  }
  set(key: string, valueToSet: any) {
    const isObject = valueToSet === 'object';
    const value = typeof isObject ? JSON.stringify(valueToSet) : valueToSet;
    localStorage.setItem(key, value);
  }

  setToken(token: string) {
    this.set('auth', token);
  }
  getToken() {
    return this.get('auth');
  }
}

export default new Storage();
