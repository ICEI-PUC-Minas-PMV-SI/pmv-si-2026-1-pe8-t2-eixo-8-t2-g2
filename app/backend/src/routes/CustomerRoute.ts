import type { Application } from 'express';
import type { GenericRequest } from '../@types';
import { CustomerValidation } from '../validations/CustomerValidation';
import { CustomerController } from '../controllers/CustomerController';
import { ResponseUtil } from '../utils/ResponseUtil';

class CustomerRoute {
  register(app: Application) {
    app.get(
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
