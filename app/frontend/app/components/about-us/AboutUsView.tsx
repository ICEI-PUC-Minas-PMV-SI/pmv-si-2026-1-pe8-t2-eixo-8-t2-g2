import { useQuery } from '@tanstack/react-query';
import AboutController from '~/controllers/AboutController';
import AboutItemController from '~/controllers/AboutItemController';
import type { AboutItem } from '~/@types/about';

const MOCK_PRODUCTS = [
  { id: 1, name: 'Churrito', category: 'Biscoito Artesanal', price: 'R$ 25,00' },
  { id: 2, name: 'Casadinho', category: 'Biscoito Artesanal', price: 'R$ 20,00' },
  { id: 3, name: 'Biscoito de Baunilha e Ninho', category: 'Biscoito Artesanal', price: 'R$ 25,00' },
  { id: 4, name: 'Canelinha', category: 'Biscoito Artesanal', price: 'R$ 30,00' },
];

export function AboutUsView() {
  const { data: about } = useQuery({
    queryKey: ['about-page-info'],
    queryFn: () => AboutController.getPage(),
    staleTime: 60 * 60 * 1000,
  });

    const { data: itemsData } = useQuery<{ data: AboutItem[] }>({
    queryKey: ['about-item'],
    queryFn: () => AboutItemController.list({ page: 1, pageSize: 100, filters: {}, sorters: [], search: '' }),
    });

  const items = itemsData?.data ?? [];

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#2c2c2c' }}>
        {/* <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
            {about?.title ?? 'Quem Somos'}
        </h2> */}


      {/* Banner */}
      <div style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 48,
        minHeight: 320,
        background: '#e8e0d8',
        display: 'flex',
        alignItems: 'center',
      }}>
        <div style={{ flex: 1, padding: '48px 56px', zIndex: 1 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16, lineHeight: 1.2 }}>
            {about?.subtitle ?? 'Olá! Eu sou a Isabella!'}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 16, maxWidth: 360, color: '#444' }}>
            {about?.main}
          </p>
          {about?.complementary && (
            <p style={{ fontSize: 15, lineHeight: 1.8, maxWidth: 360, color: '#444' }}>
              {about.complementary}
            </p>
          )}
        </div>
        {/* placeholder da imagem */}
        <div style={{
          width: 340,
          minHeight: 320,
          background: '#cfc5bb',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: 13,
        }}>
          Imagem de destaque
        </div>
      </div>

      {/* Diferenciais */}
      {items.length > 0 && (
        <div style={{ marginBottom: 56, textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 32 }}>
            Nossos diferenciais
          </h2>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'nowrap' }}>
            {items.slice(0, 5).map((item) => (
                <div key={item.id} style={{
                    border: '1px solid #e8e8e8',
                    borderRadius: 12,
                    padding: '28px 20px',
                    flex: 1, 
                    minWidth: 120,    
                    display: 'flex',
                    overflow: 'hidden',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                    background: '#fff',
                }}>
                {item.icon
                  ? <img src={item.icon} alt={item.text} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                  : <div style={{ width: 48, height: 48, background: '#f5f5f5', borderRadius: 8 }} />
                }
                <span style={{ fontSize: 13, color: '#444', textAlign: 'center', lineHeight: 1.5, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Produtos mockados */}
      <div style={{ marginBottom: 32, textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 32 }}>
          Alguns dos nossos itens mais vendidos
        </h2>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {MOCK_PRODUCTS.map((p) => (
            <div key={p.id} style={{
              border: '1px solid #e8e8e8',
              borderRadius: 12,
              overflow: 'hidden',
              width: 180,
              background: '#fff',
              textAlign: 'left',
            }}>
              <div style={{ height: 140, background: '#f0ebe5' }} />
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{p.category}</div>
                <div style={{ color: '#c0392b', fontWeight: 600, fontSize: 14, marginBottom: 10 }}>{p.price}</div>
                <button style={{
                  width: '100%',
                  padding: '6px 0',
                  border: '1px solid #c0392b',
                  borderRadius: 6,
                  background: 'transparent',
                  color: '#c0392b',
                  fontSize: 12,
                  cursor: 'pointer',
                }}>
                  Ver detalhes
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}