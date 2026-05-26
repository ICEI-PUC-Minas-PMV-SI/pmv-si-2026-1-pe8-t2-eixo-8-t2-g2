export type About = {
  id: string;
  title: string;
  subtitle: string;
  main: string;     
  complementary: string;
  imageAboutUrl?: string;
};

export type CreateAbout = Omit<About, 'id'>;

export type AboutItem = {
  id:   string;
  icon?: string;
  text: string;
  orderIndex: number;
};

export type CreateAboutItem = Omit<AboutItem, 'id'>;
