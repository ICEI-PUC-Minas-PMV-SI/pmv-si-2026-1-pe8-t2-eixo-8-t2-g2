import { type Router } from 'express';
import { ProductValidation } from '../validations/ProductValidation.js';
import { ProductController } from '../controllers/ProductController.js';
import type { GenericRequest, ProductRequest, Response } from '../@types/index.js';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware.js';
import { ImageMiddleware } from '../middlewares/ImageMiddleware.js';
import SupabaseStorage, { BUCKETS } from '../integration/SupabaseStorage.js';
import { Logger } from '../logger/Logger.js';

const upload = ImageMiddleware.getUpload();
const saveProductImage = async (productId: string, file: Express.Multer.File) => {
  const storageResult = await SupabaseStorage.saveFile(
    BUCKETS.PRODUCT_IMAGES,
    `${productId}.webp`,
    file.buffer,
    {
      contentType: file.mimetype,
      upsert: true,
    },
  );
  if (storageResult.error) {
    console.error('Error uploading file to Supabase Storage:', storageResult.error);
    throw new Error(
      'Produto criado porem houve um problema ao salvar a imagem. Tente enviar a imagem novamente.',
    );
  } else {
    await ProductController.toggleHasImage(productId, true);
  }
};
class ProductRoute {
  private logger = new Logger('ProductRoute');

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
        if (req.file) {
          saveProductImage(result.id, req.file)
            .then(() => {
              res.status(201).json({ data: result, warning: null });
            })
            .catch((err) => {
              res.status(201).json({ data: result, warning: err.message });
            });
        } else {
          res.status(201).json({ data: result, warning: null });
        }
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
        const payload = { ...req.body };
        const hasImage = payload.hasImage === 'true' || payload.hasImage === true;
        delete payload.hasImage;
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
        const result = await ProductController.update(id, payload);
        if (req.file) {
          saveProductImage(result.id, req.file)
            .then(() => {
              res.status(201).json({ data: result, warning: null });
            })
            .catch((err) => {
              res.status(201).json({ data: result, warning: err.message });
            });
        } else {
          if (result.hasImage && hasImage === false) {
            try {
              await SupabaseStorage.removeFile(BUCKETS.PRODUCT_IMAGES, [`${id}.webp`]);
              await ProductController.toggleHasImage(id, false);
              res.status(200).json({ data: result, warning: null });
            } catch (err) {
              this.logger.error('Error removing file from Supabase Storage:', err);
              res.status(200).json({
                data: result,
                warning:
                  'Produto atualizado com sucesso, mas ocorreu um erro ao remover a imagem',
              });
            }
          } else {
            res.status(200).json({ data: result, warning: null });
          }
        }
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
