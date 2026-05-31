/** BMI, calories, and weight-goal calculations (en-US labels only). */
window.DietBodyMath = (function () {
  const KCAL_PER_KG = 7700;
  const DEFAULT_WEEKLY_KG = 0.5;
  const BOXING_KCAL_PER_MIN = 8;

  function bmi(weightKg, heightCm) {
    if (!weightKg || !heightCm) return null;
    const m = heightCm / 100;
    return weightKg / (m * m);
  }

  function bmiCategory(value) {
    if (value == null || Number.isNaN(value)) return null;
    if (value < 18.5) return { label: "Underweight", status: "below" };
    if (value < 25) return { label: "Normal", status: "healthy" };
    if (value < 30) return { label: "Overweight", status: "above" };
    return { label: "Obese", status: "above" };
  }

  function bmr(weightKg, heightCm, age, sex) {
    if (!weightKg || !heightCm || !age) return null;
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    return sex === "female" ? base - 161 : base + 5;
  }

  function boxingCalories(minutes) {
    const m = Math.min(30, Math.max(0, Number(minutes) || 0));
    return Math.round(BOXING_KCAL_PER_MIN * m);
  }

  function exerciseCalories(type, minutes, kcalPerMin) {
    const m = Math.min(30, Math.max(0, Number(minutes) || 0));
    if (kcalPerMin != null && Number.isFinite(kcalPerMin)) return Math.round(kcalPerMin * m);
    if (type === "fitness_boxing") return boxingCalories(m);
    if (type === "walk") return Math.round(4 * m);
    return Math.round(5 * m);
  }

  function maintenanceCalories(weightKg, heightCm, age, sex) {
    const b = bmr(weightKg, heightCm, age, sex);
    if (b == null) return null;
    return Math.round(b * 1.2);
  }

  function goalPlan(currentKg, idealKg, heightCm, age, sex) {
    if (!currentKg || !idealKg || currentKg === idealKg) return null;
    const maintenance = maintenanceCalories(currentKg, heightCm, age, sex);
    if (maintenance == null) return null;

    const diff = currentKg - idealKg;
    const losing = diff > 0;
    const weeklyKg = DEFAULT_WEEKLY_KG;
    const dailyAdjust = Math.round((weeklyKg * KCAL_PER_KG) / 7);
    let target = losing ? maintenance - dailyAdjust : maintenance + Math.round(dailyAdjust * 0.75);
    const floor = sex === "female" ? 1200 : 1500;
    target = Math.max(floor, target);

    const weeks = Math.ceil(Math.abs(diff) / weeklyKg);
    return {
      maintenance,
      target,
      weeklyKg: losing ? -weeklyKg : weeklyKg,
      weeks,
      direction: losing ? "loss" : "gain",
      diffKg: Math.abs(diff),
    };
  }

  function latestWeight(entries) {
    if (!entries?.length) return null;
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    return sorted[0];
  }

  function weightOnDate(entries, iso) {
    return entries.find((e) => e.date === iso)?.weightKg ?? null;
  }

  function projectedWeight(startKg, startDate, weeklyKg, asOfDate) {
    if (!startKg || !startDate) return null;
    const start = new Date(startDate + "T12:00:00");
    const end = new Date(asOfDate + "T12:00:00");
    const days = Math.max(0, (end - start) / 86400000);
    return startKg + weeklyKg * (days / 7);
  }

  function onTrackStatus(entries, profile, asOfDate) {
    const ideal = profile.idealWeightKg;
    const start = profile.goalStartDate;
    const startKg = profile.startWeightKg;
    const plan = goalPlan(startKg, ideal, profile.heightCm, profile.age, profile.sex);
    const latest = latestWeight(entries);
    if (!latest || !plan || !start || startKg == null) {
      return { ok: null, label: "—", detail: "Set baseline and record weight." };
    }

    const expected = projectedWeight(startKg, start, plan.weeklyKg, latest.date);
    const tolerance = 0.6;
    const ok = Math.abs(latest.weightKg - expected) <= tolerance;
    const toward =
      plan.direction === "loss"
        ? latest.weightKg <= startKg + 0.15
        : latest.weightKg >= startKg - 0.15;

    if (!toward && Math.sign(latest.weightKg - startKg) !== Math.sign(plan.weeklyKg)) {
      return { ok: false, label: "No", detail: "Moving away from goal." };
    }

    return {
      ok,
      label: ok ? "Yes" : "No",
      detail: ok ? "Within expected range." : `Expected about ${expected.toFixed(1)} kg.`,
      expected,
      actual: latest.weightKg,
    };
  }

  return {
    bmi,
    bmiCategory,
    bmr,
    boxingCalories,
    exerciseCalories,
    maintenanceCalories,
    goalPlan,
    latestWeight,
    weightOnDate,
    onTrackStatus,
  };
})();
