/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, LayoutDashboard, Calendar, History, TrendingUp, Plus,
  Sparkles, ListCollapse, Award, Clock, Flame, ChevronRight, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Routine, CompletedWorkout, Exercise } from './types';
import { STARTER_ROUTINES } from './data/exercises';

// Component imports
import Dashboard from './components/Dashboard';
import Routines from './components/Routines';
import WorkoutSession from './components/WorkoutSession';
import Analytics from './components/Analytics';
import ExerciseList from './components/ExerciseList';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // App primary states
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [completedWorkouts, setCompletedWorkouts] = useState<CompletedWorkout[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);

  // Active workout session states
  const [isWorkoutActive, setIsWorkoutActive] = useState<boolean>(false);
  const [selectedWorkoutRoutine, setSelectedWorkoutRoutine] = useState<Routine | null>(null);

  // Initialize and load from localstorage (offline-first state engine)
  useEffect(() => {
    // 1. Load routines
    const savedRoutines = localStorage.getItem('flik_routines');
    if (savedRoutines) {
      setRoutines(JSON.parse(savedRoutines));
    } else {
      localStorage.setItem('flik_routines', JSON.stringify(STARTER_ROUTINES));
      setRoutines(STARTER_ROUTINES);
    }

    // 2. Load completed workout history
    const savedHistory = localStorage.getItem('flik_completed_workouts');
    if (savedHistory) {
      const parsed = JSON.parse(savedHistory);
      // Clean up any previously seeded mock history (having id starting with 'workout-history-')
      const filtered = parsed.filter((w: any) => !w.id.startsWith('workout-history-'));
      if (filtered.length !== parsed.length) {
        localStorage.setItem('flik_completed_workouts', JSON.stringify(filtered));
      }
      setCompletedWorkouts(filtered);
    } else {
      localStorage.setItem('flik_completed_workouts', JSON.stringify([]));
      setCompletedWorkouts([]);
    }

    // 3. Load custom exercises
    const savedCustomEx = localStorage.getItem('flik_custom_exercises');
    if (savedCustomEx) {
      setCustomExercises(JSON.parse(savedCustomEx));
    }
  }, []);

  // Sync routines changes to LocalStorage
  const handleSaveRoutine = (updatedRoutine: Routine) => {
    setRoutines(prev => {
      let nextRoutines;
      const exists = prev.some(r => r.id === updatedRoutine.id);
      if (exists) {
        nextRoutines = prev.map(r => r.id === updatedRoutine.id ? updatedRoutine : r);
      } else {
        nextRoutines = [...prev, updatedRoutine];
      }
      localStorage.setItem('flik_routines', JSON.stringify(nextRoutines));
      return nextRoutines;
    });
  };

  const handleDeleteRoutine = (routineId: string) => {
    setRoutines(prev => {
      const nextRoutines = prev.filter(r => r.id !== routineId);
      localStorage.setItem('flik_routines', JSON.stringify(nextRoutines));
      return nextRoutines;
    });
  };

  // Sync custom exercises to LocalStorage
  const handleAddCustomExercise = (newEx: Exercise) => {
    setCustomExercises(prev => {
      const nextList = [...prev, newEx];
      localStorage.setItem('flik_custom_exercises', JSON.stringify(nextList));
      return nextList;
    });
  };

  const handleDeleteCustomExercise = (exerciseId: string) => {
    setCustomExercises(prev => {
      const nextList = prev.filter(ex => ex.id !== exerciseId);
      localStorage.setItem('flik_custom_exercises', JSON.stringify(nextList));
      return nextList;
    });
  };

  // Handle active session controls
  const handleStartRoutineWorkout = (routineId: string) => {
    const routineToStart = routines.find(r => r.id === routineId);
    if (routineToStart) {
      setSelectedWorkoutRoutine(routineToStart);
      setIsWorkoutActive(true);
    }
  };

  const handleStartEmptyWorkout = () => {
    setSelectedWorkoutRoutine(null); // Represents empty session
    setIsWorkoutActive(true);
  };

  const handleFinishWorkoutSession = (completedLog: CompletedWorkout) => {
    setCompletedWorkouts(prev => {
      const nextHistory = [completedLog, ...prev];
      localStorage.setItem('flik_completed_workouts', JSON.stringify(nextHistory));
      return nextHistory;
    });
    setIsWorkoutActive(false);
    setSelectedWorkoutRoutine(null);
    setActiveTab('dashboard'); // take back to dashboard to celebrate!
  };

  const handleCancelWorkoutSession = () => {
    setIsWorkoutActive(false);
    setSelectedWorkoutRoutine(null);
  };

  // Render navigation tabs helper
  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
    { id: 'routines', label: '내 루틴', icon: History },
    { id: 'analytics', label: '성장 분석', icon: BarChart3 },
    { id: 'exercises', label: '운동 도감', icon: Dumbbell },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col font-sans selection:bg-brand-neon selection:text-zinc-950">
      
      {/* Top Main Navigation Header Bar */}
      <header className="border-b border-zinc-900 bg-[#0A0A0B]/85 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-4 flex items-center justify-between" id="app-global-header">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-850 flex items-center justify-center text-brand-neon shadow-lg relative overflow-hidden">
            {/* Elegant Cursive H inline SVG */}
            <svg viewBox="0 0 100 100" className="w-6.5 h-6.5" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 30 32 
                       C 25 32, 22 36, 22 42 
                       C 22 52, 30 72, 38 72 
                       C 42 72, 46 66, 46 56 
                       C 46 42, 40 30, 50 30 
                       C 58 30, 62 38, 64 50 
                       C 66 62, 68 72, 76 72 
                       C 80 72, 82 68, 82 62" />
            </svg>
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black tracking-tighter italic text-white flex items-center gap-1 font-display">
              Holy<span className="text-brand-neon">Gym</span>
            </h1>
            <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Active Tracker Engine</p>
          </div>
        </div>

        {/* Desktop Header Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-2xl" id="desktop-nav-menu">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-black uppercase tracking-tighter italic transition-all duration-200 ${
                  isActive 
                    ? 'bg-brand-neon text-zinc-950 shadow shadow-brand-neon/10' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Quick status bar or current state indicators */}
        <div className="text-right shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse" />
            STABLE LOG SYNCED
          </span>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6">
        <AnimatePresence mode="wait">
          {isWorkoutActive ? (
            <motion.div
              key="active-workout-session"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <WorkoutSession 
                routine={selectedWorkoutRoutine}
                customExercises={customExercises}
                onFinishWorkout={handleFinishWorkoutSession}
                onCancelWorkout={handleCancelWorkoutSession}
              />
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  completedWorkouts={completedWorkouts}
                  routines={routines}
                  onStartRoutine={handleStartRoutineWorkout}
                  onStartEmptyWorkout={handleStartEmptyWorkout}
                  onNavigate={setActiveTab}
                />
              )}

              {activeTab === 'routines' && (
                <Routines 
                  routines={routines}
                  customExercises={customExercises}
                  onSaveRoutine={handleSaveRoutine}
                  onDeleteRoutine={handleDeleteRoutine}
                  onStartRoutine={handleStartRoutineWorkout}
                />
              )}

              {activeTab === 'analytics' && (
                <Analytics 
                  completedWorkouts={completedWorkouts}
                />
              )}

              {activeTab === 'exercises' && (
                <ExerciseList 
                  customExercises={customExercises}
                  onAddCustomExercise={handleAddCustomExercise}
                  onDeleteCustomExercise={handleDeleteCustomExercise}
                  completedWorkouts={completedWorkouts}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer information bar */}
      <footer className="border-t border-zinc-900 bg-[#0A0A0B] py-8 text-center text-xs text-zinc-600 mt-12 pb-24 md:pb-8">
        <p className="font-bold text-zinc-500 uppercase tracking-wider font-display">HOLYGYM ∙ 홀리짐 운동 일지</p>
        <p className="mt-1 text-zinc-600">오프라인 우선 구조로, 기기 캐시가 삭제되기 전까지 모든 운동 로그와 세트 구성이 로컬 저장소에 안전히 보관됩니다.</p>
        <p className="mt-4 text-[9px] text-zinc-700 font-mono">© 2026 HOLYGYM STUDIO. v2.0.4 - STABLE</p>
      </footer>

      {/* Mobile Sticky Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0A0B]/90 backdrop-blur-md border-t border-zinc-900 py-2 px-4 flex justify-around items-center" id="mobile-nav-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id && !isWorkoutActive;
          return (
            <button
              key={tab.id}
              disabled={isWorkoutActive}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition ${
                isActive 
                  ? 'text-brand-neon font-black' 
                  : 'text-zinc-500 hover:text-zinc-300 disabled:opacity-40'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[9px] font-bold tracking-tighter">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
