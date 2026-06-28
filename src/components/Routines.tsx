/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, ArrowUp, ArrowDown, Search, Filter, Dumbbell, 
  ChevronRight, Save, X, Sparkles, CheckCircle2, ChevronLeft, Eye
} from 'lucide-react';
import { Routine, RoutineExercise, WorkoutSet, Exercise, ExerciseCategory, ExerciseType } from '../types';
import { DEFAULT_EXERCISES } from '../data/exercises';

interface RoutinesProps {
  routines: Routine[];
  customExercises: Exercise[];
  onSaveRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
  onStartRoutine: (routineId: string) => void;
}

export default function Routines({
  routines,
  customExercises,
  onSaveRoutine,
  onDeleteRoutine,
  onStartRoutine
}: RoutinesProps) {
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
  const [isAddingExercise, setIsAddingExercise] = useState<boolean>(false);
  
  // Exercise catalog search & filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | '전체'>('전체');

  // Combine default exercises with custom user-created exercises
  const allExercises = [...DEFAULT_EXERCISES, ...customExercises];

  // Open editor for a new empty routine
  const handleCreateNewRoutine = () => {
    const newRoutine: Routine = {
      id: `routine-${Date.now()}`,
      name: '',
      description: '',
      exercises: [],
      createdAt: new Date().toISOString()
    };
    setEditingRoutine(newRoutine);
  };

  // Open editor for an existing routine
  const handleEditRoutine = (routine: Routine) => {
    // Deep clone to avoid mutating the original until saved
    const cloned: Routine = JSON.parse(JSON.stringify(routine));
    setEditingRoutine(cloned);
  };

  // Save routine and exit editor
  const handleSave = () => {
    if (!editingRoutine) return;
    if (!editingRoutine.name.trim()) {
      alert('루틴 이름을 입력해주세요!');
      return;
    }
    if (editingRoutine.exercises.length === 0) {
      if (!confirm('종목이 없는 루틴입니다. 저장하시겠습니까?')) return;
    }
    onSaveRoutine(editingRoutine);
    setEditingRoutine(null);
  };

  // Cancel edit
  const handleCancel = () => {
    setEditingRoutine(null);
  };

  // Update routine simple text fields
  const handleUpdateField = (field: 'name' | 'description', value: string) => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      [field]: value
    });
  };

  // Add exercise to currently editing routine
  const handleAddExerciseToRoutine = (exercise: Exercise) => {
    if (!editingRoutine) return;

    // Check if exercise is already added to avoid duplicate confusion, or allow it
    const isAlreadyAdded = editingRoutine.exercises.some(re => re.exerciseId === exercise.id);
    if (isAlreadyAdded && !confirm(`'${exercise.name}' 종목이 이미 루틴에 존재합니다. 추가하시겠습니까?`)) {
      return;
    }

    const newRoutineExercise: RoutineExercise = {
      id: `re-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      exerciseId: exercise.id,
      name: exercise.name,
      category: exercise.category,
      type: exercise.type,
      sets: [
        { id: `set-${Date.now()}-1`, setNumber: 1, weight: exercise.type === 'weight_reps' ? 20 : 0, reps: 10, completed: false }
      ]
    };

    setEditingRoutine({
      ...editingRoutine,
      exercises: [...editingRoutine.exercises, newRoutineExercise]
    });
    
    setIsAddingExercise(false);
  };

  // Remove exercise from editing routine
  const handleRemoveExercise = (reId: string) => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      exercises: editingRoutine.exercises.filter(ex => ex.id !== reId)
    });
  };

  // Move exercise up or down in order
  const handleMoveExercise = (index: number, direction: 'up' | 'down') => {
    if (!editingRoutine) return;
    const list = [...editingRoutine.exercises];
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === list.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    setEditingRoutine({
      ...editingRoutine,
      exercises: list
    });
  };

  // Add a set to a routine exercise
  const handleAddSet = (reId: string) => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      exercises: editingRoutine.exercises.map(ex => {
        if (ex.id !== reId) return ex;
        
        // Grab values from the last set to duplicate intelligently
        const lastSet = ex.sets[ex.sets.length - 1];
        const defaultWeight = lastSet ? lastSet.weight : 20;
        const defaultReps = lastSet ? lastSet.reps : 10;

        const newSet: WorkoutSet = {
          id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          setNumber: ex.sets.length + 1,
          weight: defaultWeight,
          reps: defaultReps,
          completed: false
        };

        return {
          ...ex,
          sets: [...ex.sets, newSet]
        };
      })
    });
  };

  // Remove set from routine exercise
  const handleRemoveSet = (reId: string, setId: string) => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      exercises: editingRoutine.exercises.map(ex => {
        if (ex.id !== reId) return ex;
        if (ex.sets.length <= 1) return ex; // Must keep at least 1 set
        
        const filteredSets = ex.sets.filter(set => set.id !== setId);
        // Re-number remaining sets
        const updatedSets = filteredSets.map((s, idx) => ({
          ...s,
          setNumber: idx + 1
        }));

        return {
          ...ex,
          sets: updatedSets
        };
      })
    });
  };

  // Update specific set values (weight or reps)
  const handleUpdateSetField = (
    reId: string, 
    setId: string, 
    field: 'weight' | 'reps', 
    value: number
  ) => {
    if (!editingRoutine) return;
    setEditingRoutine({
      ...editingRoutine,
      exercises: editingRoutine.exercises.map(ex => {
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
      })
    });
  };

  // Filter exercise catalog
  const filteredExercises = allExercises.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.category.includes(searchQuery);
    const matchesCategory = selectedCategory === '전체' || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Render routine list (Main view)
  if (!editingRoutine) {
    return (
      <div className="space-y-6 pb-12 animate-fade-in" id="routines-list-view">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter italic flex items-center gap-2 font-display">
              <Dumbbell className="w-5 h-5 text-brand-neon" />
              내 운동 루틴 목록
            </h1>
            <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mt-1">
              자신만의 부위별 커스텀 루틴을 구성하고 손쉽게 운동을 시작하세요.
            </p>
          </div>
          <button
            id="btn-create-routine"
            onClick={handleCreateNewRoutine}
            className="px-5 py-2.5 rounded-2xl bg-brand-neon hover:bg-brand-neon-light text-zinc-950 font-black uppercase tracking-tighter italic text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-brand-neon/15"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.5]" />
            새 루틴 추가
          </button>
        </div>

        {routines.length === 0 ? (
          <div className="py-16 text-center bg-zinc-900/40 rounded-3xl border border-zinc-800 p-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-zinc-500">
              <Dumbbell className="w-8 h-8 text-brand-neon" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <p className="text-zinc-200 text-base font-bold">생성된 운동 루틴이 없습니다</p>
              <p className="text-zinc-500 text-xs font-medium">
                나만의 분할 루틴이나 커스텀 루틴을 추가해 보세요. 운동 진행 시 터치 한 번으로 쉽게 완료 세트를 체크할 수 있습니다.
              </p>
            </div>
            <button
              onClick={handleCreateNewRoutine}
              className="px-4 py-2.5 rounded-xl bg-brand-neon text-zinc-950 font-black uppercase tracking-tighter italic text-xs transition shadow-md shadow-brand-neon/10"
            >
              첫 루틴 만들기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="routines-grid">
            {routines.map(routine => (
              <div 
                key={routine.id}
                className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 md:p-6 hover:border-zinc-700/60 transition-all flex flex-col justify-between h-full"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-lg font-bold text-zinc-100 line-clamp-1">{routine.name}</h2>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEditRoutine(routine)}
                        title="루틴 수정"
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`'${routine.name}' 루틴을 정말 삭제할까요?`)) {
                            onDeleteRoutine(routine.id);
                          }
                        }}
                        title="루틴 삭제"
                        className="p-1.5 rounded-lg hover:bg-zinc-800 text-red-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {routine.description && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {routine.description}
                    </p>
                  )}

                  <div className="space-y-1.5 bg-zinc-950/40 rounded-2xl p-3.5 border border-zinc-800/60">
                    <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                      구성 종목 ({routine.exercises.length})
                    </p>
                    {routine.exercises.length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">등록된 종목이 없습니다.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {routine.exercises.map((ex, idx) => (
                          <span 
                            key={ex.id || idx}
                            className="inline-flex items-center text-xs px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800/80 text-zinc-300"
                          >
                            {ex.name.split(' ')[0]}
                            <span className="text-[10px] text-brand-neon ml-1.5 font-bold font-mono">
                              {ex.sets.length}S
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800/60">
                  <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider font-mono">
                    종목 {routine.exercises.length}개 • 총 {routine.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)}세트
                  </span>
                  
                  <button
                    onClick={() => onStartRoutine(routine.id)}
                    className="px-4 py-2.5 rounded-xl bg-brand-neon hover:bg-brand-neon-light text-zinc-950 font-black uppercase tracking-tighter italic text-xs transition duration-200 flex items-center gap-1 shadow-md shadow-brand-neon/10"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    이 루틴으로 운동 시작
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Render routine Editor mode
  const isEditing = routines.some(r => r.id === editingRoutine.id);

  return (
    <div className="space-y-6 pb-12 animate-fade-in" id="routine-editor-view">
      <div className="flex items-center gap-3">
        <button
          onClick={handleCancel}
          className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
          title="돌아가기"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter italic flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-brand-neon" />
            {isEditing ? '루틴 수정' : '새 운동 루틴 만들기'}
          </h1>
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mt-1">
            운동 종류를 추가하고 세트 수와 기본 무게/회수를 지정하여 나만의 커스텀 루틴을 만드세요.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Editor Details (Left 7 Columns) */}
        <div className="lg:col-span-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
          {/* Metadata section */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">루틴 이름 *</label>
              <input 
                type="text"
                placeholder="예: 🚀 가슴 & 이두 (Push), 가벼운 전신 홈트"
                value={editingRoutine.name}
                onChange={(e) => handleUpdateField('name', e.target.value)}
                className="w-full bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-brand-neon/80 transition"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-black text-zinc-500 uppercase tracking-wider">루틴 설명 (선택)</label>
              <textarea 
                placeholder="이 루틴의 목표나 진행 팁을 적어주세요."
                value={editingRoutine.description || ''}
                onChange={(e) => handleUpdateField('description', e.target.value)}
                rows={2}
                className="w-full bg-zinc-950 text-zinc-100 rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-brand-neon/80 transition resize-none"
              />
            </div>
          </div>

          {/* Routine Exercises Header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h2 className="text-sm font-bold text-zinc-200">
                운동 목록 ({editingRoutine.exercises.length})
              </h2>
              <button
                type="button"
                onClick={() => setIsAddingExercise(true)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 border border-zinc-700"
              >
                <Plus className="w-4.5 h-4.5" />
                종목 추가
              </button>
            </div>

            {editingRoutine.exercises.length === 0 ? (
              <div 
                onClick={() => setIsAddingExercise(true)}
                className="py-12 text-center bg-zinc-950 border border-dashed border-zinc-800 hover:border-zinc-700 rounded-2xl cursor-pointer flex flex-col items-center justify-center p-6 space-y-3 transition"
              >
                <Plus className="w-8 h-8 text-zinc-600" />
                <div className="space-y-1">
                  <p className="text-zinc-300 text-sm font-semibold">운동 종목이 비어있습니다</p>
                  <p className="text-zinc-500 text-xs">종목 추가 버튼을 눌러서 원하는 운동을 선택해보세요!</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4" id="routine-editor-exercises-list">
                {editingRoutine.exercises.map((re, index) => (
                  <div 
                    key={re.id}
                    className="bg-zinc-950 rounded-xl border border-zinc-800 p-4 space-y-3 relative group"
                  >
                    {/* Control Row */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-xs font-mono font-bold text-zinc-400 shrink-0">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-zinc-100 text-sm md:text-base leading-none">
                            {re.name}
                          </h3>
                          <span className="inline-block text-[9px] px-1.5 py-0.5 mt-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-medium font-semibold">
                            {re.category}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveExercise(index, 'up')}
                          className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 disabled:opacity-20 transition"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === editingRoutine.exercises.length - 1}
                          onClick={() => handleMoveExercise(index, 'down')}
                          className="p-1 rounded-lg hover:bg-zinc-900 text-zinc-400 disabled:opacity-20 transition"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(re.id)}
                          className="p-1 rounded-lg hover:bg-zinc-900 text-red-500 transition ml-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Set Config table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs min-w-[320px]">
                        <thead>
                          <tr className="border-b border-zinc-900 text-zinc-500 font-bold uppercase tracking-wider text-[10px]">
                            <th className="py-2 w-16">세트</th>
                            <th className="py-2">
                              {re.type === 'weight_reps' ? '무게 (kg)' : re.type === 'bodyweight_reps' ? '무게 (맨몸)' : '시간 (초)'}
                            </th>
                            <th className="py-2">회수 (회)</th>
                            <th className="py-2 w-12 text-right">삭제</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-900">
                          {re.sets.map((set) => (
                            <tr key={set.id}>
                              <td className="py-2.5 font-mono font-bold text-zinc-400">
                                S-{set.setNumber}
                              </td>
                              <td className="py-2">
                                {re.type === 'weight_reps' ? (
                                  <div className="flex items-center gap-1.5">
                                    <input 
                                      type="number"
                                      min="0"
                                      step="2.5"
                                      value={set.weight}
                                      onChange={(e) => handleUpdateSetField(re.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                                      className="w-18 bg-zinc-900 text-zinc-100 rounded-md border border-zinc-800 text-center py-1 font-mono text-sm focus:outline-none focus:border-brand-neon"
                                    />
                                    <span className="text-zinc-500 text-[10px]">kg</span>
                                  </div>
                                ) : (
                                  <span className="text-zinc-500 italic text-[11px] font-medium font-bold">맨몸 자중</span>
                                )}
                              </td>
                              <td className="py-2">
                                <input 
                                  type="number"
                                  min="1"
                                  value={set.reps}
                                  onChange={(e) => handleUpdateSetField(re.id, set.id, 'reps', parseInt(e.target.value) || 1)}
                                  className="w-18 bg-zinc-900 text-zinc-100 rounded-md border border-zinc-800 text-center py-1 font-mono text-sm focus:outline-none focus:border-brand-neon"
                                />
                              </td>
                              <td className="py-2 text-right">
                                <button
                                  type="button"
                                  disabled={re.sets.length <= 1}
                                  onClick={() => handleRemoveSet(re.id, set.id)}
                                  className="p-1 rounded text-zinc-500 hover:text-red-400 disabled:opacity-20 hover:bg-zinc-900"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Add Set trigger */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleAddSet(re.id)}
                        className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200 bg-zinc-900 rounded-lg hover:bg-zinc-800 text-[10px] font-bold border border-zinc-800 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        세트 추가
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/60">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 font-bold text-xs uppercase tracking-tighter"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-2xl bg-brand-neon hover:bg-brand-neon-light text-zinc-950 font-black uppercase tracking-tighter italic text-xs transition shadow-lg shadow-brand-neon/15 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              루틴 저장
            </button>
          </div>
        </div>

        {/* Quick Tips / Meta Info Column (Right 4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-zinc-200 text-sm flex items-center gap-1.5 uppercase font-display">
              <Sparkles className="w-4 h-4 text-brand-neon" />
              루틴 설계 가이드
            </h3>
            <ul className="space-y-3 text-xs text-zinc-400 list-disc list-inside leading-relaxed font-medium">
              <li>
                <strong className="text-zinc-200">점진적 과부하:</strong> 기본 무게와 회수를 설정해 두고, 실제로 진행할 때 무게를 올리면서 자신의 최고점에 도전해보세요.
              </li>
              <li>
                <strong className="text-zinc-200">기본 세트 수:</strong> 보통 한 종목당 <span className="text-brand-neon font-bold">3~5세트</span>를 권장합니다.
              </li>
              <li>
                <strong className="text-zinc-200">순서 배치:</strong> 체력 소모가 많은 <span className="text-brand-neon font-bold">복합 다관절 운동</span>(스쿼트, 데드리프트, 벤치프레스)을 앞쪽에 배치하는 것이 안전하고 효과적입니다.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Embedded Exercise Selector Modal overlay */}
      {isAddingExercise && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-scale-in">
            {/* Modal Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-zinc-100 text-base font-display">운동 추가하기</h3>
                <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">목록에서 루틴에 추가할 운동을 골라 터치하세요.</p>
              </div>
              <button
                onClick={() => setIsAddingExercise(false)}
                className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search and Filters */}
            <div className="p-4 border-b border-zinc-800 space-y-3 bg-zinc-900/30">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="예: 프레스, 랫풀, 스쿼트..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 text-zinc-100 rounded-xl pl-9 pr-4 py-2.5 text-xs border border-zinc-800 focus:outline-none focus:border-brand-neon"
                />
              </div>

              {/* Horizontally scrolling categories tab */}
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
              {filteredExercises.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  검색 결과에 맞는 운동이 존재하지 않습니다.
                </div>
              ) : (
                filteredExercises.map(ex => (
                  <div
                    key={ex.id}
                    onClick={() => handleAddExerciseToRoutine(ex)}
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
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-brand-neon group-hover:translate-x-0.5 transition" />
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
