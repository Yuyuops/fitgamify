import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getAICoachSuggestion } from '../services/geminiService';
import { getOpenAICoachSuggestion } from '../services/openaiService';
import { Program } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const CoachPage: React.FC = () => {
  const location = useLocation();
  const initialPrompt = (location.state as any)?.prompt || '';
  const [prompt, setPrompt] = useState(initialPrompt);
  const [suggestions, setSuggestions] = useState<Partial<Program>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const openAIKey = localStorage.getItem('openai_api_key');
      const keyStatus = localStorage.getItem('openai_api_key_status');

      let result: Partial<Program>[] | null = null;

      if (openAIKey && keyStatus === 'valid') {
        // OpenAI (coach "bushido")
        result = await getOpenAICoachSuggestion(prompt, openAIKey);
        if (!result) {
          setError("La requête avec OpenAI a échoué. Vérifiez votre clé ou le statut de l'API.");
        }
      } else {
        // Gemini par défaut
        result = await getAICoachSuggestion(prompt);
        if (!result) {
          setError("Le Sensei ne répond pas. Vérifiez la configuration de l'API Gemini ou réessayez.");
        }
      }

      if (result) {
        setSuggestions(result);
      }
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Le dojo subit des interférences.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
        Parle au Sensei
      </h2>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: 'J'ai 30 min, zéro matos, objectif brûler 300 kcal'"
            className="w-full bg-dojo-bg-start border border-dojo-border rounded-lg p-3 text-dojo-text placeholder-dojo-text-muted focus:outline-none focus:ring-2 focus:ring-dojo-glow-blue"
            rows={3}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Le Sensei réfléchit...' : 'Demander conseil'}
          </Button>
        </form>
      </Card>

      {error && <p className="text-center text-red-400">{error}</p>}

      <div className="space-y-4">
        {suggestions.map((program, index) => (
          <Card key={index}>
            <h3 className="font-bold text-lg text-dojo-glow-blue">{program.name}</h3>
            <p className="text-sm text-dojo-text-muted">
              {program.category?.join(', ') || '—'} — {program.estDurationMin || 'N/A'} min
            </p>
            <ul className="mt-2 list-disc list-inside text-sm">
              {(program.exercises || []).map((ex: any, i) => (
                <li key={i}>
                  {ex.name}{' '}
                  {ex.target?.reps
                    ? `(${ex.target.reps} reps)`
                    : ex.target?.timeSec
                    ? `(${ex.target.timeSec} sec)`
                    : ''}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CoachPage;
