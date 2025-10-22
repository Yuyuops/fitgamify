
import { GoogleGenAI, Type } from "@google/genai";
import { Program } from '../types';

// This is a placeholder for the actual API key which should be in an environment variable.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const workoutSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: 'A creative and fitting name for the workout program.' },
    mode: { type: Type.STRING, enum: ['series', 'sets'], description: 'Workout mode: "series" for traditional sets per exercise, "sets" for a circuit/rounds.' },
    rounds: { type: Type.INTEGER, description: 'Number of rounds/circuits. Only for "sets" mode.' },
    restBetweenRoundsSec: { type: Type.INTEGER, description: 'Rest time in seconds between rounds. Only for "sets" mode.' },
    category: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'Relevant categories (e.g., HIIT, Full-Body, Strength).' },
    equipment: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'List of required equipment (e.g., kettlebell, none).' },
    exercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'Name of the exercise.' },
          target: {
            type: Type.OBJECT,
            properties: {
              reps: { type: Type.INTEGER, description: 'Number of repetitions.' },
              timeSec: { type: Type.INTEGER, description: 'Duration in seconds.' }
            }
          },
          sets: { type: Type.INTEGER, description: 'Number of sets. Only for "series" mode.' },
          restSec: { type: Type.INTEGER, description: 'Rest in seconds after the exercise.' }
        },
        required: ['name', 'target']
      }
    }
  },
  required: ['name', 'mode', 'category', 'equipment', 'exercises']
};


export const parseWorkoutFromImage = async (base64Image: string, mimeType: string): Promise<Partial<Program> | null> => {
    if (!API_KEY) return null;
    try {
        const imagePart = {
            inlineData: {
                data: base64Image,
                mimeType: mimeType,
            },
        };
        const textPart = {
            text: `Analyze this workout image. Extract the program name, mode (series or sets/rounds), exercises, and their targets (reps or time). Format the output as JSON according to the provided schema. Infer equipment and categories.`,
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: workoutSchema,
            }
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        // Basic validation and mapping
        const programData: Partial<Program> = { ...parsedData };
        programData.exercises = parsedData.exercises.map((ex: any) => ({
             // In a real app, you would match `ex.name` to an existing exerciseId or create a new one.
            exerciseId: `new-${ex.name.toLowerCase().replace(/\s/g, '-')}`,
            ...ex,
        }));
        
        return programData;
    } catch (error) {
        console.error("Error parsing workout from image:", error);
        return null;
    }
};

export const getAICoachSuggestion = async (prompt: string): Promise<Partial<Program>[] | null> => {
    if (!API_KEY) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Based on this user request: "${prompt}", create three distinct workout programs. Respond with a JSON array where each object matches the provided schema. Ensure the workouts are logical and well-structured for the user's goal.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: workoutSchema,
                }
            }
        });
        
        const jsonText = response.text.trim();
        const suggestions = JSON.parse(jsonText) as Partial<Program>[];

        return suggestions.map(suggestion => ({
            ...suggestion,
            exercises: (suggestion.exercises || []).map((ex: any) => ({
                exerciseId: `new-${ex.name.toLowerCase().replace(/\s/g, '-')}`,
                ...ex,
            }))
        }));

    } catch (error) {
        console.error("Error getting AI coach suggestion:", error);
        return null;
    }
};
