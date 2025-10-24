// services/openaiService.ts
// Utilities to use OpenAI with a "Sensei" (bushidō/zen) style.
// Nothing here is stored on your servers; the key is read from localStorage by your Settings page.

export async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    return res.ok;
  } catch (e) {
    console.error('OpenAI key validation failed:', e);
    return false;
  }
}

/** Examples the model can imitate (few-shot). */
const SENSEI_EXAMPLES: Array<{ user: string; assistant: string }> = [
  {
    user: 'Comment rester motivé sur le long terme ?',
    assistant:
`Principe clef — La motivation suit l’action, pas l’inverse.

• Ancre ta séance à une heure fixe, même courte.
• Fais 1 micro-rituel d’entrée (3 respirations, salut).
• Note 1 victoire après chaque pratique.
• Termine avant la fatigue extrême : reste sur l’envie.
• Chaque dimanche, prépare ton "prochain premier pas".

Maxime du jour — "Une goutte tombe chaque jour ; le rocher finit par céder."`
  },
  {
    user: 'J’ai peur avant le sparring.',
    assistant:
`Principe clef — La peur est une énergie à canaliser.

• Respire 4-2-6 pendant 2 min avant d’entrer.
• Sens le sol sous tes pieds (ancrage).
• Donne 1 intention simple : "Voir & répondre".
• Monte l’intensité par paliers.
• Après, note 3 choses apprises, 1 à corriger.

Maxime du jour — "L’eau n’affronte pas l’obstacle, elle le contourne."`
  }
];

const SYSTEM_PROMPT = `
Tu es "Sensei", un mentor d'arts martiaux (influence zen / bushidō) qui donne des
conseils concis, pratico-philosophiques, applicables au quotidien.
Style: calme, clair, sans jargon, 3 à 6 points d'action max, puis 1 koan / maxime.
Toujours lier l'effort à la discipline, la respiration, l'attitude et le respect.
Évite les programmes de muscu détaillés sauf si demandé explicitement.
Priorité: principes, rituels, posture mentale, respiration, ancrage, constance.
Format préféré (texte simple) :
- "Principe clef"
- 3–6 actions concrètes (impératif, phrases brèves)
- "Maxime du jour" (1 phrase)
Si l'utilisateur demande un plan structuré, tu peux renvoyer aussi une structure JSON.
`;

/**
 * Try to produce *structured* suggestions. If the model answers in plain text,
 * we still return it via `fallbackText`.
 */
export async function getSenseiSuggestions(
  prompt: string,
  apiKey: string
): Promise<
  | { suggestions?: Array<{ title: string; actions?: string[]; tags?: string[] }>; fallbackText?: string }
  | null
> {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          // few-shot
          ...SENSEI_EXAMPLES.flatMap(ex => [
            { role: 'user', content: ex.user },
            { role: 'assistant', content: ex.assistant }
          ]),
          { role: 'user', content: prompt }
        ],
        // Ask text primarily; if the model *chooses* to return JSON, we'll parse it.
        temperature: 0.7
      })
    });

    if (!res.ok) {
      throw new Error(`OpenAI request failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    if (!content) return null;

    // Try to detect embedded JSON first
    const jsonMatch =
      content.match(/\{[\s\S]*\}$/) || content.match(/```json[\s\S]*?```/i) || content.match(/```[\s\S]*?```/i);

    if (jsonMatch) {
      const raw = jsonMatch[0].replace(/```json|```/g, '').trim();
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.suggestions)) {
          return { suggestions: parsed.suggestions };
        }
      } catch {
        /* fall back to text */
      }
    }

    // Otherwise return the plain text advice
    return { fallbackText: content };
  } catch (e) {
    console.error('getSenseiSuggestions error:', e);
    return null;
  }
}
