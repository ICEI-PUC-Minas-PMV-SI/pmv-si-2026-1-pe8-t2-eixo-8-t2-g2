import {
  Modal,
  Rate,
  Input,
  Button,
  Typography,
  Flex,
  Tag,
  Divider,
  Checkbox,
  message,
} from 'antd';
import {
  StarOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import type { Scheduler } from '~/@types/scheduler';
import DateUtil from '~/utils/DateUtil';
import NumberUtil from '~/utils/NumberUtil';
import { RATING_COLOR } from '~/constants/Colors';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ReviewPayload = {
  schedulerId: string;
  rating: number;
  comment?: string;
};

export type IgnorePayload = {
  schedulerIds: string[];
};

type ReviewState = {
  rating: number;
  comment: string;
  submitted: boolean;
};

type Props =
  | {
      // Modo lista: abre automaticamente com vários pedidos pendentes
      mode: 'list';
      open: boolean;
      schedulers: Scheduler[];
      onClose: () => void;
      onSubmitReview: (payload: ReviewPayload) => Promise<void>;
      onIgnore: (payload: IgnorePayload) => Promise<void>;
    }
  | {
      // Modo individual: abre a partir do clique na SchedulerList
      mode: 'single';
      open: boolean;
      scheduler: Scheduler;
      existingReview?: { rating: number; comment?: string | null };
      onClose: () => void;
      onSubmitReview: (payload: ReviewPayload) => Promise<void>;
    };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STAR_LABELS: Record<number, string> = {
  1: 'Muito ruim',
  2: 'Ruim',
  3: 'Regular',
  4: 'Bom',
  5: 'Excelente!',
};

function getOrderTotal(scheduler: Scheduler): number {
  return (scheduler.items ?? []).reduce(
    (acc, item) => acc + (item.priceAtBooking ?? 0) * item.quantity,
    0,
  );
}

function OrderSummaryCard({ scheduler }: { scheduler: Scheduler }) {
  const total = getOrderTotal(scheduler);
  const itemCount = scheduler.items?.length ?? 0;

  return (
    <div
      style={{
        background: '#FDFAF9',
        border: '1px solid #F0E8E5',
        borderRadius: 10,
        padding: '12px 16px',
      }}
    >
      <Flex justify="space-between" align="flex-start">
        <div>
          <Typography.Text strong style={{ fontSize: 14, color: '#1A1A1A' }}>
            {scheduler.customer?.name}
          </Typography.Text>
          <Typography.Text
            style={{ fontSize: 12, color: '#8C8C8C', display: 'block', marginTop: 2 }}
          >
            {DateUtil.format(scheduler.scheduledAt)} · {itemCount}{' '}
            {itemCount === 1 ? 'item' : 'itens'}
          </Typography.Text>
          {scheduler.items?.slice(0, 2).map((item) => (
            <Typography.Text
              key={item.id}
              style={{ fontSize: 12, color: '#595959', display: 'block', marginTop: 2 }}
            >
              {item.quantity}× {item.product?.name}
            </Typography.Text>
          ))}
          {(scheduler.items?.length ?? 0) > 2 && (
            <Typography.Text style={{ fontSize: 11, color: '#8C8C8C' }}>
              +{scheduler.items!.length - 2} mais
            </Typography.Text>
          )}
        </div>
        <Tag
          style={{
            borderRadius: 20,
            fontWeight: 600,
            color: '#389E0D',
            borderColor: '#B7EB8F',
            background: '#F6FFED',
            flexShrink: 0,
          }}
        >
          {NumberUtil.currency(total)}
        </Tag>
      </Flex>
    </div>
  );
}

function RatingForm({
  value,
  onChange,
}: {
  value: ReviewState;
  onChange: (v: Partial<ReviewState>) => void;
}) {
  return (
    <Flex vertical gap={16} align="center" style={{ width: '100%' }}>
      <Flex vertical align="center" gap={8}>
        <Rate
          value={value.rating}
          onChange={(r) => onChange({ rating: r })}
          style={{ fontSize: 36 }}
        />
        {value.rating > 0 && (
          <Tag
            style={{
              borderRadius: 20,
              fontWeight: 600,
              fontSize: 13,
              color: RATING_COLOR[value.rating],
              borderColor: `${RATING_COLOR[value.rating]}40`,
              background: `${RATING_COLOR[value.rating]}12`,
              padding: '2px 14px',
            }}
          >
            {STAR_LABELS[value.rating]}
          </Tag>
        )}
      </Flex>
      <Input.TextArea
        placeholder="Conte como foi sua experiência (opcional)..."
        value={value.comment}
        onChange={(e) => onChange({ comment: e.target.value })}
        rows={3}
        maxLength={300}
        showCount
        style={{ borderRadius: 8 }}
      />
    </Flex>
  );
}

// ─── Modo lista ───────────────────────────────────────────────────────────────

function ListMode(props: Extract<Props, { mode: 'list' }>) {
  const { open, schedulers, onClose, onSubmitReview, onIgnore } = props;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [ignoreAll, setIgnoreAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState<Record<string, ReviewState>>({});

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setCurrentIndex(0);
      setIgnoreAll(false);
      setReviews({});
    }
  }, [open]);

  const current = schedulers[currentIndex];
  const total = schedulers.length;
  const isLast = currentIndex === total - 1;

  const currentReview = reviews[current?.id] ?? {
    rating: 0,
    comment: '',
    submitted: false,
  };

  const updateReview = (partial: Partial<ReviewState>) => {
    if (!current) return;
    setReviews((prev) => ({
      ...prev,
      [current.id]: { ...currentReview, ...partial },
    }));
  };

  const handleSubmitCurrent = async () => {
    if (!current || currentReview.rating === 0) {
      message.warning('Selecione pelo menos 1 estrela para avaliar.');
      return;
    }
    setLoading(true);
    try {
      await onSubmitReview({
        schedulerId: current.id,
        rating: currentReview.rating,
        comment: currentReview.comment || undefined,
      });
      updateReview({ submitted: true });
      if (!isLast) setCurrentIndex((i) => i + 1);
      else onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSkipCurrent = () => {
    if (!isLast) setCurrentIndex((i) => i + 1);
    else onClose();
  };

  const handleIgnoreAll = async () => {
    setLoading(true);
    try {
      await onIgnore({ schedulerIds: schedulers.map((s) => s.id) });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const submittedCount = Object.values(reviews).filter((r) => r.submitted).length;

  if (!current) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={500}
      title={null}
      styles={{ body: { padding: 0 } }}
      closable
      closeIcon={<CloseOutlined />}
    >
      {/* Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFF7F5 0%, #FFF0EA 100%)',
          borderBottom: '1px solid #F5E0D8',
          borderRadius: '8px 8px 0 0',
          padding: '20px 24px 16px',
        }}
      >
        <Flex align="center" gap={10} style={{ marginBottom: 12 }}>
          <StarOutlined style={{ fontSize: 18, color: '#E06D5B' }} />
          <div>
            <Typography.Title
              level={5}
              style={{ margin: 0, fontSize: 15, color: '#1A1A1A' }}
            >
              Avalie seus pedidos
            </Typography.Title>
            <Typography.Text style={{ fontSize: 12, color: '#8C8C8C' }}>
              {submittedCount} de {total} avaliado{submittedCount !== 1 ? 's' : ''}
            </Typography.Text>
          </div>
        </Flex>

        {/* Progress dots */}
        <Flex gap={6} align="center">
          {schedulers.map((s, i) => {
            const submitted = reviews[s.id]?.submitted;
            const isCurrent = i === currentIndex;
            return (
              <div
                key={s.id}
                style={{
                  width: isCurrent ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: submitted ? '#52C41A' : isCurrent ? '#E06D5B' : '#E8D5CF',
                  transition: 'all 0.25s ease',
                  cursor: 'pointer',
                }}
                onClick={() => setCurrentIndex(i)}
              />
            );
          })}
        </Flex>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <OrderSummaryCard scheduler={current} />

        {currentReview.submitted ? (
          <Flex
            vertical
            align="center"
            gap={8}
            style={{
              padding: '24px 0',
              color: '#52C41A',
            }}
          >
            <CheckCircleOutlined style={{ fontSize: 36 }} />
            <Typography.Text strong style={{ color: '#389E0D' }}>
              Avaliação enviada!
            </Typography.Text>
          </Flex>
        ) : (
          <RatingForm value={currentReview} onChange={updateReview} />
        )}

        <Divider style={{ margin: '4px 0' }} />

        {/* Ações */}
        <Flex vertical gap={8}>
          {!currentReview.submitted && (
            <Button
              type="primary"
              block
              loading={loading}
              disabled={currentReview.rating === 0}
              onClick={handleSubmitCurrent}
              style={{
                background: '#E06D5B',
                borderColor: '#E06D5B',
                borderRadius: 8,
                height: 40,
                fontWeight: 600,
              }}
            >
              {isLast ? 'Enviar avaliação' : 'Enviar e próximo'}
            </Button>
          )}

          {currentReview.submitted && !isLast && (
            <Button
              type="primary"
              block
              onClick={() => setCurrentIndex((i) => i + 1)}
              style={{
                background: '#E06D5B',
                borderColor: '#E06D5B',
                borderRadius: 8,
                height: 40,
                fontWeight: 600,
              }}
            >
              Próximo pedido <RightOutlined />
            </Button>
          )}

          {!currentReview.submitted && (
            <Button block onClick={handleSkipCurrent} style={{ borderRadius: 8 }}>
              {isLast ? 'Pular' : 'Pular este'}
            </Button>
          )}

          {/* Não perguntar novamente */}
          <Flex
            justify="center"
            align="center"
            gap={8}
            style={{ paddingTop: 4, cursor: 'pointer' }}
            onClick={() => setIgnoreAll((v) => !v)}
          >
            <Checkbox checked={ignoreAll} />
            <Typography.Text
              style={{ fontSize: 12, color: '#8C8C8C', userSelect: 'none' }}
            >
              Não perguntar novamente sobre estes pedidos
            </Typography.Text>
          </Flex>

          {ignoreAll && (
            <Button
              danger
              block
              loading={loading}
              onClick={handleIgnoreAll}
              style={{ borderRadius: 8 }}
            >
              Confirmar — ignorar todos
            </Button>
          )}
        </Flex>
      </div>
    </Modal>
  );
}

// ─── Modo individual ──────────────────────────────────────────────────────────

function SingleMode(props: Extract<Props, { mode: 'single' }>) {
  const { open, scheduler, existingReview, onClose, onSubmitReview } = props;
  const isEditing = !!existingReview;

  const [review, setReview] = useState<ReviewState>({
    rating: existingReview?.rating ?? 0,
    comment: existingReview?.comment ?? '',
    submitted: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setReview({
        rating: existingReview?.rating ?? 0,
        comment: existingReview?.comment ?? '',
        submitted: false,
      });
    }
  }, [open, existingReview]);

  const handleSubmit = async () => {
    if (review.rating === 0) {
      message.warning('Selecione pelo menos 1 estrela.');
      return;
    }
    setLoading(true);
    try {
      await onSubmitReview({
        schedulerId: scheduler.id,
        rating: review.rating,
        comment: review.comment || undefined,
      });
      setReview((r) => ({ ...r, submitted: true }));
      setTimeout(onClose, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={460}
      title={null}
      styles={{ body: { padding: 0 } }}
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
        <Flex align="center" gap={10}>
          <StarOutlined style={{ fontSize: 18, color: '#E06D5B' }} />
          <div>
            <Typography.Title
              level={5}
              style={{ margin: 0, fontSize: 15, color: '#1A1A1A' }}
            >
              {isEditing ? 'Editar avaliação' : 'Avaliar pedido'}
            </Typography.Title>
            <Typography.Text style={{ fontSize: 12, color: '#8C8C8C' }}>
              Pedido #{scheduler.id.slice(-6).toUpperCase()}
            </Typography.Text>
          </div>
        </Flex>
      </div>

      <div
        style={{
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <OrderSummaryCard scheduler={scheduler} />

        {review.submitted ? (
          <Flex
            vertical
            align="center"
            gap={8}
            style={{ padding: '24px 0', color: '#52C41A' }}
          >
            <CheckCircleOutlined style={{ fontSize: 40 }} />
            <Typography.Text strong style={{ color: '#389E0D', fontSize: 15 }}>
              Avaliação {isEditing ? 'atualizada' : 'enviada'}!
            </Typography.Text>
          </Flex>
        ) : (
          <>
            <RatingForm
              value={review}
              onChange={(partial) => setReview((r) => ({ ...r, ...partial }))}
            />
            <Button
              type="primary"
              block
              loading={loading}
              disabled={review.rating === 0}
              onClick={handleSubmit}
              style={{
                background: '#E06D5B',
                borderColor: '#E06D5B',
                borderRadius: 8,
                height: 40,
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              {isEditing ? 'Atualizar avaliação' : 'Enviar avaliação'}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}

// ─── Export unificado ─────────────────────────────────────────────────────────

export function ReviewModal(props: Props) {
  if (props.mode === 'list') return <ListMode {...props} />;
  return <SingleMode {...props} />;
}
