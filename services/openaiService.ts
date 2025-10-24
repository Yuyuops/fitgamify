// services/openaiService.ts
import { Program } from '../types';

/** ✅ Export attendu par SettingsPage.tsx */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    return res.ok;
  } catch (e) {
    console.error('OpenAI API key validation failed:', e);
    return false;
  }
}

/** Ton implémentation Sensei côté OpenAI */
export async function getOpenAICoachSuggestion(
  prompt: string,
  apiKey: string
): Promise<Partial<Program>[] | null> {
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
  `.trim();

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? '';

    // 🔒 Garde-fou : si le contenu n'est pas un JSON valide, on renvoie une fiche "texte"
    try {
      const parsed = JSON.parse(text);
      const suggestions = (parsed.suggestions ?? []) as Partial<Program>[];
      return suggestions.map(s => ({
        ...s,
        exercises: (s.exercises ?? []).map((ex: any) => ({
          exerciseId: `new-${(ex.name ?? 'ex').toLowerCase().replace(/\s+/g, '-')}`,
          ...ex
        }))
      }));
    } catch {
      return [
        {
          name: 'Conseil du Sensei',
          category: ['Mindset', 'Discipline'],
          notes: text
        }
      ];
    }
  } catch (error) {
    console.error('Error getting OpenAI coach suggestion:', error);
    return null;
  }
}
