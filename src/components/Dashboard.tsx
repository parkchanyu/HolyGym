/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, Calendar, Flame, Dumbbell, Clock, ChevronRight, Award, Plus,
  ChevronDown, ChevronUp, History, TrendingUp, Sparkles, CheckCircle2
} from 'lucide-react';
import { CompletedWorkout, Routine } from '../types';

interface DashboardProps {
  completedWorkouts: CompletedWorkout[];
  routines: Routine[];
  onStartRoutine: (routineId: string) => void;
  onStartEmptyWorkout: () => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ 
  completedWorkouts, 
  routines, 
  onStartRoutine, 
  onStartEmptyWorkout,
  onNavigate 
}: DashboardProps) {
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(null);

  // Calculate statistics
  const totalWorkouts = completedWorkouts.length;
  
  const totalDurationMin = Math.round(
    completedWorkouts.reduce((sum, w) => sum + w.duration, 0) / 60
  );
  
  const totalWeightTon = (
    completedWorkouts.reduce((sum, w) => sum + w.totalWeight, 0) / 1000
  ).toFixed(1);

  // Calculate Streak (consecutive days of workout)
  const calculateStreak = (): number => {
    if (completedWorkouts.length === 0) return 0;
    
    const uniqueDates = Array.from(
      new Set(completedWorkouts.map(w => w.date))
    ).sort((a, b) => b.localeCompare(a)); // sorted descending (newest first)

    let streak = 0;
    let todayStr = new Date().toISOString().split('T')[0];
    let yesterdayStr = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // If the newest workout is not today or yesterday, streak is broken
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }

    let current = new Date(uniqueDates[0]);
    streak = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const prev = new Date(uniqueDates[i]);
      const diffTime = Math.abs(current.getTime() - prev.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
        current = prev;
      } else if (diffDays > 1) {
        break; // Streak broken
      }
    }
    return streak;
  };

  const streak = calculateStreak();

  // Activity calendar generation (Last 14 days)
  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split('T')[0];
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    const hasWorkout = completedWorkouts.some(w => w.date === dateStr);
    const dayOfWeek = d.toLocaleDateString('ko-KR', { weekday: 'short' });
    const dayNum = d.getDate();

    return { dateStr, dayOfWeek, dayNum, hasWorkout, isToday };
  });

  // Calculate Exercise Categories for custom visual SVG chart
  // Category breakdown: 가슴, 등, 하체, 어깨, 팔, 복근, 유산소
  const categoryStats: Record<string, number> = {
    '가슴': 0, '등': 0, '하체': 0, '어깨': 0, '팔': 0, '복근': 0, '유산소': 0
  };

  // Get data for the last 30 days
  completedWorkouts.forEach(workout => {
    workout.exercises.forEach(ex => {
      ex.sets.forEach(set => {
        if (set.completed && categoryStats[ex.category] !== undefined) {
          categoryStats[ex.category] += 1; // Count sets
        }
      });
    });
  });

  const categories = Object.keys(categoryStats);
  const maxSets = Math.max(...Object.values(categoryStats), 5); // Fallback to 5 to avoid division by zero

  const toggleExpandWorkout = (id: string) => {
    setExpandedWorkoutId(expandedWorkoutId === id ? null : id);
  };

  // Fun fitness quote based on current local hours
  const getMotivationalQuote = () => {
    const hr = new Date().getHours();
    if (hr < 9) return '☀️ 아침 운동으로 하루의 에너지를 100% 충전해보세요!';
    if (hr < 18) return '💪 지치는 오후, 물 한잔과 가벼운 스트레칭으로 리프레시!';
    return '🌙 오늘 하루도 고생 많으셨습니다. 마무리 운동으로 깔끔하게 마침표를 찍어볼까요?';
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="dashboard-tab-view">
      {/* Welcome Hero & Motivational Banner */}
      <div className="relative rounded-3xl bg-zinc-900/30 border border-zinc-800/80 p-6 md:p-8 overflow-hidden shadow-xl" id="hero-banner">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-neon/5 blur-3xl rounded-full" />
        <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-brand-neon/3 blur-3xl rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-neon/10 border border-brand-neon/20 text-brand-neon text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              INTELLIGENT TRACKER v2
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter italic font-display">
              득근하는 하루 되세요! 🏋️
            </h1>
            <p className="text-zinc-400 text-sm max-w-xl font-medium">
              {getMotivationalQuote()}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 shrink-0">
            <button 
              id="btn-quick-empty-workout"
              onClick={onStartEmptyWorkout}
              className="px-4 py-2.5 rounded-2xl bg-zinc-800/50 hover:bg-zinc-700/80 text-zinc-100 font-bold uppercase tracking-tighter text-xs transition-all duration-200 border border-zinc-700/60 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 text-brand-neon" />
              빈 운동 시작
            </button>
            <button 
              id="btn-quick-routine-nav"
              onClick={() => onNavigate('routines')}
              className="px-5 py-2.5 rounded-2xl bg-brand-neon hover:bg-brand-neon-light text-zinc-950 font-black uppercase tracking-tighter italic text-xs transition-all duration-200 shadow-lg shadow-brand-neon/15 flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              루틴 선택하기
            </button>
          </div>
        </div>
      </div>

      {/* Core Grid stats - 4 Pillars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="stats-dashboard-grid">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-brand-neon shrink-0">
            <Dumbbell className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Total Sessions</p>
            <h3 className="text-2xl font-black italic tracking-tighter text-zinc-100 mt-1">{totalWorkouts}회</h3>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-sky-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Total Duration</p>
            <h3 className="text-2xl font-black italic tracking-tighter text-zinc-100 mt-1">{totalDurationMin}분</h3>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-all">
          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-amber-400 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Total Volume</p>
            <h3 className="text-2xl font-black italic tracking-tighter text-zinc-100 mt-1">{totalWeightTon}톤</h3>
          </div>
        </div>

        <div className="bg-brand-neon text-black rounded-3xl p-5 flex flex-col gap-4 hover:scale-[1.01] transition-all shadow-lg shadow-brand-neon/15 border-none">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-brand-neon shrink-0">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-black/60 text-[10px] font-black uppercase tracking-widest">Active Streak</p>
            <h3 className="text-2xl font-black italic tracking-tighter text-black mt-1">{streak}일 연속</h3>
          </div>
        </div>
      </div>

      {/* Visual Analytics & Calendar Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-visuals-row">
        {/* Activity Heat-strip (Left 7 Columns) */}
        <div className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-neon" />
              <h2 className="text-base font-bold text-zinc-100 font-display">최근 14일 활동</h2>
            </div>
            <span className="text-xs text-zinc-500 font-semibold">운동 완료일 활성화</span>
          </div>

          <div className="grid grid-cols-7 md:grid-cols-14 gap-2 pt-1">
            {last14Days.map((day) => (
              <div 
                key={day.dateStr} 
                className={`flex flex-col items-center p-2 rounded-2xl border transition-all ${
                  day.hasWorkout 
                    ? 'bg-brand-neon/15 border-brand-neon/30 shadow-sm' 
                    : 'bg-zinc-950/40 border-zinc-800/80'
                } ${day.isToday ? 'ring-2 ring-brand-neon/50' : ''}`}
              >
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{day.dayOfWeek}</span>
                <span className={`text-sm font-black mt-1 font-display ${day.hasWorkout ? 'text-brand-neon' : 'text-zinc-400'}`}>
                  {day.dayNum}
                </span>
                <div className="mt-1.5">
                  {day.hasWorkout ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-neon fill-zinc-950" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-zinc-800 bg-zinc-900" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-neon/10 flex items-center justify-center text-brand-neon shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-zinc-200">
                {streak > 0 
                  ? `대단해요! ${streak}일 연속으로 건강을 가꾸고 계십니다.` 
                  : '꾸준한 운동 기록이 몸의 변화를 만듭니다!'}
              </p>
              <p className="text-zinc-500">기록을 보며 스스로의 한계를 넘어서는 즐거움을 느껴보세요.</p>
            </div>
          </div>
        </div>

        {/* Custom SVG Workout Category Chart (Right 5 Columns) */}
        <div className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-neon" />
                <h2 className="text-base font-bold text-zinc-100 font-display">부위별 누적 세트수 (30일)</h2>
              </div>
            </div>

            {/* Custom Interactive SVG Horizontal Bar Chart with Bento Palette */}
            <div className="space-y-3 py-1">
              {categories.map(category => {
                const count = categoryStats[category];
                const percentage = maxSets > 0 ? (count / maxSets) * 100 : 0;
                
                // Color mapping for premium Bento look
                const colors: Record<string, string> = {
                  '하체': 'bg-brand-neon',
                  '등': 'bg-white',
                  '가슴': 'bg-zinc-400',
                  '어깨': 'bg-zinc-500',
                  '팔': 'bg-zinc-600',
                  '복근': 'bg-zinc-700',
                  '유산소': 'bg-zinc-800'
                };
                const colorClass = colors[category] || 'bg-zinc-500';

                return (
                  <div key={category} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-zinc-300 font-bold">{category}</span>
                      <span className="text-zinc-400 font-mono">{count} 세트</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80">
                      <div 
                        className={`h-full ${colorClass} rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${Math.max(percentage, count > 0 ? 3 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mt-4 pt-3 border-t border-zinc-800/40">
            * 지난 30일간 완료된 운동 세트를 기준으로 실시간 집계된 볼륨입니다.
          </p>
        </div>
      </div>

      {/* Main Bottom Section: Recent Workouts & Routine List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-recent-and-quick">
        {/* Recent Workouts (Left 7 Columns) */}
        <div className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-brand-neon" />
              <h2 className="text-base font-bold text-zinc-100 font-display">최근 완료된 운동</h2>
            </div>
            <button 
              onClick={() => onNavigate('analytics')} 
              className="text-xs font-black uppercase tracking-tighter italic text-brand-neon hover:text-brand-neon-light transition flex items-center gap-0.5"
            >
              상세 분석 보기 <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {completedWorkouts.length === 0 ? (
            <div className="py-12 text-center bg-zinc-950/40 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center p-6 space-y-3">
              <Dumbbell className="w-10 h-10 text-zinc-700 stroke-[1.5]" />
              <div className="space-y-1">
                <p className="text-zinc-400 text-sm font-bold">저장된 운동 기록이 없습니다</p>
                <p className="text-zinc-600 text-xs font-medium">상단의 루틴선택 또는 빈 운동시작 버튼으로 새 기록을 남겨보세요!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3" id="recent-workouts-list">
              {completedWorkouts.slice(0, 4).map(workout => {
                const isExpanded = expandedWorkoutId === workout.id;
                const formattedTime = new Date(workout.endTime).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short'
                });
                const durationMin = Math.round(workout.duration / 60);

                return (
                  <div 
                    key={workout.id} 
                    className="bg-zinc-950/50 rounded-2xl border border-zinc-850 hover:border-zinc-700/80 transition-all overflow-hidden"
                  >
                    {/* Header trigger */}
                    <div 
                      onClick={() => toggleExpandWorkout(workout.id)}
                      className="p-4 cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-zinc-500 font-bold">
                            {formattedTime}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 text-[10px] font-black uppercase tracking-tighter">
                            {durationMin}분
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-zinc-900 text-zinc-300 text-[10px] font-black uppercase tracking-tighter">
                            {(workout.totalWeight / 1000).toFixed(2)}톤 볼륨
                          </span>
                        </div>
                        <h3 className="font-bold text-zinc-100 text-sm md:text-base truncate">
                          {workout.routineName}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-xs font-black text-brand-neon font-mono italic uppercase tracking-tighter">
                            {workout.exercises.length}개 종목
                          </p>
                          <p className="text-[10px] text-zinc-500 font-bold">
                            {workout.totalSetsCount}세트 완료
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-zinc-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-zinc-500" />
                        )}
                      </div>
                    </div>

                    {/* Detailed sets display */}
                    {isExpanded && (
                      <div className="border-t border-zinc-800 bg-zinc-900/20 p-4 space-y-4 animate-slide-down">
                        {workout.notes && (
                          <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800 text-xs text-zinc-400 italic flex items-start gap-2">
                            <span className="text-brand-neon shrink-0 font-bold">📝 노트:</span>
                            <span>{workout.notes}</span>
                          </div>
                        )}
                        
                        <div className="space-y-3">
                           {workout.exercises.map((ex, exIdx) => (
                            <div key={ex.id || exIdx} className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-zinc-200">
                                  {ex.name}
                                </h4>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">
                                  {ex.category}
                                </span>
                              </div>
                              
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {ex.sets.map((set, setIdx) => (
                                  <div 
                                    key={set.id || setIdx} 
                                    className="bg-zinc-950/40 rounded-xl p-2.5 border border-zinc-850 flex flex-col justify-between"
                                  >
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase">
                                      Set {set.setNumber}
                                    </span>
                                    <div className="flex items-baseline gap-1 mt-1">
                                      {ex.type === 'weight_reps' ? (
                                        <>
                                          <span className="text-sm font-black text-zinc-100 font-mono">
                                            {set.weight}
                                          </span>
                                          <span className="text-[10px] text-zinc-500 font-bold">kg</span>
                                          <span className="text-xs text-zinc-600 mx-0.5">×</span>
                                          <span className="text-sm font-black text-zinc-100 font-mono">
                                            {set.reps}
                                          </span>
                                          <span className="text-[10px] text-zinc-500 font-bold">회</span>
                                        </>
                                      ) : ex.type === 'bodyweight_reps' ? (
                                        <>
                                          <span className="text-sm font-black text-zinc-100 font-mono">
                                            {set.reps}
                                          </span>
                                          <span className="text-[10px] text-zinc-500 font-bold">회</span>
                                          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider ml-1">Bw</span>
                                        </>
                                      ) : (
                                        <>
                                          <span className="text-sm font-black text-zinc-100 font-mono">
                                            {set.reps}
                                          </span>
                                          <span className="text-[10px] text-zinc-500 font-bold">초</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Core routines quick list (Right 5 Columns) */}
        <div className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-zinc-100 font-display">내 운동 루틴</h2>
            <button 
              onClick={() => onNavigate('routines')} 
              className="text-xs font-black uppercase tracking-tighter italic text-brand-neon hover:text-brand-neon-light transition flex items-center gap-0.5"
            >
              루틴 관리 <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3" id="dashboard-routines-quick-list">
            {routines.slice(0, 3).map(routine => (
              <div 
                key={routine.id}
                className="bg-zinc-950/50 p-4.5 rounded-2xl border border-zinc-850 hover:border-zinc-700 transition flex flex-col justify-between gap-3"
              >
                <div>
                  <h3 className="font-bold text-zinc-200 text-sm">{routine.name}</h3>
                  <p className="text-zinc-500 text-xs mt-1 line-clamp-1">
                    {routine.description || '지정된 설명이 없습니다.'}
                  </p>
                  <p className="text-[9px] font-bold text-brand-neon mt-2.5 tracking-wider uppercase">
                    {routine.exercises.map(ex => ex.name.split(' ')[0]).join(' ∙ ')}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-2.5 border-t border-zinc-900">
                  <span className="text-[9px] text-zinc-500 font-mono font-bold uppercase">
                    종목 {routine.exercises.length}개
                  </span>
                  <button
                    onClick={() => onStartRoutine(routine.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-brand-neon/10 hover:bg-brand-neon text-brand-neon hover:text-zinc-950 text-xs font-black uppercase tracking-tighter italic transition-all duration-200 flex items-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    운동 시작
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
