import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '~/@types/product';
import { MockedData } from '~/constants/MockedData';

export type CartItem = {
  product: Product;
  quantity: number;
  addedAt: string;
};

type CartStore = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  setItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  resetMockCart: () => void;
};

const createMockCartItems = (): CartItem[] => {
  return MockedData.products.slice(0, 2).map((product, index) => ({
    product,
    quantity: index === 0 ? 2 : 1,
    addedAt: new Date(Date.now() - index * 60_000).toISOString(),
  }));
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: createMockCartItems(),

      addItem: (product: Product) => {
        const exists = get().items.some((item) => item.product.id === product.id);

        if (exists) {
          set({
            items: get().items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            ),
          });
          return;
        }

        set({
          items: [
            ...get().items,
            {
              product,
              quantity: 1,
              addedAt: new Date().toISOString(),
            },
          ],
        });
      },

      removeItem: (productId: string) =>
        set({ items: get().items.filter((item) => item.product.id !== productId) }),

      incrementItem: (productId: string) =>
        set({
          items: get().items.map((item) =>
            item.product.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          ),
        }),

      decrementItem: (productId: string) => {
        const nextItems = get()
          .items.map((item) => {
            if (item.product.id !== productId) {
              return item;
            }

            const nextQuantity = item.quantity - 1;
            return nextQuantity <= 0 ? null : { ...item, quantity: nextQuantity };
          })
          .filter((item): item is CartItem => item !== null);

        set({ items: nextItems });
      },

      setItemQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((item) => item.product.id !== productId) });
          return;
        }

        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      resetMockCart: () => set({ items: createMockCartItems() }),
    }),
    {
      name: 'cart-storage',
    },
  ),
);
