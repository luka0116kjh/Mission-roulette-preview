import type { StatsData } from "../types/mission";

const STORAGE_KEY = "mission-roulette:stats";

export const EMPTY_STATS: StatsData = {
  totalCompleted: 0,
  todayCompleted: 0,
  lastCompletedDate: null,
  streak: 0,
  bestStreak: 0,
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

  return {
    totalCompleted: toCount(raw.totalCompleted),
    todayCompleted: toCount(raw.todayCompleted),
    lastCompletedDate:
      typeof raw.lastCompletedDate === "string" ? raw.lastCompletedDate : null,
    streak: toCount(raw.streak),
    bestStreak: toCount(raw.bestStreak),
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
export function completeMission(current: StatsData): StatsData {
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
  };

  saveStats(next);
  return next;
}

export function resetStats(): StatsData {
  saveStats(EMPTY_STATS);
  return { ...EMPTY_STATS };
}
