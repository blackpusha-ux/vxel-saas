import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error('❌ Error: CLERK_WEBHOOK_SECRET manquant');
    return new Response('CLERK_WEBHOOK_SECRET manquant', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('❌ Error: Headers webhook svix manquants');
    return new Response('Headers webhook manquants', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Erreur vérification webhook svix:', err);
    return new Response('Erreur de vérification', { status: 400 });
  }

  if (evt.type === 'user.created') {
    await connectDB();
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address || '';
    const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Utilisateur';

    await User.findOneAndUpdate(
      { clerkId: id },
      {
        clerkId: id,
        email,
        name,
        $setOnInsert: { credits: 10, isBanned: false, role: 'user', plan: 'free' },
      },
      { upsert: true, new: true }
    );

    console.log(`✅ Utilisateur créé: ${email} avec 10 crédits`);
  }

  return new Response('Webhook reçu', { status: 200 });
}
