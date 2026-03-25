import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    const smtpUser = this.config.get('SMTP_USER') || 'inesismail08@gmail.com';
    const smtpPass = this.config.get('SMTP_PASS') || '';
    this.logger.log(`SMTP config: host=${this.config.get('SMTP_HOST') || 'smtp.gmail.com'}, user=${smtpUser}, pass=${smtpPass ? '***set***' : '***MISSING***'}`);

    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST') || 'smtp.gmail.com',
      port: Number(this.config.get('SMTP_PORT') || 587),
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
  }

  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const from = this.config.get('SMTP_FROM') || 'Flexee <inesismail08@gmail.com>';

    try {
      await this.transporter.sendMail({
        from,
        to,
        subject: 'Flexee — Réinitialisation de votre mot de passe',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 520px; margin: 0 auto; background: #0f172a; border-radius: 16px; overflow: hidden;">
            <div style="padding: 32px 32px 24px; text-align: center; background: linear-gradient(135deg, #1e293b, #0f172a);">
              <div style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ea580c); border-radius: 12px; padding: 12px; margin-bottom: 16px;">
                <span style="font-size: 24px; color: #0f172a;">⚡</span>
              </div>
              <h1 style="margin: 0; color: white; font-size: 24px;">
                Flex<span style="color: #f59e0b;">ee</span>
              </h1>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Energy Flexibility Platform</p>
            </div>
            <div style="padding: 32px;">
              <h2 style="color: white; font-size: 18px; margin: 0 0 12px;">Réinitialisation du mot de passe</h2>
              <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
                Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
              </p>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #f59e0b, #ea580c); color: #0f172a; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 8px; text-decoration: none;">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin: 24px 0 0;">
                Ce lien expire dans <strong style="color: #94a3b8;">30 minutes</strong>.<br>
                Si vous n'avez pas fait cette demande, ignorez cet email.
              </p>
            </div>
            <div style="padding: 16px 32px; background: #1e293b; text-align: center;">
              <p style="color: #475569; font-size: 11px; margin: 0;">Flexee Energy Platform © 2024</p>
            </div>
          </div>
        `,
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}: ${error instanceof Error ? error.message : error}`);
      // Don't throw — we don't want to reveal email existence
    }
  }
}
