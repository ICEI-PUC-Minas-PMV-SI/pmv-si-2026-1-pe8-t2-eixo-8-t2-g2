import type { UserCreatePayload } from '~/@types/user';
import type { TableParams } from '~/hooks/useTableQuery';
import Request from '~/utils/Request';

class UserController {
  async create(user: UserCreatePayload) {
    const {
      postalCode,
      street,
      number,
      complement,
      state,
      city,
      neighborhood,
      ...userData
    } = user;
    const data = {
      ...userData,
      phone: userData.phone.replace(/\D/g, ''),
      address: {
        postalCode,
        street,
        number,
        complement,
        state,
        city,
        neighborhood,
      },
    };
    const result = await Request.post('/user', data);
    return result;
  }

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
