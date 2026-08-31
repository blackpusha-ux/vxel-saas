import { currentUser } from '@clerk/nextjs/server';

export const ADMIN_EMAIL = 'contact.tbalbiza@gmail.com';

export async function verifyAdminServer(): Promise<{ authorized: boolean; userEmail?: string; error?: string; status?: number }> {
  try {
    const user = await currentUser();
    if (!user) {
      return { authorized: false, error: 'Non authentifié', status: 401 };
    }

    const email = user.emailAddresses.find((e) => e.id === user.primaryEmailAddressId)?.emailAddress || user.emailAddresses[0]?.emailAddress;

    console.log(`[AdminAuth] Inspection email utilisateur connecté : ${email}`);

    if (!email || email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return { authorized: false, userEmail: email, error: 'Accès refusé : Privilèges Administrateur requis', status: 403 };
    }

    return { authorized: true, userEmail: email };
  } catch (error) {
    console.error('[AdminAuth] Erreur de vérification admin :', error);
    return { authorized: false, error: 'Erreur d\'authentification serveur', status: 500 };
  }
}
