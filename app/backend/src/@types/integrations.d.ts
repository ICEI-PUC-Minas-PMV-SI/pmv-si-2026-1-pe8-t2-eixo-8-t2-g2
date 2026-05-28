export type IntegrationsPayload = {
  googleCalendar: {
    clientId: string;
    clientSecret: string;
  } | null;

  gmail: {
    clientId: string;
    clientSecret: string;
    mailFrom: string;
    mailSenderName: string;
  } | null;

  google: {
    clientId: string;
    clientSecret: string;
    refreshToken: string;
    mailFrom: string;
    mailSenderName: string;
  } | null;
};
