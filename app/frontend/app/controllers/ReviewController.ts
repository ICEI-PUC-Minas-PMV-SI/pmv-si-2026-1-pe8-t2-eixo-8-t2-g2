import type { PendingScheduler, Scheduler } from '~/@types/scheduler';
import type { ReviewPayload } from '~/components/review/ReviewModal';
import Request from '~/utils/Request';

export type ReviewRecord = {
  id: string;
  rating: number;
  comment?: string | null;
  featured: boolean;
  ignored: boolean;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    phone?: string | null;
  };
  scheduler: {
    id: string;
    scheduledAt: string;
    items: { product: { name: string }; quantity: number }[];
  };
};

class ReviewController {
  async submitReview(payload: ReviewPayload): Promise<void> {
    await Request.post('/review', payload);
  }

  async ignoreSchedulers(schedulerIds: string[]): Promise<void> {
    await Request.post('/review/ignore', { schedulerIds });
  }

  /**
   * Cliente: lista pedidos completed sem avaliação e sem ignore.
   * GET /review/pending
   */
  async listPendingForCustomer() {
    return Request.get<{ data: PendingScheduler[] }>('/review/pending').then(
      (r) => r.data,
    );
  }

  async listAll(): Promise<ReviewRecord[]> {
    return Request.get<{ data: ReviewRecord[] }>('/review').then((r) => r.data);
  }

  async listFeatured(): Promise<ReviewRecord[]> {
    return Request.get<{ data: ReviewRecord[] }>('/review/featured').then((r) => r.data);
  }
  
  /**
   * Admin: toggle de destaque para homepage.
   * PATCH /review/:id/featured
   */
  async setFeatured(id: string, featured: boolean): Promise<void> {
    await Request.patch(`/review/${id}/featured`, { featured });
  }

  ratingLabel(r: number) {
    return ['', 'Muito ruim', 'Ruim', 'Regular', 'Bom', 'Excelente'][r] ?? '';
  }

  averageRating(reviews: ReviewRecord[]): number {
    if (!reviews.length) return 0;
    return reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  }
}

export default new ReviewController();
