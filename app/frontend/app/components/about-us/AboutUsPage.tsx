import {
  Button,
  Card,
  Col,
  message,
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
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '~/hooks/useAuthStore'; //para o tipo da página
import AuthController from '~/controllers/AuthController';
import AboutController from '~/controllers/AboutController';
import { AboutItemList } from './AboutItemList';
import { AboutUsView } from './AboutUsView';
import { ModalAddAboutItem } from '../about-us/ModalAddAboutItem';


export function AboutUsPage() {
  const [aboutForm] = Form.useForm<About>();
  const [aboutImage, setAboutImage] = useState<UploadFile[]>([]);
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const isAdmin = useAuthStore((state) => state.isAdmin());

  const [refetchItems, setRefetchItems] = useState<() => void>(() => () => {});

  const queryClient = useQueryClient();
  const aboutInfo = useQuery({
    queryKey: ['about-page-info'],
    queryFn: () => {
      return AboutController.getPage();
    },
    staleTime: 60 * 60 * 1000,
  });

  const saveAboutInfo = async () => {
    try {
      let result = null;
      const values = await aboutForm.validateFields();
      console.log('Dados do formulário:', values);
      result = await AboutController.create({
        title: values.title,
        subtitle: values.subtitle,
        main: values.main,
        complementary: values.complementary
      });

      if(result){
        message.success('Alterações salvas com sucesso.');
        queryClient.invalidateQueries({ queryKey: ['about-page-info'] });
      }
      
    } catch (error) {
      console.error('Erro ao criar/editar informações:', error);
    }
  };

  useEffect(() => {
    if (aboutInfo) {
      aboutForm.setFieldsValue({
        title: aboutInfo.data?.title,
        subtitle: aboutInfo.data?.subtitle,
        main: aboutInfo.data?.main,
        complementary: aboutInfo.data?.complementary,
      });

    }
  }, [aboutForm, aboutInfo]);
  if (!isAdmin) {
    return <AboutUsView />;
  }
  else{
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
                    <Input minLength={5} 
                    maxLength={20}
                          showCount
                    />
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
                    <Input minLength={5} maxLength={80}
                          showCount
                      />
                  </Form.Item>
                  <Form.Item label="Texto Principal" name="main">
                      <Input.TextArea
                          rows={4}
                          minLength={5} 
                          maxLength={500}
                          showCount
                      />
                  </Form.Item>
                  <Form.Item label="Texto Complementar" name="complementary">
                      <Input.TextArea
                          rows={4}
                          minLength={5}
                          maxLength={500}
                          showCount
                      />
                  </Form.Item>
                  <AboutItemList setItemModalOpen={setItemModalOpen} />
                  <Button type="primary" icon={<CheckCircleOutlined />}
                    onClick={() => {
                        saveAboutInfo();
                      }}
                    >
                    Salvar alterações
                  </Button>
                  <ModalAddAboutItem
                    isOpened={itemModalOpen}
                    onClose={(reason) => {setItemModalOpen(false);
                      if(reason == 'save'){
                        message.success('Alterações salvas com sucesso.');
                      }
                    }}
                  />
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

      </Row>
    );
  }
}
