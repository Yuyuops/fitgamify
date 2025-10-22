
export interface Exercise {
  id: string;
  name: string;
  equipment: string[];
  muscles?: string[];
}

export interface ProgramExercise {
  exerciseId: string;
  target: { reps?: number; timeSec?: number };
  sets?: number;
  restSec?: number;
}

export interface Program {
  id:string;
  name: string;
  mode: 'series' | 'sets';
  rounds?: number;
  restBetweenRoundsSec?: number;
  category: string[];
  equipment: string[];
  estDurationMin: number;
  intensity: 1 | 2 | 3 | 4 | 5;
  exercises: ProgramExercise[];
}

export interface Session {
  id: string;
  programName: string;
  date: Date;
  xpGained: number;
  totalVolumeKg?: number;
  distanceKm?: number;
}

export interface Supplement {
  id: string;
  name: string;
  dosage: string;
  time: string;
  notes?: string;
}

export type SupplementLog = Record<string, boolean>;

export interface DailyLog {
  date: string; // YYYY-MM-DD
  sessions: Session[];
  hydration: number; // in ml
  supplementLog: SupplementLog;
}
