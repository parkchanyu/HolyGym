/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExerciseCategory = '가슴' | '등' | '하체' | '어깨' | '팔' | '복근' | '유산소' | '전신';

export type ExerciseType = 'weight_reps' | 'bodyweight_reps' | 'time' | 'distance';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  type: ExerciseType;
  isCustom?: boolean;
  notes?: string;
}

export interface WorkoutSet {
  id: string;
  setNumber: number;
  weight: number; // in kg
  reps: number;
  completed: boolean;
  isWarmup?: boolean;
}

export interface RoutineExercise {
  id: string; // unique instance ID in this routine
  exerciseId: string; // references Exercise.id
  name: string;
  category: ExerciseCategory;
  type: ExerciseType;
  sets: WorkoutSet[];
}

export interface Routine {
  id: string;
  name: string;
  description?: string;
  exercises: RoutineExercise[];
  createdAt: string;
}

export interface CompletedWorkout {
  id: string;
  routineId?: string;
  routineName: string;
  date: string; // YYYY-MM-DD
  endTime: string; // ISO string
  duration: number; // in seconds
  exercises: RoutineExercise[];
  notes?: string;
  totalWeight: number; // total kg lifted
  totalSetsCount: number;
}

export interface ActiveSession {
  routineId?: string;
  routineName: string;
  startTime: string; // ISO String
  exercises: RoutineExercise[];
  currentExerciseIndex: number;
  elapsedSeconds: number;
  notes?: string;
}
