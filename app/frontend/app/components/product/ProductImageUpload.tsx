import { useState, useRef, useEffect } from 'react';

import { Button, Typography, Flex, Tooltip, message } from 'antd';
import { UploadOutlined, DeleteOutlined, ScissorOutlined } from '@ant-design/icons';
import type { PublicProduct } from '~/@types/product';
import { CropModal } from './CropModal';
import { ProductCardPreview } from './ProductCardPreview';

type Props = {
  currentImageUrl?: string | null;
  onCrop: (blob: Blob | null) => void;
  productPreview?: Partial<PublicProduct>;
};

export function ProductImageUpload({ currentImageUrl, onCrop, productPreview }: Props) {
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null);
  const [cropOpen, setCropOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Adicionar esse useEffect logo após os useState
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
        // silencia: CORS ou rede — o usuário ainda pode trocar a imagem manualmente
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

  const displayUrl = previewUrl;

  return (
    <>
      {rawSrc && (
        <CropModal
          open={cropOpen}
          imageSrc={rawSrc}
          onConfirm={handleCropConfirm}
          onCancel={() => {
            setCropOpen(false);
            setRawSrc(null);
          }}
        />
      )}

      <Flex gap={24} align="flex-start" wrap="wrap">
        {/* Coluna esquerda: upload + ações */}
        <Flex vertical gap={12} style={{ flex: '1 1 200px', minWidth: 200 }}>
          {/* Zona de drop */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFileSelect(file);
            }}
            onClick={() => inputRef.current?.click()}
            style={{
              border: `2px dashed ${displayUrl ? '#E06D5B' : '#D9D9D9'}`,
              borderRadius: 10,
              padding: '20px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              background: displayUrl ? 'rgba(224,109,91,0.03)' : '#FAFAFA',
              transition: 'all 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Thumbnail da imagem atual dentro da zona */}
            {displayUrl ? (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <img
                  src={displayUrl}
                  alt="Imagem atual"
                  style={{
                    width: '100%',
                    maxWidth: 180,
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 8,
                    display: 'block',
                    margin: '0 auto 8px',
                  }}
                />
              </div>
            ) : (
              <UploadOutlined
                style={{
                  fontSize: 28,
                  color: '#8C8C8C',
                  marginBottom: 8,
                  display: 'block',
                }}
              />
            )}

            <Typography.Text style={{ fontSize: 13, color: '#595959', display: 'block' }}>
              {displayUrl ? 'Clique para trocar' : 'Arraste ou clique para selecionar'}
            </Typography.Text>
            <Typography.Text
              style={{ fontSize: 11, color: '#BFBFBF', display: 'block', marginTop: 2 }}
            >
              JPG, PNG, WebP, AVIF · máx 10 MB
            </Typography.Text>

            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
                // reset para permitir re-selecionar o mesmo arquivo
                e.target.value = '';
              }}
            />
          </div>

          {/* Ações */}
          {displayUrl && (
            <Flex gap={8}>
              <Button
                icon={<ScissorOutlined />}
                onClick={() => {
                  if (rawSrc) setCropOpen(true);
                  else inputRef.current?.click();
                }}
                style={{ flex: 1, borderColor: '#E06D5B', color: '#E06D5B' }}
              >
                Recortar
              </Button>
              <Tooltip title="Remover imagem">
                <Button danger icon={<DeleteOutlined />} onClick={handleRemove} />
              </Tooltip>
            </Flex>
          )}

          <Typography.Text style={{ fontSize: 11, color: '#BFBFBF' }}>
            A imagem será convertida para WebP e redimensionada automaticamente.
          </Typography.Text>
        </Flex>

        {/* Coluna direita: preview do card */}
        <Flex vertical gap={8} align="center" style={{ flexShrink: 0 }}>
          <Typography.Text
            style={{
              fontSize: 11,
              color: '#8C8C8C',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              fontWeight: 500,
            }}
          >
            Pré-visualização do card
          </Typography.Text>
          <ProductCardPreview imageUrl={displayUrl} product={productPreview} />
        </Flex>
      </Flex>
    </>
  );
}
