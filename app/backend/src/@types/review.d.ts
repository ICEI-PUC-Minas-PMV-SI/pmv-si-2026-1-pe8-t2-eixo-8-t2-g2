import type { ReviewFilter, ReviewSort } from './page-metadata';
import type { Request } from './server';

export type ReviewCreatePayload = {
  schedulerId: string;
  rating: number;
  comment?: string;
};

export type Review = {
  id: string;
  comment: string;
  featured: boolean;
  rating: number;
};

export type ReviewCreatePayload = Omit<Review, 'id'>;

export type ReviewRequest = Request<ReviewFilter, ReviewSort>;
