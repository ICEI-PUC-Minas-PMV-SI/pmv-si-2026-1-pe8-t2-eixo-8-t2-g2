import { type Router } from 'express';
import { ProductValidation } from '../validations/ProductValidation.js';
import { ProductController } from '../controllers/ProductController.js';
import type { GenericRequest, ProductRequest, Response } from '../@types/index.js';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware.js';
import { ImageMiddleware } from '../middlewares/ImageMiddleware.js';
import SupabaseStorage, { BUCKETS } from '../integration/SupabaseStorage.js';

const upload = ImageMiddleware.getUpload();

class ProductRoute {
  register(router: Router) {
    router.post(
      '/product',
      UserScopeMiddleware.adminOnly(),
      upload.single('file'),
      ProductValidation.create(),
      ImageMiddleware.imageDimensions(),
      ImageMiddleware.resizeImage(),
      async (req: any, res) => {
        const payload = { ...req.body };
        delete payload.id;
        if (typeof payload.categories === 'string') {
          payload.categories = JSON.parse(payload.categories);
        }
        if (typeof payload.characteristics === 'string') {
          payload.characteristics = JSON.parse(payload.characteristics);
        }
        payload.isActive = payload.isActive === 'true' || payload.isActive === true;
        payload.price = parseFloat(payload.price);
        payload.bookingLeadMinutes = parseInt(payload.bookingLeadMinutes, 10);
        const result = await ProductController.create(payload);
        const storageResult = await SupabaseStorage.saveFile(
          BUCKETS.PRODUCT_IMAGES,
          `${result.id}.webp`,
          req.file.buffer,
          {
            contentType: req.file.mimetype,
            upsert: true,
          },
        );
        const response = { data: result, warning: null as null | string };
        if (storageResult.error) {
          console.error('Error uploading file to Supabase Storage:', storageResult.error);
          response.warning =
            'Produto criado porem houve um problema ao salvar a imagem. Tente enviar a imagem novamente.';
        } else {
          await ProductController.toggleHasImage(result.id, true);
        }
        res.status(201).json(response);
      },
    );

    router.get('/product', async (req: ProductRequest, res: Response) => {
      const result = await ProductController.list(req);
      res.json(result);
    });

    router.post('/product-list', async (req: ProductRequest, res: Response) => {
      const result = await ProductController.list(req);
      res.json(result);
    });

    router.get('/product/:id', async (req: GenericRequest, res: Response) => {
      const id = req.params.id as string;
      const result = await ProductController.find(id);
      res.json(result);
    });

    router.patch(
      '/product/:id',
      UserScopeMiddleware.adminOnly(),
      upload.single('file'),
      ProductValidation.update(),
      ImageMiddleware.imageDimensions(),
      ImageMiddleware.resizeImage(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        const result = await ProductController.update(id, req.body);

        res.json(result);
      },
    );

    router.delete(
      '/product',
      UserScopeMiddleware.adminOnly(),
      async (req: GenericRequest, res: Response) => {
        const ids = req.body.data.ids as string[];
        const result = await ProductController.deleteMany(ids);
        res.status(200).send(result);
      },
    );

    router.delete(
      '/product/:id',
      UserScopeMiddleware.adminOnly(),
      async (req: GenericRequest, res: Response) => {
        const id = req.params.id as string;
        await ProductController.delete(id);
        res.status(204).send();
      },
    );
  }
}

const instance = new ProductRoute();
export { instance as ProductRoute };
export default instance;
