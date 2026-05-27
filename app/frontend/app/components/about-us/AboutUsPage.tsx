import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Upload,
  message,
  type UploadFile,
} from 'antd';

import { CheckCircleOutlined, PlusOutlined } from '@ant-design/icons';

import { useEffect, useRef, useState } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { About, AboutItem } from '~/@types/about';

import { useAuthStore } from '~/hooks/useAuthStore';

import AboutController from '~/controllers/AboutController';

import { AboutItemList } from './AboutItemList';
import { AboutUsView } from './AboutUsView';

export function AboutUsPage() {
  const [aboutForm] = Form.useForm<About>();

  const isAdmin = useAuthStore((state) => state.isAdmin());

  const queryClient = useQueryClient();

  const initializedRef = useRef(false);

  const [items, setItems] = useState<AboutItem[]>([]);

  const [saving, setSaving] = useState(false);

  const [aboutImage, setAboutImage] = useState<UploadFile[]>([]);

  const aboutInfo = useQuery({
    queryKey: ['about-page-info'],
    queryFn: () => AboutController.find(),
    staleTime: 1000 * 60 * 60,
  });

  useEffect(() => {
    if (!aboutInfo.data || initializedRef.current || !isAdmin) {
      return;
    }

    initializedRef.current = true;

    const data = aboutInfo.data;

    setItems(data.items || []);

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

      await AboutController.create({
        title: values.title,
        subtitle: values.subtitle,
        main: values.main,
        complementary: values.complementary,

        items,
      });

      message.success('Alterações salvas com sucesso.');

      queryClient.invalidateQueries({
        queryKey: ['about-page-info'],
      });
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
    <Row gutter={[16, 16]}>
      <Col span={24}>
        <Card title="Conteúdo da Página">
          <Form layout="vertical" form={aboutForm}>
            <Form.Item label="Título da Página" name="title">
              <Input minLength={5} maxLength={20} showCount />
            </Form.Item>

            <Form.Item label="Imagem de destaque">
              <Upload
                listType="picture-card"
                fileList={aboutImage}
                onChange={({ fileList }) => setAboutImage(fileList)}
                beforeUpload={() => false}
                maxCount={1}
              >
                {aboutImage.length >= 1 ? null : (
                  <div>
                    <PlusOutlined />
                    <div
                      style={{
                        marginTop: 8,
                      }}
                    >
                      Upload
                    </div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item label="Título da Seção" name="subtitle">
              <Input minLength={5} maxLength={80} showCount />
            </Form.Item>

            <Form.Item label="Texto Principal" name="main">
              <Input.TextArea rows={4} minLength={5} maxLength={500} showCount />
            </Form.Item>

            <Form.Item label="Texto Complementar" name="complementary">
              <Input.TextArea rows={4} minLength={5} maxLength={500} showCount />
            </Form.Item>

            <AboutItemList items={items} onChange={setItems} />

            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={saving}
              onClick={saveAboutInfo}
            >
              Salvar alterações
            </Button>
          </Form>
        </Card>
      </Col>
    </Row>
  );
}
