const foodDatabase = [
  { name: "pollo", aliases: ["pechuga", "pechuga de pollo"], calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { name: "arroz cocido", aliases: ["arroz"], calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { name: "pasta cocida", aliases: ["pasta", "macarrones"], calories: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  { name: "huevo", aliases: ["huevos"], calories: 143, protein: 12.6, carbs: 0.7, fat: 9.5 },
  { name: "atun", aliases: ["atun al natural"], calories: 116, protein: 26, carbs: 0, fat: 1 },
  { name: "salmon", aliases: ["salmon"], calories: 208, protein: 20, carbs: 0, fat: 13 },
  { name: "ternera", aliases: ["carne", "carne picada"], calories: 250, protein: 26, carbs: 0, fat: 15 },
  { name: "avena", aliases: ["copos de avena"], calories: 389, protein: 16.9, carbs: 66, fat: 6.9 },
  { name: "pan", aliases: ["pan blanco", "pan integral"], calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  { name: "patata cocida", aliases: ["patata", "papa"], calories: 87, protein: 1.9, carbs: 20, fat: 0.1 },
  { name: "boniato", aliases: ["batata"], calories: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { name: "platano", aliases: ["banana"], calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
  { name: "manzana", aliases: ["manzana"], calories: 52, protein: 0.3, carbs: 14, fat: 0.2 },
  { name: "yogur griego", aliases: ["yogur", "yogurt griego"], calories: 97, protein: 9, carbs: 3.6, fat: 5 },
  { name: "leche", aliases: ["leche entera"], calories: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { name: "aceite de oliva", aliases: ["aceite"], calories: 884, protein: 0, carbs: 0, fat: 100 },
  { name: "aguacate", aliases: ["avocado"], calories: 160, protein: 2, carbs: 8.5, fat: 14.7 },
  { name: "brocoli", aliases: ["brocoli"], calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4 },
  { name: "lentejas cocidas", aliases: ["lentejas"], calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { name: "garbanzos cocidos", aliases: ["garbanzos"], calories: 164, protein: 8.9, carbs: 27, fat: 2.6 }
];

const sportProfiles = {
  crossfit: { label: "CrossFit", baseMet: 8.5 },
  strength: { label: "Fuerza / pesas", baseMet: 5.5 },
  running: { label: "Running", baseMet: 9 },
  cycling: { label: "Bici", baseMet: 7.5 },
  swimming: { label: "Natacion", baseMet: 8 },
  walking: { label: "Caminar", baseMet: 3.5 },
  football: { label: "Futbol", baseMet: 8 },
  padel: { label: "Padel / tenis", baseMet: 6.5 },
  other: { label: "Otro", baseMet: 6 }
};

const state = {
  date: "",
  goals: { calories: 2400, protein: 160 },
  profile: {
    height: 175,
    weight: 75,
    sex: "",
    bodyFat: "",
    workHabits: "sedentary",
    goal: "fat_loss"
  },
  foods: [],
  workouts: [],
  selectedWorkoutImage: null,
  workoutOcrText: "",
  activeScreen: "home"
};

const $ = (selector) => document.querySelector(selector);
const storageKey = (date) => `calorie-tracker:${date}`;
const settingsKey = "calorie-tracker:settings";

const fields = {
  date: $("#entry-date"),
  goalCalories: $("#goal-calories"),
  goalProtein: $("#goal-protein"),
  bodyHeight: $("#body-height"),
  bodyWeight: $("#body-weight"),
  profileSex: $("#profile-sex"),
  bodyFat: $("#body-fat"),
  workHabits: $("#work-habits"),
  bodyGoal: $("#body-goal"),
  quickFood: $("#quick-food"),
  foodName: $("#food-name"),
  foodGrams: $("#food-grams"),
  foodCalories: $("#food-calories"),
  foodProtein: $("#food-protein"),
  foodCarbs: $("#food-carbs"),
  foodFat: $("#food-fat"),
  workoutSport: $("#workout-sport"),
  workoutEffort: $("#workout-effort"),
  workoutEffortLabel: $("#workout-effort-label"),
  workoutMinutes: $("#workout-minutes"),
  workoutCalories: $("#workout-calories"),
  workoutImage: $("#workout-image"),
  workoutNotes: $("#workout-notes"),
  ocrStatus: $("#ocr-status")
};

function todayIso() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now - timezoneOffset).toISOString().slice(0, 10);
}

function round(value, digits = 0) {
  const factor = 10 ** digits;
  return Math.round((Number(value) || 0) * factor) / factor;
}

function loadSettings() {
  const settings = JSON.parse(localStorage.getItem(settingsKey) || "{}");
  state.goals.calories = settings.goalCalories || state.goals.calories;
  state.goals.protein = settings.goalProtein || state.goals.protein;
  state.profile.height = settings.bodyHeight || state.profile.height;
  state.profile.weight = settings.bodyWeight || state.profile.weight;
  state.profile.sex = settings.sex || state.profile.sex;
  state.profile.bodyFat = settings.bodyFat || state.profile.bodyFat;
  state.profile.workHabits = settings.workHabits || state.profile.workHabits;
  state.profile.goal = settings.bodyGoal || state.profile.goal;
  fields.goalCalories.value = state.goals.calories;
  fields.goalProtein.value = state.goals.protein;
  fields.bodyHeight.value = state.profile.height;
  fields.bodyWeight.value = state.profile.weight;
  fields.profileSex.value = state.profile.sex;
  fields.bodyFat.value = state.profile.bodyFat;
  fields.workHabits.value = state.profile.workHabits;
  fields.bodyGoal.value = state.profile.goal;
}

function saveSettings() {
  state.goals.calories = Number(fields.goalCalories.value) || 0;
  state.goals.protein = Number(fields.goalProtein.value) || 0;
  state.profile.height = Number(fields.bodyHeight.value) || 175;
  state.profile.weight = Number(fields.bodyWeight.value) || 75;
  state.profile.sex = fields.profileSex.value;
  state.profile.bodyFat = fields.bodyFat.value;
  state.profile.workHabits = fields.workHabits.value;
  state.profile.goal = fields.bodyGoal.value;

  localStorage.setItem(settingsKey, JSON.stringify({
    goalCalories: state.goals.calories,
    goalProtein: state.goals.protein,
    bodyHeight: state.profile.height,
    bodyWeight: state.profile.weight,
    sex: state.profile.sex,
    bodyFat: state.profile.bodyFat,
    workHabits: state.profile.workHabits,
    bodyGoal: state.profile.goal
  }));
}

function loadDay(date) {
  const saved = JSON.parse(localStorage.getItem(storageKey(date)) || "{}");
  state.date = date;
  state.foods = saved.foods || [];
  state.workouts = saved.workouts || [];
  render();
}

function saveDay() {
  localStorage.setItem(storageKey(state.date), JSON.stringify({
    foods: state.foods,
    workouts: state.workouts
  }));
}

function findFood(query) {
  const normalized = query.trim().toLowerCase();
  return foodDatabase.find((food) => {
    const names = [food.name, ...food.aliases];
    return names.some((name) => normalized.includes(name) || name.includes(normalized));
  });
}

function scaleFood(food, grams, displayName = food.name) {
  const multiplier = grams / 100;
  return {
    id: crypto.randomUUID(),
    name: displayName,
    grams: round(grams),
    calories: round(food.calories * multiplier),
    protein: round(food.protein * multiplier, 1),
    carbs: round(food.carbs * multiplier, 1),
    fat: round(food.fat * multiplier, 1)
  };
}

function parseQuickFood(text) {
  const chunks = text.split(/,| y /i).map((chunk) => chunk.trim()).filter(Boolean);
  return chunks.map((chunk) => {
    const amountMatch = chunk.match(/(\d+(?:[.,]\d+)?)\s*(g|gr|gramos|kg|unidad|unidades|u)?/i);
    const rawAmount = amountMatch ? Number(amountMatch[1].replace(",", ".")) : 100;
    const unit = amountMatch?.[2]?.toLowerCase() || "";
    const grams = unit === "kg" ? rawAmount * 1000 : unit.startsWith("u") || (!unit && rawAmount <= 10) ? rawAmount * 100 : rawAmount;
    const name = chunk.replace(amountMatch?.[0] || "", "").trim() || chunk;
    const food = findFood(name);

    if (!food) return null;
    return scaleFood(food, grams, food.name);
  }).filter(Boolean);
}

function fillFoodFields() {
  const food = findFood(fields.foodName.value);
  const grams = Number(fields.foodGrams.value) || 100;
  if (!food) return;

  const scaled = scaleFood(food, grams, fields.foodName.value || food.name);
  fields.foodCalories.value = scaled.calories;
  fields.foodProtein.value = scaled.protein;
  fields.foodCarbs.value = scaled.carbs;
  fields.foodFat.value = scaled.fat;
}

function calculateWorkoutCalories() {
  const sport = sportProfiles[fields.workoutSport.value] || sportProfiles.other;
  const effort = Number(fields.workoutEffort.value) || 7;
  const minutes = workoutMinutes();
  const weight = bodyWeight();
  const effortFactor = 0.65 + effort * 0.07;
  const calories = sport.baseMet * effortFactor * 3.5 * weight / 200 * minutes;
  fields.workoutCalories.value = round(calories);
  fields.workoutEffortLabel.textContent = `RPE ${effort}/10`;
}

function normalizeText(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function inferSportFromText(text) {
  const normalized = normalizeText(text);
  const crossfitWords = ["wod", "amrap", "emom", "for time", "metcon", "burpee", "thruster", "wall ball", "toes to bar", "box jump", "pull up", "clean", "snatch", "rondas"];
  if (crossfitWords.some((word) => normalized.includes(word))) return "crossfit";
  if (/(running|run|correr|carrera|\d+\s?km)/.test(normalized)) return "running";
  if (/(bike|bici|cycling|assault bike|echo bike)/.test(normalized)) return "cycling";
  if (/(swim|natacion|nadar)/.test(normalized)) return "swimming";
  if (/(walk|caminar|andar)/.test(normalized)) return "walking";
  if (/(bench|squat|deadlift|press|fuerza|pesas|sentadilla|peso muerto)/.test(normalized)) return "strength";
  if (/(padel|tenis|tennis)/.test(normalized)) return "padel";
  if (/(futbol|football|soccer)/.test(normalized)) return "football";
  return fields.workoutSport.value || "other";
}

function inferDurationFromText(text) {
  const normalized = normalizeText(text);
  const patterns = [
    /(?:amrap|emom|time cap|cap)\s*(\d{1,3})/,
    /(\d{1,3})\s*(?:min|minutos|')/,
    /(\d{1,2}):(\d{2})/
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern);
    if (!match) continue;
    if (match[2]) return Number(match[1]) + Number(match[2]) / 60;
    return Number(match[1]);
  }

  if (normalized.includes("for time")) return Math.max(workoutMinutes(), 30);
  return workoutMinutes();
}

function inferEffortFromText(text, sport) {
  const normalized = normalizeText(text);
  const rpe = normalized.match(/rpe\s*(\d{1,2})/);
  if (rpe) return Math.min(Math.max(Number(rpe[1]), 1), 10);
  if (/(duro|hard|intenso|heavy|rx|for time|amrap|metcon|sprint)/.test(normalized)) return 8;
  if (/(emom|moderado|tempo)/.test(normalized)) return 7;
  if (/(suave|easy|tecnica|skill|movilidad)/.test(normalized)) return 4;
  if (sport === "strength") return 6;
  if (sport === "walking") return 3;
  return Number(fields.workoutEffort.value) || 7;
}

function applyWorkoutTextInference(text) {
  const sport = inferSportFromText(text);
  const duration = inferDurationFromText(text);
  const effort = inferEffortFromText(text, sport);

  fields.workoutSport.value = sport;
  fields.workoutMinutes.value = round(duration);
  fields.workoutEffort.value = effort;
  calculateWorkoutCalories();
}

async function readWorkoutImageText() {
  if (!state.selectedWorkoutImage?.file) return "";
  if (!window.Tesseract) {
    fields.ocrStatus.textContent = "OCR no disponible: no se pudo cargar el lector de imagen.";
    return "";
  }

  fields.ocrStatus.textContent = "Leyendo captura...";
  const result = await Tesseract.recognize(state.selectedWorkoutImage.file, "spa+eng", {
    logger: (progress) => {
      if (progress.status === "recognizing text") {
        fields.ocrStatus.textContent = `Leyendo captura... ${Math.round(progress.progress * 100)}%`;
      }
    }
  });
  state.workoutOcrText = result.data.text.trim();
  return state.workoutOcrText;
}

function bodyWeight() {
  return Number(fields.bodyWeight.value) || state.profile.weight || 75;
}

function workoutMinutes() {
  return Number(fields.workoutMinutes.value) || 45;
}

function addFood(entry) {
  state.foods.push(entry);
  saveDay();
  render();
}

function addWorkout() {
  const sport = sportProfiles[fields.workoutSport.value] || sportProfiles.other;
  const effort = Number(fields.workoutEffort.value) || 7;
  const minutes = workoutMinutes();
  const calories = Number(fields.workoutCalories.value) || 0;
  const imageName = state.selectedWorkoutImage?.name || "";
  const notes = fields.workoutNotes.value.trim();

  state.workouts.push({
    id: crypto.randomUUID(),
    name: notes ? notes.slice(0, 48) : sport.label,
    sport: sport.label,
    effort,
    minutes,
    calories: round(calories),
    imageName,
    notes
  });
  saveDay();
  clearWorkoutImage();
  render();
}

async function estimateWorkoutFromImageOnly() {
  const hasText = Boolean(fields.workoutNotes.value.trim());
  if (!state.selectedWorkoutImage && !hasText) {
    fields.workoutImage.click();
    return;
  }

  if (state.selectedWorkoutImage) {
    try {
      const text = await readWorkoutImageText();
      if (text) {
        const combinedText = [fields.workoutNotes.value.trim(), text].filter(Boolean).join("\n\n");
        fields.workoutNotes.value = combinedText;
        applyWorkoutTextInference(combinedText);
        fields.ocrStatus.textContent = "Captura leida. He ajustado deporte, duracion, esfuerzo y calorias si he detectado datos utiles.";
      } else {
        fields.ocrStatus.textContent = "No he podido leer texto claro en la captura. Uso deporte, duracion y esfuerzo manuales.";
      }
    } catch (error) {
      fields.ocrStatus.textContent = "No he podido leer la captura. Uso deporte, duracion y esfuerzo manuales.";
    }
  } else if (hasText) {
    applyWorkoutTextInference(fields.workoutNotes.value);
    fields.ocrStatus.textContent = "Texto analizado. He ajustado la estimacion con lo detectado.";
  }

  fields.workoutMinutes.value = workoutMinutes();
  calculateWorkoutCalories();
  fields.workoutNotes.value = fields.workoutNotes.value.trim() || "Estimacion automatica desde captura/texto libre.";
  addWorkout();
  fields.workoutNotes.value = "";
}

function calculateTotals(day = state) {
  const consumed = (day.foods || []).reduce((sum, item) => sum + item.calories, 0);
  const burned = (day.workouts || []).reduce((sum, item) => sum + item.calories, 0);
  return {
    consumed,
    burned,
    net: consumed - burned,
    protein: (day.foods || []).reduce((sum, item) => sum + item.protein, 0),
    carbs: (day.foods || []).reduce((sum, item) => sum + item.carbs, 0),
    fat: (day.foods || []).reduce((sum, item) => sum + item.fat, 0)
  };
}

function totals() {
  return calculateTotals(state);
}

function renderList(list, target, type) {
  const template = $("#entry-template");
  if (!target) return;
  target.innerHTML = "";

  if (!list.length) {
    const empty = document.createElement("li");
    empty.className = "empty-state";
    empty.textContent = type === "food" ? "Aun no hay comidas registradas." : "Aun no hay entrenos registrados.";
    target.append(empty);
    return;
  }

  list.forEach((item) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".entry-title").textContent = item.name;
    node.querySelector(".entry-meta").textContent = type === "food"
      ? `${item.grams} g · ${item.calories} kcal · P ${item.protein} g · C ${item.carbs} g · G ${item.fat} g`
      : workoutMeta(item);
    node.querySelector(".delete-button").addEventListener("click", () => {
      const collection = type === "food" ? state.foods : state.workouts;
      const index = collection.findIndex((entry) => entry.id === item.id);
      if (index >= 0) collection.splice(index, 1);
      saveDay();
      render();
    });
    target.append(node);
  });
}

function renderLists() {
  renderList(state.foods, $("#food-log"), "food");
  renderList(state.workouts, $("#workout-log"), "workout");
  renderList(state.foods, $("#food-screen-log"), "food");
  renderList(state.workouts, $("#workout-screen-log"), "workout");
}

function workoutMeta(item) {
  const details = [`${item.minutes} min`, `${item.calories} kcal`];
  if (item.sport) details.push(item.sport);
  if (item.effort) details.push(`RPE ${item.effort}/10`);
  if (item.type && item.type !== item.name) details.push(item.type);
  if (item.imageName) details.push(`captura: ${item.imageName}`);
  if (item.notes) details.push(item.notes);
  return details.join(" · ");
}

function readStoredDay(date) {
  return JSON.parse(localStorage.getItem(storageKey(date)) || "{}");
}

function dateFromOffset(anchorDate, offset) {
  const date = new Date(`${anchorDate}T12:00:00`);
  date.setDate(date.getDate() + offset);
  const timezoneOffset = date.getTimezoneOffset() * 60000;
  return new Date(date - timezoneOffset).toISOString().slice(0, 10);
}

function reportStatus(net, goal) {
  const difference = net - goal;
  if (difference < 0) return { label: "Deficit", className: "status-deficit", difference };
  if (difference > 0) return { label: "Por encima", className: "status-surplus", difference };
  return { label: "Justo", className: "status-even", difference };
}

function weeklyReportData() {
  const goal = Number(fields.goalCalories.value) || 0;
  const days = Array.from({ length: 7 }, (_, index) => dateFromOffset(state.date, index - 6));
  return days.map((date) => {
    const day = date === state.date ? state : readStoredDay(date);
    const data = calculateTotals(day);
    const hasEntries = (day.foods || []).length + (day.workouts || []).length > 0;
    return { date, data, hasEntries, status: reportStatus(data.net, goal) };
  });
}

function setDonutSlice(selector, start, size) {
  const slice = $(selector);
  slice.style.strokeDasharray = `${size} ${100 - size}`;
  slice.style.strokeDashoffset = 25 - start;
}

function renderDailyCharts(data, goalCalories) {
  const netForChart = Math.max(data.net, 0);
  const total = data.consumed + data.burned + netForChart;
  const consumedSize = total ? data.consumed / total * 100 : 0;
  const burnedSize = total ? data.burned / total * 100 : 0;
  const netSize = total ? netForChart / total * 100 : 0;

  setDonutSlice("#donut-consumed", 0, consumedSize);
  setDonutSlice("#donut-burned", consumedSize, burnedSize);
  setDonutSlice("#donut-net", consumedSize + burnedSize, netSize);
  $("#donut-center-value").textContent = round(data.net);
  $("#goal-scale-value").textContent = `${round(goalCalories)} kcal`;
}

function renderWeeklyBarChart(report) {
  const chart = $("#weekly-bar-chart");
  chart.innerHTML = "";
  const maxValue = Math.max(
    1,
    ...report.flatMap((day) => [day.data.consumed, day.data.burned, Math.max(day.data.net, 0)])
  );

  report.forEach((day) => {
    const item = document.createElement("div");
    const stack = document.createElement("div");
    const label = document.createElement("div");
    const dayName = document.createElement("strong");
    const net = document.createElement("span");

    item.className = "bar-day";
    stack.className = "bar-stack";
    label.className = "bar-label";
    dayName.textContent = new Date(`${day.date}T12:00:00`).toLocaleDateString("es-ES", { weekday: "short" });
    net.textContent = `${round(day.data.net)} neto`;

    [
      ["consumed", day.data.consumed],
      ["burned", day.data.burned],
      ["net", Math.max(day.data.net, 0)]
    ].forEach(([className, value]) => {
      const bar = document.createElement("div");
      bar.className = `bar ${className}`;
      bar.style.height = `${Math.max(value / maxValue * 100, value ? 3 : 0)}%`;
      bar.title = `${round(value)} kcal`;
      stack.append(bar);
    });

    label.append(dayName, net);
    item.append(stack, label);
    chart.append(item);
  });
}

function renderReport() {
  const goal = Number(fields.goalCalories.value) || 0;
  const report = weeklyReportData();

  const loggedDays = report.filter((day) => day.hasEntries);
  const deficitDays = loggedDays.filter((day) => day.status.difference < 0).length;
  const surplusDays = loggedDays.filter((day) => day.status.difference > 0).length;
  const totalNet = loggedDays.reduce((sum, day) => sum + day.data.net, 0);
  const totalGoal = loggedDays.length * goal;
  const averageNet = loggedDays.length ? totalNet / loggedDays.length : 0;
  const balance = totalNet - totalGoal;

  $("#week-deficit-days").textContent = `${deficitDays} dias`;
  $("#week-surplus-days").textContent = `${surplusDays} dias`;
  $("#week-average-net").textContent = `${round(averageNet)} kcal`;
  $("#week-balance").textContent = `${balance > 0 ? "+" : ""}${round(balance)} kcal`;

  const list = $("#daily-report");
  list.innerHTML = "";
  report.slice().reverse().forEach((day) => {
    const item = document.createElement("li");
    item.className = "report-day";
    const date = document.createElement("strong");
    const consumed = document.createElement("span");
    const burned = document.createElement("span");
    const net = document.createElement("span");
    const status = document.createElement("span");

    date.textContent = day.date;
    consumed.textContent = `${round(day.data.consumed)} kcal comida`;
    burned.textContent = `${round(day.data.burned)} kcal entreno`;
    net.textContent = `${round(day.data.net)} kcal neto`;
    status.className = `status-pill ${day.hasEntries ? day.status.className : "status-even"}`;
    status.textContent = day.hasEntries ? day.status.label : "Sin datos";
    item.append(date, consumed, burned, net, status);
    list.append(item);
  });
  renderWeeklyBarChart(report);
}

function renderWorkoutPreview() {
  const preview = $("#workout-preview");
  preview.innerHTML = "";
  preview.classList.toggle("is-visible", Boolean(state.selectedWorkoutImage));
  if (!state.selectedWorkoutImage) return;

  const image = document.createElement("img");
  image.src = state.selectedWorkoutImage.url;
  image.alt = "Captura del entrenamiento";
  const detail = document.createElement("div");
  const name = document.createElement("strong");
  const meta = document.createElement("span");
  name.textContent = state.selectedWorkoutImage.name;
  meta.className = "muted";
  meta.textContent = "Adjunta al proximo entrenamiento";
  detail.append(name, meta);
  preview.append(image, detail);
}

function workHabitLabel(value) {
  const labels = {
    sedentary: "Sentado",
    mixed: "Mixto",
    active: "Activo",
    physical: "Fisico"
  };
  return labels[value] || "Sin dato";
}

function renderProfileSummary() {
  $("#profile-weight-summary").textContent = `${round(fields.bodyWeight.value, 1)} kg`;
  $("#profile-height-summary").textContent = `${round(fields.bodyHeight.value)} cm`;
  $("#profile-fat-summary").textContent = fields.bodyFat.value ? `${fields.bodyFat.value}%` : "Sin dato";
  $("#profile-work-summary").textContent = workHabitLabel(fields.workHabits.value);
}

function setScreen(screenName) {
  state.activeScreen = screenName;
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("is-active", screen.id === `screen-${screenName}`);
  });
  document.querySelectorAll(".nav-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.screen === screenName);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function clearWorkoutImage() {
  if (state.selectedWorkoutImage?.url) URL.revokeObjectURL(state.selectedWorkoutImage.url);
  state.selectedWorkoutImage = null;
  state.workoutOcrText = "";
  fields.workoutImage.value = "";
  renderWorkoutPreview();
}

function render() {
  const data = totals();
  const goalCalories = Number(fields.goalCalories.value) || 0;
  const remaining = goalCalories - data.net;
  const progress = goalCalories ? Math.min(Math.max(data.net / goalCalories, 0), 1) * 100 : 0;

  $("#total-calories").textContent = round(data.consumed);
  $("#total-burned").textContent = round(data.burned);
  $("#net-calories").textContent = round(data.net);
  $("#remaining-calories").textContent = `${Math.abs(round(remaining))} kcal ${remaining >= 0 ? "restantes" : "por encima"}`;
  $("#calorie-progress").style.width = `${progress}%`;
  $("#protein-total").textContent = `${round(data.protein, 1)} g`;
  $("#carbs-total").textContent = `${round(data.carbs, 1)} g`;
  $("#fat-total").textContent = `${round(data.fat, 1)} g`;
  $("#entry-count").textContent = `${state.foods.length + state.workouts.length} registros`;

  renderDailyCharts(data, goalCalories);
  renderLists();
  renderReport();
  renderProfileSummary();
}

function populateFoodList() {
  const list = $("#food-list");
  foodDatabase.forEach((food) => {
    const option = document.createElement("option");
    option.value = food.name;
    list.append(option);
  });
}

$("#quick-food-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const entries = parseQuickFood(fields.quickFood.value);
  if (!entries.length) {
    fields.quickFood.setCustomValidity("No he reconocido ningun alimento de la base.");
    fields.quickFood.reportValidity();
    fields.quickFood.setCustomValidity("");
    return;
  }

  state.foods.push(...entries);
  fields.quickFood.value = "";
  saveDay();
  render();
});

$("#food-form").addEventListener("submit", (event) => {
  event.preventDefault();
  addFood({
    id: crypto.randomUUID(),
    name: fields.foodName.value.trim() || "Comida",
    grams: Number(fields.foodGrams.value) || 0,
    calories: Number(fields.foodCalories.value) || 0,
    protein: Number(fields.foodProtein.value) || 0,
    carbs: Number(fields.foodCarbs.value) || 0,
    fat: Number(fields.foodFat.value) || 0
  });
  event.currentTarget.reset();
  fields.foodGrams.value = 100;
});

$("#workout-form").addEventListener("submit", (event) => {
  event.preventDefault();
  addWorkout();
  fields.workoutNotes.value = "";
});

$("#profile-form").addEventListener("submit", (event) => {
  event.preventDefault();
  saveSettings();
  renderProfileSummary();
});

fields.foodName.addEventListener("change", fillFoodFields);
fields.foodGrams.addEventListener("input", fillFoodFields);
fields.workoutSport.addEventListener("change", calculateWorkoutCalories);
fields.workoutEffort.addEventListener("input", calculateWorkoutCalories);
fields.workoutMinutes.addEventListener("input", calculateWorkoutCalories);
fields.bodyHeight.addEventListener("input", () => {
  saveSettings();
  renderProfileSummary();
});
fields.bodyWeight.addEventListener("input", () => {
  saveSettings();
  calculateWorkoutCalories();
  renderProfileSummary();
});
fields.date.addEventListener("change", () => loadDay(fields.date.value));
fields.goalCalories.addEventListener("input", () => {
  saveSettings();
  render();
});
fields.goalProtein.addEventListener("input", saveSettings);
fields.profileSex.addEventListener("change", saveSettings);
fields.bodyFat.addEventListener("input", () => {
  saveSettings();
  renderProfileSummary();
});
fields.workHabits.addEventListener("change", () => {
  saveSettings();
  renderProfileSummary();
});
fields.bodyGoal.addEventListener("change", saveSettings);
fields.workoutImage.addEventListener("change", () => {
  const file = fields.workoutImage.files[0];
  if (!file) {
    clearWorkoutImage();
    return;
  }

  state.selectedWorkoutImage = {
    name: file.name,
    url: URL.createObjectURL(file),
    file
  };
  state.workoutOcrText = "";
  fields.ocrStatus.textContent = "Captura lista. Pulsa Estimar con captura/texto para leerla.";
  fields.workoutMinutes.value = workoutMinutes();
  calculateWorkoutCalories();
  renderWorkoutPreview();
});

$("#clear-day").addEventListener("click", () => {
  state.foods = [];
  state.workouts = [];
  saveDay();
  render();
});

$("#image-only-workout").addEventListener("click", estimateWorkoutFromImageOnly);

document.querySelectorAll(".nav-button").forEach((button) => {
  button.addEventListener("click", () => setScreen(button.dataset.screen));
});

document.querySelectorAll(".nav-shortcut").forEach((button) => {
  button.addEventListener("click", () => setScreen(button.dataset.target));
});

populateFoodList();
loadSettings();
fields.date.value = todayIso();
loadDay(fields.date.value);
calculateWorkoutCalories();
setScreen("home");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
