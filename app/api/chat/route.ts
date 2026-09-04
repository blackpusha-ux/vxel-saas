import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `Tu es l'assistant virtuel officiel de VXEL DTF Studio Pro, une plateforme SaaS B2B pour l'impression textile DTF. Ton rôle est d'aider les utilisateurs à utiliser les 3 outils : 1. Studio DTF : détourage IA, suppression fond blanc/coloré, upscale. 2. Image to Vector : conversion JPG/PNG en SVG HD. 3. Outil Planche : nesting automatique pour optimiser le film. Tarifs : 10 crédits gratuits à l'inscription. Détourage=1 crédit, Vectorisation=1 crédit, Planche 1-10 designs=5 crédits, Planche 11-50 designs=25 crédits, Upscale 2x=1 crédit, 4x=2 crédits. Abonnement Pro : 19€/mois. Sois friendly, professionnel, concis. Réponds en français. Si on te pose une question hors sujet, recentre poliment sur VXEL.`;

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
        model: 'llama3-70b-8192',
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur API Groq:', errorData);
      return NextResponse.json(
        { error: 'Erreur lors de la communication avec l\'assistant IA.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Je n\'ai pas pu formuler de réponse.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Erreur Route API Chat:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur interne du serveur.' },
      { status: 500 }
    );
  }
}
