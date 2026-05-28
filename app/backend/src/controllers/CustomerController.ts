import { CustomerService } from '../services/CustomerService.js';

class CustomerController {
  async getCustomerByPhone(phone: string) {
    return CustomerService.find(phone);
  }
}

const instance = new CustomerController();
export { instance as CustomerController };
export default instance;
