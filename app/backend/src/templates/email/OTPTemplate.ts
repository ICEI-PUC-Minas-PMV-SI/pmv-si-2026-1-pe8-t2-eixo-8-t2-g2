import BaseEmailTemplate from './BaseEmailTemplate.js';
import { EmailColors } from './EmailColors.js';

class OTPTemplate extends BaseEmailTemplate {
  renderOTPSlot(otp: string) {
    const OTP_SLOT = `
    <div style="
        display:inline-block;
        padding:8px 12px;
        background:${EmailColors.card};
        border:1px solid ${EmailColors.border};
        border-radius:8px;
        box-shadow: 0 1px 0 rgba(0,0,0,0.02);
      ">
        <span class="otp-digit" aria-label="Código de verificação" style="
          font-family: 'Courier New', Courier, monospace;
          font-size:32px;
          font-weight: bold;
          letter-spacing:10pxs;
          color:${EmailColors.accent};
          display:block;
        ">{{OTP_DIGIT}}</span>
      </div>
`;
    const otpDigits = otp.split('');
    const useSeparator = otpDigits.length % 2 === 0 && otpDigits.length > 4;
    const separator = useSeparator
      ? OTP_SLOT.replace('{{OTP_DIGIT}}', '-').replace('border:1px', 'border:0px')
      : '';
    const middleIdx = useSeparator ? otpDigits.length / 2 - 1 : null;
    return otpDigits
      .map((digit, idx) => {
        return OTP_SLOT.replace('{{OTP_DIGIT}}', digit).concat(
          idx === middleIdx ? separator : '',
        );
      })
      .join('\n');
  }
  buildOTP(otp: string) {
    const otpValue = this.sanitize(otp);
    // OTP block: usa monospace e espaçamento — simples, legível e responsivo
    const otpBlock = `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:12px auto 0; width:100%; max-width:360px;">
  <tr>
    <td align="center">
      ${this.renderOTPSlot(otpValue)}
    </td>
  </tr>
</table>
`;

    const content = `
<p style="margin:0 0 12px 0;">
  Utilize o código abaixo para acessar sua conta.
</p>

${otpBlock}

<p style="margin:12px 0 0 0; font-size:13px; color:${EmailColors.secondaryText};">
  Este código expira em <strong>10 minutos</strong>.
</p>
`;

    return super.build({
      title: `Código de verificação`,
      content,
      footerNote: `Se você não solicitou este código, ignore este e-mail. Feito com carinho pela equipe ${this.projectName}.`,
      preheader: `Código de verificação — válido por 10 minutos.`,
    });
  }
}

const instance = new OTPTemplate();
export { instance as OTPTemplate };
export default instance;
