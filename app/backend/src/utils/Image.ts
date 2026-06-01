import sharp, { type FitEnum as FitType, type Color } from 'sharp';

type Fit = keyof FitType;

type ResizeOptions = {
  maxWidth?: number;
  maxHeight?: number;
  /**
   * Como encaixar a imagem na caixa.
   * - 'inside'  → preserva proporção, nunca excede maxWidth/maxHeight (recomendado)
   * - 'cover'   → recorta para preencher a caixa (bom para thumbnails)
   * - 'contain' → adiciona letterbox, exige background definido
   */
  fit?: Fit;
  /** Cor do letterbox quando fit='contain'. Padrão: transparente. */
  background?: Color;
  /**
   * Qualidade WebP (1–100). 80 é o sweet spot:
   * visualmente indistinguível de 100, mas ~40% menor.
   */
  quality?: number;
  /** Remove metadados EXIF (localização, câmera, etc.). Padrão: true. */
  stripMetadata?: boolean;
};

type ToWebpResult = {
  buffer: Buffer;
  width: number;
  height: number;
  size: number;
};

const PRODUCT_CARD_DEFAULTS: Required<ResizeOptions> = {
  maxWidth: 526,
  maxHeight: 360,
  fit: 'inside',
  background: { r: 255, g: 255, b: 255, alpha: 0 }, // transparente
  quality: 82,
  stripMetadata: true,
};

class Image {
  async toWebp(input: Buffer, options: ResizeOptions = {}): Promise<ToWebpResult> {
    const { maxWidth, maxHeight, fit, background, quality, stripMetadata } = {
      ...PRODUCT_CARD_DEFAULTS,
      ...options,
    };

    try {
      let pipeline = sharp(input, { failOn: 'none' }); // failOn:'none' = tolera arquivos parcialmente corrompidos

      if (stripMetadata) {
        pipeline = pipeline.rotate(); // rotate() sem argumento usa EXIF para orientar corretamente e depois descarta o EXIF
      }

      const { data: buffer, info } = await pipeline
        .resize(maxWidth, maxHeight, {
          fit,
          background,
          withoutEnlargement: true, // nunca amplia além do original — evita pixelização
          kernel: sharp.kernel.lanczos3, // melhor kernel para downscale de fotos
        })
        .webp({
          quality,
          effort: 4, // 0–6: balanço encode speed vs compressão (4 = bom balanço)
          smartSubsample: true, // melhora cores em bordas de alto contraste
        })
        .toBuffer({ resolveWithObject: true });

      return {
        buffer,
        width: info.width,
        height: info.height,
        size: info.size,
      };
    } catch (error: any) {
      console.error('[ImageProcessor.toWebp]', error.message);
      throw error;
    }
  }

  async toWebpThumbnail(input: Buffer): Promise<ToWebpResult> {
    return this.toWebp(input, {
      maxWidth: 160,
      maxHeight: 120,
      quality: 70,
    });
  }

  async getMetadata(input: Buffer) {
    const meta = await sharp(input).metadata();
    return {
      width: meta.width,
      height: meta.height,
      format: meta.format,
      size: input.byteLength,
    };
  }
}

const instance = new Image();
export { instance as Image };
export default instance;
