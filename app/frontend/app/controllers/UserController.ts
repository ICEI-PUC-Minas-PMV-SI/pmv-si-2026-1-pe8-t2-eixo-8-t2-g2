import type { TableParams } from '~/hooks/useTableQuery';
import Request from '~/utils/Request';

class UserController {
  async delete(id: string) {
    const result = await Request.delete(`/user/${id}`);
    return result;
  }

  async list<T>(params: TableParams) {
    return Request.getTableData<T>('/user-list', params);
  }

  async changeRole(id: string, role: 'admin' | 'customer') {
    return Request.patch(`/user-role/${id}`, { role });
  }
}

export default new UserController();
