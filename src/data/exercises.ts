/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exercise, Routine, CompletedWorkout } from '../types';

export const DEFAULT_EXERCISES: Exercise[] = [
  // 가슴 (Chest)
  { id: 'bench-press', name: '벤치 프레스 (바벨)', category: '가슴', type: 'weight_reps' },
  { id: 'incline-bench-press', name: '인클라인 벤치 프레스 (바벨)', category: '가슴', type: 'weight_reps' },
  { id: 'dumbbell-press', name: '덤벨 프레스', category: '가슴', type: 'weight_reps' },
  { id: 'incline-dumbbell-press', name: '인클라인 덤벨 프레스', category: '가슴', type: 'weight_reps' },
  { id: 'chest-fly-machine', name: '체스트 플라이 (머신)', category: '가슴', type: 'weight_reps' },
  { id: 'push-up', name: '푸쉬업', category: '가슴', type: 'bodyweight_reps' },
  { id: 'cable-crossover', name: '케이블 크로스오버', category: '가슴', type: 'weight_reps' },

  // 등 (Back)
  { id: 'deadlift', name: '데드리프트 (바벨)', category: '등', type: 'weight_reps' },
  { id: 'pull-up', name: '풀업 (턱걸이)', category: '등', type: 'bodyweight_reps' },
  { id: 'lat-pulldown', name: '랫 풀 다운', category: '등', type: 'weight_reps' },
  { id: 'barbell-row', name: '바벨 로우', category: '등', type: 'weight_reps' },
  { id: 'dumbbell-row', name: '원 암 덤벨 로우', category: '등', type: 'weight_reps' },
  { id: 'seated-row-machine', name: '시티드 로우 (머신)', category: '등', type: 'weight_reps' },

  // 하체 (Legs)
  { id: 'squat', name: '스쿼트 (바벨)', category: '하체', type: 'weight_reps' },
  { id: 'leg-press', name: '레그 프레스', category: '하체', type: 'weight_reps' },
  { id: 'leg-extension', name: '레그 익스텐션', category: '하체', type: 'weight_reps' },
  { id: 'leg-curl', name: '레그 컬', category: '하체', type: 'weight_reps' },
  { id: 'lunge', name: '런지 (덤벨)', category: '하체', type: 'weight_reps' },
  { id: 'romanian-deadlift', name: '루마니안 데드리프트', category: '하체', type: 'weight_reps' },

  // 어깨 (Shoulders)
  { id: 'overhead-press', name: '오버헤드 프레스 (바벨)', category: '어깨', type: 'weight_reps' },
  { id: 'dumbbell-shoulder-press', name: '덤벨 숄더 프레스', category: '어깨', type: 'weight_reps' },
  { id: 'side-lateral-raise', name: '사이드 레터럴 레이즈', category: '어깨', type: 'weight_reps' },
  { id: 'bent-over-lateral-raise', name: '벤트 오버 레터럴 레이즈', category: '어깨', type: 'weight_reps' },
  { id: 'front-raise', name: '프론트 레이즈 (덤벨)', category: '어깨', type: 'weight_reps' },

  // 팔 (Arms)
  { id: 'barbell-curl', name: '바벨 컬', category: '팔', type: 'weight_reps' },
  { id: 'dumbbell-curl', name: '덤벨 컬', category: '팔', type: 'weight_reps' },
  { id: 'triceps-pushdown-cable', name: '트라이셉스 푸쉬다운 (케이블)', category: '팔', type: 'weight_reps' },
  { id: 'lying-triceps-extension', name: '라잉 트라이셉스 익스텐션', category: '팔', type: 'weight_reps' },
  { id: 'hammer-curl', name: '해머 컬', category: '팔', type: 'weight_reps' },

  // 복근 (Core)
  { id: 'crunch', name: '크런치', category: '복근', type: 'bodyweight_reps' },
  { id: 'leg-raise', name: '레그 레이즈', category: '복근', type: 'bodyweight_reps' },
  { id: 'plank', name: '플랭크', category: '복근', type: 'time' },

  // 유산소 (Cardio)
  { id: 'running', name: '러닝머신 (트레드밀)', category: '유산소', type: 'time' },
  { id: 'cycling', name: '실내 자전거', category: '유산소', type: 'time' },
  { id: 'stair-climber', name: '천국의 계단 (스텝밀)', category: '유산소', type: 'time' },
];

export const STARTER_ROUTINES: Routine[] = [
  {
    id: 'routine-push',
    name: '🔥 가슴 & 어깨 & 삼두 (Push)',
    description: '상체 밀기 운동 위주의 루틴입니다. 가슴과 전면 어깨, 삼두근을 자극합니다.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    exercises: [
      {
        id: 're-1',
        exerciseId: 'bench-press',
        name: '벤치 프레스 (바벨)',
        category: '가슴',
        type: 'weight_reps',
        sets: [
          { id: 'set-1-1', setNumber: 1, weight: 60, reps: 10, completed: false },
          { id: 'set-1-2', setNumber: 2, weight: 60, reps: 10, completed: false },
          { id: 'set-1-3', setNumber: 3, weight: 65, reps: 8, completed: false },
          { id: 'set-1-4', setNumber: 4, weight: 65, reps: 8, completed: false },
        ]
      },
      {
        id: 're-2',
        exerciseId: 'dumbbell-shoulder-press',
        name: '덤벨 숄더 프레스',
        category: '어깨',
        type: 'weight_reps',
        sets: [
          { id: 'set-2-1', setNumber: 1, weight: 16, reps: 12, completed: false },
          { id: 'set-2-2', setNumber: 2, weight: 16, reps: 10, completed: false },
          { id: 'set-2-3', setNumber: 3, weight: 18, reps: 8, completed: false },
        ]
      },
      {
        id: 're-3',
        exerciseId: 'side-lateral-raise',
        name: '사이드 레터럴 레이즈',
        category: '어깨',
        type: 'weight_reps',
        sets: [
          { id: 'set-3-1', setNumber: 1, weight: 7, reps: 15, completed: false },
          { id: 'set-3-2', setNumber: 2, weight: 7, reps: 15, completed: false },
          { id: 'set-3-3', setNumber: 3, weight: 7, reps: 15, completed: false },
        ]
      },
      {
        id: 're-4',
        exerciseId: 'triceps-pushdown-cable',
        name: '트라이셉스 푸쉬다운 (케이블)',
        category: '팔',
        type: 'weight_reps',
        sets: [
          { id: 'set-4-1', setNumber: 1, weight: 20, reps: 12, completed: false },
          { id: 'set-4-2', setNumber: 2, weight: 25, reps: 10, completed: false },
          { id: 'set-4-3', setNumber: 3, weight: 25, reps: 10, completed: false },
        ]
      }
    ]
  },
  {
    id: 'routine-pull',
    name: '💪 등 & 이두 (Pull)',
    description: '상체 당기기 운동 위주의 루틴입니다. 등 전체와 이두근을 자극합니다.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    exercises: [
      {
        id: 're-5',
        exerciseId: 'lat-pulldown',
        name: '랫 풀 다운',
        category: '등',
        type: 'weight_reps',
        sets: [
          { id: 'set-5-1', setNumber: 1, weight: 40, reps: 12, completed: false },
          { id: 'set-5-2', setNumber: 2, weight: 45, reps: 10, completed: false },
          { id: 'set-5-3', setNumber: 3, weight: 50, reps: 8, completed: false },
          { id: 'set-5-4', setNumber: 4, weight: 50, reps: 8, completed: false },
        ]
      },
      {
        id: 're-6',
        exerciseId: 'pull-up',
        name: '풀업 (턱걸이)',
        category: '등',
        type: 'bodyweight_reps',
        sets: [
          { id: 'set-6-1', setNumber: 1, weight: 0, reps: 8, completed: false },
          { id: 'set-6-2', setNumber: 2, weight: 0, reps: 8, completed: false },
          { id: 'set-6-3', setNumber: 3, weight: 0, reps: 6, completed: false },
        ]
      },
      {
        id: 're-7',
        exerciseId: 'seated-row-machine',
        name: '시티드 로우 (머신)',
        category: '등',
        type: 'weight_reps',
        sets: [
          { id: 'set-7-1', setNumber: 1, weight: 35, reps: 12, completed: false },
          { id: 'set-7-2', setNumber: 2, weight: 40, reps: 10, completed: false },
          { id: 'set-7-3', setNumber: 3, weight: 40, reps: 10, completed: false },
        ]
      },
      {
        id: 're-8',
        exerciseId: 'barbell-curl',
        name: '바벨 컬',
        category: '팔',
        type: 'weight_reps',
        sets: [
          { id: 'set-8-1', setNumber: 1, weight: 20, reps: 12, completed: false },
          { id: 'set-8-2', setNumber: 2, weight: 25, reps: 10, completed: false },
          { id: 'set-8-3', setNumber: 3, weight: 25, reps: 10, completed: false },
        ]
      }
    ]
  },
  {
    id: 'routine-legs',
    name: '🏋️ 하체 & 복근 (Legs & Core)',
    description: '강력한 하체 단련과 코어 안정을 위한 루틴입니다.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    exercises: [
      {
        id: 're-9',
        exerciseId: 'squat',
        name: '스쿼트 (바벨)',
        category: '하체',
        type: 'weight_reps',
        sets: [
          { id: 'set-9-1', setNumber: 1, weight: 60, reps: 10, completed: false },
          { id: 'set-9-2', setNumber: 2, weight: 80, reps: 8, completed: false },
          { id: 'set-9-3', setNumber: 3, weight: 80, reps: 8, completed: false },
          { id: 'set-9-4', setNumber: 4, weight: 90, reps: 6, completed: false },
        ]
      },
      {
        id: 're-10',
        exerciseId: 'leg-press',
        name: '레그 프레스',
        category: '하체',
        type: 'weight_reps',
        sets: [
          { id: 'set-10-1', setNumber: 1, weight: 120, reps: 12, completed: false },
          { id: 'set-10-2', setNumber: 2, weight: 140, reps: 10, completed: false },
          { id: 'set-10-3', setNumber: 3, weight: 160, reps: 10, completed: false },
        ]
      },
      {
        id: 're-11',
        exerciseId: 'leg-raise',
        name: '레그 레이즈',
        category: '복근',
        type: 'bodyweight_reps',
        sets: [
          { id: 'set-11-1', setNumber: 1, weight: 0, reps: 15, completed: false },
          { id: 'set-11-2', setNumber: 2, weight: 0, reps: 15, completed: false },
          { id: 'set-11-3', setNumber: 3, weight: 0, reps: 15, completed: false },
        ]
      }
    ]
  }
];

// Generates past completed workouts for visual charts
export const generateMockHistory = (): CompletedWorkout[] => {
  const history: CompletedWorkout[] = [];
  const today = new Date();

  // Helper to subtract days
  const subDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
  };

  const formatDate = (date: Date): string => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Predefined completed sessions (to show trends)
  const templates = [
    {
      routineName: '🔥 가슴 & 어깨 & 삼두 (Push)',
      duration: 3240, // 54 mins
      exercises: [
        {
          exerciseId: 'bench-press',
          name: '벤치 프레스 (바벨)',
          category: '가슴' as const,
          type: 'weight_reps' as const,
          weights: [50, 55, 60, 60],
          reps: [10, 10, 8, 8]
        },
        {
          exerciseId: 'dumbbell-shoulder-press',
          name: '덤벨 숄더 프레스',
          category: '어깨' as const,
          type: 'weight_reps' as const,
          weights: [14, 14, 16],
          reps: [12, 10, 8]
        },
        {
          exerciseId: 'side-lateral-raise',
          name: '사이드 레터럴 레이즈',
          category: '어깨' as const,
          type: 'weight_reps' as const,
          weights: [6, 6, 6],
          reps: [15, 15, 15]
        }
      ]
    },
    {
      routineName: '💪 등 & 이두 (Pull)',
      duration: 3480, // 58 mins
      exercises: [
        {
          exerciseId: 'lat-pulldown',
          name: '랫 풀 다운',
          category: '등' as const,
          type: 'weight_reps' as const,
          weights: [35, 40, 45, 45],
          reps: [12, 12, 10, 8]
        },
        {
          exerciseId: 'pull-up',
          name: '풀업 (턱걸이)',
          category: '등' as const,
          type: 'bodyweight_reps' as const,
          weights: [0, 0, 0],
          reps: [8, 7, 6]
        },
        {
          exerciseId: 'barbell-curl',
          name: '바벨 컬',
          category: '팔' as const,
          type: 'weight_reps' as const,
          weights: [15, 20, 20],
          reps: [12, 10, 10]
        }
      ]
    },
    {
      routineName: '🏋️ 하체 & 복근 (Legs & Core)',
      duration: 3600, // 60 mins
      exercises: [
        {
          exerciseId: 'squat',
          name: '스쿼트 (바벨)',
          category: '하체' as const,
          type: 'weight_reps' as const,
          weights: [50, 70, 70, 80],
          reps: [10, 10, 8, 6]
        },
        {
          exerciseId: 'leg-press',
          name: '레그 프레스',
          category: '하체' as const,
          type: 'weight_reps' as const,
          weights: [100, 120, 140],
          reps: [12, 10, 10]
        },
        {
          exerciseId: 'leg-raise',
          name: '레그 레이즈',
          category: '복근' as const,
          type: 'bodyweight_reps' as const,
          weights: [0, 0, 0],
          reps: [15, 15, 15]
        }
      ]
    }
  ];

  // Let's seed 10 workouts over the last 14 days
  // E.g. days ago: 13, 11, 10, 8, 7, 6, 4, 3, 1, 0 (today)
  const workoutDaysAgo = [13, 11, 8, 7, 5, 4, 2, 1];

  workoutDaysAgo.forEach((daysAgo, index) => {
    const workoutDate = subDays(today, daysAgo);
    const templateIndex = index % templates.length;
    const template = templates[templateIndex];

    // Slightly adjust weights and reps based on daysAgo to show progressive overload!
    // Older days (larger daysAgo) will have slightly lower weights
    const factor = (14 - daysAgo) / 14; // goes from 0.07 to 1.0
    const weightMultiplier = 0.9 + (factor * 0.15); // ranges from ~0.9 to ~1.05

    const completedExercises = template.exercises.map((ex, exIdx) => {
      const sets = ex.weights.map((w, sIdx) => {
        const adjustedWeight = ex.type === 'bodyweight_reps' ? 0 : Math.round((w * weightMultiplier) / 2.5) * 2.5;
        const baseReps = ex.reps[sIdx];
        const adjustedReps = baseReps + (factor > 0.6 ? 1 : 0);

        return {
          id: `comp-set-${daysAgo}-${exIdx}-${sIdx}`,
          setNumber: sIdx + 1,
          weight: adjustedWeight,
          reps: adjustedReps,
          completed: true
        };
      });

      return {
        id: `comp-ex-${daysAgo}-${exIdx}`,
        exerciseId: ex.exerciseId,
        name: ex.name,
        category: ex.category,
        type: ex.type,
        sets
      };
    });

    let totalWeight = 0;
    let totalSetsCount = 0;
    completedExercises.forEach(ex => {
      ex.sets.forEach(s => {
        totalWeight += s.weight * s.reps;
        totalSetsCount++;
      });
    });

    history.push({
      id: `workout-history-${daysAgo}`,
      routineName: template.routineName,
      date: formatDate(workoutDate),
      endTime: workoutDate.toISOString(),
      duration: Math.round(template.duration * (0.95 + Math.random() * 0.1)),
      exercises: completedExercises,
      totalWeight,
      totalSetsCount,
      notes: daysAgo === 1 ? '컨디션 매우 좋음. 벤치프레스 증량 성공!' : undefined
    });
  });

  return history.sort((a, b) => b.endTime.localeCompare(a.endTime));
};
