import { Button, Flex, message, Modal, Slider, Tag, Typography } from 'antd';
import { useCallback, useState } from 'react';
import { ScissorOutlined, ZoomInOutlined, RotateRightOutlined } from '@ant-design/icons';
import Cropper, { type Area, type Point } from 'react-easy-crop';
import ProductController from '~/controllers/ProductController';

const CARD_ASPECT = 263 / 180;

export function CropModal({
  open,
  imageSrc,
  onConfirm,
  onCancel,
  aspect = CARD_ASPECT,
}: {
  open: boolean;
  imageSrc: string;
  onConfirm: (blob: Blob, previewUrl: string) => void;
  onCancel: () => void;
  aspect?: number;
}) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_: Area, pixelCrop: Area) => {
    setCroppedArea(pixelCrop);
  }, []);

  const handleConfirm = async () => {
    if (!croppedArea) return;
    setLoading(true);
    try {
      const blob = await ProductController.getCroppedImage(
        imageSrc,
        croppedArea,
        rotation,
      );
      const previewUrl = URL.createObjectURL(blob);
      onConfirm(blob, previewUrl);
    } catch {
      message.error('Erro ao recortar imagem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
      title={
        <Flex align="center" gap={8}>
          <ScissorOutlined style={{ color: '#E06D5B' }} />
          <span>Recortar imagem</span>
          <Tag
            style={{
              borderRadius: 20,
              fontSize: 11,
              background: 'rgba(224,109,91,0.1)',
              color: '#C05A48',
              border: 'none',
            }}
          >
            proporção do card travada
          </Tag>
        </Flex>
      }
      styles={{ body: { padding: 0 } }}
    >
      {/* Área de crop */}
      <div style={{ position: 'relative', height: 340, background: '#1A1A1A' }}>
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          style={{
            containerStyle: { borderRadius: 0 },
            cropAreaStyle: {
              border: '2px solid #E06D5B',
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.55)',
            },
          }}
        />
      </div>

      {/* Controles */}
      <div style={{ padding: '16px 24px 20px' }}>
        <Flex vertical gap={12}>
          <Flex align="center" gap={12}>
            <ZoomInOutlined style={{ color: '#8C8C8C', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Typography.Text
                style={{
                  fontSize: 12,
                  color: '#8C8C8C',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Zoom
              </Typography.Text>
              <Slider
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={setZoom}
                tooltip={{ formatter: (v) => `${v?.toFixed(1)}×` }}
              />
            </div>
          </Flex>

          <Flex align="center" gap={12}>
            <RotateRightOutlined style={{ color: '#8C8C8C', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Typography.Text
                style={{
                  fontSize: 12,
                  color: '#8C8C8C',
                  display: 'block',
                  marginBottom: 4,
                }}
              >
                Rotação
              </Typography.Text>
              <Slider
                min={-180}
                max={180}
                step={1}
                value={rotation}
                onChange={setRotation}
                tooltip={{ formatter: (v) => `${v}°` }}
                marks={{ '-90': '-90°', 0: '0°', 90: '90°' }}
              />
            </div>
          </Flex>
        </Flex>

        <Flex justify="flex-end" gap={8} style={{ marginTop: 16 }}>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button
            type="primary"
            loading={loading}
            onClick={handleConfirm}
            style={{ background: '#E06D5B', borderColor: '#E06D5B' }}
          >
            Aplicar recorte
          </Button>
        </Flex>
      </div>
    </Modal>
  );
}
