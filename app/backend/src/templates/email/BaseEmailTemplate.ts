import path from 'node:path';
import { EmailColors } from './EmailColors.js';
import type { Attachment } from 'nodemailer/lib/mailer/index';
import { Env } from '../../utils/Env.js';

export type BaseTemplateOptions = {
  title: string;
  content: string; // aceita HTML simples (já sanitizado)
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
  preheader?: string; // texto curto exibido na pré-visualização do e-mail
};

export class BaseEmailTemplate {
  protected projectName = 'Isabella Cáster';

  protected sanitize(value?: string) {
    if (!value) return '';
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  protected getLogoAttachment(): Attachment {
    const logoPath = path.join(Env.getBackendPath(), 'src', 'assets', 'logo.png');

    return {
      cid: 'logo',
      filename: 'logo.png',
      path: logoPath,
    };
  }

  protected getHeaderImageAttachment(): Attachment {
    const headerImgPath = path.join(Env.getBackendPath(), 'src', 'assets', 'header.jpg');

    return {
      cid: 'emailHeader',
      filename: 'header.jpg',
      path: headerImgPath,
    };
  }

  protected renderCTA(label: string, url: string) {
    const safeUrl = this.sanitize(url);
    const safeLabel = this.sanitize(label);

    return `
<tr>
  <td align="center" style="padding:20px 24px;">
    <!-- CTA -->
    <a href="${safeUrl}"
       role="button"
       style="
         display:inline-block;
         min-width:160px;
         padding:12px 20px;
         background:${EmailColors.accent};
         color:#ffffff;
         text-decoration:none;
         font-family: Inter, 'Helvetica Neue', Arial, sans-serif;
         font-size:15px;
         font-weight:600;
         border-radius:8px;
         box-shadow: 0 2px 0 rgba(0,0,0,0.04);
       ">
      ${safeLabel}
    </a>
  </td>
</tr>
`;
  }

  build(options: BaseTemplateOptions) {
    const { title, content, ctaLabel, ctaUrl, footerNote, preheader = '' } = options;
    const ctaSection = ctaLabel && ctaUrl ? this.renderCTA(ctaLabel, ctaUrl) : '';

    // basic styles (kept inline-friendly for email clients)
    const template = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${this.sanitize(title)}</title>

<!-- Preheader (hidden in body, visible in preview) -->
<style>
  .preheader { display: none !important; visibility: hidden; opacity: 0; color: transparent; height: 0; width: 0; overflow: hidden; mso-hide:all; }
  /* Responsivo pequeno */
  @media only screen and (max-width: 480px) {
    .email-card { width: 100% !important; }
    .content-td { padding: 20px !important; }
    .cta a { width: 100% !important; box-sizing: border-box; display:block; }
    .otp-digit { font-size: 28px !important; letter-spacing: 8px !important; }
  }
</style>
</head>

<body style="margin:0; padding:0; background:${EmailColors.background}; -webkit-font-smoothing:antialiased;">
  <div class="preheader" aria-hidden="true">${this.sanitize(preheader)}</div>

  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="min-width:100%;">
    <tr>
      <td align="center" style="padding:36px 12px;">
        <table class="email-card" width="600" cellpadding="0" cellspacing="0" role="presentation" style="width:100%; max-width:600px; background:${EmailColors.card}; border-radius:12px; overflow:hidden; border:1px solid ${EmailColors.border};">
          
          <!-- Header -->
          <tr>
            <td align="center" style="padding:28px; background:${EmailColors.headerBg}; background-image:url('cid:emailHeader'); background-size: cover; border-bottom:1px solid ${EmailColors.border};">
              <!-- <img src="cid:logo" width="56" height="56" alt="${this.projectName} logo" style="display:block; margin:0 auto 12px;"/> -->
              <div
                style="font-family: Inter, 'Helvetica Neue', Arial, sans-serif; font-size:20px;
                font-weight:600;
                color:${EmailColors.headerText};
                background-size: cover;
                "
              >
                ${this.projectName}
              </div>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td align="left" class="content-td" style="padding:28px 36px 12px 36px; font-family: Inter, 'Helvetica Neue', Arial, sans-serif; color:${EmailColors.primaryText};">
              <h1 style="margin:0; font-size:18px; font-weight:600; color:${EmailColors.primaryText};">
                ${this.sanitize(title)}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td align="left" class="content-td" style="padding:0 36px 20px 36px; font-family: Inter, 'Helvetica Neue', Arial, sans-serif; font-size:15px; line-height:1.45; color:${EmailColors.primaryText};">
              ${content}
            </td>
          </tr>

          ${ctaSection}

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:18px 28px; border-top:1px solid ${EmailColors.border}; background:transparent;">
              <div style="font-family: Inter, 'Helvetica Neue', Arial, sans-serif; font-size:12px; color:${EmailColors.secondaryText};">
                ${this.sanitize(footerNote || `Feito com carinho pela equipe ${this.projectName}`)}
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    return {
      template,
      attachments: [this.getHeaderImageAttachment()],
    };
  }
}

export default BaseEmailTemplate;
