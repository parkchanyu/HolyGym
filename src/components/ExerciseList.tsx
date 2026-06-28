/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Dumbbell, Trash2, Check, Sparkles, 
  HelpCircle, CheckCircle2, Flame, Trophy, Info
} from 'lucide-react';
import { Exercise, ExerciseCategory, ExerciseType } from '../types';
import { DEFAULT_EXERCISES } from '../data/exercises';

interface ExerciseListProps {
  customExercises: Exercise[];
  onAddCustomExercise: (exercise: Exercise) => void;
  onDeleteCustomExercise: (exerciseId: string) => void;
}

export default function ExerciseList({
  customExercises,
  onAddCustomExercise,
  onDeleteCustomExercise
}: ExerciseListProps) {
  // Navigation / Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | '전체'>('전체');

  // Custom exercise form State
  const [isCreatingCustom, setIsCreatingCustom] = useState<boolean>(false);
  const [customName, setCustomName] = useState<string>('');
  const [customCategory, setCustomCategory] = useState<ExerciseCategory>('가슴');
  const [customType, setCustomType] = useState<ExerciseType>('weight_reps');

  const allExercises = [...DEFAULT_EXERCISES, ...customExercises];

  // Filter exercises
  const filteredExercises = allExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === '전체' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle custom exercise creation
  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      alert('운동 이름을 입력해 주세요!');
      return;
    }

    // Check duplicates
    const isDuplicate = allExercises.some(ex => ex.name.trim().toLowerCase() === customName.trim().toLowerCase());
    if (isDuplicate) {
      alert('이미 동일한 이름의 운동 종목이 등록되어 있습니다.');
      return;
    }

    const newExercise: Exercise = {
      id: `custom-exercise-${Date.now()}`,
      name: customName.trim(),
      category: customCategory,
      type: customType,
      isCustom: true
    };

    onAddCustomExercise(newExercise);

    // Reset form
    setCustomName('');
    setIsCreatingCustom(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="exercise-list-tab-view">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter italic flex items-center gap-2 font-display uppercase">
            <Dumbbell className="w-5 h-5 text-brand-neon" />
            운동 도감 & 커스텀 종목 등록
          </h1>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mt-1">
            다양한 부위별 운동 가이드를 확인하고, 원하는 종목이 없으면 나만의 새로운 운동을 등록하여 설계에 반영하세요.
          </p>
        </div>
        
        <button
          onClick={() => setIsCreatingCustom(!isCreatingCustom)}
          className="px-4 py-2.5 rounded-xl bg-brand-neon hover:bg-brand-neon/90 text-zinc-950 font-black text-xs uppercase tracking-tight transition flex items-center justify-center gap-1.5 shadow-lg shadow-brand-neon/10 shrink-0"
        >
          <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
          새로운 커스텀 운동 추가
        </button>
      </div>

      {/* Custom Exercise creator Form overlay */}
      {isCreatingCustom && (
        <form 
          onSubmit={handleCreateCustom}
          className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 md:p-6 space-y-4 animate-slide-down shadow-xl"
        >
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Sparkles className="w-4.5 h-4.5 text-brand-neon" />
            <h3 className="font-extrabold text-zinc-100 text-sm font-display uppercase tracking-tight">새로운 커스텀 운동 만들기</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name Input */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">운동 명칭 *</label>
              <input 
                type="text"
                placeholder="예: 케이블 삼두 프레스, 딥스..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full bg-zinc-950 text-zinc-100 rounded-xl px-4 py-2.5 text-xs border border-zinc-850 focus:outline-none focus:border-brand-neon transition"
              />
            </div>

            {/* Category Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">자극 부위 (카테고리)</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value as ExerciseCategory)}
                className="w-full bg-zinc-950 text-zinc-200 rounded-xl px-4 py-2.5 text-xs border border-zinc-850 focus:outline-none focus:border-brand-neon transition cursor-pointer font-bold"
              >
                {(['가슴', '등', '하체', '어깨', '팔', '복근', '유산소', '전신'] as const).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Type Select */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">기록 측정 타입</label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as ExerciseType)}
                className="w-full bg-zinc-950 text-zinc-200 rounded-xl px-4 py-2.5 text-xs border border-zinc-850 focus:outline-none focus:border-brand-neon transition cursor-pointer font-bold"
              >
                <option value="weight_reps">중량 및 횟수 (바벨, 머신 운동 등)</option>
                <option value="bodyweight_reps">맨몸 횟수 (푸쉬업, 풀업, 크런치 등)</option>
                <option value="time">시간 측정 (플랭크, 유산소 등)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-zinc-800/60">
            <button
              type="button"
              onClick={() => setIsCreatingCustom(false)}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-300 text-xs font-semibold"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-neon hover:bg-brand-neon/90 text-zinc-950 font-black text-xs uppercase tracking-tight"
            >
              종목 추가 완료
            </button>
          </div>
        </form>
      )}

      {/* Search and Category Filters panel */}
      <div className="bg-zinc-900/50 border border-zinc-850 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="예: 벤치, 스쿼트, 데드..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 text-zinc-200 rounded-xl pl-9 pr-4 py-2.5 text-xs border border-zinc-850 focus:outline-none focus:border-brand-neon transition font-medium"
          />
        </div>

        {/* Category selector row */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {(['전체', '가슴', '등', '하체', '어깨', '팔', '복근', '유산소'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap border transition ${
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

      {/* Exercises directory grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="exercise-catalog-grid">
        {filteredExercises.map((ex) => {
          // Color coding by category
          const colors: Record<string, { bg: string, text: string, border: string }> = {
            '가슴': { bg: 'bg-white/10', text: 'text-white', border: 'border-white/20' },
            '등': { bg: 'bg-white/10', text: 'text-white/80', border: 'border-white/25' },
            '하체': { bg: 'bg-brand-neon/10', text: 'text-brand-neon', border: 'border-brand-neon/20' },
            '어깨': { bg: 'bg-zinc-800/20', text: 'text-zinc-300', border: 'border-zinc-800' },
            '팔': { bg: 'bg-zinc-850/20', text: 'text-zinc-400', border: 'border-zinc-800' },
            '복근': { bg: 'bg-zinc-900/40', text: 'text-zinc-400', border: 'border-zinc-850' },
            '유산소': { bg: 'bg-zinc-950/40', text: 'text-zinc-500', border: 'border-zinc-850' }
          };

          const colorTheme = colors[ex.category] || { bg: 'bg-zinc-800/10', text: 'text-zinc-400', border: 'border-zinc-850' };

          return (
            <div 
              key={ex.id}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 hover:border-zinc-700 transition flex flex-col justify-between h-full group shadow-sm"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black tracking-wide ${colorTheme.bg} ${colorTheme.text} ${colorTheme.border} border uppercase`}>
                    {ex.category}
                  </span>
                  
                  {ex.isCustom && (
                    <span className="inline-flex items-center text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 bg-zinc-800/80 text-zinc-400 rounded">
                      커스텀
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-extrabold text-zinc-100 text-sm md:text-base leading-snug group-hover:text-white transition">
                    {ex.name}
                  </h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-1">
                    {ex.type === 'weight_reps' ? '⚖️ 중량 + 횟수 세트 기록' : ex.type === 'bodyweight_reps' ? '🤸 맨몸 횟수 세트 기록' : '⏱️ 타이머 초단위 기록'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-5 pt-3 border-t border-zinc-900">
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">
                  <Info className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>루틴 설계 반영 가능</span>
                </div>

                {ex.isCustom && (
                  <button
                    onClick={() => {
                      if (confirm(`'${ex.name}' 종목을 정말 삭제할까요? 이 종목이 포함된 루틴의 세팅이 손상될 수 있습니다.`)) {
                        onDeleteCustomExercise(ex.id);
                      }
                    }}
                    className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-950 rounded-lg transition"
                    title="종목 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
