import type { CreateAbout, About } from '~/@types/about';
import Request from '~/utils/Request';

class AboutController {
  async create(about: CreateAbout): Promise<About> {
    const result = await Request.post<About>('/about', about);
    return result;
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
