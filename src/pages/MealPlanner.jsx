import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  AlertCircle,
  Award,
  ChevronRight,
  TrendingUp,
  Layers,
  Heart,
  Wallet,
} from 'lucide-react';
import BudgetInput from '../components/planner/BudgetInput';
import MealCard from '../components/planner/MealCard';
import BudgetSummary from '../components/planner/BudgetSummary';
import {
  getRecommendations,
  calculateNutritionSummary,
  generateTwoMealCombinations,
} from '../services/recommendationService';
import { getRestaurantById, getNutritionForFood } from '../services/foodService';

export default function MealPlanner() {
  const [currentBudget, setCurrentBudget] = useState(25000);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [isTwoMealMode, setIsTwoMealMode] = useState(false);

  // Initial load with default Rp 25.000 budget
  useEffect(() => {
    handleSearchBudget(25000);
  }, []);

  const handleSearchBudget = (budget) => {
    setIsLoading(true);
    setErrorMessage('');
    setCurrentBudget(budget);
    setHasSearched(true);
    setIsTwoMealMode(false);

    // Simulate snappy calculation
    setTimeout(() => {
      const res = getRecommendations(budget);
      if (res.success && res.recommendations.length > 0) {
        setRecommendations(res.recommendations);
        setSelectedIndex(0);
        setErrorMessage('');
      } else {
        // Fallback or offer 2-meal mode
        const twoMealRes = generateTwoMealCombinations(budget);
        if (twoMealRes.length > 0) {
          setRecommendations(twoMealRes);
          setSelectedIndex(0);
          setIsTwoMealMode(true);
          setErrorMessage('');
        } else {
          setRecommendations([]);
          setErrorMessage(
            res.message ||
              `Tidak ditemukan kombinasi dalam budget Rp ${budget.toLocaleString(
                'id-ID'
              )}. Coba naikkan sedikit budget harian.`
          );
        }
      }
      setIsLoading(false);
    }, 250);
  };

  const handleForceTwoMeal = (budget) => {
    setIsLoading(true);
    setIsTwoMealMode(true);
    setTimeout(() => {
      const twoMealRes = generateTwoMealCombinations(budget);
      if (twoMealRes.length > 0) {
        setRecommendations(twoMealRes);
        setSelectedIndex(0);
        setErrorMessage('');
      } else {
        setRecommendations([]);
        setErrorMessage(`Budget terlalu kecil bahkan untuk 2 kali makan.`);
      }
      setIsLoading(false);
    }, 250);
  };

  const activePlan = recommendations[selectedIndex] || null;

  const activePlanNutrition = activePlan
    ? calculateNutritionSummary(activePlan)
    : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
          Rekomendasi Menu Harian Seimbang
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Dapatkan kombinasi 3 waktu makan (Sarapan, Siang, & Malam) yang tidak melebihi anggaran Anda dengan gizi optimal.
        </p>
      </div>

      {/* Budget Form */}
      <BudgetInput
        onSubmit={handleSearchBudget}
        isLoading={isLoading}
        initialBudget={currentBudget}
      />
      
      {/* Two Meal Mode Button - only show if no three meal results */}
      {!isTwoMealMode && recommendations.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-slate-600">
            <Wallet className="w-4 h-4" />
            <span className="text-xs">Budget harian Anda terlalu rendah untuk 3 kali makan?</span>
          </div>
          <button
            type="button"
            onClick={() => handleForceTwoMeal(15000)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Aktifkan Mode Hemat (2 Kali Makan)
          </button>
        </div>
      )}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-full mx-auto flex items-center justify-center text-emerald-600 animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="font-bold text-slate-800 text-base">
            Mengkalkulasi Kombinasi Terbaik...
          </p>
          <p className="text-xs text-slate-500">
            Mengevaluasi harga, variasi menu, dan kandungan gizi dari menu survei.
          </p>
        </div>
      ) : errorMessage ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">
            Belum Ada Kombinasi yang Pas
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            {errorMessage}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleSearchBudget(30000)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
            >
              Coba Budget Rp 30.000
            </button>
          </div>
        </div>
      ) : isTwoMealMode ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <Award className="w-5 h-5" />
            <h3 className="font-bold text-base">Mode 2 Waktu Makan (Budget Hemat)</h3>
          </div>
          <p className="text-xs text-slate-700">
            Mode hemat memungkinkan 2 kali makan yang seimbang (contoh: Sarapan + Makan Malam) yang sesuai dengan budget harian rendah Anda.
          </p>
          <div className="bg-white rounded-xl border border-emerald-200 p-4 space-y-3">
            {/* Two meals display */}
            <div className="grid grid-cols-2 gap-3">
              <MealCard
                meal={activePlan?.lunch}
                mealType="lunch"
                nutrition={activePlan?.lunch ? getNutritionForFood(activePlan.lunch) : null}
                restaurant={activePlan?.lunch ? getRestaurantById(activePlan.lunch?.restaurantId) : null}
              />
              <MealCard
                meal={activePlan?.dinner}
                mealType="dinner"
                nutrition={activePlan?.dinner ? getNutritionForFood(activePlan.dinner) : null}
                restaurant={activePlan?.dinner ? getRestaurantById(activePlan.dinner?.restaurantId) : null}
              />
            </div>
            <div className="pt-3 border-t border-emerald-100">
              <BudgetSummary
                combination={activePlan}
                budget={currentBudget}
                nutritionSummary={activePlanNutrition}
              />
            </div>
          </div>
        </div>
      ) : activePlan ? (
        <div className="space-y-5">
          {/* Recommendation Tabs (Top 5 Alternatives) */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {recommendations.map((rec, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedIndex(idx)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                    selectedIndex === idx
                      ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-700/20'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Rekomendasi #{idx + 1}</span>
                </button>
              ))}
            </div>

            {/* Score Indicators */}
            <div className="hidden sm:flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <Sparkles className="w-3.5 h-3.5" />
                Skor: {Math.round(activePlan.finalScore)}/100
              </span>
              <span className="text-slate-300">|</span>
              <span title="Efisiensi Budget">
                Budget: {Math.round(activePlan.budgetScore || 0)}
              </span>
              <span title="Keseimbangan Gizi">
                Gizi: {Math.round(activePlan.nutritionScore || 0)}
              </span>
              <span title="Variasi Menu">
                Variasi: {Math.round(activePlan.varietyScore || 0)}
              </span>
            </div>
          </div>

          {/* Three Meal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MealCard
              meal={activePlan.breakfast}
              mealType="breakfast"
              nutrition={getNutritionForFood(activePlan.breakfast)}
              restaurant={getRestaurantById(activePlan.breakfast?.restaurantId)}
            />
            <MealCard
              meal={activePlan.lunch}
              mealType="lunch"
              nutrition={getNutritionForFood(activePlan.lunch)}
              restaurant={getRestaurantById(activePlan.lunch?.restaurantId)}
            />
            <MealCard
              meal={activePlan.dinner}
              mealType="dinner"
              nutrition={getNutritionForFood(activePlan.dinner)}
              restaurant={getRestaurantById(activePlan.dinner?.restaurantId)}
            />
          </div>

          {/* Budget & Nutrition Summary */}
          <BudgetSummary
            combination={activePlan}
            budget={currentBudget}
            nutritionSummary={activePlanNutrition}
          />
        </div>
      ) : null}
    </div>
  );
}
