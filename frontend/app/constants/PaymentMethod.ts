import type { PaymentMethod } from '~/@types/payment';

export const PaymentMethodMap: Record<PaymentMethod, string> = {
  credit_card: 'Cartão de Crédito',
  pix: 'Pix',
  bank_transfer: 'Transferência bancária',
  cash: 'Dinheiro',
};
