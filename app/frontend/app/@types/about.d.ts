export type TopProduct = {
  id: string;
  name: string;
  price: number;
};

export type About = {
  id: string;
  title: string;
  subtitle: string;
  main: string;
  complementary: string;
  imageAboutUrl?: string;
  topProducts?: TopProduct[];
  items?: AboutItem[];
};

export type CreateAbout = Omit<About, 'id'>;

export type AboutItem = {
  id?: string;
  tempId?: string;

  text: string;

  icon?: string;

  orderIndex: number;

  file?: File;
};

export type CreateAboutItem = Omit<AboutItem, 'id'>;
