class RegexPattern {
  static time = /^([0-9]{2}):([0-9]{2})$/;

  isValidTime(time: string): boolean {
    return RegexPattern.time.test(time);
  }
}

export { RegexPattern };
