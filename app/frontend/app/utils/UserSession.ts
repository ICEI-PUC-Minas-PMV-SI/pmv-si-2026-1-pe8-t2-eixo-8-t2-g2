import { useAuthStore } from '~/hooks/useAuthStore';
import { useCartStore } from '~/hooks/useCartStore';

class UserSession {
  clear() {
    useAuthStore.getState().logout();
    useAuthStore.persist.clearStorage();
    useCartStore.getState().clearCart();
  }
}

const instance = new UserSession();
export { instance as UserSession };
