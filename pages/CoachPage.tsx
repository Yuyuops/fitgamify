import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAICoachSuggestion } from '../services/geminiService';
import { getSenseiSuggestions } from '../services/openaiService';
import { Program } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const CoachPage: React.FC = () => {
  const location = useLocation();
  const initialPrompt = (location.state as any)?.prompt || '';

  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [suggestions, setSuggestions] = useState<Partial<Program>[]>([]);
  const [adviceText, setAdviceText] = useState<string>(''); // <-- pour le texte "Sensei"
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setAdviceText('');

    try {
      // On lit ce que tu stockes déjà dans SettingsPage
      const openAIKey = localStorage.getItem('openai_api_key');
      const keyStatus = localStorage.getItem('openai_api_key_status'); // "valid" si validée

      // 1) OPENAI (Sensei) prioritaire si clé valide
      if (openAIKey && keyStatus === 'valid') {
        console.log('Using OpenAI Sensei (bushidō/zen)…');
        const result = await getSenseiSuggestions(prompt, openAIKey);
        // Si l’IA renvoie un JSON structuré, on affiche en cartes
        if (result?.suggestions?.length) {
          // On mappe ce JSON en un modèle proche de Program pour garder l’affichage actuel
          const mapped: Partial<Program>[] = result.suggestions.map((s, idx) => ({
            name: s.title || `Suggestion ${idx + 1}`,
            category: s.tags || [],
            // on place les actions comme “exercices” textuels pour réutiliser la liste
            exercises: (s.actions || []).map((a) => ({
              name: a,
              target: { timeSec: undefined, reps: undefined }, // pas de quantification ici
            }))
          }));

          setSuggestions(mapped);
          return;
        }

        // Sinon on montre le texte “Sensei”
        if (result?.fallbackText) {
          setAdviceText(result.fallbackText);
          return;
        }

        // Si pas de réponse exploitable -> on bascule Gemini
        console.warn('OpenAI OK mais pas de contenu exploitable, fallback Gemini.');
      }

      // 2) GEMINI (fallback)
      console.log('Using Gemini fallback…');
      const gemini = await getAICoachSuggestion(prompt);
      if (!gemini) {
        setError("Le Sensei ne répond pas. Vérifie la configuration de l’API ou réessaie.");
        return;
      }
      setSuggestions(gemini);

    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Le dojo subit des interférences.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2
        className="text-2xl font-bold text-center"
        style={{ fontFamily: "'Rajdhani', sans-serif" }}
      >
        Parle au Sensei
      </h2>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex : “J’ai 30 min, zéro matos, objectif brûler 300 kcal” ou “Comment rester motivé ?”"
            className="w-full bg-dojo-bg-start border border-dojo-border rounded-lg p-3 text-dojo-text placeholder-dojo-text-muted focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue"
            rows={3}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Le Sensei réfléchit…' : 'Demander conseil'}
          </Button>
        </form>
      </Card>

      {error && <p className="text-center text-red-400">{error}</p>}

      {/* Affichage TEXTE (Sensei) */}
      {adviceText && (
        <Card>
          <div
            className="text-dojo-text leading-relaxed whitespace-pre-wrap"
            // on garde les retours à la ligne, pas besoin de Markdown ici
          >
            {adviceText}
          </div>
        </Card>
      )}

      {/* Affichage CARTES (structuré) */}
      <div className="space-y-4">
        {suggestions.map((program, index) => (
          <Card key={index}>
            <h3 className="font-bold text-lg text-dojo-glow-blue">
              {program.name}
            </h3>
            <p className="text-sm text-dojo-text-muted">
              {(program.category || []).join(', ') || 'Conseils'}
              {' '}– {program.estDurationMin || 'N/A'} min
            </p>
            <ul className="mt-2 list-disc list-inside text-sm">
              {(program.exercises || []).map((ex: any, i) => {
                const label =
                  ex?.name ||
                  (typeof ex === 'string' ? ex : 'Action');
                const detail =
                  ex?.target?.reps
                    ? `${ex.target.reps} reps`
                    : ex?.target?.timeSec
                      ? `${ex.target.timeSec} sec`
                      : ''; // souvent vide pour des conseils
                return (
                  <li key={i}>
                    {label}{detail ? ` (${detail})` : ''}
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoachPage;
