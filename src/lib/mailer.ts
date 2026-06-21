import nodemailer from 'nodemailer'

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'localhost',
    port: Number(process.env.SMTP_PORT ?? 1025),
    secure: process.env.SMTP_SECURE === 'true',
    auth:
      process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  })
}

const FROM = process.env.SMTP_FROM ?? 'noreply@universidademil.com.br'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function logo() {
  return `<div style="text-align:center;margin-bottom:24px;">
    <span style="font-family:Arial,sans-serif;font-size:28px;font-weight:900;color:#EC55B5;letter-spacing:2px;">MIL</span>
    <p style="font-size:11px;color:#888;margin:4px 0 0;letter-spacing:4px;text-transform:uppercase;">Universidade</p>
  </div>`
}

function wrap(content: string) {
  return `<!DOCTYPE html><html lang="pt-BR"><body style="margin:0;padding:0;background:#0f0f0f;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;border:1px solid #2a2a2a;">
        <tr><td style="padding:40px 40px 32px;">${logo()}${content}</td></tr>
        <tr><td style="padding:20px 40px;background:#111;text-align:center;">
          <p style="margin:0;font-size:11px;color:#555;">© Universo Mil — Todos os direitos reservados</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`
}

export async function sendInviteEmail(to: string, name: string, token: string) {
  const link = `${APP_URL}/convite?token=${token}`
  const html = wrap(`
    <h2 style="color:#fff;font-size:20px;margin:0 0 12px;">Olá, ${name}! 👋</h2>
    <p style="color:#bbb;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Você foi convidada para a <strong style="color:#EC55B5;">Universo Mil</strong>.
      Clique no botão abaixo para criar seu acesso à plataforma.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${link}" style="background:#EC55B5;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;display:inline-block;">
        Criar meu acesso
      </a>
    </div>
    <p style="color:#666;font-size:12px;text-align:center;margin:0;">
      Este link expira em 72 horas. Se você não esperava este e-mail, ignore-o.
    </p>
  `)
  await send({ to, subject: 'Seu convite para a Universo Mil', html })
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const link = `${APP_URL}/redefinir-senha?token=${token}`
  const html = wrap(`
    <h2 style="color:#fff;font-size:20px;margin:0 0 12px;">Redefinir senha</h2>
    <p style="color:#bbb;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Olá, <strong style="color:#fff;">${name}</strong>. Recebemos sua solicitação de redefinição de senha.
      Clique no botão abaixo para criar uma nova senha.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${link}" style="background:#EC55B5;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;display:inline-block;">
        Redefinir minha senha
      </a>
    </div>
    <p style="color:#666;font-size:12px;text-align:center;margin:0;">
      Este link expira em 1 hora. Se você não solicitou isto, ignore este e-mail.
    </p>
  `)
  await send({ to, subject: 'Redefinição de senha — Universo Mil', html })
}

export async function sendMagicLinkEmail(to: string, token: string) {
  const link = `${APP_URL}/magic-signin?token=${token}`
  const html = wrap(`
    <h2 style="color:#fff;font-size:20px;margin:0 0 12px;">Entrar sem senha</h2>
    <p style="color:#bbb;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Clique no botão abaixo para acessar a plataforma sem precisar de senha.
      O link é válido por <strong style="color:#fff;">15 minutos</strong>.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${link}" style="background:#EC55B5;color:#fff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;display:inline-block;">
        Acessar agora
      </a>
    </div>
    <p style="color:#666;font-size:12px;text-align:center;margin:0;">
      Se você não solicitou este acesso, ignore este e-mail.
    </p>
  `)
  await send({ to, subject: 'Seu link de acesso — Universo Mil', html })
}

async function send({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const transport = createTransport()
    await transport.sendMail({ from: FROM, to, subject, html })
  } catch (err) {
    // In dev without SMTP, log so the link is accessible
    console.error('[mailer] Failed to send email:', err)
    console.log('[mailer] Email content would have been sent to:', to)
    console.log('[mailer] Subject:', subject)
  }
}
