class AppError extends Error {
  public data?: Record<string, any>;
  public statusCode: number;
  public originalError: unknown;
  public constructor(
    message: string,
    statusCode: number,
    data: Record<string, any> | null = null,
    originalError: unknown = null,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.originalError = originalError;
    if (data) {
      this.data = data;
    }
  }
}

export { AppError };
