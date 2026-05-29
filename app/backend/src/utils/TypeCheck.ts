class TypeCheck {
  isString(value: unknown): value is string {
    return typeof value === 'string';
  }
}

const instance = new TypeCheck();

export { instance as TypeCheck };
