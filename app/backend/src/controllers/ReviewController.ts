import type { ReviewCreatePayload } from '../@types/index.js';
import { ReviewService } from '../services/ReviewService.js';

class ReviewController {
  async create(userId: string, data: ReviewCreatePayload) {
    return ReviewService.create(userId, data);
  }

  async find(id: string) {
    return ReviewService.find(id);
  }

  async list() {
    return ReviewService.list();
  }

  async listFeatured() {
    return ReviewService.list(true);
  }
  
  async ignoreReview(userId: string, schedulerIds: string[]) {
    return ReviewService.ignoreReview(userId, schedulerIds);
  }

  async getPending(userId: string) {
    return ReviewService.getPending(userId);
  }

  async changeFeatured(reviewId: string, featured: boolean) {
    return ReviewService.changeFeatured(reviewId, featured);
  }
}

const instance = new ReviewController();
export { instance as ReviewController };
