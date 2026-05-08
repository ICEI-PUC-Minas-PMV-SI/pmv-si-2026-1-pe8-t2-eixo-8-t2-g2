import dayjs from 'dayjs';
import type { Product, ProductCategory } from '~/@types/product';
import type { Scheduler } from '~/@types/scheduler';

type MockedDataType = {
  schedulers: Scheduler[];
  productCategories: ProductCategory[];
  products: Product[];
};

export const MockedData: MockedDataType = {
  schedulers: [
    {
      id: 'sch-1',
      customerName: 'Ana Souza',
      scheduledAt: dayjs().hour(9).minute(0).second(0).millisecond(0).toISOString(),
      estimatedStartAt: dayjs().hour(9).minute(15).second(0).millisecond(0).toISOString(),
      estimatedEndAt: dayjs().hour(10).minute(30).second(0).millisecond(0).toISOString(),
      estimatedPickupDeliveryAt: dayjs()
        .hour(11)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toISOString(),
      status: 'confirmed',
      paymentMethod: 'credit',
      deliveryType: 'pickup',
      items: [
        {
          id: 'it-1',
          productName: 'Bolo de Chocolate',
          quantity: 1,
          priceAtBooking: 120,
          durationMinutes: 75,
        },
      ],
    },
    {
      id: 'sch-2',
      customerName: 'Bruno Lima',
      scheduledAt: dayjs().hour(11).minute(30).second(0).millisecond(0).toISOString(),
      estimatedStartAt: dayjs()
        .hour(11)
        .minute(45)
        .second(0)
        .millisecond(0)
        .toISOString(),
      estimatedEndAt: dayjs().hour(12).minute(30).second(0).millisecond(0).toISOString(),
      estimatedPickupDeliveryAt: dayjs()
        .hour(13)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toISOString(),
      status: 'pending',
      paymentMethod: 'bank_transfer',
      deliveryType: 'delivery',
      items: [
        {
          id: 'it-2',
          productName: 'Cupcake Gourmet',
          quantity: 12,
          priceAtBooking: 84,
          durationMinutes: 30,
        },
        {
          id: 'it-3',
          productName: 'Mini Brownie',
          quantity: 20,
          priceAtBooking: 60,
          durationMinutes: 20,
        },
      ],
    },
    {
      id: 'sch-3',
      customerName: 'Carla Mendes',
      scheduledAt: dayjs().hour(14).minute(0).second(0).millisecond(0).toISOString(),
      estimatedStartAt: dayjs()
        .hour(14)
        .minute(10)
        .second(0)
        .millisecond(0)
        .toISOString(),
      estimatedEndAt: dayjs().hour(15).minute(0).second(0).millisecond(0).toISOString(),
      status: 'in_progress',
      paymentMethod: 'debit',
      deliveryType: 'pickup',
      items: [
        {
          id: 'it-4',
          productName: 'Torta de Morango',
          quantity: 1,
          priceAtBooking: 180,
          durationMinutes: 60,
        },
      ],
    },
    {
      id: 'sch-4',
      customerName: 'Daniel Alves',
      scheduledAt: dayjs()
        .add(1, 'day')
        .hour(16)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toISOString(),
      status: 'completed',
      paymentMethod: 'credit',
      deliveryType: 'delivery',
      items: [
        {
          id: 'it-5',
          productName: 'Bento Cake',
          quantity: 2,
          priceAtBooking: 200,
          durationMinutes: 90,
        },
      ],
    },
    {
      id: 'sch-5',
      customerName: 'Um nome completamente extenso',
      scheduledAt: dayjs()
        .add(0, 'day')
        .hour(0)
        .minute(0)
        .second(0)
        .millisecond(0)
        .toISOString(),
      status: 'completed',
      paymentMethod: 'credit',
      deliveryType: 'delivery',
      items: [
        {
          id: 'it-5',
          productName: 'Bento Cake',
          quantity: 2,
          priceAtBooking: 200,
          durationMinutes: 90,
        },
      ],
    },
  ],
  productCategories: [
    {
      id: 'cat-1',
      name: 'Bolos',
      slug: 'bolos',
      description: 'Bolos para encomenda e pronta entrega',
      isActive: true,
      orderIndex: 1,
    },
    {
      id: 'cat-2',
      name: 'Doces',
      slug: 'doces',
      description: 'Doces finos e tradicionais',
      isActive: true,
      orderIndex: 2,
    },
    {
      id: 'cat-3',
      name: 'Tortas',
      slug: 'tortas',
      description: 'Tortas doces sob encomenda',
      isActive: true,
      orderIndex: 3,
    },
  ],
  products: [
    {
      id: 'prd-1',
      name: 'Bolo de Chocolate',
      slug: 'bolo-de-chocolate',
      description: 'Bolo clássico com recheio cremoso.',
      price: 120,
      estimatedMinPrice: 100,
      estimatedMaxPrice: 180,
      bookingLeadTimeMinutes: 120,
      bookingLeadDays: 2,
      isActive: true,
      characteristics: ['ch-1'],
      categories: ['Bolos'],
      imageUrl: 'https://picsum.photos/seed/bolo/400/300',
    },
    {
      id: 'prd-2',
      name: 'Cupcake Gourmet',
      slug: 'cupcake-gourmet',
      description: 'Caixa com cupcakes decorados.',
      price: 84,
      estimatedMinPrice: 72,
      estimatedMaxPrice: 120,
      bookingLeadTimeMinutes: 60,
      bookingLeadDays: 1,
      isActive: true,
      characteristics: ['ch-3'],
      categories: ['Doces'],
    },
  ],
};
