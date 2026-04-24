import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useHabitStore } from '../../store/useHabitStore';
import { searchFood, FoodSearchResult, nutriscoreToFoodType, nutriscoreToTag } from '../../lib/openFoodFacts';

interface AddHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddHabitModal: React.FC<AddHabitModalProps> = ({ isOpen, onClose }) => {
  const addHabit = useHabitStore(state => state.addHabit);

  // Form state
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [mealTime, setMealTime] = useState<'Morning' | 'Afternoon' | 'Night' | 'Snack'>('Morning');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const foods = await searchFood(searchQuery);
      setResults(foods);
      setSearching(false);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults([]);
      setSelectedFood(null);
      setMealTime('Morning');
    }
  }, [isOpen]);

  const handleSelectFood = (food: FoodSearchResult) => {
    setSelectedFood(food);
    setResults([]);
    setSearchQuery(food.name);
  };

  const handleSubmit = async () => {
    if (!selectedFood || submitting) return;
    setSubmitting(true);

    const foodType = nutriscoreToFoodType(selectedFood.nutriscoreGrade);

    await addHabit({
      title: selectedFood.name + (selectedFood.brand ? ` (${selectedFood.brand})` : ''),
      type: foodType,
      difficulty: mealTime,
    });

    setSubmitting(false);
    onClose();
  };

  const getNutriscoreColor = (grade: string) => {
    switch (grade.toLowerCase()) {
      case 'a': return 'bg-emerald-500 text-white';
      case 'b': return 'bg-lime-500 text-white';
      case 'c': return 'bg-yellow-500 text-black';
      case 'd': return 'bg-orange-500 text-white';
      case 'e': return 'bg-red-500 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  if (!isOpen) return null;

  const content = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-panel rounded-2xl shadow-2xl border border-white/10 p-8 mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-on-surface font-headline-lg tracking-tight">Log Meal</h2>
            <p className="text-sm text-slate-400 font-body-md mt-1">Search for a food item to log</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-slate-400"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSelectedFood(null);
            }}
            placeholder="Search foods (e.g. apple, pasta, chicken)..."
            className="w-full bg-surface-container-highest/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-on-surface placeholder:text-slate-500 focus:outline-none focus:border-primary-container font-body-md text-sm transition-colors"
            autoFocus
          />
          {searching && (
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-primary animate-spin text-sm">refresh</span>
          )}
        </div>

        {/* Search Results Dropdown */}
        {results.length > 0 && !selectedFood && (
          <div className="mb-6 rounded-xl border border-white/10 bg-surface-container-lowest/80 overflow-hidden max-h-60 overflow-y-auto">
            {results.map(food => (
              <button
                key={food.id}
                onClick={() => handleSelectFood(food)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
              >
                {food.imageUrl ? (
                  <img src={food.imageUrl} alt="" className="w-10 h-10 rounded object-cover bg-surface-container-highest" />
                ) : (
                  <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-500 text-sm">restaurant</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-label-md text-on-surface text-sm truncate">{food.name}</p>
                  {food.brand && <p className="text-xs text-slate-500 truncate">{food.brand}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase ${getNutriscoreColor(food.nutriscoreGrade)}`}>
                    {food.nutriscoreGrade !== 'unknown' ? food.nutriscoreGrade.toUpperCase() : '?'}
                  </span>
                  <span className="text-xs text-slate-400">{food.calories} kcal</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected Food Details */}
        {selectedFood && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-label-md text-on-surface font-semibold">{selectedFood.name}</p>
                {selectedFood.brand && <p className="text-xs text-slate-400">{selectedFood.brand}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${getNutriscoreColor(selectedFood.nutriscoreGrade)}`}>
                  Nutri-Score {selectedFood.nutriscoreGrade !== 'unknown' ? selectedFood.nutriscoreGrade.toUpperCase() : '?'}
                </span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                  nutriscoreToFoodType(selectedFood.nutriscoreGrade) === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {nutriscoreToTag(selectedFood.nutriscoreGrade)}
                </span>
              </div>
            </div>

            {/* Macro Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                <p className="text-lg font-bold text-on-surface font-headline-lg">{selectedFood.calories}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-label-md">kcal</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                <p className="text-lg font-bold text-emerald-400 font-headline-lg">{selectedFood.protein}g</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-label-md">Protein</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                <p className="text-lg font-bold text-cyan-400 font-headline-lg">{selectedFood.carbs}g</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-label-md">Carbs</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                <p className="text-lg font-bold text-yellow-400 font-headline-lg">{selectedFood.fat}g</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-label-md">Fat</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                <p className="text-lg font-bold text-lime-400 font-headline-lg">{selectedFood.fiber}g</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-label-md">Fiber</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3 text-center border border-white/5">
                <p className="text-lg font-bold text-pink-400 font-headline-lg">{selectedFood.sugar}g</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-label-md">Sugar</p>
              </div>
            </div>
          </div>
        )}

        {/* Meal Time Selector */}
        <div className="mb-8">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 block font-label-md">
            Meal Time
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['Morning', 'Afternoon', 'Night', 'Snack'] as const).map(time => (
              <button
                key={time}
                onClick={() => setMealTime(time)}
                className={`px-3 py-2.5 rounded-lg font-label-md text-xs uppercase tracking-wider transition-all border ${
                  mealTime === time
                    ? 'bg-primary/20 text-primary border-primary/30'
                    : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                }`}
              >
                {time === 'Morning' ? '🌅 Breakfast' : time === 'Afternoon' ? '☀️ Lunch' : time === 'Night' ? '🌙 Dinner' : '🍎 Snack'}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!selectedFood || submitting}
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-bold tracking-widest uppercase py-4 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.98] font-label-md"
        >
          {submitting ? 'Logging...' : 'Log This Meal'}
        </button>
      </div>
    </div>
  );

  return ReactDOM.createPortal(content, document.body);
};
