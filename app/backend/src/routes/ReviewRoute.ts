import { type Router } from 'express';
import type { Response, GenericRequest, ReviewRequest } from '../@types/index.js';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware.js';
import { ReviewValidation } from '../validations/ReviewValidation.js';
import { ReviewController } from '../controllers/ReviewController.js';

class ReviewRoute {
  register(router: Router) {
    router.post(
      '/review',
      ReviewValidation.create(),
      async (req: GenericRequest, res) => {
        const userId = req.user?.id || '';
        const result = await ReviewController.create(userId, req.body);
        res.json(result);
      },
    );
    router.post(
      '/review/ignore',
      UserScopeMiddleware.adminOnly(),
      ReviewValidation.ignoreReview(),
      async (req: GenericRequest, res) => {
        const userId = req.user?.id || '';
        const result = await ReviewController.ignoreReview(userId, req.body.schedulerIds);
        res.json(result);
      },
    );

    // router.get('/review', async (_req: ReviewRequest, res: Response) => {
    //   const result = await ReviewController.list();
    //   res.json({ data: result });
    // });

    router.post('/review-list', async (req: ReviewRequest, res: Response) => {
      const result = await ReviewController.list(req);
      res.json(result);
    });

    router.get('/review/featured', async (_req: ReviewRequest, res: Response) => {
      const result = await ReviewController.listFeatured();
      res.json(result);
    });

    router.get('/review/pending', async (req: ReviewRequest, res: Response) => {
      const userId = req.user?.id || '';
      const result = await ReviewController.getPending(userId);
      res.json(result);
    });

    router.patch(
      '/review/:id/featured',
      UserScopeMiddleware.adminOnly(),
      ReviewValidation.changeFeatured(),
      async (req: ReviewRequest, res: Response) => {
        const id = req.params.id as string;
        const result = await ReviewController.changeFeatured(id, req.body.featured);
        res.json(result);
      },
    );
  }
}

const instance = new ReviewRoute();
export { instance as ReviewRoute };
export default instance;
