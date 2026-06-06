import {
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Switch,
  Tag,
  Tooltip,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import type { CreateProductCategoryPayload, ProductCategory } from '~/@types/product';
import ProductCategoryController from '~/controllers/ProductCategoryController';
import { useTableQuery } from '~/hooks/useTableQuery';
import TextUtil from '~/utils/TextUtil';

type PresetPeriod = {
  label: string;
  emoji: string;
  start: { day: number; month: number }; // month: 1-12
  end: { day: number; month: number };
  tooltip?: string;
};

const PRESET_PERIODS: PresetPeriod[] = [
  {
    label: 'Natal',
    emoji: '🎄',
    start: { day: 1, month: 12 },
    end: { day: 31, month: 12 },
    tooltip: 'Panetones, rabanadas, chocotones',
  },
  {
    label: 'Páscoa',
    emoji: '🐣',
    start: { day: 1, month: 3 },
    end: { day: 30, month: 4 },
    tooltip: 'Ovos de Páscoa, trufas, bombons',
  },
  {
    label: 'Dia dos Namorados',
    emoji: '💕',
    start: { day: 1, month: 6 },
    end: { day: 12, month: 6 },
    tooltip: 'Chocolates, bolos decorados, trufas',
  },
  {
    label: 'Dia das Mães',
    emoji: '💐',
    start: { day: 1, month: 5 },
    end: { day: 11, month: 5 },
    tooltip: 'Bolos, cestas, doces finos',
  },
  {
    label: 'Dia dos Pais',
    emoji: '👔',
    start: { day: 1, month: 8 },
    end: { day: 10, month: 8 },
    tooltip: 'Bolos, cestas, doces especiais',
  },
  {
    label: 'Festa Junina',
    emoji: '🌽',
    start: { day: 1, month: 6 },
    end: { day: 30, month: 6 },
    tooltip: 'Pé-de-moleque, paçoca, bolo de milho, canjica',
  },
  {
    label: 'Carnaval',
    emoji: '🎭',
    start: { day: 1, month: 2 },
    end: { day: 28, month: 2 },
    tooltip: 'Doces temáticos, bolos coloridos',
  },
  {
    label: 'Ano Novo',
    emoji: '🥂',
    start: { day: 26, month: 12 },
    end: { day: 1, month: 1 },
    tooltip: 'Lentilha, uva, doces da virada',
  },
  {
    label: 'Dia das Crianças',
    emoji: '🎈',
    start: { day: 1, month: 10 },
    end: { day: 12, month: 10 },
    tooltip: 'Doces coloridos, bolos temáticos, chocolates',
  },
  {
    label: 'Halloween',
    emoji: '🎃',
    start: { day: 15, month: 10 },
    end: { day: 31, month: 10 },
    tooltip: 'Doces temáticos, bolos assombrados',
  },
];

const THIS_YEAR = dayjs().year();

function presetToDayjs(p: { day: number; month: number }, year = THIS_YEAR): Dayjs {
  return dayjs(
    `${year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`,
  );
}

type ValidityPayload =
  | { type: 'none' }
  | {
      type: 'annual';
      startDate: string;
      endDate: string;
    }
  | { type: 'fixed'; startDate: string; endDate: string }; // ISO date strings

type ComponentProps = {
  isOpened: boolean;
  editingCategory?: ProductCategory | null;
  onClose: (reason?: 'cancel' | 'save', productCategory?: ProductCategory) => void;
};

export function ModalAddProductCategory(props: ComponentProps) {
  const { isOpened, onClose, editingCategory } = props;
  const isEditing = !!editingCategory;
  const [selectedPreset, setSelectedPreset] = useState<string>();

  const [hasValidity, setHasValidity] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);

  const {
    tableProps: { dataSource },
  } = useTableQuery<ProductCategory>('product-category', (params) =>
    ProductCategoryController.list<ProductCategory>(params),
  );
  const categories = dataSource || [];

  const [categoryForm] = Form.useForm();

  useEffect(() => {
    if (editingCategory) {
      categoryForm.setFieldsValue(editingCategory);
      let validity = !editingCategory.startsAt || !editingCategory.endsAt ? 'none' : '';
      validity = validity || (editingCategory.isRecurring ? 'annual' : 'fixed');

      if (validity !== 'none') {
        setHasValidity(true);
        setIsAnnual(validity === 'annual');

        if (validity === 'annual') {
          const start = dayjs(editingCategory.startsAt);
          const end = dayjs(editingCategory.endsAt);
          categoryForm.setFieldsValue({
            validityAnnualStart: dayjs(editingCategory.startsAt),
            validityAnnualEnd: dayjs(editingCategory.endsAt),
          });
          const matchedPreset = PRESET_PERIODS.find((preset) => {
            return (
              start.date() === preset.start.day &&
              start.month() + 1 === preset.start.month &&
              end.date() === preset.end.day &&
              end.month() + 1 === preset.end.month
            );
          });

          setSelectedPreset(matchedPreset?.label);
        } else {
          categoryForm.setFieldsValue({
            validityFixedRange: [
              dayjs(editingCategory.startsAt),
              dayjs(editingCategory.endsAt),
            ],
          });
        }
      } else {
        setHasValidity(false);
        setIsAnnual(false);
      }
    } else {
      categoryForm.resetFields();
      setHasValidity(false);
      setIsAnnual(false);
      setSelectedPreset(undefined);
    }
  }, [editingCategory, isOpened]);

  const applyPreset = (preset: PresetPeriod) => {
    setSelectedPreset(preset.label);

    setHasValidity(true);
    setIsAnnual(true);

    categoryForm.setFieldsValue({
      validityAnnualStart: presetToDayjs(preset.start),
      validityAnnualEnd: presetToDayjs(preset.end),
    });
  };

  const buildValidityPayload = (values: any): ValidityPayload => {
    if (!hasValidity) return { type: 'none' };

    if (isAnnual) {
      const start: Dayjs = values.validityAnnualStart;
      const end: Dayjs = values.validityAnnualEnd;
      if (!start || !end) return { type: 'none' };
      return {
        type: 'annual',
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD'),
      };
    }

    const range: [Dayjs, Dayjs] = values.validityFixedRange;
    if (!range || !range[0] || !range[1]) return { type: 'none' };
    return {
      type: 'fixed',
      startDate: range[0].format('YYYY-MM-DD'),
      endDate: range[1].format('YYYY-MM-DD'),
    };
  };

  // -------------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------------
  const handleOk = () => {
    categoryForm.validateFields().then(async (values) => {
      const validity = buildValidityPayload(values);
      const next: CreateProductCategoryPayload = {
        name: values.name,
        slug: values.slug || TextUtil.createSlug(values.name),
        description: values.description,
        isActive: values.isActive ?? true,
        orderIndex: values.orderIndex ?? categories.length + 1,
        startsAt: validity.type === 'none' ? undefined : validity.startDate,
        endsAt: validity.type === 'none' ? undefined : validity.endDate,
        isRecurring: isAnnual,
      };

      let result;
      if (isEditing) {
        result = await ProductCategoryController.update({
          id: editingCategory.id,
          ...next,
        });
      } else {
        result = await ProductCategoryController.create(next);
      }

      message.success(isEditing ? 'Categoria atualizada.' : 'Categoria criada.');
      onClose('save', result);
      categoryForm.resetFields();
      setHasValidity(false);
      setIsAnnual(false);
    });
  };

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <Modal
      title={isEditing ? 'Editar categoria' : 'Nova categoria'}
      getContainer={document.body}
      open={isOpened}
      onCancel={() => onClose('cancel')}
      onOk={handleOk}
      okText={isEditing ? 'Salvar' : 'Criar'}
      cancelText="Cancelar"
      width={600}
    >
      <Form
        layout="vertical"
        form={categoryForm}
        initialValues={{ isActive: true, orderIndex: categories.length + 1 }}
      >
        {/* Dados principais */}
        <Row gutter={16}>
          <Col span={18}>
            <Form.Item label="Nome" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label="Ativa" name="isActive" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item label="Vigência">
              <Switch
                checked={hasValidity}
                onChange={(checked) => {
                  setHasValidity(checked);

                  if (!checked) {
                    setIsAnnual(false);
                    setSelectedPreset(undefined);
                  }
                }}
                checkedChildren="Com vigência"
                unCheckedChildren="Sem vigência"
              />
            </Form.Item>
          </Col>
          <Col span={12} hidden={!hasValidity}>
            <Form.Item label="Repetição anual">
              <Switch
                checked={isAnnual}
                onChange={(checked) => {
                  setIsAnnual(checked);

                  if (!checked) {
                    setSelectedPreset(undefined);
                  }
                }}
                checkedChildren="Repete todo ano"
                unCheckedChildren="Data fixa"
              />
            </Form.Item>
          </Col>
        </Row>

        {hasValidity && (
          <>
            {/* Picker anual — apenas dia/mês */}
            {isAnnual && (
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Início (dia/mês)"
                    name="validityAnnualStart"
                    rules={[{ required: true, message: 'Informe o início' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      inputReadOnly
                      format="DD/MM"
                      picker="date"
                      renderExtraFooter={() => null}
                      showNow={false}
                      placeholder="DD/MM"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Fim (dia/mês)"
                    name="validityAnnualEnd"
                    rules={[{ required: true, message: 'Informe o fim' }]}
                  >
                    <DatePicker
                      style={{ width: '100%' }}
                      format="DD/MM"
                      showNow={false}
                      placeholder="DD/MM"
                    />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {/* Picker de data fixa — dia/mês/ano, range */}
            {!isAnnual && (
              <Form.Item
                label="Período"
                name="validityFixedRange"
                rules={[{ required: true, message: 'Informe o período' }]}
              >
                <DatePicker.RangePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder={['Data início', 'Data fim']}
                />
              </Form.Item>
            )}
            <Form.Item label="Períodos comemorativos">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {PRESET_PERIODS.map((preset) => (
                  <Tooltip key={preset.label} title={preset.tooltip}>
                    <Tag
                      color={selectedPreset === preset.label ? 'blue' : undefined}
                      style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        fontSize: 16,
                        padding: '2px 10px',
                      }}
                      onClick={() => applyPreset(preset)}
                    >
                      {preset.emoji} {preset.label}
                    </Tag>
                  </Tooltip>
                ))}
              </div>
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
}
