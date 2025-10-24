// src/services/openaiService.ts
import { Program } from '../types';

/**
 * Vérifie rapidement la clé OpenAI (pas d'appel sensible, on liste les modèles).
 */
export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: { Authorization: `Bearer ${apiKey}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Sensei "bushido" : on demande un texte concis avec des puces + une maxime.
 * On normalise ensuite ce texte en un "pseudo-programme" pour l'affichage existant.
 */
export async function getOpenAICoachSuggestion(
  prompt: string,
  apiKey: string
): Promise<Partial<Program>[] | null> {
  const systemPrompt = `
Tu es "Sensei", mentor d'arts martiaux (influence zen/bushido).
Donne des conseils concis, pratico-philosophiques, applicables tout de suite.
Style: calme, clair, sans jargon.
Toujours relier effort, souffle, posture mentale, respect, constance.
Ne propose PAS un plan de musculation détaillé (sauf demande explicite).
Format de sortie (texte simple) :
- 3 à 6 puces d'actions concrètes, à l'impératif
- puis une dernière ligne commençant par "Maxime :" avec une courte maxime.
`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!res.ok) {
      console.error('OpenAI request failed with status:', res.status);
      return null;
    }

    const data = await res.json();
    const text: string = data?.choices?.[0]?.message?.content ?? '';

    // On transforme les lignes en items affichables comme des "exercices"
    const lines = text
      .split('\n')
      .map(l => l.replace(/^[-•]\s*/, '').trim())
      .filter(Boolean);

    // Sépare les puces de la maxime finale si présente
    const adviceLines: string[] = [];
    let maximeLine = '';

    for (const l of lines) {
      if (/^maxime\s*:/i.test(l)) {
        maximeLine = l.replace(/^maxime\s*:\s*/i, '').trim();
      } else {
        adviceLines.push(l);
      }
    }

    const exercises = adviceLines.map((line, idx) => ({
      exerciseId: `sensei-${idx}`,
      name: line,
      target: {} as any
    }));

    if (maximeLine) {
      exercises.push({
        exerciseId: `sensei-maxime`,
        name: `Maxime — ${maximeLine}`,
        target: {} as any
      });
    }

    const suggestion: Partial<Program> = {
      name: 'Conseils du Sensei',
      category: ['Philosophie', 'Motivation'],
      exercises
    };

    return [suggestion];
  } catch (err) {
    console.error('Error in getOpenAICoachSuggestion:', err);
    return null;
  }
}
