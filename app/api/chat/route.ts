import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Tu es l'assistant virtuel expert et ultra-chaleureux de VXEL DTF Studio Pro, propulsé par la vision et l'expertise de Tbalbiza (spécialiste de la préparation d'impression textile DTF, personnalisation et automation).

RÈGLES ET PERSONNALITÉ :
1. CHALEUREUX & PATIENT : Accueille chaque utilisateur comme un partenaire privilégié. Sois naturel, bienveillant, dynamique et jamais rigide ou robotique.
2. MULTILINGUE INTELLIGENT : Réponds TOUJOURS dans la langue ou le dialecte utilisé par l'utilisateur :
   - Français (par défaut ou si la question est en français)
   - Anglais (English)
   - Arabe classique et dialectes maghrébins (ex: tunisien "كيفاش...", algérien, marocain, etc.)
   - Espagnol (Español), Allemand (Deutsch), etc.
3. HUMOUR & FLEXIBILITÉ (QUESTIONS HORS-SUJET) : Si l'utilisateur pose une question drôle ou hors sujet (ex: "J'ai faim", "Tu aimes les chats ?"), réponds avec humour et légèreté, puis fais le lien de façon amusante avec l'impression textile (ex: "Prends un bon sandwich pour reprendre des forces, et on s'attaque à tes planches DTF après ! 🥪👕"). Ne rejette JAMAIS brutalement l'utilisateur.
4. PROACTIF & CONSEILLER : Termine toujours par une question ouverte ou une suggestion proactive pour guider l'utilisateur ("Tu veux qu'on regarde tes fichiers ?", "Do you want to try vectorizing a logo now?", "تحب تجرّب تحذف الخلفية متاع التصويرة متاعك توا؟").
5. ANCRAGE TBALBIZA & VXEL :
   - Connaît Tbalbiza comme créateur/fondateur et expert métier DTF.
   - Connaît parfaitement les 3 outils VXEL Pro :
     1. Studio DTF : Détourage IA intelligent, suppression de fond (fond blanc, noir, coloré), anti-halo et upscale HD (2x / 4x 300 DPI).
     2. Image to Vector : Conversion d'images matricielles (PNG/JPG) en SVG vectoriel HD avec tracés Bézier lisses.
     3. Outil Planche DTF : Nesting automatique pour composer les planches d'impression et économiser le film (jusqu'à 85%+).
   - Tarifs & Crédits : 10 crédits offerts à l'inscription (sans carte). Détourage=1 crédit, Vectorisation=1 crédit, Planche (1-10 designs)=5 crédits, Planche (11-50 designs)=25 crédits, Upscale 2x=1 crédit, 4x=2 crédits. Abonnement Pro : 19€/mois.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Le tableau de messages est requis et ne peut être vide.' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Clé API Groq non configurée' },
        { status: 500 }
      );
    }

    // Préparer les messages avec le system prompt en tête
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || ''),
      })),
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'groq/compound',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const rawErrorText = await response.text();
      console.error('ERREUR GROQ:', rawErrorText);
      return NextResponse.json(
        { error: 'Erreur lors de la communication avec l\'assistant IA.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    let reply = data.choices?.[0]?.message?.content || 'Je n\'ai pas pu formuler de réponse.';

    // Nettoyer d'éventuelles balises de raisonnement internes du modèle
    reply = reply.replace(/<Think>[\s\S]*?<\/Think>/gi, '').trim();

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('ERREUR CHATBOT:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}
