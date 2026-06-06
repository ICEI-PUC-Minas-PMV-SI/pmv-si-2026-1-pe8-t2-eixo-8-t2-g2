import type {
  ReviewCreatePayload,
  ReviewFilterKey,
  ReviewRequest,
} from '../@types/index.js';
import { ReviewService } from '../services/ReviewService.js';
import type { Prisma } from '../generated/prisma';

class ReviewController {
  async create(userId: string, data: ReviewCreatePayload) {
    return ReviewService.create(userId, data);
  }

  async find(id: string) {
    return ReviewService.find(id);
  }

  async list(req: ReviewRequest) {
    const orderBy = [] as Prisma.ReviewOrderByWithRelationInput[];
    const filter: Prisma.ReviewWhereInput = {};
    const filters = req.filters;
    const sorters = req.sort;
    const search = req.search?.trim();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key as ReviewFilterKey];
        switch (key as ReviewFilterKey) {
          case 'comment':
            filter.comment = {
              not: null,
              notIn: [''],
            };
            break;
          case 'featured':
            filter.featured = value as boolean;
            break;
          case 'rating':
            filter.rating = value as number;
            break;
        }
      });
    }

    if (sorters) {
      sorters.forEach((sort) => {
        const { key, order } = sort;
        switch (key) {
          case 'rating':
            orderBy.push({
              rating: order === 'ascend' ? 'asc' : 'desc',
            });
            break;
        }
      });
    }

    if (search) {
      filter.OR = [
        {
          comment: {
            contains: search,
          },
        },
        {
          customer: {
            name: {
              contains: search,
            },
          },
        },
        {
          scheduler: {
            items: {
              some: {
                product: {
                  name: {
                    contains: search,
                  },
                },
              },
            },
          },
        },
      ];
    }
    return ReviewService.list(filter, orderBy, req.pagination);
  }

  async listFeatured() {
    return ReviewService.list({ featured: true }, [{ updatedAt: 'desc' }], {
      take: 3,
      skip: 0,
    });
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
