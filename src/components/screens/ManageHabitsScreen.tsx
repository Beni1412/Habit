import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HabitCategory, HabitFrequency, HabitDifficulty, TimeOfDay } from '../../types';
import {
  Plus,
  Trash2,
  Flame,
  Sparkles,
  CheckSquare,
  Calendar,
  Zap,
  Filter,
  Search,
  Edit2,
  Clock,
  Hash,
} from 'lucide-react';

export const ManageHabitsScreen: React.FC = () => {
  const { habits, addHabit, deleteHabit, setEditingHabit, setIsEditHabitModalOpen } = useApp();

  const [habitName, setHabitName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>('Health');
  const [selectedFrequency, setSelectedFrequency] = useState<HabitFrequency>('Daily');
  const [selectedDifficulty, setSelectedDifficulty] = useState<HabitDifficulty>('medium');
  const [targetCount, setTargetCount] = useState<number>(1);
  const [unit, setUnit] = useState<string>('times');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('anytime');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: HabitCategory[] = ['Health', 'Mindfulness', 'Fitness', 'Learning', 'Productivity'];

  const getPointsForDifficulty = (diff: HabitDifficulty) => {
    switch (diff) {
      case 'easy':
        return 10;
      case 'medium':
        return 20;
      case 'hard':
        return 30;
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habitName.trim()) return;

    addHabit({
      name: habitName.trim(),
      description: description.trim(),
      category: selectedCategory,
      frequency: selectedFrequency,
      difficulty: selectedDifficulty,
      targetCount: Math.max(1, targetCount),
      unit: unit.trim() || 'times',
      timeOfDay,
      points: getPointsForDifficulty(selectedDifficulty),
    });

    setHabitName('');
    setDescription('');
    setTargetCount(1);
    setUnit('times');
  };

  const filteredHabits = habits.filter((h) => {
    const matchesCategory = categoryFilter === 'All' || h.category === categoryFilter;
    const matchesSearch =
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.description && h.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 py-5 pb-24 md:pb-12 space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center bg-white p-5 sm:p-6 rounded-3xl border border-[#bccabb]/30 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0d1c2e] tracking-tight">
            Manage & Organize Habits
          </h1>
          <p className="text-xs sm:text-sm text-[#6d7b6d] font-medium mt-0.5">
            Configure custom routine targets, schedules, and difficulty rewards.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-[#4ade80]/15 text-[#005e2d] px-4 py-2 rounded-2xl text-xs font-bold border border-[#4ade80]/30">
          <Sparkles className="w-4 h-4" /> {habits.length} Active Routines
        </div>
      </div>

      {/* Grid Layout: Left Create Form / Right Active Routines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Create Form (5 cols) */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleCreate}
            className="bg-[#ffffff] rounded-3xl p-5 sm:p-6 border border-[#bccabb]/30 shadow-md space-y-4 sticky top-24"
          >
            <div className="flex items-center gap-2 pb-2 border-b border-[#bccabb]/20">
              <Plus className="w-5 h-5 text-[#006d36]" />
              <h2 className="text-lg font-black text-[#0d1c2e]">Add New Routine</h2>
            </div>

            {/* Habit Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
                Habit Name *
              </label>
              <input
                type="text"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                placeholder="e.g. Read 15 Pages, Morning Water, HIIT Workout"
                className="w-full px-4 py-2.5 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 focus:outline-none focus:ring-2 focus:ring-[#006d36] text-xs font-semibold placeholder:text-[#bccabb] transition-all"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
                Description / Notes
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Right after waking up before morning coffee"
                className="w-full px-4 py-2 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 focus:outline-none focus:ring-2 focus:ring-[#006d36] text-xs font-semibold placeholder:text-[#bccabb] transition-all"
              />
            </div>

            {/* Category Pills */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
                Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#006d36] text-white shadow-xs scale-105'
                          : 'bg-[#eff4ff] text-[#3d4a3e] hover:bg-[#dce9ff]'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Count & Unit */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5" /> Target
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={targetCount}
                  onChange={(e) => setTargetCount(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f9ff] border border-[#bccabb]/40 text-xs font-bold focus:ring-2 focus:ring-[#006d36] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
                  Unit
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f9ff] border border-[#bccabb]/40 text-xs font-bold focus:ring-2 focus:ring-[#006d36] focus:outline-none"
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
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Time
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f9ff] border border-[#bccabb]/40 text-xs font-bold focus:ring-2 focus:ring-[#006d36] focus:outline-none capitalize"
                >
                  <option value="anytime">Anytime</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Frequency
                </label>
                <select
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value as HabitFrequency)}
                  className="w-full px-3 py-2 rounded-xl bg-[#f8f9ff] border border-[#bccabb]/40 text-xs font-bold focus:ring-2 focus:ring-[#006d36] focus:outline-none"
                >
                  <option value="Daily">Daily</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </div>
            </div>

            {/* Difficulty Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
                  Difficulty
                </label>
                <span className="text-xs font-black text-[#006d36] bg-[#4ade80]/20 px-2 py-0.5 rounded-md">
                  +{getPointsForDifficulty(selectedDifficulty)} Leafs
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as HabitDifficulty[]).map((diff) => {
                  const isSelected = selectedDifficulty === diff;
                  return (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`p-2 rounded-xl border text-center capitalize text-xs font-bold transition-all ${
                        isSelected
                          ? 'border-[#006d36] bg-[#4ade80]/15 text-[#006d36] ring-1 ring-[#006d36]'
                          : 'border-[#bccabb]/30 bg-white text-[#6d7b6d] hover:bg-[#eff4ff]'
                      }`}
                    >
                      <Zap className="w-3.5 h-3.5 mx-auto mb-0.5 text-[#f6bb1f]" />
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-[#006d36] hover:bg-[#005e2d] text-white font-black text-sm shadow-md transition-all bouncy-button border-b-[#004722] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Save Routine
            </button>
          </form>
        </div>

        {/* Right Column: Active Routines (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-3 border border-[#bccabb]/30 shadow-xs space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#6d7b6d] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search habits by name or keyword..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#f8f9ff] border border-[#bccabb]/40 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#006d36]"
              />
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
              <Filter className="w-3.5 h-3.5 text-[#6d7b6d] shrink-0 ml-1" />
              {['All', ...categories].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCategoryFilter(filter)}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                    categoryFilter === filter
                      ? 'bg-[#006d36] text-white shadow-xs'
                      : 'bg-[#eff4ff] text-[#3d4a3e] hover:bg-[#dce9ff]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* List of Routines */}
          <div className="space-y-3">
            {filteredHabits.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#bccabb]/30">
                <CheckSquare className="w-12 h-12 text-[#bccabb] mx-auto mb-2" />
                <h3 className="font-bold text-[#0d1c2e] text-sm">No habits match your filter</h3>
                <p className="text-xs text-[#6d7b6d] mt-1">
                  Create a new routine using the form on the left!
                </p>
              </div>
            ) : (
              filteredHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-[#bccabb]/30 shadow-xs flex items-center justify-between gap-4 hover:border-[#4ade80] transition-all"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-sm sm:text-base text-[#0d1c2e] truncate">
                        {habit.name}
                      </h3>
                      <span className="px-2 py-0.5 rounded-md bg-[#eff4ff] text-[#0060ac] text-[10px] font-bold">
                        {habit.category}
                      </span>
                      {habit.targetCount && habit.targetCount > 1 && (
                        <span className="px-2 py-0.5 rounded-md bg-[#4ade80]/20 text-[#005e2d] text-[10px] font-bold">
                          Goal: {habit.targetCount} {habit.unit}
                        </span>
                      )}
                    </div>

                    {habit.description && (
                      <p className="text-xs text-[#6d7b6d] truncate">{habit.description}</p>
                    )}

                    <div className="flex items-center gap-2.5 text-xs text-[#6d7b6d] font-medium">
                      <span>{habit.frequency}</span>
                      <span>•</span>
                      <span className="capitalize">{habit.difficulty}</span>
                      <span>•</span>
                      <span className="text-[#006d36] font-bold">+{habit.points} Leafs</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Flame Streak */}
                    <div className="flex items-center gap-1 bg-[#ffdf9f]/40 text-[#795900] px-2.5 py-1 rounded-full text-xs font-black border border-[#f6bb1f]/30">
                      <Flame className="w-3.5 h-3.5 text-[#f6bb1f] fill-[#f6bb1f]" />
                      <span>{habit.streak}d</span>
                    </div>

                    {/* Edit button */}
                    <button
                      onClick={() => {
                        setEditingHabit(habit);
                        setIsEditHabitModalOpen(true);
                      }}
                      className="p-2 rounded-xl text-[#6d7b6d] hover:text-[#0060ac] hover:bg-[#eff4ff] transition-colors"
                      title="Edit Habit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-2 rounded-xl text-[#6d7b6d] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 transition-colors"
                      title="Delete habit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
