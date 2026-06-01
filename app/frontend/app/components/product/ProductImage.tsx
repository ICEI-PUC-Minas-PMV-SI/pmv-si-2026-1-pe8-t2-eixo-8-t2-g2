import { useState } from 'react';
import { Skeleton } from 'antd';
import { PictureOutlined } from '@ant-design/icons';

type ProductImageProps = {
  src?: string;
  alt: string;
};

export function ProductImage({ src, alt }: ProductImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  if (!src) {
    return (
      <div
        style={{
          width: 120,
          height: 82,
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
        width: 120,
        height: 82,
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
            width: 120,
            height: 82,
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
