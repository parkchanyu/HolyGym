/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, StopCircle, Plus, Trash2, X, PlusCircle, AlertTriangle,
  RotateCcw, Sparkles, Check, ChevronRight, Clock, Award, Flame, Dumbbell,
  Timer, Volume2, Search, CheckCircle2, NotepadText
} from 'lucide-react';
import { Routine, RoutineExercise, WorkoutSet, Exercise, CompletedWorkout, ExerciseCategory } from '../types';
import { DEFAULT_EXERCISES } from '../data/exercises';

interface WorkoutSessionProps {
  routine: Routine | null; // null represents empty quick workout
  customExercises: Exercise[];
  onFinishWorkout: (completed: CompletedWorkout) => void;
  onCancelWorkout: () => void;
}

export default function WorkoutSession({
  routine,
  customExercises,
  onFinishWorkout,
  onCancelWorkout
}: WorkoutSessionProps) {
  // Setup the active workout exercises list (mutable during workout)
  const [sessionExercises, setSessionExercises] = useState<RoutineExercise[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [workoutNotes, setWorkoutNotes] = useState<string>('');
  const [isAddingExercise, setIsAddingExercise] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | '전체'>('전체');
  
  // Timer running state
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Rest Timer State
  const [restDuration, setRestDuration] = useState<number>(0); // remaining seconds
  const [initialRestTime, setInitialRestTime] = useState<number>(60); // default 60s rest
  const [isRestTimerActive, setIsRestTimerActive] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Workout finished summary recap modal overlay
  const [recapWorkout, setRecapWorkout] = useState<CompletedWorkout | null>(null);

  // References for clock timer
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const allExercises = [...DEFAULT_EXERCISES, ...customExercises];

  // Initialize session exercises on mount
  useEffect(() => {
    if (routine) {
      // Deep clone routine exercises so we don't mess up the template
      const clonedExercises: RoutineExercise[] = JSON.parse(JSON.stringify(routine.exercises));
      setSessionExercises(clonedExercises);
    } else {
      // Empty workout start
      setSessionExercises([]);
    }

    // Start timer
    timerIntervalRef.current = setInterval(() => {
      setIsPaused(prevPaused => {
        if (!prevPaused) {
          setElapsedSeconds(prev => prev + 1);
        }
        return prevPaused;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [routine]);

  // Rest timer countdown effect
  useEffect(() => {
    if (isRestTimerActive && restDuration > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestDuration(prev => {
          if (prev <= 1) {
            clearInterval(restIntervalRef.current!);
            setIsRestTimerActive(false);
            playBeepChime(true); // Alert rest timer ended!
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [isRestTimerActive, restDuration]);

  // Synthesized audio chime using Web Audio API
  const playBeepChime = (isEndChime: boolean = false) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      const playNote = (frequency: number, startTime: number, duration: number, volume: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = isEndChime ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(frequency, startTime);
        
        gain.gain.setValueAtTime(volume, startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
        
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      if (isEndChime) {
        // High, double chime for timer finish
        playNote(587.33, now, 0.15, 0.15); // D5
        playNote(880.00, now + 0.12, 0.35, 0.15); // A5
      } else {
        // Low cozy sound when checking a set
        playNote(523.25, now, 0.12, 0.12); // C5
      }
    } catch (e) {
      console.warn('Web Audio API is not supported or blocked by user action:', e);
    }
  };

  // Toggle set completed state
  const handleToggleSetCompleted = (reId: string, setId: string) => {
    let wasChecked = false;

    const updated = sessionExercises.map(ex => {
      if (ex.id !== reId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(set => {
          if (set.id !== setId) return set;
          const nextCompleted = !set.completed;
          if (nextCompleted) {
            wasChecked = true;
          }
          return {
            ...set,
            completed: nextCompleted
          };
        })
      };
    });

    setSessionExercises(updated);

    // If a set was newly checked, play soft sound and launch rest timer
    if (wasChecked) {
      playBeepChime(false);
      triggerRestTimer();
    }
  };

  // Launch rest timer count
  const triggerRestTimer = () => {
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    setRestDuration(initialRestTime);
    setIsRestTimerActive(true);
  };

  // Modify rest timer on-the-fly (+30s or -30s)
  const adjustRestTimer = (seconds: number) => {
    setRestDuration(prev => {
      const next = Math.max(0, prev + seconds);
      if (next === 0) {
        setIsRestTimerActive(false);
        if (restIntervalRef.current) clearInterval(restIntervalRef.current);
      }
      return next;
    });
  };

  // Skip rest timer entirely
  const handleSkipRest = () => {
    setIsRestTimerActive(false);
    setRestDuration(0);
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);
  };

  // Adjust default rest duration
  const changeDefaultRestTime = (seconds: number) => {
    setInitialRestTime(seconds);
    if (isRestTimerActive) {
      setRestDuration(seconds);
    }
  };

  // Dynamic values edit inside current session
  const handleUpdateSessionSet = (
    reId: string,
    setId: string,
    field: 'weight' | 'reps',
    value: number
  ) => {
    setSessionExercises(prev => prev.map(ex => {
      if (ex.id !== reId) return ex;
      return {
        ...ex,
        sets: ex.sets.map(s => {
          if (s.id !== setId) return s;
          return {
            ...s,
            [field]: value
          };
        })
      };
    }));
  };

  // Add a set dynamically during workout
  const handleAddSetDuringWorkout = (reId: string) => {
    setSessionExercises(prev => prev.map(ex => {
      if (ex.id !== reId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const weight = lastSet ? lastSet.weight : 20;
      const reps = lastSet ? lastSet.reps : 10;

      const newSet: WorkoutSet = {
        id: `active-set-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        setNumber: ex.sets.length + 1,
        weight,
        reps,
        completed: false
      };

      return {
        ...ex,
        sets: [...ex.sets, newSet]
      };
    }));
  };

  // Delete a set dynamically during workout
  const handleRemoveSetDuringWorkout = (reId: string, setId: string) => {
    setSessionExercises(prev => prev.map(ex => {
      if (ex.id !== reId) return ex;
      if (ex.sets.length <= 1) return ex; // must keep at least 1 set

      const filtered = ex.sets.filter(s => s.id !== setId);
      const updated = filtered.map((s, idx) => ({
        ...s,
        setNumber: idx + 1
      }));

      return {
        ...ex,
        sets: updated
      };
    }));
  };

  // Add exercise to active session on-the-fly
  const handleAddExerciseToActiveSession = (exercise: Exercise) => {
    const newSessionExercise: RoutineExercise = {
      id: `active-re-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      type: exercise.type,
      sets: [
        { id: `active-set-${Date.now()}-1`, setNumber: 1, weight: exercise.type === 'weight_reps' ? 20 : 0, reps: 10, completed: false }
      ]
    };

    setSessionExercises(prev => [...prev, newSessionExercise]);
    setIsAddingExercise(false);
  };

  // Delete exercise from active session
  const handleDeleteExerciseFromSession = (reId: string) => {
    if (confirm('이 운동 종목을 현재 운동에서 완전히 제외할까요?')) {
      setSessionExercises(prev => prev.filter(ex => ex.id !== reId));
    }
  };

  // Finish Workout process
  const handleFinishSession = () => {
    // Compile completed exercises
    // Include only exercises that have at least one checked set, or ask user
    const completedExercises = sessionExercises.map(ex => {
      const completedSets = ex.sets.filter(s => s.completed);
      return {
        ...ex,
        sets: completedSets
      };
    }).filter(ex => ex.sets.length > 0);

    if (completedExercises.length === 0) {
      alert('완료한 세트가 하나도 없습니다. 한 세트 이상 완료 상태를 체크해 주세요!');
      return;
    }

    // Stop timer
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (restIntervalRef.current) clearInterval(restIntervalRef.current);

    // Calculate metrics
    let totalWeight = 0;
    let totalSetsCount = 0;
    completedExercises.forEach(ex => {
      ex.sets.forEach(s => {
        totalWeight += s.weight * s.reps;
        totalSetsCount++;
      });
    });

    const completedWorkoutRecord: CompletedWorkout = {
      id: `workout-log-${Date.now()}`,
      routineId: routine?.id,
      routineName: routine?.name || '🚀 빈 운동 루틴',
      date: new Date().toISOString().split('T')[0],
      endTime: new Date().toISOString(),
      duration: elapsedSeconds,
      exercises: completedExercises,
      notes: workoutNotes.trim() ? workoutNotes.trim() : undefined,
      totalWeight,
      totalSetsCount
    };

    // Set the recap to show the nice celebrate pop up
    setRecapWorkout(completedWorkoutRecord);
  };

  // Confirm and save from recap popup
  const handleConfirmSaveRecap = () => {
    if (recapWorkout) {
      onFinishWorkout(recapWorkout);
    }
  };

  // Cancel workout (lose progress warning)
  const handleCancelSession = () => {
    if (confirm('정말로 현재 운동 세션을 취소할까요? 지금까지 입력한 모든 운동 기록이 소실됩니다.')) {
      onCancelWorkout();
    }
  };

  // Format stopwatch string
  const formatElapsedTime = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return [
      hrs > 0 ? String(hrs).padStart(2, '0') : null,
      String(mins).padStart(2, '0'),
      String(secs).padStart(2, '0')
    ].filter(Boolean).join(':');
  };

  const filteredExercisesCatalog = allExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.category.includes(searchQuery);
    const matchesCategory = selectedCategory === '전체' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Render Workout Finished Celebration Recap
  if (recapWorkout) {
    const durationMins = Math.round(recapWorkout.duration / 60);
    return (
      <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg p-6 md:p-8 text-center space-y-6 shadow-2xl animate-scale-in relative my-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-brand-neon rounded-full flex items-center justify-center shadow-lg shadow-brand-neon/35 border-4 border-zinc-900">
            <Award className="w-10 h-10 text-zinc-950 stroke-[2.5]" />
          </div>

          <div className="pt-10 space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-neon/10 border border-brand-neon/20 text-brand-neon text-[10px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              오운완! 오늘 운동 완료
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter italic font-display">
              오늘도 정말 멋지게 해내셨네요! 🎉
            </h1>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider max-w-sm mx-auto">
              땀방울은 배신하지 않습니다. 오늘의 기록이 쌓여 내일의 단단한 성장을 이룹니다.
            </p>
          </div>

          {/* Recap Big numbers */}
          <div className="grid grid-cols-3 gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">시간</span>
              <p className="text-lg md:text-xl font-black text-zinc-100 font-mono tracking-tighter">{durationMins}분</p>
            </div>
            <div className="border-x border-zinc-850 space-y-1">
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">완료 세트</span>
              <p className="text-lg md:text-xl font-black text-brand-neon font-mono tracking-tighter">{recapWorkout.totalSetsCount}S</p>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">누적 볼륨</span>
              <p className="text-lg md:text-xl font-black text-zinc-100 font-mono tracking-tighter">{(recapWorkout.totalWeight / 1000).toFixed(2)}t</p>
            </div>
          </div>

          {/* List of exercises completed */}
          <div className="space-y-3.5 text-left bg-zinc-950/40 rounded-2xl p-4 border border-zinc-850/60 max-h-56 overflow-y-auto">
            <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">오늘 격파한 운동 종목</h3>
            <div className="space-y-2.5">
              {recapWorkout.exercises.map((ex, idx) => (
                <div key={ex.id || idx} className="flex items-center justify-between text-xs border-b border-zinc-900 pb-1.5 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-bold text-zinc-200 truncate">{ex.name}</p>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">{ex.category}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-zinc-400 font-bold">{ex.sets.length}세트 완수</p>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {ex.type === 'weight_reps' 
                        ? `${Math.max(...ex.sets.map(s => s.weight))}kg 최고 중량`
                        : '체중 지탱'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <div className="pt-2">
            <button
              onClick={handleConfirmSaveRecap}
              className="w-full py-3.5 rounded-2xl bg-brand-neon hover:bg-brand-neon-light text-zinc-950 font-black uppercase tracking-tighter italic text-xs md:text-sm transition-all duration-200 shadow-xl shadow-brand-neon/15 flex items-center justify-center gap-2"
            >
              대시보드에 기록 남기기
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in relative" id="workout-session-view">
      {/* Upper Sticky Bar: Routine Name, Stopwatch and Actions */}
      <div className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-850 py-3.5 px-4 rounded-b-3xl flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-neon/10 text-brand-neon text-[9px] font-black uppercase tracking-wider border border-brand-neon/15">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse" />
              진행 중
            </span>
            <span className="text-xs text-zinc-400 font-mono font-bold flex items-center gap-1 bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-800">
              <Clock className="w-3.5 h-3.5 text-brand-neon" />
              {formatElapsedTime(elapsedSeconds)}
            </span>
          </div>
          <h1 className="text-base md:text-lg font-black text-white truncate mt-1.5 font-display italic">
            {routine?.name || '🚀 커스텀 빈 운동'}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? '운동 재개' : '운동 일시정지'}
            className={`p-2.5 rounded-2xl border transition ${
              isPaused 
                ? 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          </button>
          
          <button
            onClick={handleCancelSession}
            title="운동 종료 및 취소"
            className="p-2.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-red-500 hover:bg-red-950/20 hover:border-red-900/50 transition"
          >
            <StopCircle className="w-4 h-4" />
          </button>

          <button
            onClick={handleFinishSession}
            className="px-4 py-2.5 bg-brand-neon hover:bg-brand-neon-light text-zinc-950 font-black uppercase tracking-tighter italic text-xs rounded-2xl transition shadow-lg shadow-brand-neon/15"
          >
            운동 완료
          </button>
        </div>
      </div>

      {isPaused && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold rounded-xl flex items-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>현재 타이머가 일시정지 상태입니다. 운동을 재개하려면 정지 버튼을 누르세요.</span>
        </div>
      )}

      {/* Main active grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Core exercise checklist list (Left 8 Columns) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
              체크리스트 ({sessionExercises.length}개 운동)
            </h2>
            <button
              onClick={() => setIsAddingExercise(true)}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-zinc-300 text-xs font-bold border border-zinc-800 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4 text-brand-neon" />
              대체/종목 추가
            </button>
          </div>

          {sessionExercises.length === 0 ? (
            <div className="py-16 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 flex flex-col items-center justify-center space-y-4">
              <Dumbbell className="w-12 h-12 text-zinc-600 stroke-[1.5]" />
              <div className="space-y-1.5 max-w-xs">
                <p className="text-zinc-300 text-sm font-semibold">운동에 종목이 없습니다</p>
                <p className="text-zinc-500 text-xs">
                  우측 상단 '대체/종목 추가' 버튼을 눌러 오늘 완료할 운동들을 직접 목록에 더해보세요!
                </p>
              </div>
              <button
                onClick={() => setIsAddingExercise(true)}
                className="px-4 py-2.5 rounded-xl bg-brand-neon text-zinc-950 font-black uppercase tracking-tighter italic text-xs transition shadow-md shadow-brand-neon/10"
              >
                첫 종목 고르기
              </button>
            </div>
          ) : (
            <div className="space-y-4" id="active-session-exercises-checklist">
              {sessionExercises.map((ex, exIdx) => (
                <div 
                  key={ex.id}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-4 md:p-5 space-y-4"
                >
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-4 border-b border-zinc-850 pb-3">
                    <div>
                      <h3 className="font-extrabold text-zinc-100 text-sm md:text-base">
                        {ex.name}
                      </h3>
                      <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-400 mt-1">
                        {ex.category}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteExerciseFromSession(ex.id)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-950 transition"
                      title="종목 삭제"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Sets log list */}
                  <div className="space-y-2">
                    {ex.sets.map((set, sIdx) => (
                      <div 
                        key={set.id}
                        className={`grid grid-cols-12 items-center gap-2 p-2 rounded-2xl border transition ${
                          set.completed 
                            ? 'bg-brand-neon/5 border-brand-neon/20 text-brand-neon' 
                            : 'bg-zinc-950/40 border-zinc-850 text-zinc-400'
                        }`}
                      >
                        {/* Number tag */}
                        <div className="col-span-2 text-xs font-mono font-extrabold text-center">
                          S-{set.setNumber}
                        </div>

                        {/* Weight weight_reps input */}
                        <div className="col-span-4 flex items-center gap-1 justify-center">
                          {ex.type === 'weight_reps' ? (
                            <>
                              <input 
                                type="number"
                                min="0"
                                step="2.5"
                                value={set.weight}
                                onChange={(e) => handleUpdateSessionSet(ex.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                                className="w-14 bg-zinc-900 border border-zinc-800 rounded-md py-1 font-mono text-xs text-center text-zinc-200 focus:outline-none focus:border-brand-neon"
                              />
                              <span className="text-[10px] text-zinc-500">kg</span>
                            </>
                          ) : (
                            <span className="text-[10px] text-zinc-500 italic font-medium">맨몸 자중</span>
                          )}
                        </div>

                        {/* Reps input */}
                        <div className="col-span-4 flex items-center gap-1 justify-center">
                          <input 
                            type="number"
                            min="1"
                            value={set.reps}
                            onChange={(e) => handleUpdateSessionSet(ex.id, set.id, 'reps', parseInt(e.target.value) || 1)}
                            className="w-12 bg-zinc-900 border border-zinc-800 rounded-md py-1 font-mono text-xs text-center text-zinc-200 focus:outline-none focus:border-brand-neon"
                          />
                          <span className="text-[10px] text-zinc-500">
                            {ex.type === 'time' ? '초' : '회'}
                          </span>
                        </div>

                        {/* Check complete trigger */}
                        <div className="col-span-2 flex justify-center">
                          <button
                            onClick={() => handleToggleSetCompleted(ex.id, set.id)}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                              set.completed
                                ? 'bg-brand-neon border-brand-neon text-zinc-950 shadow-md shadow-brand-neon/20'
                                : 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-700'
                            }`}
                          >
                            <Check className={`w-4.5 h-4.5 stroke-[3] ${set.completed ? 'scale-100 text-zinc-950' : 'scale-0'} transition-all`} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add set trigger row & delete sets controls */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleAddSetDuringWorkout(ex.id)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 border border-zinc-850 text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      세트 추가
                    </button>
                    
                    {ex.sets.length > 1 && (
                      <button
                        onClick={() => handleRemoveSetDuringWorkout(ex.id, ex.sets[ex.sets.length - 1].id)}
                        className="px-2.5 py-1.5 rounded-lg text-zinc-500 hover:text-red-400 text-xs font-semibold flex items-center gap-1"
                      >
                        마지막 세트 삭제
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Rest Timer & Notes Widget (Right 4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Rest timer widget */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-brand-neon/5 blur-2xl rounded-full" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <Timer className="w-4.5 h-4.5 text-brand-neon" />
                <h3 className="font-bold text-zinc-100 text-sm font-display uppercase tracking-tight">휴식 타이머</h3>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Sound enabler switch */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title={soundEnabled ? '알림음 켜짐' : '알림음 꺼짐'}
                  className={`p-1.5 rounded-xl border transition ${
                    soundEnabled 
                      ? 'bg-brand-neon/10 border-brand-neon/20 text-brand-neon' 
                      : 'bg-zinc-950 border-zinc-850 text-zinc-600'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Core Countdown visualization */}
            <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-850 text-center space-y-3">
              {isRestTimerActive && restDuration > 0 ? (
                <>
                  <p className="text-4xl font-extrabold text-sky-400 font-mono tracking-tight animate-pulse">
                    00:{String(restDuration).padStart(2, '0')}
                  </p>
                  
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => adjustRestTimer(-30)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg border border-zinc-800"
                    >
                      -30초
                    </button>
                    <button
                      onClick={handleSkipRest}
                      className="px-4 py-1.5 text-[10px] font-extrabold bg-sky-500/10 hover:bg-sky-500 hover:text-zinc-950 text-sky-400 rounded-lg border border-sky-500/20 transition-all"
                    >
                      휴식 건너뛰기
                    </button>
                    <button
                      onClick={() => adjustRestTimer(30)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg border border-zinc-800"
                    >
                      +30초
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-2 py-1">
                  <p className="text-sm font-semibold text-zinc-400">대기 중</p>
                  <p className="text-xs text-zinc-600">완료 체크 시 타이머가 자동으로 실행됩니다.</p>
                  <button
                    onClick={triggerRestTimer}
                    className="mt-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-bold border border-zinc-800"
                  >
                    타이머 직접 실행 ({initialRestTime}초)
                  </button>
                </div>
              )}
            </div>

            {/* Customizer row */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">휴식 시간 기본값 설정</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[30, 60, 90, 120].map((sec) => (
                  <button
                    key={sec}
                    onClick={() => changeDefaultRestTime(sec)}
                    className={`py-1.5 rounded-lg text-[10px] font-bold border font-mono transition ${
                      initialRestTime === sec
                        ? 'bg-sky-500/10 border-sky-400 text-sky-400 font-extrabold shadow-sm'
                        : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {sec}초
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Notes module */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-zinc-100 text-sm flex items-center gap-1.5 uppercase font-display">
              <NotepadText className="w-4.5 h-4.5 text-brand-neon" />
              오늘의 운동 노트
            </h3>
            
            <textarea
              placeholder="예: 오늘 삼두 자극 끝내줌. 바벨로우 시 허리 통증 주의할 것."
              rows={3}
              value={workoutNotes}
              onChange={(e) => setWorkoutNotes(e.target.value)}
              className="w-full bg-zinc-950 text-zinc-200 border border-zinc-850 rounded-xl p-3 text-xs focus:outline-none focus:border-brand-neon/80 transition resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Embedded on-the-fly exercise selector Modal Overlay */}
      {isAddingExercise && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-100 text-base font-display">현재 세션에 종목 추가</h3>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">목록에서 오늘 수행할 운동을 골라 터치하면 추가됩니다.</p>
              </div>
              <button
                onClick={() => setIsAddingExercise(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 border-b border-zinc-800 space-y-3 bg-zinc-900/30">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="운동 명칭, 부위로 찾기..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-100 rounded-xl pl-9 pr-4 py-2.5 text-xs border border-zinc-800 focus:outline-none focus:border-brand-neon"
                />
              </div>

              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
                {(['전체', '가슴', '등', '하체', '어깨', '팔', '복근', '유산소'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition ${
                      selectedCategory === cat
                        ? 'bg-brand-neon border-brand-neon text-zinc-950 shadow-md shadow-brand-neon/10'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-zinc-900">
              {filteredExercisesCatalog.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  검색 결과에 맞는 운동이 존재하지 않습니다.
                </div>
              ) : (
                filteredExercisesCatalog.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => handleAddExerciseToActiveSession(ex)}
                    className="p-3 hover:bg-zinc-800/40 rounded-xl cursor-pointer flex items-center justify-between transition group"
                  >
                    <div>
                      <h4 className="font-bold text-zinc-200 text-sm group-hover:text-white">
                        {ex.name}
                      </h4>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                        {ex.category} • {ex.type === 'weight_reps' ? '무게/회수' : ex.type === 'bodyweight_reps' ? '맨몸 회수' : '시간'}
                      </p>
                    </div>
                    <PlusCircle className="w-4 h-4 text-zinc-600 group-hover:text-brand-neon transition" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
