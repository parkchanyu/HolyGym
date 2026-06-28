/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TrendingUp, Calendar, Dumbbell, Award, Flame, Clock, 
  ChevronRight, BarChart2, Filter, Sparkles, SlidersHorizontal
} from 'lucide-react';
import { CompletedWorkout, ExerciseCategory } from '../types';

interface AnalyticsProps {
  completedWorkouts: CompletedWorkout[];
}

export default function Analytics({ completedWorkouts }: AnalyticsProps) {
  // Sort workouts chronological ascending (oldest first) for charting progress
  const chronologicalWorkouts = [...completedWorkouts].sort((a, b) => 
    a.endTime.localeCompare(b.endTime)
  );

  // We want to track specific exercise progress. Find exercises that have been logged at least once.
  const getLoggableExercises = () => {
    const list: { id: string; name: string; category: string }[] = [];
    completedWorkouts.forEach(w => {
      w.exercises.forEach(ex => {
        if (!list.some(item => item.id === ex.exerciseId)) {
          list.push({ id: ex.exerciseId, name: ex.name, category: ex.category });
        }
      });
    });
    return list;
  };

  const loggedExercises = getLoggableExercises();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    loggedExercises[0]?.id || 'bench-press'
  );

  // Calculate 1RM (Epley formula: Weight * (1 + Reps/30))
  const calculateEstimated1RM = (weight: number, reps: number): number => {
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30) * 10) / 10;
  };

  // Get historical data for the selected exercise
  const getExerciseHistory = () => {
    const history: { date: string; maxWeight: number; estimated1RM: number; formattedDate: string }[] = [];
    
    chronologicalWorkouts.forEach(workout => {
      const exerciseInWorkout = workout.exercises.find(ex => ex.exerciseId === selectedExerciseId);
      if (exerciseInWorkout) {
        let maxWeight = 0;
        let best1RM = 0;

        exerciseInWorkout.sets.forEach(set => {
          if (set.completed) {
            if (set.weight > maxWeight) maxWeight = set.weight;
            const est1RM = calculateEstimated1RM(set.weight, set.reps);
            if (est1RM > best1RM) best1RM = est1RM;
          }
        });

        if (maxWeight > 0 || best1RM > 0) {
          const dateObj = new Date(workout.endTime);
          history.push({
            date: workout.date,
            maxWeight,
            estimated1RM: best1RM,
            formattedDate: `${dateObj.getMonth() + 1}/${dateObj.getDate()}`
          });
        }
      }
    });

    return history;
  };

  const exerciseHistory = getExerciseHistory();
  const selectedExerciseName = loggedExercises.find(e => e.id === selectedExerciseId)?.name || '선택된 운동';

  // Total volume metric trends over last 8 workouts
  const volumeTrendData = chronologicalWorkouts.slice(-8).map(w => {
    const d = new Date(w.endTime);
    return {
      name: `${d.getMonth() + 1}/${d.getDate()}`,
      volume: Math.round(w.totalWeight),
      sets: w.totalSetsCount,
      duration: Math.round(w.duration / 60)
    };
  });

  // Calculate Muscle breakdown
  const categorySummary: Record<ExerciseCategory, number> = {
    '가슴': 0, '등': 0, '하체': 0, '어깨': 0, '팔': 0, '복근': 0, '유산소': 0, '전신': 0
  };

  completedWorkouts.forEach(w => {
    w.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed && categorySummary[ex.category] !== undefined) {
          categorySummary[ex.category] += s.weight * s.reps || s.reps || 1; // Accumulate volume or reps
        }
      });
    });
  });

  const totalCatVolume = Object.values(categorySummary).reduce((sum, v) => sum + v, 0) || 1;

  // Custom SVG line/area drawer for Progressive Overload (Volume Trend)
  const drawVolumeChart = () => {
    if (volumeTrendData.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-zinc-500 text-xs">
          차트를 그리려면 최소 2회 이상의 다른 운동 기록이 쌓여야 합니다.
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const paddingLeft = 45;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const maxVal = Math.max(...volumeTrendData.map(d => d.volume), 1000) * 1.1;
    const minVal = Math.min(...volumeTrendData.map(d => d.volume), 0) * 0.9;
    const range = maxVal - minVal;

    // Map points
    const points = volumeTrendData.map((d, idx) => {
      const x = paddingLeft + (idx / (volumeTrendData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((d.volume - minVal) / range) * chartHeight;
      return { x, y, name: d.name, value: d.volume };
    });

    // Create SVG Path line
    const pathD = points.reduce((acc, p, idx) => {
      return acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
    }, '');

    // Create Filled area path
    const areaD = pathD + `L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * ratio;
          const labelVal = Math.round(maxVal - ratio * range);
          return (
            <g key={idx} className="opacity-40">
              <line 
                x1={paddingLeft} 
                y1={y} 
                x2={width - paddingRight} 
                y2={y} 
                stroke="#27272a" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
              <text 
                x={paddingLeft - 8} 
                y={y + 4} 
                fill="#71717a" 
                fontSize="9" 
                textAnchor="end"
                className="font-mono font-medium"
              >
                {labelVal >= 1000 ? `${(labelVal / 1000).toFixed(1)}t` : `${labelVal}k`}
              </text>
            </g>
          );
        })}

        {/* Shaded Area fill */}
        <path d={areaD} fill="url(#volumeAreaGrad)" className="opacity-20" />

        {/* Line Stroke */}
        <path d={pathD} fill="none" stroke="#C1FF72" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle 
              cx={p.x} 
              cy={p.y} 
              r="4" 
              fill="#C1FF72" 
              stroke="#09090b" 
              strokeWidth="1.5"
              className="hover:r-6 transition-all"
            />
            {/* Tooltip text showing on graph hover */}
            <text 
              x={p.x} 
              y={p.y - 10} 
              fill="#f4f4f5" 
              fontSize="9" 
              fontWeight="bold" 
              textAnchor="middle" 
              className="opacity-0 group-hover:opacity-100 transition duration-150 font-mono bg-zinc-950 px-1 py-0.5"
            >
              {p.value}kg
            </text>
            {/* X Axis Labels */}
            <text 
              x={p.x} 
              y={paddingTop + chartHeight + 16} 
              fill="#71717a" 
              fontSize="9" 
              fontWeight="bold" 
              textAnchor="middle"
              className="font-mono"
            >
              {p.name}
            </text>
          </g>
        ))}

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="volumeAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C1FF72" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#C1FF72" stopOpacity="0.0"/>
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // Custom SVG line chart for Specific Exercise 1RM Tracker
  const draw1RMEstimateChart = () => {
    if (exerciseHistory.length < 2) {
      return (
        <div className="h-44 flex flex-col items-center justify-center text-zinc-500 text-xs p-6 border border-dashed border-zinc-800 rounded-xl bg-zinc-950/40">
          <Dumbbell className="w-8 h-8 text-zinc-700 mb-2 stroke-[1.5]" />
          <span>성장 그래프를 그리려면 이 종목({selectedExerciseName})이 포함된</span>
          <span className="mt-0.5">서로 다른 날짜의 운동 기록이 2회 이상 완수되어야 합니다.</span>
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const paddingLeft = 40;
    const paddingRight = 15;
    const paddingTop = 15;
    const paddingBottom = 25;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const allWeights = [
      ...exerciseHistory.map(d => d.maxWeight), 
      ...exerciseHistory.map(d => d.estimated1RM)
    ];
    const maxVal = Math.max(...allWeights, 40) * 1.08;
    const minVal = Math.max(0, Math.min(...allWeights, 0) * 0.9);
    const range = maxVal - minVal;

    // Map 1RM points
    const points1RM = exerciseHistory.map((d, idx) => {
      const x = paddingLeft + (idx / (exerciseHistory.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((d.estimated1RM - minVal) / range) * chartHeight;
      return { x, y, name: d.formattedDate, value: d.estimated1RM };
    });

    // Map Max Weight points
    const pointsMax = exerciseHistory.map((d, idx) => {
      const x = paddingLeft + (idx / (exerciseHistory.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((d.maxWeight - minVal) / range) * chartHeight;
      return { x, y, name: d.formattedDate, value: d.maxWeight };
    });

    const path1RM = points1RM.reduce((acc, p, idx) => acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `, '');
    const pathMax = pointsMax.reduce((acc, p, idx) => acc + `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y} `, '');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
          const y = paddingTop + chartHeight * ratio;
          const labelVal = Math.round(maxVal - ratio * range);
          return (
            <g key={idx} className="opacity-40">
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#27272a" strokeWidth="1" strokeDasharray="3 3"/>
              <text x={paddingLeft - 8} y={y + 3} fill="#71717a" fontSize="9" textAnchor="end" className="font-mono">{labelVal}kg</text>
            </g>
          );
        })}

        {/* 1RM Line (Brand Neon Lime) */}
        <path d={path1RM} fill="none" stroke="#C1FF72" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* Max Weight Line (Pure White) */}
        <path d={pathMax} fill="none" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80" />

        {/* 1RM Points */}
        {points1RM.map((p, idx) => (
          <g key={`1rm-${idx}`} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="3.5" fill="#C1FF72" stroke="#09090b" strokeWidth="1"/>
            <text x={p.x} y={p.y - 10} fill="#C1FF72" fontSize="8" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition duration-150 font-mono bg-zinc-950">
              {p.value}kg
            </text>
            <text x={p.x} y={paddingTop + chartHeight + 15} fill="#71717a" fontSize="9" textAnchor="middle" className="font-mono">{p.name}</text>
          </g>
        ))}

        {/* Max Weight Points */}
        {pointsMax.map((p, idx) => (
          <g key={`max-${idx}`} className="group cursor-pointer">
            <circle cx={p.x} cy={p.y} r="3" fill="#ffffff" stroke="#09090b" strokeWidth="1"/>
            <text x={p.x} y={p.y + 12} fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition duration-150 font-mono bg-zinc-950">
              {p.value}kg
            </text>
          </g>
        ))}
      </svg>
    );
  };

  // Generate 35-day activity heat-matrix
  const generateCalendarMatrix = () => {
    const d = new Date();
    // Offset to start on a Sunday from 5 weeks ago
    const totalDays = 35;
    const cells = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Find Sunday 5 weeks ago
    const startOffset = d.getDay(); // day of week (0 = Sun, 6 = Sat)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (totalDays - 1 - startOffset));

    for (let i = 0; i < totalDays; i++) {
      const currentCellDate = new Date(startDate);
      currentCellDate.setDate(startDate.getDate() + i);
      const dateStr = currentCellDate.toISOString().split('T')[0];
      const hasWorkout = completedWorkouts.some(w => w.date === dateStr);
      const isCurrentMonth = currentCellDate.getMonth() === new Date().getMonth();

      cells.push({
        dateStr,
        dayNum: currentCellDate.getDate(),
        hasWorkout,
        isToday: dateStr === todayStr,
        isCurrentMonth
      });
    }

    return cells;
  };

  const calendarMatrix = generateCalendarMatrix();

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="analytics-tab-view">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter italic flex items-center gap-2 font-display">
          <BarChart2 className="w-5 h-5 text-brand-neon" />
          피트니스 성장 분석 리포트
        </h1>
        <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mt-1">
          기록을 통해 점진적 과부하를 파악하고, 신체 훈련 밸런스와 최적의 운동 효율을 시각적으로 확인하세요.
        </p>
      </div>

      {completedWorkouts.length === 0 ? (
        <div className="py-20 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 flex flex-col items-center justify-center space-y-4">
          <Award className="w-16 h-16 text-zinc-700 stroke-[1.2]" />
          <div className="space-y-1 max-w-sm">
            <p className="text-zinc-200 text-base font-bold">축적된 데이터가 충분하지 않습니다</p>
            <p className="text-zinc-500 text-xs font-medium">
              운동 세션을 완료하고 '기록 완료'를 누르시면 자동으로 심층 데이터 시각화가 활성화됩니다.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="analytics-dashboard-grid">
          
          {/* Progressive Overload - Overall Volume Trend (Left 7 Columns) */}
          <div className="lg:col-span-7 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-zinc-100 text-sm md:text-base flex items-center gap-2 font-display uppercase tracking-tight">
                  <TrendingUp className="w-4.5 h-4.5 text-brand-neon" />
                  종합 누적 중량(Volume) 추이
                </h3>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5">최근 8회 동안 완수한 세트수 × 무게의 합산 성과 그래프</p>
              </div>
            </div>

            <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-2xl flex items-center justify-center min-h-[180px]">
              {drawVolumeChart()}
            </div>
            
            <div className="p-3.5 bg-zinc-950/60 border border-zinc-850 rounded-2xl flex items-center gap-2.5 text-xs text-zinc-400 leading-normal">
              <Sparkles className="w-4 h-4 text-brand-neon shrink-0" />
              <span>
                볼륨 그래프가 <strong className="text-zinc-200">우상향</strong>하고 있다면 훈련 부하가 안정적으로 증가하고 있음을 의미합니다!
              </span>
            </div>
          </div>

          {/* Muscle Split Proportion & 35-day Heatmap (Right 5 Columns) */}
          <div className="lg:col-span-5 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 md:p-6 shadow-sm flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-zinc-100 text-sm font-display uppercase tracking-tight">부위별 훈련 밸런스 점유율</h3>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5">누적된 총 운동량에 대한 신체 부위별 기여도 비율</p>
              </div>

              <div className="space-y-3">
                {(Object.keys(categorySummary) as ExerciseCategory[]).map(cat => {
                  const val = categorySummary[cat];
                  if (val === 0) return null;
                  const ratio = Math.round((val / totalCatVolume) * 100);

                  const colors: Record<string, string> = {
                    '가슴': 'bg-white',
                    '등': 'bg-white/80',
                    '하체': 'bg-brand-neon',
                    '어깨': 'bg-zinc-400',
                    '팔': 'bg-zinc-500',
                    '복근': 'bg-zinc-600',
                    '유산소': 'bg-zinc-700',
                    '전신': 'bg-zinc-800'
                  };
                  const color = colors[cat] || 'bg-zinc-500';

                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-zinc-300">{cat}</span>
                        <span className="text-zinc-400 font-mono">{ratio}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-850">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${ratio}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak Grid Map */}
            <div className="pt-4 border-t border-zinc-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-zinc-300 uppercase tracking-tight font-display">최근 5주 출석 캘린더</span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">일 → 토 순서</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 max-w-[280px]">
                {calendarMatrix.map((cell, idx) => (
                  <div 
                    key={idx}
                    title={cell.dateStr}
                    className={`aspect-square w-full rounded flex items-center justify-center text-[8px] font-mono font-bold border transition-all ${
                      cell.hasWorkout
                        ? 'bg-brand-neon border-brand-neon/30 text-zinc-950 shadow-sm shadow-brand-neon/10'
                        : cell.isToday
                        ? 'bg-zinc-900 border-brand-neon/50 text-brand-neon'
                        : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                    }`}
                  >
                    {cell.dayNum}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Exercise Specific 1RM Growth Tracker - Full Row */}
          <div className="lg:col-span-12 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-6" id="1rm-spec-section">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-850 pb-4">
              <div>
                <h3 className="font-extrabold text-zinc-100 text-sm md:text-base flex items-center gap-2 font-display uppercase tracking-tight">
                  <SlidersHorizontal className="w-4.5 h-4.5 text-brand-neon" />
                  종목별 최대 중량 및 예상 1RM 추적기
                </h3>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5">선택한 개별 운동의 실수행 최고 무게 및 1회 최고 능력치(1RM)의 점진적 변화를 분석합니다.</p>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={selectedExerciseId}
                  onChange={(e) => setSelectedExerciseId(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-brand-neon transition font-bold cursor-pointer"
                >
                  {loggedExercises.length === 0 ? (
                    <option value="bench-press">벤치 프레스 (기본)</option>
                  ) : (
                    loggedExercises.map(ex => (
                      <option key={ex.id} value={ex.id}>
                        {ex.name} ({ex.category})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              {/* Left columns (Chart) */}
              <div className="md:col-span-3 bg-zinc-950/40 border border-zinc-850 p-4 rounded-2xl flex items-center justify-center min-h-[180px]">
                {draw1RMEstimateChart()}
              </div>

              {/* Right column (Info Card) */}
              <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-850 space-y-4 self-stretch flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">선택된 종목</span>
                    <h4 className="font-bold text-zinc-200 text-sm mt-0.5">{selectedExerciseName}</h4>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1">
                      <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">최고 무게</span>
                      <p className="text-base font-extrabold text-white font-mono mt-0.5">
                        {exerciseHistory.length > 0 ? Math.max(...exerciseHistory.map(d => d.maxWeight)) : 0}kg
                      </p>
                    </div>
                    <div className="flex-1 border-l border-zinc-850 pl-4">
                      <span className="text-[8px] text-zinc-500 font-black uppercase tracking-wider block">최고 예상 1RM</span>
                      <p className="text-base font-extrabold text-brand-neon font-mono mt-0.5">
                        {exerciseHistory.length > 0 ? Math.max(...exerciseHistory.map(d => d.estimated1RM)) : 0}kg
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl text-[10px] text-zinc-500 leading-normal font-medium">
                  <span className="text-brand-neon font-black block mb-0.5 uppercase tracking-wide">💡 1RM 이란?</span>
                  한 번에 딱 1회 반복해서 최대로 들어올릴 수 있는 순수 무겁기 강도입니다. Epley 공식을 활용해 부상 위험 없이 간접 계산됩니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
