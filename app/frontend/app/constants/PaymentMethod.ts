import type { PaymentMethod } from '~/@types/payment';

export const PaymentMethodMap: Record<PaymentMethod, string> = {
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
  pix: 'Pix',
  bank_transfer: 'Transferência bancária',
  cash: 'Dinheiro',
};
