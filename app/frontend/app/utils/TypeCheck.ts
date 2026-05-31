import type { CreateProduct, Product } from '~/@types/product';

class TypeCheck {
  isNewProduct(product: Product | CreateProduct): product is CreateProduct {
    return !('id' in product) || !product.id;
  }
}

export default new TypeCheck();
