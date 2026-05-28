import BaseEmailTemplate from './BaseEmailTemplate.js';
import { EmailColors } from './EmailColors.js';

class PasswordResetTemplate extends BaseEmailTemplate {
  buildResetEmail(resetLink: string) {
    const sanitizedLink = this.sanitize(resetLink);

    // Botão de redefinição de senha
    const buttonBlock = `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px auto;">
  <tr>
    <td align="center">
      <a href="${sanitizedLink}" target="_blank" style="
        background-color: ${EmailColors.accent};
        color: #ffffff;
        text-decoration: none;
        padding: 12px 24px;
        border-radius: 6px;
        font-weight: bold;
        display: inline-block;
        font-family: Arial, sans-serif;
      ">
        Redefinir minha senha
      </a>
    </td>
  </tr>
</table>
`;

    // Texto alternativo do link
    const fallbackLink = `
<p style="font-size:12px; color:${EmailColors.secondaryText}; word-break:break-all;">
  Se o botão acima não funcionar, copie e cole este link no navegador:<br/>
  <a href="${sanitizedLink}" target="_blank">${sanitizedLink}</a>
</p>
`;

    // Conteúdo principal do e-mail
    const content = `
<p style="margin:0 0 12px 0;">
  Você solicitou a redefinição de senha. Clique no botão abaixo para continuar:
</p>

${buttonBlock}

<p style="margin:12px 0 0 0; font-size:13px; color:${EmailColors.secondaryText};">
  Este link expira em <strong>10 minutos</strong>.
</p>

${fallbackLink}
`;

    return super.build({
      title: 'Redefinição de senha',
      content,
      footerNote: `Se você não solicitou redefinição de senha, ignore este e-mail. Feito com carinho pela equipe ${this.projectName}.`,
    });
  }
}

const instance = new PasswordResetTemplate();
export { instance as PasswordResetTemplate };
export default instance;
