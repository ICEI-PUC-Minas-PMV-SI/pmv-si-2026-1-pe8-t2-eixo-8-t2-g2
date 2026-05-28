import sharp, { type FitEnum as FitType, type Color } from 'sharp';

type WebpConverterOptions = {
  width?: number;
  height?: number;
  fit?: keyof FitType;
  background?: Color;
};

class Image {
  defaultOptions: WebpConverterOptions = {
    width: 800,
    height: 600,
    fit: 'contain',
    background: 'transparent',
  };

  async toWebp(file: Express.Multer.File, options: WebpConverterOptions = {}) {
    try {
      const { width, height, fit, background } = { ...this.defaultOptions, ...options };
      const buffer = await sharp(file.buffer)
        .resize(width, height, { fit, background })
        .webp()
        .toBuffer();
      return { buffer };
    } catch (error: any) {
      console.error(error.message);
      return Promise.reject(error);
    }
  }
}

const instance = new Image();
export { instance as Image };
export default instance;
