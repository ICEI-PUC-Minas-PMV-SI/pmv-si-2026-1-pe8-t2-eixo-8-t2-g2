import { useState, useRef, useEffect } from 'react';
import { Button, Flex, Tooltip, Typography, message } from 'antd';
import { DeleteOutlined, ScissorOutlined, UploadOutlined } from '@ant-design/icons';
import { CropModal } from '../product/CropModal';

type Props = {
  currentImageUrl?: string | null;
  onCrop: (blob: Blob | null) => void;
};

export function AboutImageUpload({ currentImageUrl, onCrop }: Props) {
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null);
  const [cropOpen, setCropOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentImageUrl) return;

    let objectUrl: string;
    fetch(currentImageUrl)
      .then((r) => r.blob())
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setRawSrc(objectUrl);
      })
      .catch(() => {
        // silencia erros de CORS/rede — usuário ainda pode trocar manualmente
      });

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [currentImageUrl]);

  const handleFileSelect = (file: File) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowed.includes(file.type)) {
      message.error('Formato não suportado. Use JPG, PNG, WebP ou AVIF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      message.error('Arquivo muito grande. Máximo: 10 MB.');
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setRawSrc(objectUrl);
    setCropOpen(true);
  };

  const handleCropConfirm = (blob: Blob, url: string) => {
    if (previewUrl && previewUrl !== currentImageUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(url);
    onCrop(blob);
    setCropOpen(false);
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl !== currentImageUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setRawSrc(null);
    onCrop(null);
  };

  return (
    <>
      {rawSrc && (
        <CropModal
          open={cropOpen}
          imageSrc={rawSrc}
          aspect={16 / 9}
          onConfirm={handleCropConfirm}
          onCancel={() => {
            setCropOpen(false);
            setRawSrc(null);
          }}
        />
      )}

      <Flex vertical gap={12}>
        {/* Zona de drop / preview */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleFileSelect(file);
          }}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${previewUrl ? '#E06D5B' : '#D9D9D9'}`,
            borderRadius: 12,
            overflow: 'hidden',
            cursor: 'pointer',
            background: previewUrl ? 'transparent' : '#FAFAFA',
            transition: 'all 0.2s',
            // Proporção 16:9 para a imagem hero
            aspectRatio: '16 / 9',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Imagem de destaque"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <>
              <UploadOutlined style={{ fontSize: 32, color: '#8C8C8C' }} />
              <Typography.Text style={{ fontSize: 13, color: '#595959' }}>
                Arraste ou clique para selecionar
              </Typography.Text>
              <Typography.Text style={{ fontSize: 11, color: '#BFBFBF' }}>
                JPG, PNG, WebP, AVIF · máx 10 MB · proporção 16:9 recomendada
              </Typography.Text>
            </>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              e.target.value = '';
            }}
          />
        </div>

        {/* Ações */}
        {previewUrl && (
          <Flex gap={8}>
            <Button
              icon={<ScissorOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                if (rawSrc) setCropOpen(true);
                else inputRef.current?.click();
              }}
              style={{ flex: 1, borderColor: '#E06D5B', color: '#E06D5B' }}
            >
              Recortar
            </Button>
            <Tooltip title="Remover imagem">
              <Button
                danger
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              />
            </Tooltip>
          </Flex>
        )}

        <Typography.Text style={{ fontSize: 11, color: '#BFBFBF' }}>
          A imagem será convertida para WebP e redimensionada automaticamente.
        </Typography.Text>
      </Flex>
    </>
  );
}
