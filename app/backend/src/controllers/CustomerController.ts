import { CustomerService } from '../services/CustomerService';

class CustomerController {
  async getCustomerByPhone(phone: string) {
    return CustomerService.find(phone);
  }
}

const instance = new CustomerController();
export { instance as CustomerController };
export default instance;
