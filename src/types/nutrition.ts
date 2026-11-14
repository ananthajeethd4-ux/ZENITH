export type MealType = 'Breakfast' | 'Midday Ration' | 'Dinner' | 'Extravehicular Snack' | 'Supplement';

export interface FoodLogEntry {
  id: string;
  astronautId: string;
  date: string;
  mealType: MealType;
  description: string;
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  sodium_mg: number;
  potassium_mg: number;
  hydration_ml: number;
  supplementsTaken: string[];
  isEstimated: boolean;
}

export interface MicronutrientLabRecord {
  id: string;
  astronautId: string;
  drawDate: string;
  analyzedDate: string;
  vitaminD_25OH_ng_ml: number; // Normal range: 30-80 ng/mL
  ferritin_ng_ml: number;       // Normal range: 30-300 ng/mL
  potassium_mEq_L: number;      // Normal range: 3.5-5.0 mEq/L
  sodium_mEq_L: number;         // Normal range: 135-145 mEq/L
  folate_ng_ml: number;         // Normal range: > 4.0 ng/mL
  vitaminB12_pg_ml: number;     // Normal range: 200-900 pg/mL
  calcium_mg_dl: number;        // Normal range: 8.5-10.2 mg/dL
  labTechnician: string;
  method: 'In-Flight Blood Analysis Module (i-STAT / MinION)' | 'Pre-Flight Ground Lab';
  nextFollowUpDueDate: string;
  clinicalNotes?: string;
}

export interface NutritionGoals {
  astronautId: string;
  dailyCaloriesTarget: number;
  dailyHydrationTarget_ml: number;
  dailyProteinTarget_g: number;
  maxSodiumTarget_mg: number;
  targetPotassium_mg: number;
}

