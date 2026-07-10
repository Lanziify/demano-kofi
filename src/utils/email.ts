import nodemailer from 'nodemailer';
import nodemailerSendgrid from 'nodemailer-sendgrid';

export const transporter =
  process.env.NODE_ENV === 'development'
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    : nodemailer.createTransport(
        nodemailerSendgrid({
          apiKey: process.env.SENDGRID_API_KEY!,
        })
      );
