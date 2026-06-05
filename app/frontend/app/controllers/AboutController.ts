import type { CreateAbout, About } from '~/@types/about';
import Request from '~/utils/Request';

class AboutController {
  async buildFormData(
    values: CreateAbout,
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
      formData.append('file', croppedImage, 'about-main-image.jpg');
    }

    return formData;
  }
  async create(
    about: CreateAbout,
    image: Blob | null,
    hasImage: boolean,
  ): Promise<About> {
    const formData = await this.buildFormData({ ...about, hasImage } as any, image);

    return Request.post<About>('/about', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async update(about: Partial<About> & { id: string }) {
    const result = await Request.patch<About>(`/about/${about.id}`, about);
    return result;
  }

  async delete(id: string) {
    const result = await Request.delete(`/about/${id}`);
    return result;
  }

  async deleteMany(ids: string[]) {
    const result = await Request.delete(`/about`, { data: { ids } });
    return result;
  }

  async find() {
    const result = await Request.get<About>('/about');
    return result;
  }
}

export default new AboutController();
