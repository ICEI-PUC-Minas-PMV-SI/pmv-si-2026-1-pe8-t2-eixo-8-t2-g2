import type { Area } from 'react-easy-crop';
import type { PublicCharacteristic } from '~/@types/characteristic';
import type { CreateProduct, Product, PublicProduct } from '~/@types/product';
import type { TableParams } from '~/hooks/useTableQuery';
import Request from '~/utils/Request';

class ProductController {
  async buildFormData(
    values: CreateProduct | Partial<Product>,
    croppedImage?: Blob | null,
  ): Promise<FormData> {
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, String(value));
      }
    });

    if (croppedImage) {
      formData.append('file', croppedImage, 'product-image.jpg');
    }

    return formData;
  }
  async create(
    product: CreateProduct,
    image: Blob | null,
    hasImage: boolean,
  ): Promise<Product> {
    const formData = await this.buildFormData({ ...product, hasImage } as any, image);

    return Request.post<Product>('/product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async update(
    product: Partial<Product> & { id: string },
    image: Blob | null,
    hasImage: boolean,
  ): Promise<Product> {
    const productClone: any = { ...product, hasImage };
    if (Array.isArray(productClone.categories) && productClone.categories.length > 0) {
      productClone.categories = productClone.categories.map((c: any) => {
        if (typeof c === 'string') return c;
        if (c.value) return c.value;
      });
    }
    if (
      Array.isArray(productClone.characteristics) &&
      productClone.characteristics.length > 0
    ) {
      productClone.characteristics = productClone.characteristics.map((c: any) => {
        if (typeof c === 'string') return c;
        if (c.value) return c.value;
      });
    }
    const formData = await this.buildFormData(productClone, image);

    return Request.patch<Product>(`/product/${product.id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async delete(id: string) {
    const result = await Request.delete(`/product/${id}`);
    return result;
  }

  async deleteMany(ids: string[]) {
    const result = await Request.delete<{
      message: string;
      status: 'success' | 'partial' | 'failed';
    }>(`/product`, { data: { ids } });
    return result;
  }

  async list<T>(params?: TableParams) {
    if (params) {
      return Request.getTableData<T>('/product-list', params);
    }
    return Request.post<{ data: T[]; total: number }>('/product-list');
  }
  getCategories(product: PublicProduct): { id: string; name: string }[] {
    return (product.categories ?? [])
      .map((c: any) => ({
        id: c?.category?.id ?? c?.id ?? c?.name ?? '',
        name: c?.category?.name ?? c?.name ?? '',
      }))
      .filter((c) => c.name);
  }

  getCharacteristics(product: PublicProduct): PublicCharacteristic[] {
    return (product.characteristics ?? []).map((c: any) => c?.characteristic ?? c);
  }

  async getCroppedImage(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    const radians = (rotation * Math.PI) / 180;
    const sin = Math.abs(Math.sin(radians));
    const cos = Math.abs(Math.cos(radians));
    const rotW = image.width * cos + image.height * sin;
    const rotH = image.width * sin + image.height * cos;

    // Canvas de rotação
    const rotCanvas = document.createElement('canvas');
    rotCanvas.width = rotW;
    rotCanvas.height = rotH;
    const rotCtx = rotCanvas.getContext('2d')!;
    rotCtx.translate(rotW / 2, rotH / 2);
    rotCtx.rotate(radians);
    rotCtx.drawImage(image, -image.width / 2, -image.height / 2);

    // Canvas final com a área cropada — saída em 2× para HiDPI
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    ctx.drawImage(
      rotCanvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    );

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob retornou null'));
        },
        'image/jpeg',
        0.95, // alta qualidade — o sharp no backend vai converter para WebP
      );
    });
  }
}

export default new ProductController();
