import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ZoneBarChart } from '../components/charts/ZoneBarChart';
import {
  Utensils,
  Droplets,
  TestTube2,
  Calendar,
  Plus,
  ShieldAlert,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { MealType, MicronutrientLabRecord } from '../types/nutrition';

export const NutritionPage: React.FC = () => {
  const { selectedAstronaut, foodLogs, labRecords, nutritionGoalsMap, addFoodLog, addLabRecord } = useApp();

  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);

  // Food log form state
  const [mealType, setMealType] = useState<MealType>('Breakfast');
  const [foodDesc, setFoodDesc] = useState('');
  const [foodCalories, setFoodCalories] = useState(650);
  const [foodProtein, setFoodProtein] = useState(35);
  const [foodCarbs, setFoodCarbs] = useState(70);
  const [foodFat, setFoodFat] = useState(20);
  const [foodHydration, setFoodHydration] = useState(600);
  const [foodSodium, setFoodSodium] = useState(750);
  const [foodSupplements, setFoodSupplements] = useState('Vitamin D3 (2000 IU), Calcium (500 mg)');

  // Lab form state
  const [labVitD, setLabVitD] = useState(45.0);
  const [labFerritin, setLabFerritin] = useState(120);
  const [labPotassium, setLabPotassium] = useState(4.2);
  const [labSodium, setLabSodium] = useState(139);
  const [labFolate, setLabFolate] = useState(9.5);
  const [labB12, setLabB12] = useState(600);
  const [labCalcium, setLabCalcium] = useState(9.4);
  const [labMethod, setLabMethod] = useState<'In-Flight Blood Analysis Module (i-STAT / MinION)' | 'Pre-Flight Ground Lab'>(
    'In-Flight Blood Analysis Module (i-STAT / MinION)'
  );
  const [labNotes, setLabNotes] = useState('');

  const astronautFoods = foodLogs.filter((f) => f.astronautId === selectedAstronaut.id);
  const astronautLabs = labRecords.filter((l) => l.astronautId === selectedAstronaut.id);
  const goals = nutritionGoalsMap[selectedAstronaut.id] || {
    astronautId: selectedAstronaut.id,
    dailyCaloriesTarget: 2700,
    dailyHydrationTarget_ml: 2800,
    dailyProteinTarget_g: 110,
    maxSodiumTarget_mg: 2300,
    targetPotassium_mg: 3500,
  };

  // Day sums
  const totalCalories = astronautFoods.reduce((sum, f) => sum + f.calories_kcal, 0);
  const totalProtein = astronautFoods.reduce((sum, f) => sum + f.protein_g, 0);
  const totalHydration = astronautFoods.reduce((sum, f) => sum + f.hydration_ml, 0);
  const totalSodium = astronautFoods.reduce((sum, f) => sum + f.sodium_mg, 0);

  const handleSaveFood = () => {
    addFoodLog({
      astronautId: selectedAstronaut.id,
      date: new Date().toISOString().split('T')[0],
      mealType,
      description: foodDesc,
      calories_kcal: Number(foodCalories),
      protein_g: Number(foodProtein),
      carbs_g: Number(foodCarbs),
      fat_g: Number(foodFat),
      sodium_mg: Number(foodSodium),
      potassium_mg: 800,
      hydration_ml: Number(foodHydration),
      supplementsTaken: foodSupplements.split(',').map((s) => s.trim()).filter(Boolean),
      isEstimated: true,
    });
    setIsFoodModalOpen(false);
    setFoodDesc('');
  };

  const handleSaveLab = () => {
    const today = new Date().toISOString().split('T')[0];
    const nextDate = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

    addLabRecord({
      astronautId: selectedAstronaut.id,
      drawDate: new Date().toISOString(),
      analyzedDate: new Date().toISOString(),
      vitaminD_25OH_ng_ml: Number(labVitD),
      ferritin_ng_ml: Number(labFerritin),
      potassium_mEq_L: Number(labPotassium),
      sodium_mEq_L: Number(labSodium),
      folate_ng_ml: Number(labFolate),
      vitaminB12_pg_ml: Number(labB12),
      calcium_mg_dl: Number(labCalcium),
      labTechnician: 'Dr. Kenjiro Sato, Flight Surgeon',
      method: labMethod,
      nextFollowUpDueDate: nextDate,
      clinicalNotes: labNotes,
    });
    setIsLabModalOpen(false);
    setLabNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-ink tracking-tight">
            Nutrition & Micronutrient Laboratory
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Space rations logging, hydration balance, and certified blood chemistry assays
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsLabModalOpen(true)}
            icon={<TestTube2 className="w-3.5 h-3.5" />}
          >
            Enter Lab Assay
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsFoodModalOpen(true)}
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Log Meal Ration
          </Button>
        </div>
      </div>

      {/* Critical Scientific & Camera Disclaimer Notice */}
      <div className="p-4 bg-paper-dark border border-edge rounded-sm space-y-2 text-xs text-ink-secondary">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <ShieldAlert className="w-4 h-4 text-slate-primary shrink-0" />
          <span>Scientific & Nutritional Disclaimers</span>
        </div>
        <ul className="list-disc pl-5 space-y-1 text-ink-secondary">
          <li>
            <strong className="text-ink">Camera optical inspection CANNOT diagnose vitamin or mineral deficiencies:</strong> Visual imaging or facial skin appearance does not reflect systemic biochemical levels.
          </li>
          <li>
            <strong className="text-ink">Food logs represent nutritional estimates:</strong> Caloric and macronutrient figures are approximations based on packaging specifications, not physiological absorption assays.
          </li>
          <li>
            <strong className="text-ink">Certified clinical testing required:</strong> Suspected hypovitaminosis, electrolyte imbalances, or anemia require validated in-flight blood analysis (i-STAT / MinION) reviewed by a qualified Flight Surgeon.
          </li>
        </ul>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Daily Calories */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>DAILY ENERGY</span>
            <Utensils className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {totalCalories}
            <span className="text-xs font-normal text-ink-secondary ml-1">/ {goals.dailyCaloriesTarget} kcal</span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">
            Progress: {Math.round((totalCalories / goals.dailyCaloriesTarget) * 100)}% estimated
          </div>
        </div>

        {/* Daily Hydration */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>TOTAL HYDRATION</span>
            <Droplets className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {totalHydration}
            <span className="text-xs font-normal text-ink-secondary ml-1">/ {goals.dailyHydrationTarget_ml} ml</span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">
            Remaining: {Math.max(0, goals.dailyHydrationTarget_ml - totalHydration)} ml
          </div>
        </div>

        {/* Daily Protein */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>PROTEIN INTAKE</span>
            <span className="text-slate-primary font-mono text-xs">g</span>
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {totalProtein}
            <span className="text-xs font-normal text-ink-secondary ml-1">/ {goals.dailyProteinTarget_g} g</span>
          </div>
          <div className="text-[11px] font-mono text-ink-muted mt-2">Target: 1.2 - 1.5 g/kg mass</div>
        </div>

        {/* Latest Vitamin D */}
        <div className="paper-surface rounded-sm p-4 border border-edge">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-mono">
            <span>SERUM VITAMIN D</span>
            <TestTube2 className="w-3.5 h-3.5 text-slate-primary" />
          </div>
          <div className="text-2xl font-semibold text-ink telemetry-val mt-1">
            {astronautLabs[0] ? astronautLabs[0].vitaminD_25OH_ng_ml : 46.2}
            <span className="text-xs font-normal text-ink-secondary ml-1">ng/mL</span>
          </div>
          <div className="text-[11px] font-mono text-slate-primary mt-2">Optimal range (30-80 ng/mL)</div>
        </div>
      </div>

      {/* Daily Nutrient Intake Progress */}
      <Card>
        <CardHeader
          title="Daily Nutrient Intake vs Spaceflight Recommended Allowances"
          subtitle="Estimated values derived from scanned ration bar codes and water dispenser dispenser logs"
        />
        <ZoneBarChart
          items={[
            {
              label: 'Energy (Calories)',
              sublabel: 'Target metabolic load',
              current: totalCalories,
              target: goals.dailyCaloriesTarget,
              unit: 'kcal',
            },
            {
              label: 'Clean Water Hydration',
              sublabel: 'Cabin water reclamation dispenser',
              current: totalHydration,
              target: goals.dailyHydrationTarget_ml,
              unit: 'ml',
            },
            {
              label: 'Dietary Protein',
              sublabel: 'Musculoskeletal protection',
              current: totalProtein,
              target: goals.dailyProteinTarget_g,
              unit: 'g',
            },
            {
              label: 'Dietary Sodium Cap',
              sublabel: 'Microgravity fluid shift restriction',
              current: totalSodium,
              target: goals.maxSodiumTarget_mg,
              unit: 'mg',
              warning: true,
            },
          ]}
        />
      </Card>

      {/* Micronutrient Laboratory Panel (Certified Blood Assays) */}
      <Card>
        <CardHeader
          title="In-Flight Micronutrient & Blood Chemistry Panel"
          subtitle="Validated laboratory data from station blood/urine analyzer (i-STAT module)"
          tag={<Badge variant="manual" size="sm">Laboratory Verified</Badge>}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-edge bg-paper text-ink-secondary font-mono uppercase text-[10px]">
                <th className="py-2.5 px-3">Analyte / Biomarker</th>
                <th className="py-2.5 px-3">Latest Value</th>
                <th className="py-2.5 px-3">Standard Reference Interval</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Draw Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge/60 font-mono">
              {astronautLabs[0] && (
                <>
                  <tr className="hover:bg-paper">
                    <td className="py-2 px-3 font-semibold text-ink">Serum 25-OH Vitamin D</td>
                    <td className="py-2 px-3 text-ink font-semibold">{astronautLabs[0].vitaminD_25OH_ng_ml} ng/mL</td>
                    <td className="py-2 px-3 text-ink-secondary">30.0 - 80.0 ng/mL</td>
                    <td className="py-2 px-3"><Badge variant="normal" size="sm">Optimal</Badge></td>
                    <td className="py-2 px-3 text-ink-secondary">{new Date(astronautLabs[0].drawDate).toLocaleDateString()}</td>
                  </tr>
                  <tr className="hover:bg-paper">
                    <td className="py-2 px-3 font-semibold text-ink">Serum Ferritin (Iron Stores)</td>
                    <td className="py-2 px-3 text-ink font-semibold">{astronautLabs[0].ferritin_ng_ml} ng/mL</td>
                    <td className="py-2 px-3 text-ink-secondary">30.0 - 300.0 ng/mL</td>
                    <td className="py-2 px-3"><Badge variant="normal" size="sm">Normal</Badge></td>
                    <td className="py-2 px-3 text-ink-secondary">{new Date(astronautLabs[0].drawDate).toLocaleDateString()}</td>
                  </tr>
                  <tr className="hover:bg-paper">
                    <td className="py-2 px-3 font-semibold text-ink">Serum Potassium (K⁺)</td>
                    <td className="py-2 px-3 text-ink font-semibold">{astronautLabs[0].potassium_mEq_L} mEq/L</td>
                    <td className="py-2 px-3 text-ink-secondary">3.5 - 5.0 mEq/L</td>
                    <td className="py-2 px-3"><Badge variant="normal" size="sm">Normal</Badge></td>
                    <td className="py-2 px-3 text-ink-secondary">{new Date(astronautLabs[0].drawDate).toLocaleDateString()}</td>
                  </tr>
                  <tr className="hover:bg-paper">
                    <td className="py-2 px-3 font-semibold text-ink">Serum Sodium (Na⁺)</td>
                    <td className="py-2 px-3 text-ink font-semibold">{astronautLabs[0].sodium_mEq_L} mEq/L</td>
                    <td className="py-2 px-3 text-ink-secondary">135.0 - 145.0 mEq/L</td>
                    <td className="py-2 px-3"><Badge variant="normal" size="sm">Normal</Badge></td>
                    <td className="py-2 px-3 text-ink-secondary">{new Date(astronautLabs[0].drawDate).toLocaleDateString()}</td>
                  </tr>
                  <tr className="hover:bg-paper">
                    <td className="py-2 px-3 font-semibold text-ink">Serum Calcium (Ca²⁺)</td>
                    <td className="py-2 px-3 text-ink font-semibold">{astronautLabs[0].calcium_mg_dl} mg/dL</td>
                    <td className="py-2 px-3 text-ink-secondary">8.5 - 10.2 mg/dL</td>
                    <td className="py-2 px-3"><Badge variant="normal" size="sm">Normal</Badge></td>
                    <td className="py-2 px-3 text-ink-secondary">{new Date(astronautLabs[0].drawDate).toLocaleDateString()}</td>
                  </tr>
                  <tr className="hover:bg-paper">
                    <td className="py-2 px-3 font-semibold text-ink">Vitamin B12 (Cobalamin)</td>
                    <td className="py-2 px-3 text-ink font-semibold">{astronautLabs[0].vitaminB12_pg_ml} pg/mL</td>
                    <td className="py-2 px-3 text-ink-secondary">200.0 - 900.0 pg/mL</td>
                    <td className="py-2 px-3"><Badge variant="normal" size="sm">Normal</Badge></td>
                    <td className="py-2 px-3 text-ink-secondary">{new Date(astronautLabs[0].drawDate).toLocaleDateString()}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

        {astronautLabs[0] && (
          <div className="mt-4 pt-3 border-t border-edge/60 flex flex-wrap items-center justify-between text-xs text-ink-secondary font-mono">
            <div>
              <span>Next Certified Follow-Up Due: </span>
              <strong className="text-ink">{astronautLabs[0].nextFollowUpDueDate}</strong>
            </div>
            <div>
              <span>Assay Method: {astronautLabs[0].method}</span>
            </div>
          </div>
        )}
      </Card>

      {/* Ration Food Logs */}
      <Card>
        <CardHeader
          title="Daily Food & Supplement Log"
          subtitle="Packaged space rations, rehydrated pantry items, and micro-supplements"
        />

        <div className="space-y-3">
          {astronautFoods.map((food) => (
            <div key={food.id} className="p-3.5 bg-paper rounded-sm border border-edge/80 text-xs">
              <div className="flex items-center justify-between text-ink-secondary font-mono mb-1">
                <span className="font-semibold text-ink text-sm">{food.mealType}</span>
                <span>{food.date}</span>
              </div>

              <p className="text-ink text-xs mb-2 leading-relaxed">{food.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-ink-secondary">
                <span>Calories: <strong className="text-ink">{food.calories_kcal} kcal</strong></span>
                <span>Protein: <strong className="text-ink">{food.protein_g} g</strong></span>
                <span>Hydration: <strong className="text-ink">{food.hydration_ml} ml</strong></span>
                <span>Sodium: <strong className="text-ink">{food.sodium_mg} mg</strong></span>
              </div>

              {food.supplementsTaken.length > 0 && (
                <div className="mt-2 pt-2 border-t border-edge/40 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono text-ink-secondary uppercase">Supplements:</span>
                  {food.supplementsTaken.map((supp, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-paper-dark border border-edge rounded-sm text-[10px] text-ink font-mono"
                    >
                      {supp}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Log Meal Ration Modal */}
      <Modal
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        title="Log Space Food Ration"
        subtitle={`Recording meal entry for ${selectedAstronaut.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsFoodModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveFood}>
              Save Food Log
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Meal Allocation</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value as MealType)}
              className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-xs"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Midday Ration">Midday Ration</option>
              <option value="Dinner">Dinner</option>
              <option value="Extravehicular Snack">Extravehicular Snack</option>
              <option value="Supplement">Dedicated Supplement</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Ration Description</label>
            <textarea
              rows={2}
              value={foodDesc}
              onChange={(e) => setFoodDesc(e.target.value)}
              placeholder="e.g. Thermo-stabilized beef brisket, rehydrated mashed potatoes, fortified berry drink..."
              className="w-full p-2 bg-paper border border-edge rounded-sm text-xs text-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Calories (kcal)</label>
              <input
                type="number"
                value={foodCalories}
                onChange={(e) => setFoodCalories(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Hydration Volume (ml)</label>
              <input
                type="number"
                value={foodHydration}
                onChange={(e) => setFoodHydration(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Protein (g)</label>
              <input
                type="number"
                value={foodProtein}
                onChange={(e) => setFoodProtein(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-medium text-ink mb-1 font-mono">Sodium (mg)</label>
              <input
                type="number"
                value={foodSodium}
                onChange={(e) => setFoodSodium(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-ink mb-1 font-mono">Supplements Taken (Comma-separated)</label>
            <input
              type="text"
              value={foodSupplements}
              onChange={(e) => setFoodSupplements(e.target.value)}
              placeholder="e.g. Vitamin D3 (2000 IU), Calcium (500 mg)"
              className="w-full p-2 bg-paper border border-edge rounded-sm text-xs text-ink font-mono"
            />
          </div>
        </div>
      </Modal>

      {/* Enter Lab Assay Modal */}
      <Modal
        isOpen={isLabModalOpen}
        onClose={() => setIsLabModalOpen(false)}
        title="Enter Laboratory Micronutrient Assay"
        subtitle={`Manual entry of validated clinical blood chemistry for ${selectedAstronaut.name}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsLabModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveLab}>
              Record Lab Panel
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-paper border border-edge rounded-sm text-ink-secondary">
            <span className="font-semibold text-ink">Analytical Validation:</span> Enter actual numbers from in-flight diagnostic cartridge reading. These values establish clinical baselines.
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-ink mb-1">Serum Vitamin D 25-OH (ng/mL)</label>
              <input
                type="number"
                step="0.1"
                value={labVitD}
                onChange={(e) => setLabVitD(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-mono text-ink mb-1">Serum Ferritin (ng/mL)</label>
              <input
                type="number"
                value={labFerritin}
                onChange={(e) => setLabFerritin(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-ink mb-1">Potassium (mEq/L)</label>
              <input
                type="number"
                step="0.1"
                value={labPotassium}
                onChange={(e) => setLabPotassium(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-mono text-ink mb-1">Sodium (mEq/L)</label>
              <input
                type="number"
                value={labSodium}
                onChange={(e) => setLabSodium(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-ink mb-1">Calcium (mg/dL)</label>
              <input
                type="number"
                step="0.1"
                value={labCalcium}
                onChange={(e) => setLabCalcium(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
            <div>
              <label className="block font-mono text-ink mb-1">Vitamin B12 (pg/mL)</label>
              <input
                type="number"
                value={labB12}
                onChange={(e) => setLabB12(Number(e.target.value))}
                className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-ink mb-1">Assay Equipment</label>
            <select
              value={labMethod}
              onChange={(e) => setLabMethod(e.target.value as any)}
              className="w-full p-2 bg-paper border border-edge rounded-sm font-mono text-ink text-xs"
            >
              <option value="In-Flight Blood Analysis Module (i-STAT / MinION)">In-Flight Blood Analysis Module (i-STAT / MinION)</option>
              <option value="Pre-Flight Ground Lab">Pre-Flight Ground Lab Baseline</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-ink mb-1">Clinical Notes</label>
            <textarea
              rows={2}
              value={labNotes}
              onChange={(e) => setLabNotes(e.target.value)}
              placeholder="e.g. Sample processed within 15 minutes of puncture, zero hemolysis observed..."
              className="w-full p-2 bg-paper border border-edge rounded-sm text-xs text-ink"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

