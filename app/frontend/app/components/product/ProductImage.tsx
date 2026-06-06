import { useState } from 'react';
import { Skeleton } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
import { useBreakpoint } from '~/hooks/useBreakpoint';

type ProductImageProps = {
  src?: string;
  alt: string;
  width?: number | string;
  height?: number | string;
};

export function ProductImage({ src, alt, width = 120, height = 82 }: ProductImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const isMobile = useBreakpoint('md');
  const sizePreset = isMobile ? { width: 80, height: 60 } : { width: 120, height: 82 };
  const size = { height: height || sizePreset.height, width: width || sizePreset.width };
  if (!src) {
    return (
      <div
        style={{
          ...size,
          display: 'grid',
          placeItems: 'center',
          background: '#f5f5f5',
          borderRadius: 12,
        }}
      >
        <PictureOutlined />
      </div>
    );
  }

  return (
    <div
      style={{
        ...size,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 12,
        background: '#f5f5f5',
      }}
    >
      {status === 'loading' && (
        <Skeleton.Image
          active
          style={{
            ...size,
          }}
        />
      )}

      {status === 'error' && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <PictureOutlined />
        </div>
      )}

      <img
        src={src}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: status === 'loaded' ? 'block' : 'none',
        }}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  );
}
