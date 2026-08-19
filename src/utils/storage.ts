import { CATEGORY_IDS, type CategoryId, type HistoryEntry, type Mission, type StatsData } from "../types/mission";

const STORAGE_KEY = "mission-roulette:stats";
const HISTORY_KEY = "mission-roulette:history";
const FAVORITES_KEY = "mission-roulette:favorites";
const THEME_KEY = "mission-roulette:theme";

/** 히스토리에 남기는 최근 기록 개수 */
const HISTORY_LIMIT = 20;

function emptyCategoryCompleted(): Record<CategoryId, number> {
  return CATEGORY_IDS.reduce(
    (acc, id) => ({ ...acc, [id]: 0 }),
    {} as Record<CategoryId, number>,
  );
}

export const EMPTY_STATS: StatsData = {
  totalCompleted: 0,
  todayCompleted: 0,
  lastCompletedDate: null,
  streak: 0,
  bestStreak: 0,
  categoryCompleted: emptyCategoryCompleted(),
};

/**
 * localStorage를 쓸 수 없는 환경(사생활 보호 모드, 샌드박스 iframe 등)에서도
 * 앱이 죽지 않도록 메모리 저장소로 자동 대체한다.
 */
const memoryStore = new Map<string, string>();

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

function writeRaw(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    memoryStore.set(key, value);
  }
}

/** 로컬 시간 기준 YYYY-MM-DD */
export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dayDiff(from: string, to: string): number {
  const a = new Date(`${from}T00:00:00`).getTime();
  const b = new Date(`${to}T00:00:00`).getTime();
  return Math.round((b - a) / 86_400_000);
}

function sanitize(value: unknown): StatsData {
  const raw = value as Partial<StatsData> | null;
  if (!raw || typeof raw !== "object") return { ...EMPTY_STATS };

  const toCount = (n: unknown) =>
    typeof n === "number" && Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;

  const rawCategory = (raw.categoryCompleted ?? {}) as Partial<Record<CategoryId, unknown>>;
  const categoryCompleted = CATEGORY_IDS.reduce(
    (acc, id) => ({ ...acc, [id]: toCount(rawCategory[id]) }),
    {} as Record<CategoryId, number>,
  );

  return {
    totalCompleted: toCount(raw.totalCompleted),
    todayCompleted: toCount(raw.todayCompleted),
    lastCompletedDate:
      typeof raw.lastCompletedDate === "string" ? raw.lastCompletedDate : null,
    streak: toCount(raw.streak),
    bestStreak: toCount(raw.bestStreak),
    categoryCompleted,
  };
}

/**
 * 저장된 값을 오늘 날짜 기준으로 보정해서 돌려준다.
 * - 날짜가 바뀌었으면 todayCompleted = 0
 * - 어제도 오늘도 아니면 연속 기록 끊김 → streak = 0
 * - 전체 완료 횟수와 최고 기록은 유지
 */
export function loadStats(): StatsData {
  const raw = readRaw(STORAGE_KEY);
  if (!raw) return { ...EMPTY_STATS };

  let parsed: StatsData;
  try {
    parsed = sanitize(JSON.parse(raw));
  } catch {
    return { ...EMPTY_STATS };
  }

  const today = todayKey();
  if (!parsed.lastCompletedDate) return { ...parsed, todayCompleted: 0, streak: 0 };

  const gap = dayDiff(parsed.lastCompletedDate, today);
  if (gap === 0) return parsed;
  if (gap === 1) return { ...parsed, todayCompleted: 0 };
  return { ...parsed, todayCompleted: 0, streak: 0 };
}

export function saveStats(stats: StatsData): void {
  writeRaw(STORAGE_KEY, JSON.stringify(stats));
}

/** 미션 하나를 완료했을 때의 다음 기록 상태 */
export function completeMission(current: StatsData, category: CategoryId): StatsData {
  const today = todayKey();
  const gap =
    current.lastCompletedDate === null
      ? Infinity
      : dayDiff(current.lastCompletedDate, today);

  const streak = gap === 0 ? Math.max(current.streak, 1) : gap === 1 ? current.streak + 1 : 1;

  const next: StatsData = {
    totalCompleted: current.totalCompleted + 1,
    todayCompleted: gap === 0 ? current.todayCompleted + 1 : 1,
    lastCompletedDate: today,
    streak,
    bestStreak: Math.max(current.bestStreak, streak),
    categoryCompleted: {
      ...current.categoryCompleted,
      [category]: (current.categoryCompleted[category] ?? 0) + 1,
    },
  };

  saveStats(next);
  return next;
}

export function resetStats(): StatsData {
  saveStats(EMPTY_STATS);
  return { ...EMPTY_STATS };
}

/* ============================================================ 히스토리 */

function sanitizeHistory(value: unknown): HistoryEntry[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (item): item is HistoryEntry =>
        !!item &&
        typeof item === "object" &&
        typeof (item as HistoryEntry).id === "number" &&
        typeof (item as HistoryEntry).title === "string" &&
        typeof (item as HistoryEntry).category === "string" &&
        typeof (item as HistoryEntry).date === "string" &&
        typeof (item as HistoryEntry).completedAt === "number",
    )
    .slice(0, HISTORY_LIMIT);
}

export function loadHistory(): HistoryEntry[] {
  const raw = readRaw(HISTORY_KEY);
  if (!raw) return [];
  try {
    return sanitizeHistory(JSON.parse(raw));
  } catch {
    return [];
  }
}

/** 완료한 미션을 히스토리 맨 앞에 추가하고, 최근 HISTORY_LIMIT개만 남긴다. */
export function addHistoryEntry(mission: Mission): HistoryEntry[] {
  const entry: HistoryEntry = {
    id: mission.id,
    title: mission.title,
    category: mission.category,
    date: todayKey(),
    completedAt: Date.now(),
  };

  const next = [entry, ...loadHistory()].slice(0, HISTORY_LIMIT);
  writeRaw(HISTORY_KEY, JSON.stringify(next));
  return next;
}

/* ============================================================ 즐겨찾기 */

function sanitizeIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((n): n is number => typeof n === "number" && Number.isFinite(n));
}

export function loadFavorites(): number[] {
  const raw = readRaw(FAVORITES_KEY);
  if (!raw) return [];
  try {
    return sanitizeIds(JSON.parse(raw));
  } catch {
    return [];
  }
}

/** 즐겨찾기에 있으면 빼고, 없으면 추가한다. */
export function toggleFavorite(id: number): number[] {
  const current = loadFavorites();
  const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
  writeRaw(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

/* ============================================================ 테마 */

export type Theme = "light" | "dark";

export function loadTheme(): Theme | null {
  const raw = readRaw(THEME_KEY);
  return raw === "light" || raw === "dark" ? raw : null;
}

export function saveTheme(theme: Theme): void {
  writeRaw(THEME_KEY, theme);
}
