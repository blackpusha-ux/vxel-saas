import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// ---------------------------------------------------------------------------
// In-memory rate limiter (per IP — up to 3 requests per 10 minutes)
// Pas de dépendance externe Upstash/Redis nécessaire
// ---------------------------------------------------------------------------
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const RATE_LIMIT_MAX = 3; // max 3 envois par fenêtre
const rateLimitMap = new Map<string, { count: number; firstRequest: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.firstRequest > RATE_LIMIT_WINDOW_MS) {
    // Fenêtre expirée ou nouveau visiteur — reset
    rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return true; // OK
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false; // Bloqué
  }

  record.count++;
  return true; // OK
}

// Nettoyage périodique de la Map (évite la fuite mémoire)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.firstRequest > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

// ---------------------------------------------------------------------------
// POST /api/contact
// Envoi d'email sécurisé via Resend — l'adresse de destination n'est JAMAIS
// exposée au client. L'expéditeur voit uniquement son propre email en réponse.
// ---------------------------------------------------------------------------
export async function POST(req: Request) {
  // --- 1. Rate Limiting (IP-based) ---
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Trop de messages envoyés. Veuillez patienter 10 minutes avant de réessayer.',
      },
      {
        status: 429,
        headers: { 'Retry-After': '600' },
      }
    );
  }

  // --- 2. Validation de la clé Resend ---
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey || !resendKey.startsWith('re_')) {
    console.error('[ContactAPI] RESEND_API_KEY manquante ou invalide');
    return NextResponse.json(
      { success: false, error: 'Service email non configuré. Contactez le support.' },
      { status: 503 }
    );
  }

  // --- 3. Parsing et Validation du Payload ---
  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Payload JSON invalide.' }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  // Validation stricte des champs
  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return NextResponse.json({ success: false, error: 'Nom invalide (minimum 2 caractères).' }, { status: 400 });
  }
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ success: false, error: 'Adresse email invalide.' }, { status: 400 });
  }
  if (!message || typeof message !== 'string' || message.trim().length < 10) {
    return NextResponse.json({ success: false, error: 'Message trop court (minimum 10 caractères).' }, { status: 400 });
  }
  if (message.trim().length > 2000) {
    return NextResponse.json({ success: false, error: 'Message trop long (maximum 2000 caractères).' }, { status: 400 });
  }

  // Sanitisation basique pour éviter les injections HTML dans les emails
  const sanitize = (str: string) =>
    str.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

  const safeName = sanitize(name.trim().slice(0, 100));
  const safeEmail = email.trim().toLowerCase().slice(0, 254);
  const safeSubject = subject ? sanitize(subject.trim().slice(0, 200)) : 'Nouveau message VXEL DTF Studio Pro';
  const safeMessage = sanitize(message.trim());

  // --- 4. Envoi via Resend ---
  const resend = new Resend(resendKey);

  // L'adresse de destination est EXCLUSIVEMENT côté serveur via variable d'environnement
  const toEmail = process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL || 'contact.tbalbiza@gmail.com';

  try {
    const { error } = await resend.emails.send({
      // L'expéditeur utilise un domaine vérifié Resend (pas le domaine du client)
      from: 'VXEL Contact Form <noreply@vxel-contact.resend.dev>',
      to: [toEmail],
      // On met le vrai email du client en Reply-To pour permettre de lui répondre directement
      replyTo: safeEmail,
      subject: `[VXEL Contact] ${safeSubject}`,
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0A0A0A; color: #E2E8F0; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background: #161616; border: 1px solid #2E2E2E; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #F7941D, #FFB25A); padding: 28px 32px;">
              <h1 style="margin: 0; color: #000; font-size: 20px; font-weight: 900; letter-spacing: -0.5px;">
                📩 Nouveau Message VXEL
              </h1>
              <p style="margin: 6px 0 0; color: #1a1a1a; font-size: 12px; font-weight: 600;">Via le formulaire de contact VXEL DTF Studio Pro</p>
            </div>
            <div style="padding: 28px 32px; space-y: 16px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2E2E2E; width: 120px; color: #F7941D; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: top;">
                    Nom
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2E2E2E; color: #F1F5F9; font-size: 14px; font-weight: 600;">
                    ${safeName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2E2E2E; color: #F7941D; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: top;">
                    Email
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2E2E2E; color: #F1F5F9; font-size: 14px;">
                    <a href="mailto:${safeEmail}" style="color: #F7941D; text-decoration: none;">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2E2E2E; color: #F7941D; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: top;">
                    Sujet
                  </td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #2E2E2E; color: #F1F5F9; font-size: 14px;">
                    ${safeSubject}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0; color: #F7941D; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: top;">
                    Message
                  </td>
                  <td style="padding: 16px 0 0; color: #E2E8F0; font-size: 14px; line-height: 1.6;">
                    ${safeMessage}
                  </td>
                </tr>
              </table>
            </div>
            <div style="padding: 16px 32px 24px; background: #0D0D0D; border-top: 1px solid #2E2E2E;">
              <p style="margin: 0; color: #64748B; font-size: 11px;">
                📅 Reçu le ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })} — IP: ${ip.substring(0, 12)}***
                <br>⚡ Reply-To configuré — Répondez directement à cet email pour contacter <strong style="color: #94A3B8;">${safeName}</strong>.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('[ContactAPI] Erreur Resend:', error);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer.' },
        { status: 500 }
      );
    }

    // Email de confirmation à l'expéditeur (sans révéler l'adresse de destination)
    await resend.emails.send({
      from: 'VXEL DTF Studio Pro <noreply@vxel-contact.resend.dev>',
      to: [safeEmail],
      subject: '✅ Votre message a bien été reçu — VXEL DTF Studio Pro',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0A0A0A; color: #E2E8F0; margin: 0; padding: 24px;">
          <div style="max-width: 560px; margin: 0 auto; background: #161616; border: 1px solid #2E2E2E; border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #F7941D, #FFB25A); padding: 24px 28px; text-align: center;">
              <h1 style="margin: 0; color: #000; font-size: 18px; font-weight: 900;">✅ Message Bien Reçu !</h1>
            </div>
            <div style="padding: 28px; text-align: center;">
              <p style="font-size: 14px; color: #CBD5E1; line-height: 1.7;">
                Bonjour <strong style="color: #F1F5F9;">${safeName}</strong>,<br><br>
                Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais, généralement <strong style="color: #F7941D;">sous 24h ouvrées</strong>.
              </p>
              <div style="background: #0A0A0A; border: 1px solid #2E2E2E; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: left;">
                <p style="margin: 0 0 6px; font-size: 11px; color: #F7941D; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Votre message :</p>
                <p style="margin: 0; font-size: 13px; color: #94A3B8; line-height: 1.5; font-style: italic;">"${safeMessage}"</p>
              </div>
              <p style="font-size: 12px; color: #64748B;">En attendant, explorez nos outils sur <a href="https://vexel-mocha.vercel.app" style="color: #F7941D; text-decoration: none; font-weight: 700;">VXEL DTF Studio Pro</a>.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }).catch(() => {
      // L'email de confirmation est non-bloquant — on ne plante pas si ça échoue
    });

    return NextResponse.json({ success: true, message: 'Message envoyé avec succès !' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[ContactAPI] Exception:', msg);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur. Veuillez réessayer plus tard.' },
      { status: 500 }
    );
  }
}
