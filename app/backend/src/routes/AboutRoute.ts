import { AboutController } from '../controllers/AboutController.js';
import { type Router } from 'express';
import { AboutValidation } from '../validations/AboutValidation.js';
import type { Response, AboutRequest } from '../@types/index.js';
import { UserScopeMiddleware } from '../middlewares/UserScopeMiddleware.js';
import { ImageMiddleware } from '../middlewares/ImageMiddleware.js';
import SupabaseStorage, { BUCKETS } from '../integration/SupabaseStorage.js';
import { Logger } from '../logger/Logger.js';

const upload = ImageMiddleware.getUpload();

const saveAboutImage = async (file: Express.Multer.File) => {
  const storageResult = await SupabaseStorage.saveFile(
    BUCKETS.ABOUT,
    `about-main-image.webp`,
    file.buffer,
    {
      contentType: file.mimetype,
      upsert: true,
    },
  );
  if (storageResult.error) {
    console.error('Error uploading file to Supabase Storage:', storageResult.error);
    throw new Error(
      'Conteúdo da página salvo, porem houve um problema ao salvar a imagem. Tente enviar a imagem novamente.',
    );
  } else {
    await AboutController.setHasImage(true);
  }
};
class AboutRoute {
  private logger = new Logger('AboutRoute');

  register(router: Router) {
    router.post(
      '/about',
      UserScopeMiddleware.adminOnly(),
      upload.single('file'),
      AboutValidation.create(),
      ImageMiddleware.imageDimensions(640, 360),
      ImageMiddleware.resizeImage({
        maxWidth: 1200,
        maxHeight: 675,
        fit: 'inside',
        quality: 85,
      }),
      async (req, res) => {
        const payload = { ...req.body };
        const hasImage = payload.hasImage === 'true' || payload.hasImage === true;
        delete payload.hasImage;
        if (payload.items && typeof payload.items === 'string') {
          payload.items = JSON.parse(payload.items);
        }
        const result = await AboutController.create(payload);
        if (req.file) {
          saveAboutImage(req.file)
            .then(() => {
              res.status(201).json({ data: result, warning: null });
            })
            .catch((err: any) => {
              res.status(201).json({ data: result, warning: err.message });
            });
        } else {
          if (result?.hasImage && !hasImage) {
            try {
              await SupabaseStorage.removeFile(BUCKETS.ABOUT, ['about-main-image.webp']);
              await AboutController.setHasImage(false);
              res.status(200).json({ data: result, warning: null });
            } catch (err) {
              this.logger.error('Error removing file from Supabase Storage:', err);
              res.status(200).json({
                data: result,
                warning:
                  'Conteúdo da página atualizado com sucesso, mas ocorreu um erro ao remover a imagem',
              });
            }
          } else {
            res.status(201).json({ data: result, warning: null });
          }
        }
      },
    );

    router.get('/about', async (_req: AboutRequest, res: Response) => {
      const result = await AboutController.findOne();
      res.json(result);
    });

    router.get('/about/:id', async (req: AboutRequest, res: Response) => {
      const id = req.params.id as string;
      const result = await AboutController.find(id);
      res.json(result);
    });

    router.patch(
      '/about/:id',
      UserScopeMiddleware.adminOnly(),
      async (req: AboutRequest, res: Response) => {
        const id = req.params.id as string;
        const result = await AboutController.update(id, req.body);
        res.json(result);
      },
    );
  }
}

const instance = new AboutRoute();
export { instance as AboutRoute };
export default instance;
