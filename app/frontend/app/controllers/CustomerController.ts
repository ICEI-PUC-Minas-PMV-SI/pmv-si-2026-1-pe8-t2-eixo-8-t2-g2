import type { Customer } from '~/@types/customer';
import Request from '~/utils/Request';

class CustomerController {
  async findByPhone(phone: string) {
    const result = await Request.get<Customer | null>('/customer', {
      phone,
    });

    return result;
  }
}

export default new CustomerController();
