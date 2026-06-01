import type { FileFilterCallback } from 'multer';
import multer from 'multer';
import type { Request } from 'express';
import { Image } from '../utils/Image';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

/** Tamanho máximo do arquivo bruto: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** Dimensões mínimas aceitáveis */
const MIN_WIDTH = 200;
const MIN_HEIGHT = 150;

class ImageMiddleware {
  private imageFileFilter(mimeTypes: Set<string> = ALLOWED_MIME) {
    return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
      if (!mimeTypes.has(file.mimetype)) {
        cb(
          new Error(
            `Formato não suportado: ${file.mimetype}. Use JPG, PNG, WebP, AVIF ou GIF.`,
          ),
        );
        return;
      }
      cb(null, true);
    };
  }
  getUpload() {
    return multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE },
      fileFilter: this.imageFileFilter(),
    });
  }
  imageDimensions(minWidth: number = MIN_WIDTH, minHeight: number = MIN_HEIGHT) {
    return async (req: Request, res: any, next: any) => {
      if (!req.file) return next();

      try {
        const meta = await Image.getMetadata(req.file.buffer);
        if ((meta.width ?? 0) < minWidth || (meta.height ?? 0) < minHeight) {
          return res.status(422).json({
            message: `Imagem muito pequena. Mínimo: ${minWidth}×${minHeight}px. Recebido: ${meta.width}×${meta.height}px.`,
          });
        }
        (req as any).imageMeta = meta;
        next();
      } catch (err) {
        console.log(err);
        return res
          .status(422)
          .json({ message: 'Não foi possível ler a imagem enviada.' });
      }
    };
  }
  resizeImage() {
    return async (req: Request, res: any, next: any) => {
      if (!req.file) return next();

      try {
        const result = await Image.toWebp(req.file.buffer);

        req.file.buffer = result.buffer;
        req.file.mimetype = 'image/webp';
        req.file.size = result.size;
        req.file.originalname = req.file.originalname.replace(/\.[^.]+$/, '.webp');
        (req as any).imageInfo = { width: result.width, height: result.height };

        next();
      } catch (error: any) {
        console.log(error);
        return res.status(500).json({ message: 'Erro ao processar imagem.' });
      }
    };
  }
}

const instance = new ImageMiddleware();
export { instance as ImageMiddleware };
