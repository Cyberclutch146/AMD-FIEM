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
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [mealTime, setMealTime] = useState<'Morning' | 'Afternoon' | 'Night' | 'Snack'>('Morning');
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) { setResults([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      const foods = await searchFood(searchQuery);
      setResults(foods);
      setSearching(false);
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen) { setSearchQuery(''); setResults([]); setSelectedFood(null); setMealTime('Morning'); }
  }, [isOpen]);

  const handleSelectFood = (food: FoodSearchResult) => { setSelectedFood(food); setResults([]); setSearchQuery(food.name); };

  const handleSubmit = async () => {
    if (!selectedFood || submitting) return;
    setSubmitting(true);
    await addHabit({
      title: selectedFood.name + (selectedFood.brand ? ` (${selectedFood.brand})` : ''),
      type: nutriscoreToFoodType(selectedFood.nutriscoreGrade),
      difficulty: mealTime,
    });
    setSubmitting(false);
    onClose();
  };

  const getNutriscoreColor = (g: string) => {
    switch (g.toLowerCase()) {
      case 'a': return 'bg-emerald-500 text-white';
      case 'b': return 'bg-lime-500 text-white';
      case 'c': return 'bg-yellow-500 text-gray-900';
      case 'd': return 'bg-orange-500 text-white';
      case 'e': return 'bg-red-500 text-white';
      default: return 'bg-slate-600 text-white';
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg glass-card p-8 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-extrabold text-white tracking-tight">Log Meal</h2>
            <p className="text-sm text-slate-500 mt-0.5">Search for a food item</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedFood(null); }}
            placeholder="Search foods (apple, pasta, chicken...)"
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            autoFocus
          />
          {searching && <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 animate-spin text-[16px]">refresh</span>}
        </div>

        {/* Results */}
        {results.length > 0 && !selectedFood && (
          <div className="mb-5 rounded-xl border border-white/[0.08] overflow-hidden max-h-56 overflow-y-auto bg-brand-dark/90">
            {results.map(food => (
              <button key={food.id} onClick={() => handleSelectFood(food)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.06] transition-colors border-b border-white/[0.04] last:border-0"
              >
                {food.imageUrl ? (
                  <img src={food.imageUrl} alt="" className="w-9 h-9 rounded-lg object-cover bg-white/[0.04]" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
                    <span className="material-symbols-outlined text-slate-600 text-[14px]">restaurant</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-slate-200 truncate">{food.name}</p>
                  {food.brand && <p className="text-[11px] text-slate-600 truncate">{food.brand}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`w-5 h-5 rounded text-[9px] font-bold flex items-center justify-center ${getNutriscoreColor(food.nutriscoreGrade)}`}>
                    {food.nutriscoreGrade !== 'unknown' ? food.nutriscoreGrade.toUpperCase() : '?'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">{food.calories} kcal</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected food details */}
        {selectedFood && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-white">{selectedFood.name}</p>
                {selectedFood.brand && <p className="text-xs text-slate-500">{selectedFood.brand}</p>}
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getNutriscoreColor(selectedFood.nutriscoreGrade)}`}>
                  {selectedFood.nutriscoreGrade !== 'unknown' ? selectedFood.nutriscoreGrade.toUpperCase() : '?'}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  nutriscoreToFoodType(selectedFood.nutriscoreGrade) === 'Healthy' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-500/15 text-orange-400'
                }`}>{nutriscoreToTag(selectedFood.nutriscoreGrade)}</span>
              </div>
            </div>
            {/* Macros Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: selectedFood.calories, label: 'kcal', color: 'text-white' },
                { val: `${selectedFood.protein}g`, label: 'Protein', color: 'text-emerald-400' },
                { val: `${selectedFood.carbs}g`, label: 'Carbs', color: 'text-cyan-400' },
                { val: `${selectedFood.fat}g`, label: 'Fat', color: 'text-yellow-400' },
                { val: `${selectedFood.fiber}g`, label: 'Fiber', color: 'text-lime-400' },
                { val: `${selectedFood.sugar}g`, label: 'Sugar', color: 'text-pink-400' },
              ].map(m => (
                <div key={m.label} className="bg-white/[0.04] rounded-lg p-3 text-center border border-white/[0.04]">
                  <p className={`text-lg font-display font-bold ${m.color}`}>{m.val}</p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Meal Time */}
        <div className="mb-6">
          <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-3">Meal Time</label>
          <div className="grid grid-cols-4 gap-2">
            {([
              { key: 'Morning', emoji: '🌅', label: 'Breakfast' },
              { key: 'Afternoon', emoji: '☀️', label: 'Lunch' },
              { key: 'Night', emoji: '🌙', label: 'Dinner' },
              { key: 'Snack', emoji: '🍎', label: 'Snack' },
            ] as const).map(({ key, emoji, label }) => (
              <button key={key} onClick={() => setMealTime(key)}
                className={`py-2.5 rounded-xl text-[11px] font-semibold transition-all border ${
                  mealTime === key
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 shadow-inner'
                    : 'bg-white/[0.03] text-slate-500 border-white/[0.06] hover:bg-white/[0.06]'
                }`}
              >
                <span className="block text-lg mb-0.5">{emoji}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!selectedFood || submitting}
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold py-3.5 rounded-xl disabled:opacity-20 disabled:cursor-not-allowed hover:shadow-glow active:scale-[0.98] transition-all text-sm"
        >
          {submitting ? 'Logging...' : 'Log This Meal'}
        </button>
      </div>
    </div>,
    document.body
  );
};
