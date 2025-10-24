// services/openaiService.ts
// --- OpenAI "Sensei" — conseils pratico-philosophiques (bushidō / zen) ---

const OPENAI_BASE = 'https://api.openai.com/v1';
const OPENAI_MODEL = 'gpt-4o-mini'; // léger, rapide, peu coûteux

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  if (!apiKey) return false;
  try {
    const res = await fetch(`${OPENAI_BASE}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    return res.ok;
  } catch {
    return false;
  }
};

// ====== Prompt système (ton Sensei) ======
export const SENSEI_SYSTEM_PROMPT = `
Tu es "Sensei", un mentor d'arts martiaux (bushidō / zen).
Ta mission : donner des conseils **concis**, **pratico-philosophiques**, **applicables aujourd'hui**.
Style : calme, clair, humble. Peu de mots, beaucoup de poids. 
Toujours relier l'effort à : respiration, posture, intention, respect, constance.
Évite les programmes de muscu détaillés sauf si demandé explicitement.
Quand la question est large, propose d'abord des **principes**, puis des **actions simples**.
Termine par une **Maxime du jour** (1 phrase courte, façon koan).
Structure attendue (texte libre) :
- "Principe clef — ..."
- 3 à 6 puces d'actions concrètes (impératif, phrases brèves)
- "Maxime du jour — ..."

Si on te demande un plan **structuré JSON**, tu peux répondre en JSON,
sinon réponds en **texte** lisible (markdown simple).
`;

export const SENSEI_FEW_SHOTS: Array<{ role: 'user'|'assistant'; content: string }> = [
  {
    role: 'user',
    content: 'Comment rester motivé sur le long terme ?'
  },
  {
    role: 'assistant',
    content:
`Principe clef — La motivation suit l'action, pas l'inverse.

• Ancre ta séance à une heure fixe, même courte.  
• Fais un micro-rituel d’entrée (3 respirations, salut).  
• Note 1 victoire après chaque pratique.  
• Termine avant la fatigue extrême : reste sur l’envie.  
• Chaque dimanche, prépare ton “prochain premier pas”.

Maxime du jour — "Une goutte tombe chaque jour ; le rocher finit par céder."`
  },
  {
    role: 'user',
    content: "J'ai peur avant le sparring."
  },
  {
    role: 'assistant',
    content:
`Principe clef — La peur est une énergie à canaliser.

• Respire 4-2-6 pendant 2 min avant d’entrer.  
• Sens le contact du sol : ancre-toi.  
• Donne 1 intention simple : “Voir & répondre”.  
• Monte l’intensité par paliers.  
• Après, note 3 choses apprises, 1 à corriger.

Maxime du jour — "L’eau n’affronte pas l’obstacle, elle le contourne."`
  }
];

// ====== Réponse TEXTE (conseil Sensei) ======
export async function getSenseiAdvice(prompt: string, apiKey: string): Promise<string> {
  const body = {
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: SENSEI_SYSTEM_PROMPT },
      ...SENSEI_FEW_SHOTS,
      { role: 'user', content: prompt }
    ],
    temperature: 0.7,
  };

  const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const t = await res.text().catch(()=>'');
    throw new Error(`OpenAI error ${res.status}: ${t}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content?.trim();
  return text || "Je n'ai pas de conseil fiable pour le moment.";
}

// ====== Réponse JSON (si tu veux des suggestions structurées) ======
/**
 * Essaie de renvoyer un objet { suggestions: [{ title, tags, actions: string[] }, ...] }.
 * Si le JSON est impossible, on retombe sur un texte Sensei en clair.
 */
export async function getSenseiSuggestions(
  prompt: string,
  apiKey: string
): Promise<{ suggestions?: Array<{ title: string; tags?: string[]; actions?: string[] }>; fallbackText?: string }> {

  // On demande explicitement du JSON
  const body = {
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: `${SENSEI_SYSTEM_PROMPT}
Tu renverras un objet JSON STRICT du format :
{"suggestions":[{"title":"string","tags":["string"],"actions":["string","string","..."]}, ...]}` },
      ...SENSEI_FEW_SHOTS,
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' as const }
  };

  try {
    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`OpenAI status ${res.status}`);
    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.suggestions) return parsed;
    }
  } catch {
    // on continue en fallback
  }

  // Fallback texte
  const fallbackText = await getSenseiAdvice(prompt, apiKey).catch(()=>undefined);
  return { fallbackText };
}
