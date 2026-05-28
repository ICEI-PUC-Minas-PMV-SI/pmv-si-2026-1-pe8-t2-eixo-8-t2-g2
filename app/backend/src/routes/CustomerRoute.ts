import type { Router } from 'express';
import type { GenericRequest } from '../@types/index.js';
import { CustomerValidation } from '../validations/CustomerValidation.js';
import { CustomerController } from '../controllers/CustomerController.js';
import { ResponseUtil } from '../utils/ResponseUtil.js';

class CustomerRoute {
  register(router: Router) {
    router.get(
      '/customer',
      CustomerValidation.getCustomer(),
      async (req: GenericRequest, res) => {
        const phone = req.query.phone;
        if (typeof phone !== 'string') {
          return ResponseUtil.handleError(res, new Error('Invalid customer phone'));
        }
        const result = await CustomerController.getCustomerByPhone(phone);
        res.json(result);
      },
    );
  }
}

const instance = new CustomerRoute();
export { instance as CustomerRoute };
export default instance;
