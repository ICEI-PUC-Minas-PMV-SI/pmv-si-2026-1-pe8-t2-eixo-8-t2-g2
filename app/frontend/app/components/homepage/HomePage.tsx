import { useState } from 'react';
import { Layout, Typography, Button, Tag, Space, Grid, message } from 'antd';
import { CalendarOutlined, HeartOutlined } from '@ant-design/icons';
import AppHeader from '../header/AppHeader';
import { AppFooter } from '../footer';
import { useCartStore } from '~/hooks/useCartStore';
import type { PublicProduct } from '~/@types/product';
import { TestimonialsSection } from './TestimonialSection';
import { ProductDetailModal } from './ProductDetailModal';
import { AboutSection } from './AboutSection';
import type { AppSettings } from '~/@types/app-settings';
import type { AboutInfo } from '~/@types/about';
import { ContactSection } from './ContactSection';
import { CatalogSection } from './CatalogSection';
import { HowToOrderSection } from './HowToOrderSection';
import { HeroSection } from './HeroSection';

// ─── Mock / placeholder data (substitua pelas chamadas reais de API) ──────────

const MOCK_SETTINGS: AppSettings = {
  siteName: 'Doce & Cia',
  whatsapp: '5531999999999',
  contactEmail: 'contato@doceatelier.com.br',
  serviceHours: 'Seg–Sex 8h–18h · Sáb 8h–14h',
  address: 'Belo Horizonte, MG',
  instagram: 'doceatelier',
};

const MOCK_ABOUT: AboutInfo = {
  title: 'Feito com amor, entregue com cuidado',
  subtitle: 'Nossa história',
  main: 'Somos uma confeitaria artesanal que acredita que cada mordida deve ser uma experiência única. Trabalhamos com ingredientes selecionados e técnicas tradicionais para criar doces que encantam.',
  complementary:
    'Cada encomenda é tratada com atenção especial, do primeiro contato até a entrega. Personalizamos tudo para o seu momento especial.',
  items: [
    { id: '1', text: 'Ingredientes 100% naturais', orderIndex: 0 },
    { id: '2', text: 'Receitas artesanais exclusivas', orderIndex: 1 },
    { id: '3', text: 'Embalagens sustentáveis', orderIndex: 2 },
    { id: '4', text: 'Entrega com cuidado e pontualidade', orderIndex: 3 },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

// function formatPrice(value: number) {
//   return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// }

function getProductImage(product: PublicProduct) {
  if (product.imageUrl) return product.imageUrl;

  const names = (product.categories ?? [])
    .map((c: any) => {
      const catName = c?.category?.name ?? c?.name ?? '';
      return catName.toLowerCase();
    })
    .join(' ');
  const slug = product.slug?.toLowerCase() ?? '';

  const keyword = encodeURIComponent(
    names.includes('torta')
      ? 'pie tart pastry'
      : names.includes('biscoito') || names.includes('artesanal')
        ? 'artisan cookies biscuits'
        : names.includes('brunch')
          ? 'brunch food'
          : names.includes('doce')
            ? 'sweet dessert cake'
            : slug.includes('brownie')
              ? 'brownie chocolate'
              : slug.includes('bolo')
                ? 'cake'
                : 'bakery food',
  );
  const seed = product.id.charCodeAt(0) + product.id.charCodeAt(1);
  return `https://source.unsplash.com/400x300/?${keyword}&sig=${seed}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

export function HomePage() {
  const [settings] = useState<AppSettings>(MOCK_SETTINGS);
  const [about] = useState<AboutInfo>(MOCK_ABOUT);

  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: PublicProduct) => {
    addItem(product as any);
    message.success(`"${product.name}" adicionado ao carrinho!`);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      {/* <SiteHeader settings={settings} /> */}
      <AppHeader settings={settings} />
      <HeroSection settings={settings} />
      <AboutSection about={about} />
      <HowToOrderSection settings={settings} />
      <CatalogSection
        settings={settings}
        onViewDetails={(p) => {
          setSelectedProduct(p);
          setModalOpen(true);
        }}
      />
      <TestimonialsSection />
      <ContactSection settings={settings} />
      {/* <SiteFooter settings={settings} /> */}
      <AppFooter useFullFooter />

      <ProductDetailModal
        product={selectedProduct}
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedProduct(null);
        }}
        settings={settings}
        onAddToCart={handleAddToCart}
      />
    </Layout>
  );
}
