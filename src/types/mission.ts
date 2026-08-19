export type CategoryId = "fun" | "development" | "exercise" | "study" | "growth";

/** 화면에서 고를 수 있는 값 = 실제 카테고리 + 전체 */
export type SelectableCategory = CategoryId | "all";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export interface Mission {
  id: number;
  category: CategoryId;
  title: string;
  description?: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  rarity: Rarity;
}

export interface CategoryMeta {
  id: SelectableCategory;
  /** 목록에 붙는 두 자리 인덱스 */
  index: string;
  label: string;
  /** 모노스페이스 표기용 짧은 코드 */
  code: string;
}

export interface RarityMeta {
  label: string;
  weight: number;
  /** 4단계 중 몇 번째인지 (등급 표시 바에 사용) */
  level: 1 | 2 | 3 | 4;
}

export const CATEGORIES: CategoryMeta[] = [
  { id: "all", index: "00", label: "전체", code: "ALL" },
  { id: "fun", index: "01", label: "재미", code: "FUN" },
  { id: "development", index: "02", label: "개발", code: "DEV" },
  { id: "exercise", index: "03", label: "운동", code: "MOVE" },
  { id: "study", index: "04", label: "공부", code: "STUDY" },
  { id: "growth", index: "05", label: "자기계발", code: "GROW" },
];

export const RARITY_META: Record<Rarity, RarityMeta> = {
  common: { label: "COMMON", weight: 60, level: 1 },
  rare: { label: "RARE", weight: 25, level: 2 },
  epic: { label: "EPIC", weight: 12, level: 3 },
  legendary: { label: "LEGENDARY", weight: 3, level: 4 },
};

export function categoryMeta(id: SelectableCategory): CategoryMeta {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

/** "전체"를 뺀 실제 카테고리 id 목록. 카테고리별 통계를 순회할 때 쓴다. */
export const CATEGORY_IDS: CategoryId[] = ["fun", "development", "exercise", "study", "growth"];

export interface StatsData {
  totalCompleted: number;
  todayCompleted: number;
  lastCompletedDate: string | null;
  streak: number;
  bestStreak: number;
  /** 카테고리별 완료 횟수 */
  categoryCompleted: Record<CategoryId, number>;
}

/** 완료한 미션 한 건의 기록 */
export interface HistoryEntry {
  id: number;
  title: string;
  category: CategoryId;
  /** 로컬 시간 기준 YYYY-MM-DD */
  date: string;
  /** 정렬용 타임스탬프 */
  completedAt: number;
}
