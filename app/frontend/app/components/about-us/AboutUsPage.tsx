import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Space,
  Typography,
  message,
} from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { About, AboutItem } from '~/@types/about';
import { useAuthStore } from '~/hooks/useAuthStore';
import AboutController from '~/controllers/AboutController';
import { AboutItemList } from './AboutItemList';
import { AboutImageUpload } from './AboutImageUpload';
import { AboutPagePreview } from './AboutPagePreview';
import { AboutUsView } from './AboutUsView';

export function AboutUsPage() {
  const [aboutForm] = Form.useForm<About>();
  const isAdmin = useAuthStore((state) => state.isAdmin());
  const queryClient = useQueryClient();
  const initializedRef = useRef(false);
  const croppedImageRef = useRef<Blob | null>(null);

  const [items, setItems] = useState<AboutItem[]>([]);
  const [saving, setSaving] = useState(false);

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const watchedTitle = Form.useWatch('title', aboutForm);
  const watchedSubtitle = Form.useWatch('subtitle', aboutForm);
  const watchedMain = Form.useWatch('main', aboutForm);

  const aboutInfo = useQuery({
    queryKey: ['about-page-info'],
    queryFn: () => AboutController.find(),
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (!aboutInfo.data || initializedRef.current || !isAdmin) return;

    initializedRef.current = true;
    const data = aboutInfo.data;

    setItems(data.items || []);
    setPreviewImageUrl(data.imageUrl ?? null);

    aboutForm.setFieldsValue({
      title: data.title,
      subtitle: data.subtitle,
      main: data.main,
      complementary: data.complementary,
    });
  }, [aboutInfo.data]);

  const saveAboutInfo = async () => {
    try {
      setSaving(true);
      const values = await aboutForm.validateFields();

      await AboutController.create(
        {
          title: values.title,
          subtitle: values.subtitle,
          main: values.main,
          complementary: values.complementary,
          items,
        },
        croppedImageRef.current,
        !!previewImageUrl,
      );

      croppedImageRef.current = null;
      message.success('Alterações salvas com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['about-page-info'] });
    } catch (error) {
      console.error(error);
      message.error('Erro ao salvar alterações.');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return <AboutUsView />;
  }

  return (
    <Space orientation="vertical" size="large" style={{ width: '100%', padding: 16 }}>
      <Row gutter={[24, 24]}>
        {/* ── Coluna de edição ── */}
        <Col xs={24} xl={14}>
          <Card title="Conteúdo da Página">
            <Form layout="vertical" form={aboutForm}>
              <Form.Item
                label="Título da Página"
                name="title"
                rules={[{ min: 5, max: 80 }]}
              >
                <Input minLength={5} maxLength={80} showCount />
              </Form.Item>

              <Form.Item
                label="Título da Seção (exibido como tag acima do título)"
                name="subtitle"
                rules={[{ min: 5, max: 80 }]}
              >
                <Input minLength={5} maxLength={80} showCount />
              </Form.Item>

              <Form.Item
                label="Imagem de destaque"
                tooltip="Proporção 16:9 recomendada. A imagem ficará ao lado do texto na seção hero."
              >
                <AboutImageUpload
                  currentImageUrl={aboutInfo.data?.imageUrl}
                  onCrop={(blob) => {
                    croppedImageRef.current = blob;
                    // Atualiza a URL do preview em tempo real
                    if (blob) {
                      const url = URL.createObjectURL(blob);
                      setPreviewImageUrl((prev) => {
                        // Revoga a URL anterior se era um blob local
                        if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
                        return url;
                      });
                    } else {
                      setPreviewImageUrl(null);
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Texto Principal"
                name="main"
                rules={[{ min: 5, max: 500 }]}
              >
                <Input.TextArea rows={4} minLength={5} maxLength={500} showCount />
              </Form.Item>

              <Form.Item
                label="Texto Complementar"
                name="complementary"
                rules={[{ max: 500 }]}
              >
                <Input.TextArea rows={4} maxLength={500} showCount />
              </Form.Item>

              <AboutItemList items={items} onChange={setItems} />

              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                loading={saving}
                onClick={saveAboutInfo}
                style={{ marginTop: 8 }}
              >
                Salvar alterações
              </Button>
            </Form>
          </Card>
        </Col>

        {/* ── Coluna de preview ── */}
        <Col xs={24} xl={10}>
          <Card
            title="Pré-visualização"
            style={{ position: 'sticky', top: 16 }}
            styles={{ body: { display: 'flex', justifyContent: 'center', padding: 24 } }}
          >
            <Flex vertical align="center" gap={12}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Atualiza automaticamente enquanto você edita
              </Typography.Text>
              <AboutPagePreview
                imageUrl={previewImageUrl}
                about={{
                  title: watchedTitle,
                  subtitle: watchedSubtitle,
                  main: watchedMain,
                  items,
                }}
              />
            </Flex>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
