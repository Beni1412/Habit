import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { HabitCategory, HabitFrequency, HabitDifficulty, TimeOfDay } from '../../types';
import { X, Save, Trash2, Calendar, Zap, Clock, Hash, AlignLeft } from 'lucide-react';

export const EditHabitModal: React.FC = () => {
  const {
    editingHabit,
    setEditingHabit,
    isEditHabitModalOpen,
    setIsEditHabitModalOpen,
    updateHabit,
    deleteHabit,
  } = useApp();

  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>('Health');
  const [selectedFrequency, setSelectedFrequency] = useState<HabitFrequency>('Daily');
  const [selectedDifficulty, setSelectedDifficulty] = useState<HabitDifficulty>('medium');
  const [targetCount, setTargetCount] = useState<number>(1);
  const [unit, setUnit] = useState<string>('times');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');

  useEffect(() => {
    if (editingHabit) {
      setHabitName(editingHabit.name);
      setDescription(editingHabit.description || '');
      setSelectedCategory(editingHabit.category);
      setSelectedFrequency(editingHabit.frequency);
      setSelectedDifficulty(editingHabit.difficulty);
      setTargetCount(editingHabit.targetCount || 1);
      setUnit(editingHabit.unit || 'times');
      setTimeOfDay(editingHabit.timeOfDay || 'anytime');
    }
  }, [editingHabit]);

  if (!isEditHabitModalOpen || !editingHabit) return null;

  const categories: HabitCategory[] = ['Health', 'Mindfulness', 'Fitness', 'Learning', 'Productivity'];

  const getPoints = (diff: HabitDifficulty) => {
    switch (diff) {
      case 'easy':
        return 10;
      case 'medium':
        return 20;
      case 'hard':
        return 30;
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    updateHabit(editingHabit.id, {
      name: habitName.trim(),
      description: description.trim(),
      category: selectedCategory,
      frequency: selectedFrequency,
      difficulty: selectedDifficulty,
      targetCount: Math.max(1, targetCount),
      unit: unit.trim() || 'times',
      timeOfDay,
      points: getPoints(selectedDifficulty),
    });

    setEditingHabit(null);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${editingHabit.name}"?`)) {
      deleteHabit(editingHabit.id);
      setEditingHabit(null);
      setIsEditHabitModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1c2e]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#bccabb]/40 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsEditHabitModalOpen(false);
            setEditingHabit(null);
          }}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#f8f9ff] border border-[#bccabb]/30 flex items-center justify-center text-[#6d7b6d] hover:text-[#0d1c2e] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-2xl font-black text-[#0d1c2e] tracking-tight">Edit Habit Routine</h2>
          <p className="text-xs text-[#6d7b6d] font-medium mt-0.5">
            Modify targets, schedule reminders, or difficulty.
          </p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          {/* Habit Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
              Habit Name *
            </label>
            <input
              type="text"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 focus:outline-none focus:ring-2 focus:ring-[#006d36] text-sm font-semibold placeholder:text-[#bccabb]"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-1">
              <AlignLeft className="w-3.5 h-3.5" /> Note / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 2 large glasses before breakfast"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 focus:outline-none focus:ring-2 focus:ring-[#006d36] text-xs font-semibold placeholder:text-[#bccabb]"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#006d36] text-white shadow-sm scale-105'
                      : 'bg-[#eff4ff] text-[#3d4a3e] hover:bg-[#dce9ff]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Target Count & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-1">
                <Hash className="w-3.5 h-3.5" /> Daily Target
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={targetCount}
                onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 text-xs font-bold focus:ring-2 focus:ring-[#006d36] focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 text-xs font-bold focus:ring-2 focus:ring-[#006d36] focus:outline-none"
              >
                <option value="times">times</option>
                <option value="glasses">glasses</option>
                <option value="pages">pages</option>
                <option value="mins">mins</option>
                <option value="km">km</option>
                <option value="reps">reps</option>
              </select>
            </div>
          </div>

          {/* Schedule Time & Frequency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Schedule Time
              </label>
              <select
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 text-xs font-bold focus:ring-2 focus:ring-[#006d36] focus:outline-none capitalize"
              >
                <option value="anytime">Anytime</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Frequency
              </label>
              <select
                value={selectedFrequency}
                onChange={(e) => setSelectedFrequency(e.target.value as HabitFrequency)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 text-xs font-bold focus:ring-2 focus:ring-[#006d36] focus:outline-none"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>

          {/* Difficulty Tier */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
                Difficulty Tier
              </label>
              <span className="text-xs font-black text-[#006d36]">
                +{getPoints(selectedDifficulty)} Leaf Points
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as HabitDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`p-2.5 rounded-2xl border text-center capitalize text-xs font-bold transition-all ${
                    selectedDifficulty === diff
                      ? 'border-[#006d36] bg-[#4ade80]/15 text-[#006d36] ring-1 ring-[#006d36]'
                      : 'border-[#bccabb]/30 bg-white text-[#6d7b6d]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 mx-auto mb-1 text-[#f6bb1f]" />
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              className="py-3.5 rounded-2xl bg-[#ffdad6]/40 hover:bg-[#ffdad6] text-[#ba1a1a] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>

            <button
              type="submit"
              className="col-span-2 py-3.5 rounded-2xl bg-[#006d36] hover:bg-[#005e2d] text-white font-black text-sm shadow-md transition-all bouncy-button border-b-[#004722] flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
