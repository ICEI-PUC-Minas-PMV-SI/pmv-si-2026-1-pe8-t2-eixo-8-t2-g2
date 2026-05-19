export type About = {
  id: string;
  title: string;
  subtitle: string;
  main: string;     
  complementary: string;
  imageAboutUrl?: string;
  items: string[];
};

export type CreateAboutPayload = Omit<About, 'id'>;

export type AboutItem = {
  id:   string;
  icon: string;
  text: string;
};

export type CreateAboutItemPayload = Omit<AboutItem, 'id'>;
