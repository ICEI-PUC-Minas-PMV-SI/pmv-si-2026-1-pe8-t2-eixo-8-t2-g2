import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Upload,
  type UploadFile,
  Progress,
  Space,
  Typography,
  Switch,
} from 'antd';
import { useEffect, useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import type { About } from '~/@types/about';
import { CheckCircleOutlined, LockOutlined } from '@ant-design/icons';
import { useAuthStore } from '~/hooks/useAuthStore'; //para o tipo da página
import AuthController from '~/controllers/AuthController';

export function AboutUsPage() {
  const [aboutForm] = Form.useForm<About>();
  const [aboutImage, setAboutImage] = useState<UploadFile[]>([]);

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={24}>
        <Card title="Conteúdo da Página">
          <Form
            layout="vertical"
            form={aboutForm}
          >
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item label="Título da Página" name="title">
                  <Input maxLength={20}/>
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
                            <div style={{ marginTop: 8 }}>Upload</div>
                        </div>
                        )}
                    </Upload>
                </Form.Item>
                <Form.Item label="Título da Seção" name="subtitle">
                  <Input maxLength={80}
                        showCount
                    />
                </Form.Item>
                <Form.Item label="Texto Principal" name="main">
                    <Input.TextArea
                        rows={4}
                        maxLength={500}
                        showCount
                    />
                </Form.Item>
                <Form.Item label="Texto Complementar" name="complementary">
                    <Input.TextArea
                        rows={4}
                        maxLength={500}
                        showCount
                    />
                </Form.Item>
                <Button type="primary" icon={<CheckCircleOutlined />}>
                  Salvar perfil
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </Col>

    </Row>
  );
}
