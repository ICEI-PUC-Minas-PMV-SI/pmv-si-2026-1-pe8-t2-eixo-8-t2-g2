import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  HeartOutlined,
  InstagramOutlined,
  MailOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import './AppFooter.css';
import logoIsabellaCaster from './assets/logo-isabella-caster.png';

export type AppFooterProps = {
  phone?: string;
  phoneHref?: string;
  email?: string;
  businessHours?: string;
  locationLabel?: string;
  instagramHandle?: string;
  instagramUrl?: string;
  badgeText?: string;
  copyrightYear?: number;
};

const DEFAULTS = {
  phone: '(31) 99822-6620',
  phoneHref: 'https://wa.me/5531998226620',
  email: 'contato@isabellacaster.com.br',
  businessHours: 'Seg a Sáb: 8h às 18h',
  locationLabel: 'Feito em casa, com amor.',
  instagramHandle: '@isabella_caster',
  instagramUrl: 'https://www.instagram.com/isabella_caster',
  badgeText: 'Feito com amor em cada detalhe.',
  copyrightYear: new Date().getFullYear(),
} as const;

export function AppFooter({
  phone = DEFAULTS.phone,
  phoneHref = DEFAULTS.phoneHref,
  email = DEFAULTS.email,
  businessHours = DEFAULTS.businessHours,
  locationLabel = DEFAULTS.locationLabel,
  instagramHandle = DEFAULTS.instagramHandle,
  instagramUrl = DEFAULTS.instagramUrl,
  badgeText = DEFAULTS.badgeText,
  copyrightYear = DEFAULTS.copyrightYear,
}: AppFooterProps = {}) {
  return (
    <footer className="app-footer" role="contentinfo">
      <div className="app-footer__inner">
        <div className="app-footer__grid">
          <div className="app-footer__brand">
            <img
              src={logoIsabellaCaster}
              alt="Isabella Cáster Confeitaria"
              className="app-footer__logo"
            />
          </div>

          <section className="app-footer__section" aria-labelledby="footer-atendimento">
            <h2 id="footer-atendimento" className="app-footer__section-title">
              Atendimento
            </h2>
            <ul className="app-footer__contact-list">
              <li className="app-footer__contact-item">
                <WhatsAppOutlined className="app-footer__icon" aria-hidden />
                <a href={phoneHref} target="_blank" rel="noopener noreferrer">
                  {phone}
                </a>
              </li>
              <li className="app-footer__contact-item">
                <MailOutlined className="app-footer__icon" aria-hidden />
                <a href={`mailto:${email}`}>{email}</a>
              </li>
              <li className="app-footer__contact-item">
                <ClockCircleOutlined className="app-footer__icon" aria-hidden />
                <span>{businessHours}</span>
              </li>
              <li className="app-footer__contact-item">
                <EnvironmentOutlined className="app-footer__icon" aria-hidden />
                <span>{locationLabel}</span>
              </li>
            </ul>
          </section>

          <section className="app-footer__section" aria-labelledby="footer-siga-me">
            <h2 id="footer-siga-me" className="app-footer__section-title">
              Siga-me
            </h2>
            <div className="app-footer__social">
              <a
                className="app-footer__instagram"
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramOutlined className="app-footer__icon" aria-hidden />
                {instagramHandle}
              </a>
              <p className="app-footer__badge">
                <HeartOutlined className="app-footer__badge-icon" aria-hidden />
                {badgeText}
              </p>
            </div>
          </section>
        </div>

        <p className="app-footer__copyright">
          © {copyrightYear} Isabella Cáster Confeitaria. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
