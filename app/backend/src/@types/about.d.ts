import type { AboutFilter, AboutSort } from './page-metadata.js';
import type { Request } from './server.js';

export type AboutRequest = Request<AboutFilter, AboutSort>;

export type AboutItem = {
  id?: string;
  orderIndex: number;
  text: string;
};

export type AboutCreatePayload = {
  title?: string;
  subtitle?: string;
  main?: string;
  complementary?: string;
  items?: AboutItem[];
};
