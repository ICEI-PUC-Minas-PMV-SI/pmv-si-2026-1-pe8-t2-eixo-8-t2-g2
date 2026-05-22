import type { CreateAboutItem, AboutItem } from '~/@types/about';
import type { TableParams } from '~/hooks/useTableQuery';
import Request from '~/utils/Request';

class AboutItemController {
  async create(aboutItem: CreateAboutItem): Promise<AboutItem> {
    const result = await Request.post<AboutItem>('/aboutItem', aboutItem);
    return result;
  }

  async update(aboutItem: Partial<AboutItem> & { id: string }) {
    const result = await Request.patch<AboutItem>(`/aboutItem/${aboutItem.id}`, aboutItem);
    return result;
  }

  async delete(id: string) {
    const result = await Request.delete(`/aboutItem/${id}`);
    return result;
  }

  async deleteMany(ids: string[]) {
    const result = await Request.delete(`/aboutItem`, { data: { ids } });
    return result;
  }

  async getPage() {
    const result = await Request.get<AboutItem>('/aboutItemPage');
    return result;
  }

  async list<T>(params: TableParams) {
    return Request.getTableData<T>('/aboutItems', params);
  }

  async reorder(items: { id: string; orderIndex: number }[]) {
    return Request.post('/aboutItems/reorder', { items });
  }
}

export default new AboutItemController();
