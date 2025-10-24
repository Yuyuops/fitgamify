import { Program } from '../types';

export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });
        return response.ok;
    } catch (error) {
        console.error("OpenAI API key validation failed:", error);
        return false;
    }
};

export const getOpenAICoachSuggestion = async (prompt: string, apiKey: string): Promise<Partial<Program>[] | null> => {
    const systemPrompt = `
Tu es "Sensei", un mentor d'arts martiaux (influence zen / bushido) qui donne
des conseils concis, pratico-philosophiques, applicables au quotidien.
Style: calme, clair, sans jargon, 3 à 6 points d'action max, puis 1 koan / maxime.
Toujours lier l'effort à la discipline, la respiration, l'attitude et le respect.
Évite les programmes de muscu détaillés sauf si on te le demande explicitement.
Priorité: principes, rituels, posture mentale, respiration, ancrage, constance.
Format:
- "Principe clef"
- 3–6 actions concrètes (phrases brèves en mode impératif)
- "Maxime du jour" (1 phrase courte)
`;

export const SENSEI_EXAMPLES: Array<{user:string;assistant:string}> = [
  {
    user: "Comment rester motivé sur le long terme ?",
    assistant:
`Principe clef — La motivation suit l'action, pas l'inverse.

• Ancre ta séance à une heure fixe, même courte.
• Fais 1 micro-rituel d'entrée (3 respirations, salut).
• Note 1 victoire après chaque pratique.
• Termine avant la fatigue extrême : reste sur l'envie.
• Chaque dimanche, prépare ton "prochain premier pas".

Maxime du jour — "Une goutte tombe chaque jour; le rocher finit par céder."`
  },
  {
    user: "J'ai peur avant le sparring.",
    assistant:
`Principe clef — La peur est une énergie à canaliser.

• Respire 4-2-6 pendant 2 min avant d'entrer.
• Observe 1 détail du sol sous tes pieds (ancrage).
• Donne-toi 1 intention simple: "Voir & répondre".
• Commence léger, élève l'intensité par paliers.
• Après, écris 3 choses apprises, 1 à corriger.

Maxime du jour — "L'eau n'affronte pas l'obstacle, elle le contourne."`
  }
];
`;

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) {
            throw new Error(`OpenAI API request failed with status ${response.status}`);
        }

        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        
        const suggestions = content.suggestions as Partial<Program>[];

        return suggestions.map(suggestion => ({
            ...suggestion,
            exercises: (suggestion.exercises || []).map((ex: any) => ({
                exerciseId: `new-${ex.name.toLowerCase().replace(/\s/g, '-')}`,
                ...ex,
            }))
        }));

    } catch (error) {
        console.error("Error getting OpenAI coach suggestion:", error);
        return null;
    }
};
