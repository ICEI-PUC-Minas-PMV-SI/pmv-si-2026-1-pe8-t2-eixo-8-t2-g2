import type { PaymentMethod } from '~/@types/payment';

export const PaymentMethodMap: Record<PaymentMethod, string> = {
  credit_card: 'Crédito',
  debit_card: 'Débito',
  pix: 'Pix',
  bank_transfer: 'Transferência bancária',
  cash: 'Dinheiro',
};
