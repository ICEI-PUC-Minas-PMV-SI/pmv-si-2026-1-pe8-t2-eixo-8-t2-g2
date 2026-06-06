import { useState } from 'react';
import { Layout, message, Spin } from 'antd';
import { AppFooter } from '../footer';
import { useQuery } from '@tanstack/react-query';
import { useCartStore } from '~/hooks/useCartStore';
import type { PublicProduct } from '~/@types/product';
import { TestimonialsSection } from './TestimonialSection';
import { ProductDetailModal } from './ProductDetailModal';
import type { AppSettings } from '~/@types/app-settings';
import type { About } from '~/@types/about';
import { ContactSection } from './ContactSection';
import { CatalogSection } from './CatalogSection';
import { HowToOrderSection } from './HowToOrderSection';
import { HeroSection } from './HeroSection';
import { AppSettingsController } from '~/controllers/AppSettingsController';
import TextUtil from '~/utils/TextUtil';
import AboutController from '~/controllers/AboutController';
import { AboutUsView } from '../about-us/AboutUsView';

export function HomePage() {
  const [selectedProduct, setSelectedProduct] = useState<PublicProduct | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const settingsQuery = useQuery<AppSettings>({
    queryKey: ['app-settings'],
    queryFn: () => AppSettingsController.findInfo(),
    staleTime: 1000 * 60 * 5,
  });
  const aboutQuery = useQuery<About>({
    queryKey: ['about-data'],
    queryFn: () => AboutController.find(),
    staleTime: 1000 * 60 * 5,
  });

  const instagram = TextUtil.parseInstagram(settingsQuery.data?.instagram);

  const settings = {
    whatsapp: settingsQuery.data?.whatsapp ?? '',
    phone: settingsQuery.data?.whatsapp ?? '',
    phoneHref: settingsQuery.data?.whatsapp
      ? `https://wa.me/${settingsQuery.data.whatsapp}`
      : '',
    email: settingsQuery.data?.contactEmail ?? '',
    serviceHours: settingsQuery.data?.serviceHours ?? '',
    locationLabel: settingsQuery.data?.address ?? '',
    instagramHandle: instagram?.handle,
    instagramUrl: instagram?.url,
    instagram: settingsQuery.data?.instagram,
  };

  const handleAddToCart = (product: PublicProduct) => {
    addItem(product as any);
    message.success(`"${product.name}" adicionado ao carrinho!`);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <HeroSection settings={settings} />
      <Spin spinning={aboutQuery.isLoading}>{aboutQuery.data && <AboutUsView />}</Spin>

      <HowToOrderSection settings={settings} />

      <CatalogSection
        onViewDetails={(p) => {
          setSelectedProduct(p);
          setModalOpen(true);
        }}
      />

      <TestimonialsSection />

      <ContactSection settings={settings} />

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
