class PasswordUtil {
  hasMinLength(password: string) {
    return password.length >= 6;
  }

  hasUppercase(password: string) {
    return /[A-Z]/.test(password);
  }

  hasLowercase(password: string) {
    return /[a-z]/.test(password);
  }

  hasNumber(password: string) {
    return /\d/.test(password);
  }

  isValid(password: string) {
    return (
      this.hasMinLength(password) &&
      this.hasUppercase(password) &&
      this.hasLowercase(password) &&
      this.hasNumber(password)
    );
  }
}

export default new PasswordUtil();
