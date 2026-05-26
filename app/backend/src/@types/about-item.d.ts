export type AboutItemRequest = Request<AboutItemFilter, AboutItemSort>;

export type AboutItemCreatePayload = {
  id: string;
  icon?: string;
  text: string;
};

export type AboutItemCreatePayload = Omit<AboutItem, 'id'>;
