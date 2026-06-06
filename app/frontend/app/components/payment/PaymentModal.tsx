import {
  Modal,
  Form,
  InputNumber,
  Typography,
  Flex,
  Divider,
  Tag,
  Alert,
  Segmented,
  Steps,
  Input,
} from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  WalletOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo } from 'react';
import type { PaymentMethod } from '~/@types/payment';
import type { Scheduler } from '~/@types/scheduler';
import { PaymentMethodMap } from '~/constants/PaymentMethod';
import NumberUtil from '~/utils/NumberUtil';
import {
  BuildingColumns,
  CreditCard,
  MoneyBill,
  PIX,
  SackDollar,
} from '../icon/components';
import { useBreakpoint } from '~/hooks/useBreakpoint';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PaymentType = 'deposit' | 'remainder';

export type RegisterPaymentPayload = {
  schedulerId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  type: PaymentType;
  note?: string;
};

type Payment = {
  id: string;
  amount: number;
  paymentMethod: PaymentMethod;
  type: PaymentType;
  createdAt: string;
};

type ComponentProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (payload: RegisterPaymentPayload) => Promise<void>;
  scheduler: Scheduler & { payments?: Payment[] };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_OPTIONS = [
  {
    label: (
      <div style={{ padding: '4px 0' }}>
        <MoneyBill style={{ fontSize: 20 }} />
        <div style={{ fontSize: 12, marginTop: 2 }}>Dinheiro</div>
      </div>
    ),
    value: 'cash',
  },
  {
    label: (
      <div style={{ padding: '4px 0' }}>
        <CreditCard style={{ fontSize: 20 }} />
        <div style={{ fontSize: 12, marginTop: 2 }}>Crédito</div>
      </div>
    ),
    value: 'credit_card',
  },
  {
    label: (
      <div style={{ padding: '4px 0' }}>
        <SackDollar style={{ fontSize: 20 }} />
        <div style={{ fontSize: 12, marginTop: 2 }}>Débito</div>
      </div>
    ),
    value: 'debit_card',
  },
  {
    label: (
      <div style={{ padding: '4px 0' }}>
        <PIX style={{ fontSize: 20 }} />
        <div style={{ fontSize: 12, marginTop: 2 }}>PIX</div>
      </div>
    ),
    value: 'pix',
  },
  {
    label: (
      <div style={{ padding: '4px 0' }}>
        <BuildingColumns style={{ fontSize: 20 }} />
        <div style={{ fontSize: 12, marginTop: 2 }}>Transf. Bancária</div>
      </div>
    ),
    value: 'bank_transfer',
  },
] as const;

function getOrderTotal(scheduler: Scheduler): number {
  return (scheduler.items ?? []).reduce(
    (acc, item) => acc + (item.priceAtBooking ?? 0) * item.quantity,
    0,
  );
}

function PaymentStatusBadge({
  paidTotal,
  orderTotal,
}: {
  paidTotal: number;
  orderTotal: number;
}) {
  const percent = orderTotal > 0 ? Math.round((paidTotal / orderTotal) * 100) : 0;
  const isPaid = paidTotal >= orderTotal;

  return (
    <div
      style={{
        background: isPaid ? '#F6FFED' : '#FFFBE6',
        border: `1px solid ${isPaid ? '#B7EB8F' : '#FFE58F'}`,
        borderRadius: 10,
        padding: '14px 16px',
      }}
    >
      <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
        <Typography.Text style={{ fontSize: 12, color: '#8C8C8C', fontWeight: 500 }}>
          SITUAÇÃO DO PAGAMENTO
        </Typography.Text>
        <Tag
          color={isPaid ? 'success' : 'warning'}
          style={{ borderRadius: 20, fontWeight: 600, fontSize: 11 }}
        >
          {isPaid ? 'Quitado' : `${percent}% pago`}
        </Tag>
      </Flex>
      <Flex justify="space-between" align="flex-end">
        <div>
          <Typography.Text style={{ fontSize: 12, color: '#8C8C8C', display: 'block' }}>
            Já pago
          </Typography.Text>
          <Typography.Text
            strong
            style={{ fontSize: 16, color: isPaid ? '#389E0D' : '#AD6800' }}
          >
            {NumberUtil.currency(paidTotal)}
          </Typography.Text>
        </div>
        {!isPaid && (
          <div style={{ textAlign: 'right' }}>
            <Typography.Text style={{ fontSize: 12, color: '#8C8C8C', display: 'block' }}>
              Restante
            </Typography.Text>
            <Typography.Text strong style={{ fontSize: 16, color: '#CF1322' }}>
              {NumberUtil.currency(orderTotal - paidTotal)}
            </Typography.Text>
          </div>
        )}
        <div style={{ textAlign: 'right' }}>
          <Typography.Text style={{ fontSize: 12, color: '#8C8C8C', display: 'block' }}>
            Total do pedido
          </Typography.Text>
          <Typography.Text strong style={{ fontSize: 16, color: '#1A1A1A' }}>
            {NumberUtil.currency(orderTotal)}
          </Typography.Text>
        </div>
      </Flex>

      {/* Barra de progresso manual */}
      <div
        style={{
          marginTop: 12,
          height: 6,
          borderRadius: 3,
          background: '#E8E8E8',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${Math.min(percent, 100)}%`,
            borderRadius: 3,
            background: isPaid ? '#52C41A' : '#FAAD14',
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}

// ─── PaymentModal ─────────────────────────────────────────────────────────────

export function PaymentModal({ open, onClose, onConfirm, scheduler }: ComponentProps) {
  const [form] = Form.useForm();

  const orderTotal = useMemo(() => getOrderTotal(scheduler), [scheduler]);
  const payments = scheduler.payments ?? [];
  const depositPayment = payments.find((p) => p.type === 'deposit');
  const remainderPayment = payments.find((p) => p.type === 'remainder');
  const paidTotal = payments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = Math.round(Math.max(orderTotal - paidTotal, 0) * 100) / 100;
  const isMobile = useBreakpoint('md');

  // Qual tipo de pagamento está disponível agora
  const paymentType: PaymentType = depositPayment ? 'remainder' : 'deposit';
  const isFullyPaid = !!remainderPayment || paidTotal >= orderTotal;

  // Pré-carrega o valor sugerido ao abrir
  useEffect(() => {
    if (!open) return;
    const suggested =
      paymentType === 'deposit'
        ? Math.round(orderTotal * 0.5 * 100) / 100 // 50% do total
        : remaining; // restante exato
    form.setFieldsValue({
      amount: suggested,
      paymentMethod: scheduler.paymentMethod ?? 'cash',
    });
  }, [open, paymentType, orderTotal, remaining, scheduler.paymentMethod]);

  const handleConfirm = async () => {
    const values = await form.validateFields();
    await onConfirm({
      schedulerId: scheduler.id,
      amount: values.amount,
      paymentMethod: values.paymentMethod,
      type: paymentType,
      note: values.note,
    });
    form.resetFields();
    onClose();
  };

  // Steps visuais
  const stepItems = [
    {
      title: 'Sinal',
      description: depositPayment
        ? `${NumberUtil.currency(depositPayment.amount)} · ${PaymentMethodMap[depositPayment.paymentMethod]}`
        : 'Pendente',
      icon: depositPayment ? (
        <CheckCircleOutlined style={{ color: '#52C41A' }} />
      ) : (
        <WalletOutlined />
      ),
      status: depositPayment ? ('finish' as const) : ('process' as const),
    },
    {
      title: 'Restante',
      description: remainderPayment
        ? `${NumberUtil.currency(remainderPayment.amount)} · ${PaymentMethodMap[remainderPayment.paymentMethod]}`
        : 'Pendente',
      icon: remainderPayment ? (
        <CheckCircleOutlined style={{ color: '#52C41A' }} />
      ) : depositPayment ? (
        <WalletOutlined />
      ) : undefined,
      status: remainderPayment
        ? ('finish' as const)
        : depositPayment
          ? ('process' as const)
          : ('wait' as const),
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={handleConfirm}
      okText={
        paymentType === 'deposit'
          ? 'Confirmar sinal → Status: Confirmado'
          : 'Confirmar pagamento final → Status: Concluído'
      }
      okButtonProps={{
        disabled: isFullyPaid,
        style: { background: '#E06D5B', borderColor: '#E06D5B' },
      }}
      cancelText="Fechar"
      width={520}
      title={null}
      style={{ top: 20 }}
      styles={{
        body: { padding: 0, maxHeight: 'calc(100vh - 220px)', overflowY: 'auto' },
      }}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFF7F5 0%, #FFF0EA 100%)',
          borderBottom: '1px solid #F5E0D8',
          borderRadius: '8px 8px 0 0',
          padding: '20px 24px',
        }}
      >
        <Flex align="center" gap={10} style={{ marginBottom: 4 }}>
          <DollarOutlined style={{ fontSize: 18, color: '#E06D5B' }} />
          <Typography.Title
            level={5}
            style={{ margin: 0, color: '#1A1A1A', fontSize: 15 }}
          >
            Registrar Pagamento
          </Typography.Title>
        </Flex>
        <Typography.Text style={{ fontSize: 12, color: '#888' }}>
          {scheduler.customer?.name} · Pedido #{scheduler.id.slice(-6).toUpperCase()}
        </Typography.Text>
      </div>

      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        {/* Situação atual */}
        {isMobile ? (
          <Alert
            type={isFullyPaid ? 'success' : 'warning'}
            showIcon
            description={
              isFullyPaid
                ? 'Pedido quitado'
                : `Restante: ${NumberUtil.currency(remaining)}`
            }
          />
        ) : (
          <PaymentStatusBadge paidTotal={paidTotal} orderTotal={orderTotal} />
        )}

        {/* Steps de pagamento */}
        <Steps size="small" items={stepItems} style={{ padding: '4px 0' }} />

        <Divider style={{ margin: '0' }} />

        {isFullyPaid ? (
          !isMobile && (
            <Alert
              type="success"
              showIcon
              icon={<CheckCircleOutlined />}
              title="Pedido quitado"
              description="Todos os pagamentos deste pedido foram registrados."
            />
          )
        ) : (
          <Form form={form} layout="vertical">
            {/* Tipo de pagamento (informativo, não editável) */}
            <div
              style={{
                background: paymentType === 'deposit' ? '#E6F4FF' : '#F6FFED',
                border: `1px solid ${paymentType === 'deposit' ? '#91CAFF' : '#B7EB8F'}`,
                borderRadius: 8,
                padding: '10px 14px',
                marginBottom: 16,
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <InfoCircleOutlined
                style={{
                  color: paymentType === 'deposit' ? '#1677FF' : '#52C41A',
                  fontSize: 14,
                  flexShrink: 0,
                }}
              />
              <Typography.Text style={{ fontSize: 13, color: '#595959' }}>
                {paymentType === 'deposit' ? (
                  <>
                    Registrando o <strong>sinal</strong>. Ao confirmar, o pedido irá para{' '}
                    <Tag color="blue" style={{ margin: 0, borderRadius: 10 }}>
                      Confirmado
                    </Tag>
                  </>
                ) : (
                  <>
                    Registrando o <strong>pagamento final</strong>. Ao confirmar, o pedido
                    irá para{' '}
                    <Tag color="green" style={{ margin: 0, borderRadius: 10 }}>
                      Concluído
                    </Tag>
                  </>
                )}
              </Typography.Text>
            </div>

            {/* Meio de pagamento */}
            <Form.Item
              label="Meio de pagamento"
              name="paymentMethod"
              rules={[{ required: true, message: 'Selecione o meio de pagamento' }]}
            >
              <Segmented vertical={isMobile} block options={PAYMENT_OPTIONS as any} />
            </Form.Item>

            {/* Valor */}
            <Form.Item
              label={
                <Flex gap={6} align="center">
                  <span>Valor</span>
                  <Typography.Text style={{ fontSize: 11, color: '#8C8C8C' }}>
                    {paymentType === 'deposit'
                      ? '(pré-calculado como 50% — ajuste se necessário)'
                      : '(pré-calculado como restante — ajuste se necessário)'}
                  </Typography.Text>
                </Flex>
              }
              name="amount"
              rules={[
                { required: true, message: 'Informe o valor' },
                {
                  validator: (_, value) =>
                    value > 0
                      ? Promise.resolve()
                      : Promise.reject('O valor deve ser maior que zero'),
                },
              ]}
            >
              <InputNumber
                disabled={paymentType !== 'deposit'}
                style={{ width: '100%' }}
                min={0.01}
                max={orderTotal}
                precision={2}
                prefix="R$"
                step={1}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
              />
            </Form.Item>

            {/* Observação opcional */}
            <Form.Item label="Observação (opcional)" name="note">
              <Form.Item name="note" noStyle>
                <Input.TextArea rows={2} placeholder="Ex.: pago em espécie na entrega" />
              </Form.Item>
            </Form.Item>
          </Form>
        )}
      </div>
    </Modal>
  );
}
