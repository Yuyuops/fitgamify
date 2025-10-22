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
You are a world-class fitness coach named Sensei. Your task is to generate three distinct workout programs based on the user's request.
You MUST respond with a valid JSON object. The root object should have a single key "suggestions" which is an array of three program objects.
Each program object must conform to the following structure:
- name: string (A creative and fitting name for the workout program.)
- mode: string (Either 'series' for traditional sets or 'sets' for a circuit/rounds.)
- rounds: integer (Number of rounds. Only for 'sets' mode.)
- restBetweenRoundsSec: integer (Rest time in seconds between rounds. Only for 'sets' mode.)
- category: string[] (Relevant categories like 'HIIT', 'Full-Body', 'Strength'.)
- equipment: string[] (List of required equipment like 'kettlebell', 'none'.)
- exercises: Array of objects, each with:
  - name: string (Name of the exercise.)
  - target: object with 'reps' (integer) or 'timeSec' (integer).
  - sets: integer (Number of sets. Only for 'series' mode.)
  - restSec: integer (Rest in seconds after the exercise.)
Ensure the workouts are logical, well-structured, and directly address the user's goal.
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
