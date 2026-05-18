export type DebugMailData = {
  template: 'otp';
  email: string;
  value?: {
    otp?: string;
  };
};
