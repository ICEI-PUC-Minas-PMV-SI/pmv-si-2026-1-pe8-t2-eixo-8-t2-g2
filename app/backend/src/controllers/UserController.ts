import ms from 'ms';
import { UserService } from '../services/UserService';
import type { UserCreatePayload, UserFilterKey, UserRequest } from '@types';
import type { User } from '../generated/prisma/client';
import { AppError } from '../error/AppError';
import { HttpCode } from '../utils/HttpCode';
import { OTPUtil } from '../utils/OTPUtil';
import type {
  UserOrderByWithRelationInput,
  UserWhereInput,
} from '../generated/prisma/models';

class UserController {
  async create(
    user: UserCreatePayload,
    { createCustomer }: { createCustomer?: boolean } = {},
  ) {
    const result = await UserService.create(user, {
      createCustomer: createCustomer || false,
    });
    return result;
  }
  list(req: UserRequest) {
    const orderBy = [] as UserOrderByWithRelationInput[];
    const filter: UserWhereInput = {};
    const filters = req.filters;
    const sorters = req.sort;
    const search = req.search?.trim();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        const value = filters[key as UserFilterKey];
        switch (key as UserFilterKey) {
          case 'role':
            filter.role = {
              in: Array.isArray(value) ? value : [value],
            };
            break;
        }
      });
    }

    if (sorters) {
      sorters.forEach((sort) => {
        const { key, order } = sort;
        switch (key) {
          case 'name':
            orderBy.push({
              name: order === 'ascend' ? 'asc' : 'desc',
            });
            break;
          case 'createdAt':
            orderBy.push({
              createdAt: order === 'ascend' ? 'asc' : 'desc',
            });
            break;
        }
      });
    }

    if (search) {
      filter.OR = [
        {
          name: {
            contains: search,
          },
        },
      ];
    }

    return UserService.list(filter, orderBy, req.pagination);
  }
  async find(params: Partial<User>) {
    return UserService.find(params);
  }
  async update(id: string, data: Partial<UserCreatePayload>) {
    return UserService.update(id, data);
  }
  async delete(id: string) {
    return UserService.delete(id);
  }
  async forgotPassword(email: string) {
    await UserService.forgotPassword(email);
    return { message: 'recovery code sent by email' };
  }
  async validateOTP({ email, otp }: { email: string; otp: string }) {
    const user = await UserService.find({ email }, { otpSecret: true });
    if (!user) throw new AppError('Usuário não encontrado', HttpCode.NOT_FOUND);
    if (!user.otpSecret) return false;

    return OTPUtil.verify(otp, user.otpSecret, ms('5m'));
  }
  async resetPassword(email: string, newPassword: string) {
    await UserService.updatePassword(email, newPassword);
  }
  async changeRole(id: string, role: 'admin' | 'customer') {
    await UserService.changeRole(id, role);
  }
}

const instance = new UserController();
export { instance as UserController };
